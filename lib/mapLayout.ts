// Geometry for the topic map. Pure and DOM-free: the same call runs on the server for the
// first paint and in a useMemo on the client when the mode/year/orientation changes.
//
// The expensive part (embeddings, LLM taxonomy, supervised UMAP) is precomputed offline by
// scripts/prepare-data.mjs and lives in data/map.json. Everything here is O(n log n)
// arithmetic on those coordinates — ~0.2 ms for the current 236 posts.
import type { MapPoint } from './data';

export type TimedPoint = MapPoint & {
  t: number; // post timestamp (ms)
  year: string; // YYYY
};

export type LayoutMode = 'topics' | 'timeline';
export type Orientation = 'h' | 'v';

export type Placed = { x: number; y: number; visible: boolean };

export type LayoutOpts = {
  mode: LayoutMode;
  year: string | null; // null = все годы
  orientation: Orientation; // 'v' — узкий экран, таймлайн разворачивается вниз
  clusterCount: number;
};

export type Layout = {
  view: { w: number; h: number };
  placed: Map<number, Placed>;
  ticks: { label: string; pos: number }[]; // отметки лет вдоль оси времени
  laneSize: number; // толщина дорожки темы в единицах viewBox
  laneStart: number; // полоса под подписи лет, дорожки начинаются после неё
};

const TOPICS_VIEW = { w: 100, h: 64 };
const TIMELINE_VIEW_H = { w: 100, h: 88 };
const TIMELINE_VIEW_V = { w: 100, h: 170 };

// Разреженный год не должен раздувать три точки на пол-экрана.
const MAX_ZOOM = 2.2;
const ZOOM_FILL = 0.86;

export function viewFor(mode: LayoutMode, orientation: Orientation) {
  if (mode !== 'timeline') return TOPICS_VIEW;
  return orientation === 'v' ? TIMELINE_VIEW_V : TIMELINE_VIEW_H;
}

export function computeLayout(points: TimedPoint[], opts: LayoutOpts): Layout {
  const view = viewFor(opts.mode, opts.orientation);
  const subset = opts.year ? points.filter((p) => p.year === opts.year) : points;
  const visible = new Set(subset.map((p) => p.id));
  const placed = new Map<number, Placed>();

  if (opts.mode === 'topics') {
    // Не пересчитываем UMAP: берём bbox подмножества и делаем аффинный зум с общим
    // масштабом по обеим осям — соседства сохраняются, движение читается как приближение.
    let scale = 1;
    let cx = 0.5;
    let cy = 0.5;
    if (opts.year && subset.length > 1) {
      let minX = Infinity;
      let maxX = -Infinity;
      let minY = Infinity;
      let maxY = -Infinity;
      for (const p of subset) {
        if (p.x < minX) minX = p.x;
        if (p.x > maxX) maxX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.y > maxY) maxY = p.y;
      }
      cx = (minX + maxX) / 2;
      cy = (minY + maxY) / 2;
      scale = Math.min(
        ZOOM_FILL / Math.max(maxX - minX, 1e-3),
        ZOOM_FILL / Math.max(maxY - minY, 1e-3),
        MAX_ZOOM,
      );
    }
    for (const p of points) {
      placed.set(p.id, {
        x: (0.5 + (p.x - cx) * scale) * view.w,
        y: (0.5 + (p.y - cy) * scale) * view.h,
        visible: visible.has(p.id),
      });
    }
    return { view, placed, ticks: [], laneSize: 0, laneStart: 0 };
  }

  // Таймлайн: ось времени по дате поста, дорожка на тему, beeswarm-раздвижка внутри дорожки.
  const vertical = opts.orientation === 'v';
  const along = vertical ? view.h : view.w; // ось времени
  const across = vertical ? view.w : view.h; // ось тем
  const padAlong = vertical ? 12 : 8;
  // Полоса под подписи лет: горизонтально — сверху, вертикально — слева.
  const laneStart = vertical ? 7 : 6;
  const laneSize = (across - laneStart) / Math.max(opts.clusterCount, 1);
  const step = Math.min(1.7, laneSize / 4.2);
  const dodgeCap = laneSize * 0.34; // раздвижка не выходит за свою дорожку и из-под её подписи
  const minGap = 2.1;

  const source = subset.length ? subset : points;
  let tMin = Infinity;
  let tMax = -Infinity;
  for (const p of source) {
    if (p.t < tMin) tMin = p.t;
    if (p.t > tMax) tMax = p.t;
  }
  const span = Math.max(tMax - tMin, 1);
  const timePos = (t: number) =>
    padAlong + ((Math.min(Math.max(t, tMin), tMax) - tMin) / span) * (along - padAlong * 2);

  const byLane = new Map<number, TimedPoint[]>();
  for (const p of subset) {
    const lane = byLane.get(p.c);
    if (lane) lane.push(p);
    else byLane.set(p.c, [p]);
  }

  for (const [cluster, list] of byLane) {
    list.sort((a, b) => a.t - b.t);
    const laneCentre = laneStart + (cluster + 0.5) * laneSize;
    const done: { a: number; off: number }[] = [];
    for (const p of list) {
      const a = timePos(p.t);
      let off = 0;
      for (let k = 0; k < 9; k++) {
        const candidate = k === 0 ? 0 : (k % 2 ? 1 : -1) * Math.ceil(k / 2) * step;
        off = Math.max(-dodgeCap, Math.min(dodgeCap, candidate));
        const clash = done.some(
          (q) => Math.abs(q.a - a) < minGap && Math.abs(q.off - off) < step * 0.9,
        );
        if (!clash) break;
      }
      done.push({ a, off });
      const b = Math.max(laneStart + 1.2, Math.min(across - 1.2, laneCentre + off));
      placed.set(p.id, vertical ? { x: b, y: a, visible: true } : { x: a, y: b, visible: true });
    }
  }

  // Отфильтрованные точки паркуются в центре своей дорожки — гаснут, не улетая через весь экран.
  for (const p of points) {
    if (placed.has(p.id)) continue;
    const laneCentre = laneStart + (p.c + 0.5) * laneSize;
    const a = timePos(p.t);
    placed.set(
      p.id,
      vertical ? { x: laneCentre, y: a, visible: false } : { x: a, y: laneCentre, visible: false },
    );
  }

  const ticks: { label: string; pos: number }[] = [];
  const firstYear = new Date(tMin).getUTCFullYear();
  const lastYear = new Date(tMax).getUTCFullYear();
  for (let y = firstYear; y <= lastYear; y++) {
    ticks.push({ label: String(y), pos: timePos(Date.UTC(y, 0, 1)) });
  }

  return { view, placed, ticks, laneSize, laneStart };
}

