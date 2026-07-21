/**
 * Builds search + topic-map data from a Telegram Desktop chat export.
 *
 * Supports both export formats:
 *   - "Machine-readable JSON" (result.json)
 *   - HTML (messages.html, messages2.html, … — pass any of them or the folder)
 *
 * Usage:
 *   OPENAI_API_KEY=sk-... npm run prepare-data -- --export data/raw/messages.html --channel pomazkovjs
 *
 * With OPENAI_API_KEY set it embeds every post (text-embedding-3-small),
 * clusters posts into topics (k-means), projects them to 2D (UMAP) and writes:
 *   data/posts.json   — posts with cluster assignment
 *   data/map.json     — 2D points + cluster labels for the topic map
 *   data/vectors.json — unit-normalized embeddings for semantic search
 *
 * Without the key it still writes real posts.json (keyword search works),
 * an empty map.json, and removes stale vectors.json.
 */

import { readFile, writeFile, mkdir, readdir, rm, stat } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { UMAP } from 'umap-js';

const EMBED_MODEL = 'text-embedding-3-small';
const EMBED_DIM = 512;
const BATCH_SIZE = 96;
const MIN_TEXT_LENGTH = 30;
const MAX_TEXT_CHARS = 8000;

// ---------- args ----------

function parseArgs(argv) {
  const args = { export: 'data/raw/messages.html', channel: null };
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--export') args.export = argv[++i];
    else if (argv[i] === '--channel') args.channel = argv[++i];
  }
  return args;
}

// ---------- deterministic rng ----------

function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------- html entities ----------

const NAMED_ENTITIES = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
  laquo: '«', raquo: '»', mdash: '—', ndash: '–', hellip: '…',
  copy: '©', reg: '®', trade: '™', deg: '°', middot: '·', bull: '•',
};

function decodeEntities(s) {
  return s
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number(dec)))
    .replace(/&([a-zA-Z]+);/g, (m, name) => NAMED_ENTITIES[name] ?? m);
}

function htmlToText(s) {
  return decodeEntities(
    s
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]+>/g, ''),
  )
    .split('\n')
    .map((line) => line.replace(/[ \t]+/g, ' ').trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// "24.02.2022 09:28:54 UTC+03:00" -> "2022-02-24T09:28:54+03:00"
function parseTgDate(s) {
  const m = s.match(/(\d{2})\.(\d{2})\.(\d{4})\s+(\d{2}:\d{2}:\d{2})\s+UTC([+-]\d{2}):?(\d{2})/);
  if (!m) return s;
  return `${m[3]}-${m[2]}-${m[1]}T${m[4]}${m[5]}:${m[6]}`;
}

// ---------- telegram export parsing ----------

function extractJsonText(message) {
  const t = message.text;
  if (typeof t === 'string') return t;
  if (Array.isArray(t)) {
    return t.map((part) => (typeof part === 'string' ? part : part.text ?? '')).join('');
  }
  return '';
}

function parseJsonExport(raw) {
  const posts = [];
  for (const m of raw.messages ?? []) {
    if (m.type !== 'message') continue;
    const text = extractJsonText(m).trim();
    if (text.length < MIN_TEXT_LENGTH) continue;
    posts.push({ id: m.id, date: m.date, text });
  }
  return posts;
}

function parseHtmlExport(html) {
  const posts = [];
  const openRe = /<div class="message default clearfix[^"]*" id="message(\d+)">/g;
  const starts = [];
  let m;
  while ((m = openRe.exec(html)) !== null) {
    starts.push({ id: Number(m[1]), index: m.index });
  }
  for (let i = 0; i < starts.length; i++) {
    const next = html.indexOf('<div class="message ', starts[i].index + 1);
    const block = html.slice(starts[i].index, next === -1 ? html.length : next);

    const dateMatch = block.match(/<div class="pull_right date details" title="([^"]+)">/);
    const textMatch = block.match(/<div class="text">([\s\S]*?)<\/div>/);
    if (!textMatch) continue;

    const text = htmlToText(textMatch[1]);
    if (text.length < MIN_TEXT_LENGTH) continue;

    posts.push({
      id: starts[i].id,
      date: dateMatch ? parseTgDate(dateMatch[1]) : '',
      text,
    });
  }
  return posts;
}

async function loadExport(exportPath) {
  const stats = await stat(exportPath);

  if (!stats.isDirectory() && exportPath.endsWith('.json')) {
    return parseJsonExport(JSON.parse(await readFile(exportPath, 'utf8')));
  }

  // HTML export: read all messages*.html in the folder
  const dir = stats.isDirectory() ? exportPath : path.dirname(exportPath);
  const files = (await readdir(dir))
    .filter((f) => /^messages\d*\.html$/.test(f))
    .sort((a, b) => {
      const na = Number(a.match(/\d+/)?.[0] ?? 1);
      const nb = Number(b.match(/\d+/)?.[0] ?? 1);
      return na - nb;
    });
  if (files.length === 0) {
    throw new Error(`No messages*.html files found in ${dir}`);
  }
  const posts = [];
  for (const file of files) {
    posts.push(...parseHtmlExport(await readFile(path.join(dir, file), 'utf8')));
  }
  return posts;
}

