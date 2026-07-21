import { promises as fs } from 'fs';
import path from 'path';

export type Reaction = { e: string; n: number };

export type Post = {
  id: number;
  date: string;
  text: string;
  link: string | null;
  cluster: number;
  reactions?: Reaction[];
};

// Compact post payload for client components (lists, charts, tooltips).
export type PostMeta = {
  id: number;
  date: string; // YYYY-MM-DD
  preview: string;
  link: string | null;
  cluster: number;
  rx: number; // total reactions
  topE: string; // top reaction emojis, e.g. "🔥❤️"
};

export type CuratedSeries = { title: string; description: string; ids: number[] };
export type CuratedTimelineItem = { id: number; label: string };
export type Curated = { series: CuratedSeries[]; timeline: CuratedTimelineItem[] };

export type MapCluster = { id: number; label: string };
export type MapPoint = { id: number; x: number; y: number; c: number };

export type MapData = {
  sample: boolean;
  clusters: MapCluster[];
  points: MapPoint[];
};

export type VectorData = {
  dim: number;
  ids: number[];
  vectors: Float32Array; // ids.length * dim, unit-normalized
};

const dataDir = () => path.join(process.cwd(), 'data');

export async function loadPosts(): Promise<Post[]> {
  const raw = await fs.readFile(path.join(dataDir(), 'posts.json'), 'utf8');
  return JSON.parse(raw) as Post[];
}

export async function loadMap(): Promise<MapData> {
  const raw = await fs.readFile(path.join(dataDir(), 'map.json'), 'utf8');
  return JSON.parse(raw) as MapData;
}

export async function loadVectors(): Promise<VectorData | null> {
  try {
    const raw = await fs.readFile(path.join(dataDir(), 'vectors.json'), 'utf8');
    const parsed = JSON.parse(raw) as { dim: number; ids: number[]; b64: string };
    const buf = Buffer.from(parsed.b64, 'base64');
    const vectors = new Float32Array(buf.buffer, buf.byteOffset, buf.byteLength / 4);
    return { dim: parsed.dim, ids: parsed.ids, vectors };
  } catch {
    return null;
  }
}

export async function loadCurated(): Promise<Curated> {
  try {
    const raw = await fs.readFile(path.join(dataDir(), 'curated.json'), 'utf8');
    return JSON.parse(raw) as Curated;
  } catch {
    return { series: [], timeline: [] };
  }
}

export function toMeta(post: Post, previewLen = 200): PostMeta {
  const reactions = post.reactions ?? [];
  return {
    id: post.id,
    date: post.date.slice(0, 10),
    preview: makePreview(post.text, previewLen),
    link: post.link,
    cluster: post.cluster,
    rx: reactions.reduce((s, r) => s + r.n, 0),
    topE: reactions.slice(0, 2).map((r) => r.e).join(''),
  };
}

export function makePreview(text: string, max = 220): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  return clean.length > max ? clean.slice(0, max - 1).trimEnd() + '…' : clean;
}