// Центроид видимых точек темы — к нему едет подпись кластера.
export function clusterAnchor(
  points: TimedPoint[],
  layout: Layout,
  cluster: number,
): { x: number; y: number; count: number } {
  let sx = 0;
  let sy = 0;
  let n = 0;
  for (const p of points) {
    if (p.c !== cluster) continue;
    const pl = layout.placed.get(p.id);
    if (!pl || !pl.visible) continue;
    sx += pl.x;
    sy += pl.y;
    n++;
  }
  return n ? { x: sx / n, y: sy / n, count: n } : { x: 0, y: 0, count: 0 };
}

export type ClusterLabel = { id: number; x: number; y: number; count: number };

// Подписи тем в режиме «Темы»: центроид + разведение по вертикали, иначе на зуме года
// соседние кластеры пишут названия друг поверх друга.
const LABEL_LINE = 3.2;
const LABEL_CHAR = 1.35; // ширина символа при font-size 2.4 в единицах viewBox

export function layoutClusterLabels(
  points: TimedPoint[],
  layout: Layout,
  clusters: { id: number; label: string }[],
): Map<number, ClusterLabel> {
  const items = clusters
    .map((c) => {
      const anchor = clusterAnchor(points, layout, c.id);
      return {
        id: c.id,
        x: anchor.x,
        y: anchor.y,
        count: anchor.count,
        half: Math.min((c.label.length * LABEL_CHAR) / 2, 26),
      };
    })
    .filter((item) => item.count > 0)
    .sort((a, b) => a.y - b.y);

  for (let i = 1; i < items.length; i++) {
    for (let j = 0; j < i; j++) {
      const above = items[j];
      const current = items[i];
      const overlapX = Math.abs(above.x - current.x) < (above.half + current.half) * 0.85;
      if (overlapX && current.y - above.y < LABEL_LINE) current.y = above.y + LABEL_LINE;
    }
  }

  const result = new Map<number, ClusterLabel>();
  for (const item of items) {
    result.set(item.id, {
      id: item.id,
      x: Math.max(item.half + 1, Math.min(layout.view.w - item.half - 1, item.x)),
      y: Math.max(3.4, Math.min(layout.view.h - 1.4, item.y)),
      count: item.count,
    });
  }
  return result;
}
