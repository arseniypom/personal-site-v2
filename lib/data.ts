import { promises as fs } from 'fs';
import path from 'path';

export type Post = {
  id: number;
  date: string;
  text: string;
  link: string | null;
  cluster: number;
};

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

export function makePreview(text: string, max = 220): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  return clean.length > max ? clean.slice(0, max - 1).trimEnd() + '…' : clean;
}
