import { NextResponse } from 'next/server';
import {
  loadCurated,
  loadMap,
  loadPosts,
  loadVectors,
  makePreview,
  type Curated,
  type Post,
} from '@/lib/data';

export const runtime = 'nodejs';

const TOP_N = 8;
const RRF_K = 60;
const STOP_WORDS = new Set([
  'без',
  'все',
  'для',
  'еще',
  'зачем',
  'или',
  'как',
  'когда',
  'над',
  'под',
  'почему',
  'при',
  'про',
  'что',
  'это',
]);

type Scored = { post: Post; score: number };

async function embedQuery(query: string, dim: number): Promise<Float32Array | null> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  const res = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: query,
      dimensions: dim,
    }),
  });
  if (!res.ok) return null;
  const json = await res.json();
  const emb: number[] = json.data?.[0]?.embedding;
  if (!emb) return null;
  const v = new Float32Array(emb);
  let norm = 0;
  for (let i = 0; i < v.length; i++) norm += v[i] * v[i];
  norm = Math.sqrt(norm) || 1;
  for (let i = 0; i < v.length; i++) v[i] /= norm;
  return v;
}

function normalize(text: string): string {
  return text.toLowerCase().replaceAll('ё', 'е');
}

function expandTerm(term: string): string[] {
  const variants = [term];
  if (term.startsWith('собесед')) variants.push('собес', 'интервью');
  if (term.startsWith('собес')) variants.push('собесед', 'интервью');
  if (term === 'ии' || term.startsWith('искусствен')) {
    variants.push('gpt', 'chatgpt', 'claude', 'нейросет');
  }
  if (term.startsWith('переезд')) variants.push('релокац', 'виза');
  if (term.startsWith('релокац')) variants.push('переезд', 'виза');
  if (term.startsWith('работ')) variants.push('ваканси', 'оффер', 'найм');
  return [...new Set(variants)];
}

function queryGroups(query: string): string[][] {
  return normalize(query)
    .split(/[^\p{L}\p{N}]+/u)
    .filter((term) => term.length > 1 && !STOP_WORDS.has(term))
    .map(expandTerm);
}

function countOccurrences(text: string, term: string): number {
  let count = 0;
  let index = text.indexOf(term);
  while (index !== -1 && count < 5) {
    count += 1;
    index = text.indexOf(term, index + term.length);
  }
  return count;
}

function lexicalScore(text: string, groups: string[][]): number {
  const haystack = normalize(text);
  let matchedGroups = 0;
  let occurrences = 0;
  for (const variants of groups) {
    const best = Math.max(...variants.map((variant) => countOccurrences(haystack, variant)));
    if (best > 0) {
      matchedGroups += 1;
      occurrences += best;
    }
  }
  if (matchedGroups === 0) return 0;
  return matchedGroups * 3 + occurrences + (matchedGroups === groups.length ? 4 : 0);
}

function curatedBoosts(curated: Curated, groups: string[][]): Map<number, number> {
  const boosts = new Map<number, number>();
  for (const series of curated.series) {
    const score = lexicalScore(`${series.title} ${series.description}`, groups);
    if (score === 0) continue;
    for (const id of series.ids) boosts.set(id, Math.max(boosts.get(id) ?? 0, score * 0.75));
  }
  return boosts;
}

function keywordRanking(posts: Post[], query: string, curated: Curated): Scored[] {
  const groups = queryGroups(query);
  if (groups.length === 0) return [];
  const boosts = curatedBoosts(curated, groups);
  const scored: Scored[] = [];
  for (const post of posts) {
    const score = lexicalScore(post.text, groups) + (boosts.get(post.id) ?? 0);
    if (score > 0) scored.push({ post, score });
  }
  return scored.sort((a, b) => b.score - a.score);
}

function fuseRankings(vector: Scored[], lexical: Scored[]): Scored[] {
  const fused = new Map<number, Scored>();
  const add = (item: Scored, score: number) => {
    const current = fused.get(item.post.id);
    fused.set(item.post.id, { post: item.post, score: (current?.score ?? 0) + score });
  };

  vector.forEach((item, rank) => add(item, 1 / (RRF_K + rank + 1)));
  lexical.forEach((item, rank) => {
    const lexicalStrength = Math.min(item.score, 20) * 0.0004;
    add(item, 1.35 / (RRF_K + rank + 1) + lexicalStrength);
  });

  return [...fused.values()].sort((a, b) => b.score - a.score).slice(0, TOP_N);
}

export async function POST(request: Request) {
  let query = '';
  let cluster: number | null = null;
  let year: string | null = null;
  try {
    const body = await request.json();
    query = String(body?.query ?? '').trim();
    cluster = Number.isInteger(body?.cluster) ? Number(body.cluster) : null;
    year = /^\d{4}$/.test(String(body?.year ?? '')) ? String(body.year) : null;
  } catch {
    // fall through to empty query check
  }
  if (!query) {
    return NextResponse.json({ error: 'Пустой запрос' }, { status: 400 });
  }

  const [allPosts, vectorData, map, curated] = await Promise.all([
    loadPosts(),
    loadVectors(),
    loadMap(),
    loadCurated(),
  ]);
  const posts = allPosts.filter(
    (post) =>
      (cluster === null || post.cluster === cluster) &&
      (year === null || post.date.startsWith(year)),
  );
  const clusterLabels = new Map(map.clusters.map((item) => [item.id, item.label]));
  const lexical = keywordRanking(posts, query, curated);

  let mode: 'hybrid' | 'vector' | 'keyword' = 'keyword';
  let results: Scored[] = lexical.slice(0, TOP_N);

  if (vectorData) {
    const queryVec = await embedQuery(query, vectorData.dim);
    if (queryVec) {
      const byId = new Map(posts.map((post) => [post.id, post]));
      const { dim, ids, vectors } = vectorData;
      const vectorRanking: Scored[] = [];
      for (let i = 0; i < ids.length; i++) {
        const post = byId.get(ids[i]);
        if (!post) continue;
        let dot = 0;
        const offset = i * dim;
        for (let j = 0; j < dim; j++) dot += vectors[offset + j] * queryVec[j];
        vectorRanking.push({ post, score: dot });
      }
      vectorRanking.sort((a, b) => b.score - a.score);
      mode = lexical.length > 0 ? 'hybrid' : 'vector';
      results = fuseRankings(vectorRanking, lexical);
    }
  }

  return NextResponse.json({
    mode,
    results: results.map(({ post, score }) => {
      const reactions = post.reactions ?? [];
      return {
        id: post.id,
        score: Math.round(score * 1000) / 1000,
        preview: makePreview(post.text, 220),
        date: post.date.slice(0, 10),
        link: post.link,
        cluster: post.cluster,
        clusterLabel: clusterLabels.get(post.cluster) ?? null,
        rx: reactions.reduce((sum, reaction) => sum + reaction.n, 0),
        topE: reactions
          .slice(0, 2)
          .map((reaction) => reaction.e)
          .join(''),
      };
    }),
  });
}
