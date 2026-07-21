import { NextResponse } from 'next/server';
import { loadPosts, loadVectors, loadMap, makePreview, type Post } from '@/lib/data';

export const runtime = 'nodejs';

const TOP_N = 8;

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

function keywordSearch(posts: Post[], query: string): Scored[] {
  const terms = query
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter((t) => t.length > 1);
  if (terms.length === 0) return [];
  const scored: Scored[] = [];
  for (const post of posts) {
    const text = post.text.toLowerCase();
    let score = 0;
    for (const term of terms) {
      let idx = text.indexOf(term);
      while (idx !== -1) {
        score += 1;
        idx = text.indexOf(term, idx + term.length);
      }
    }
    if (score > 0) scored.push({ post, score });
  }
  return scored.sort((a, b) => b.score - a.score).slice(0, TOP_N);
}

export async function POST(request: Request) {
  let query = '';
  try {
    const body = await request.json();
    query = String(body?.query ?? '').trim();
  } catch {
    // fall through to empty query check
  }
  if (!query) {
    return NextResponse.json({ error: 'Empty query' }, { status: 400 });
  }

  const [posts, vectorData, map] = await Promise.all([loadPosts(), loadVectors(), loadMap()]);
  const clusterLabels = new Map(map.clusters.map((c) => [c.id, c.label]));

  let mode: 'vector' | 'keyword' = 'keyword';
  let results: Scored[] = [];

  if (vectorData) {
    const queryVec = await embedQuery(query, vectorData.dim);
    if (queryVec) {
      mode = 'vector';
      const byId = new Map(posts.map((p) => [p.id, p]));
      const { dim, ids, vectors } = vectorData;
      const scored: Scored[] = [];
      for (let i = 0; i < ids.length; i++) {
        let dot = 0;
        const offset = i * dim;
        for (let j = 0; j < dim; j++) dot += vectors[offset + j] * queryVec[j];
        const post = byId.get(ids[i]);
        if (post) scored.push({ post, score: dot });
      }
      results = scored.sort((a, b) => b.score - a.score).slice(0, TOP_N);
    }
  }

  if (mode === 'keyword') {
    results = keywordSearch(posts, query);
  }

  return NextResponse.json({
    mode,
    results: results.map(({ post, score }) => ({
      id: post.id,
      score: Math.round(score * 1000) / 1000,
      preview: makePreview(post.text, 300),
      date: post.date,
      link: post.link,
      cluster: clusterLabels.get(post.cluster) ?? null,
    })),
  });
}