// ---------- embeddings ----------

async function embedBatch(texts, apiKey) {
  const res = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: EMBED_MODEL,
      input: texts.map((t) => t.slice(0, MAX_TEXT_CHARS)),
      dimensions: EMBED_DIM,
    }),
  });
  if (!res.ok) {
    throw new Error(`OpenAI embeddings failed: ${res.status} ${await res.text()}`);
  }
  const json = await res.json();
  return json.data
    .sort((a, b) => a.index - b.index)
    .map((d) => {
      const v = Float32Array.from(d.embedding);
      let norm = 0;
      for (const x of v) norm += x * x;
      norm = Math.sqrt(norm) || 1;
      for (let i = 0; i < v.length; i++) v[i] /= norm;
      return v;
    });
}

async function embedAll(posts, apiKey) {
  const vectors = [];
  for (let i = 0; i < posts.length; i += BATCH_SIZE) {
    const batch = posts.slice(i, i + BATCH_SIZE);
    vectors.push(...(await embedBatch(batch.map((p) => p.text), apiKey)));
    console.log(`  embedded ${Math.min(i + BATCH_SIZE, posts.length)}/${posts.length}`);
  }
  return vectors;
}

// ---------- k-means ----------

function kmeans(vectors, k, rng, iterations = 60) {
  const n = vectors.length;
  const dim = vectors[0].length;

  // k-means++ init
  const centroids = [vectors[Math.floor(rng() * n)].slice()];
  while (centroids.length < k) {
    const dists = vectors.map((v) => {
      let best = Infinity;
      for (const c of centroids) {
        let d = 0;
        for (let j = 0; j < dim; j++) {
          const diff = v[j] - c[j];
          d += diff * diff;
        }
        if (d < best) best = d;
      }
      return best;
    });
    const total = dists.reduce((s, d) => s + d, 0);
    let target = rng() * total;
    let idx = 0;
    while (target > dists[idx] && idx < n - 1) target -= dists[idx++];
    centroids.push(vectors[idx].slice());
  }

  const assignment = new Array(n).fill(0);
  for (let iter = 0; iter < iterations; iter++) {
    let changed = false;
    for (let i = 0; i < n; i++) {
      let best = 0;
      let bestDist = Infinity;
      for (let c = 0; c < k; c++) {
        let d = 0;
        for (let j = 0; j < dim; j++) {
          const diff = vectors[i][j] - centroids[c][j];
          d += diff * diff;
        }
        if (d < bestDist) {
          bestDist = d;
          best = c;
        }
      }
      if (assignment[i] !== best) {
        assignment[i] = best;
        changed = true;
      }
    }
    if (!changed) break;
    for (let c = 0; c < k; c++) {
      const members = [];
      for (let i = 0; i < n; i++) if (assignment[i] === c) members.push(vectors[i]);
      if (members.length === 0) continue;
      const centroid = new Float32Array(dim);
      for (const v of members) for (let j = 0; j < dim; j++) centroid[j] += v[j];
      for (let j = 0; j < dim; j++) centroid[j] /= members.length;
      centroids[c] = centroid;
    }
  }
  return assignment;
}

// ---------- cluster labels (tf-idf top terms) ----------

const STOPWORDS = new Set(
  `и в во не что он на я с со как а то все она так его но да ты к у же вы за бы по только ее мне было вот от меня еще нет о из ему теперь когда даже ну вдруг ли если уже или ни быть был него до вас нибудь опять уж вам ведь там потом себя ничего ей может они тут где есть надо ней для мы тебя их чем была сам чтоб без будто чего раз тоже себе под будет ж тогда кто этот того потому этого какой совсем ним здесь этом один почти мой тем чтобы нее сейчас были куда зачем всех никогда можно при наконец два об другой хоть после над больше тот через эти нас про всего них какая много разве три эту моя впрочем хорошо свою этой перед иногда лучше чуть том нельзя такой им более всегда конечно всю между это очень просто самый ещё вообще именно например кстати давайте будем сегодня которые который которая свой свои прям точно почему потому-что the a an and or of to in on for with is are was were be been it this that at by from as not you your i we they he she`
    .split(/\s+/),
);

function tokenize(text) {
  return text
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter((t) => t.length > 2 && !STOPWORDS.has(t));
}

function labelClusters(posts, assignment, k) {
  const df = new Map();
  const postTokens = posts.map((p) => {
    const tokens = tokenize(p.text);
    for (const t of new Set(tokens)) df.set(t, (df.get(t) ?? 0) + 1);
    return tokens;
  });

  const labels = [];
  for (let c = 0; c < k; c++) {
    const counts = new Map();
    let members = 0;
    for (let i = 0; i < posts.length; i++) {
      if (assignment[i] !== c) continue;
      members++;
      for (const t of postTokens[i]) counts.set(t, (counts.get(t) ?? 0) + 1);
    }
    if (members === 0) {
      labels.push(`Тема ${c + 1}`);
      continue;
    }
    const scored = [...counts.entries()]
      .map(([t, count]) => [t, count * Math.log(posts.length / (df.get(t) ?? 1))])
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([t]) => t);
    labels.push(scored.join(' · ') || `Тема ${c + 1}`);
  }
  return labels;
}

// ---------- main ----------

async function main() {
  const args = parseArgs(process.argv);
  const apiKey = process.env.OPENAI_API_KEY;

  console.log(`Reading export: ${args.export}`);
  const posts = await loadExport(args.export);
  if (posts.length === 0) {
    console.error('No usable posts found in the export.');
    process.exit(1);
  }
  console.log(`Found ${posts.length} posts.`);

  const makePost = (p, cluster) => ({
    id: p.id,
    date: p.date,
    text: p.text,
    link: args.channel ? `https://t.me/${args.channel}/${p.id}` : null,
    cluster,
  });

  await mkdir('data', { recursive: true });

  if (!apiKey) {
    console.warn(
      '\nOPENAI_API_KEY is not set — writing posts for keyword search only.\n' +
        'Semantic search and the topic map will activate after you re-run this\n' +
        'script with the key set.\n',
    );
    await writeFile(
      path.join('data', 'posts.json'),
      JSON.stringify(posts.map((p) => makePost(p, 0)), null, 1),
    );
    await writeFile(
      path.join('data', 'map.json'),
      JSON.stringify({ sample: false, clusters: [], points: [] }, null, 1),
    );
    await rm(path.join('data', 'vectors.json'), { force: true });
    console.log(`Done: data/posts.json — ${posts.length} posts (keyword search mode).`);
    return;
  }

  console.log(`Embedding with ${EMBED_MODEL} (${EMBED_DIM}d)…`);
  const vectors = await embedAll(posts, apiKey);

  const k = Math.max(4, Math.min(10, Math.round(Math.sqrt(posts.length / 2))));
  console.log(`Clustering into ${k} topics…`);
  const rng = mulberry32(42);
  const assignment = kmeans(vectors, k, rng);
  const labels = labelClusters(posts, assignment, k);

  console.log('Projecting to 2D with UMAP…');
  const umap = new UMAP({
    nComponents: 2,
    nNeighbors: Math.min(15, posts.length - 1),
    minDist: 0.1,
    random: mulberry32(7),
  });
  const coords = umap.fit(vectors.map((v) => Array.from(v)));

  const xs = coords.map((c) => c[0]);
  const ys = coords.map((c) => c[1]);
  const [minX, maxX] = [Math.min(...xs), Math.max(...xs)];
  const [minY, maxY] = [Math.min(...ys), Math.max(...ys)];
  const scale = (v, min, max) => 0.05 + (0.9 * (v - min)) / (max - min || 1);

  const outMap = {
    sample: false,
    clusters: labels.map((label, id) => ({ id, label })),
    points: posts.map((p, i) => ({
      id: p.id,
      x: Math.round(scale(coords[i][0], minX, maxX) * 1000) / 1000,
      y: Math.round(scale(coords[i][1], minY, maxY) * 1000) / 1000,
      c: assignment[i],
    })),
  };

  const flat = new Float32Array(posts.length * EMBED_DIM);
  vectors.forEach((v, i) => flat.set(v, i * EMBED_DIM));
  const outVectors = {
    dim: EMBED_DIM,
    ids: posts.map((p) => p.id),
    b64: Buffer.from(flat.buffer).toString('base64'),
  };

  await writeFile(
    path.join('data', 'posts.json'),
    JSON.stringify(posts.map((p, i) => makePost(p, assignment[i])), null, 1),
  );
  await writeFile(path.join('data', 'map.json'), JSON.stringify(outMap, null, 1));
  await writeFile(path.join('data', 'vectors.json'), JSON.stringify(outVectors));

  console.log('\nDone:');
  console.log(`  data/posts.json   — ${posts.length} posts`);
  console.log(`  data/map.json     — ${k} topics: ${labels.join(' | ')}`);
  console.log(`  data/vectors.json — ${posts.length}×${EMBED_DIM} embeddings`);
  console.log('\nCommit the data/ files and push — Vercel will redeploy with real data.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
