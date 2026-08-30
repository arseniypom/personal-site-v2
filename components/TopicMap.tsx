'use client';

import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useState,
  useSyncExternalStore,
  type CSSProperties,
} from 'react';
import type { PostMeta } from '@/lib/data';
import {
  computeLayout,
  layoutClusterLabels,
  type Layout,
  type LayoutMode,
  type Orientation,
  type TimedPoint,
} from '@/lib/mapLayout';
import { colorOf } from '@/lib/palette';
import PostItem from './PostItem';

type Cluster = { id: number; label: string };
export type PreviewMap = Record<number, PostMeta>;

type View = { mode: LayoutMode; year: string | null; cluster: number | null };
type ViewAction =
  | { type: 'mode'; mode: LayoutMode }
  | { type: 'year'; year: string | null }
  | { type: 'cluster'; cluster: number };

function viewReducer(state: View, action: ViewAction): View {
  switch (action.type) {
    case 'mode':
      return state.mode === action.mode ? state : { ...state, mode: action.mode };
    case 'year':
      return { ...state, year: state.year === action.year ? null : action.year };
    case 'cluster':
      return { ...state, cluster: state.cluster === action.cluster ? null : action.cluster };
  }
}

// Таймлайн разворачивается вниз на узком экране: 8 горизонтальных дорожек на 390 px
// превращаются в четырёхпиксельные полосы.
const NARROW = '(max-width: 640px)';
const subscribeNarrow = (onChange: () => void) => {
  const mq = window.matchMedia(NARROW);
  mq.addEventListener('change', onChange);
  return () => mq.removeEventListener('change', onChange);
};
const narrowSnapshot = (): Orientation => (window.matchMedia(NARROW).matches ? 'v' : 'h');
const narrowServerSnapshot = (): Orientation => 'h';

export default function TopicMap({
  clusters,
  points,
  previews,
}: {
  clusters: Cluster[];
  points: TimedPoint[];
  previews: PreviewMap;
}) {
  const [view, dispatch] = useReducer(viewReducer, {
    mode: 'topics',
    year: null,
    cluster: null,
  });
  const [hovered, setHovered] = useState<TimedPoint | null>(null);
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [moving, setMoving] = useState(false);

  const orientation = useSyncExternalStore(
    subscribeNarrow,
    narrowSnapshot,
    narrowServerSnapshot,
  );
  const timelineOrientation: Orientation = view.mode === 'timeline' ? orientation : 'h';

  const labelOf = useMemo(() => new Map(clusters.map((c) => [c.id, c.label])), [clusters]);
  const years = useMemo(
    () => [...new Set(points.map((p) => p.year))].filter(Boolean).sort(),
    [points],
  );
  const selectedPost = selectedPostId === null ? null : previews[selectedPostId];

  const layout = useMemo(
    () =>
      computeLayout(points, {
        mode: view.mode,
        year: view.year,
        orientation: timelineOrientation,
        clusterCount: clusters.length,
      }),
    [points, view.mode, view.year, timelineOrientation, clusters.length],
  );

  // Слой свечения гасится на время перелёта: feGaussianBlur перерастеризуется каждый кадр
  // и только он, а не количество точек, мешает держать 60 fps на телефоне.
  const layoutKey = `${view.mode}|${view.year ?? 'all'}|${timelineOrientation}`;
  useEffect(() => {
    setMoving(true);
    const timer = setTimeout(() => setMoving(false), 720);
    return () => clearTimeout(timer);
  }, [layoutKey]);

  useEffect(() => {
    if (!selectedPost) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedPostId(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedPost]);

  const onHover = useCallback((point: TimedPoint | null) => setHovered(point), []);
  const onSelect = useCallback((id: number) => setSelectedPostId(id), []);

  const clusterLabels = useMemo(
    () => (view.mode === 'topics' ? layoutClusterLabels(points, layout, clusters) : null),
    [points, layout, clusters, view.mode],
  );

  const visibleCount = useMemo(() => {
    let n = 0;
    for (const p of points) {
      const placed = layout.placed.get(p.id);
      if (placed?.visible && (view.cluster === null || view.cluster === p.c)) n++;
    }
    return n;
  }, [points, layout, view.cluster]);

  const hoveredPlaced = hovered ? layout.placed.get(hovered.id) : null;
  const hoveredPreview = hovered ? previews[hovered.id] : null;
  const relX = hoveredPlaced ? hoveredPlaced.x / layout.view.w : 0;
  const relY = hoveredPlaced ? hoveredPlaced.y / layout.view.h : 0;

  return (
    <>
      <section className="card channel-map" id="topic-map">
        <h2 className="channel-section-heading">Карта тем</h2>
        {points.length === 0 && (
          <p className="channel-map-hint">
            Карта тем появится после генерации эмбеддингов (см. README — запустите пайплайн с
            ключом OpenAI).
          </p>
        )}
        {points.length > 0 && (
          <>
            <p className="channel-map-hint">
              {view.mode === 'topics'
                ? 'Каждая точка — пост. Нажмите, чтобы посмотреть.'
                : timelineOrientation === 'v'
                  ? 'Те же посты по времени: сверху вниз — от старых к новым, столбец — тема.'
                  : 'Те же посты по времени: слева направо — от старых к новым, строка — тема.'}
            </p>

            <div className="map-controls">
              <div className="map-modes" role="group" aria-label="Режим карты">
                <button
                  type="button"
                  className={'map-mode' + (view.mode === 'topics' ? ' is-active' : '')}
                  aria-pressed={view.mode === 'topics'}
                  onClick={() => dispatch({ type: 'mode', mode: 'topics' })}
                >
                  Темы
                </button>
                <button
                  type="button"
                  className={'map-mode' + (view.mode === 'timeline' ? ' is-active' : '')}
                  aria-pressed={view.mode === 'timeline'}
                  onClick={() => dispatch({ type: 'mode', mode: 'timeline' })}
                >
                  Таймлайн
                </button>
              </div>
              <div className="map-years" role="group" aria-label="Фильтр по годам">
                <button
                  type="button"
                  className={'map-year' + (view.year === null ? ' is-active' : '')}
                  aria-pressed={view.year === null}
                  onClick={() => dispatch({ type: 'year', year: null })}
                >
                  Все годы
                </button>
                {years.map((year) => (
                  <button
                    key={year}
                    type="button"
                    className={'map-year' + (view.year === year ? ' is-active' : '')}
                    aria-pressed={view.year === year}
                    onClick={() => dispatch({ type: 'year', year })}
                  >
                    {year}
                  </button>
                ))}
              </div>
            </div>

            <div className="map-legend">
              {clusters.map((cluster) => (
                <button
                  key={cluster.id}
                  type="button"
                  className={
                    'map-legend-chip' +
                    (view.cluster === cluster.id ? ' is-active' : '') +
                    (view.cluster !== null && view.cluster !== cluster.id ? ' is-dimmed' : '')
                  }
                  style={{ borderColor: colorOf(cluster.id) }}
                  onClick={() => dispatch({ type: 'cluster', cluster: cluster.id })}
                >
                  <span className="map-legend-dot" style={{ background: colorOf(cluster.id) }} />
                  {cluster.label}
                </button>
              ))}
            </div>

            <div className={'map-wrap' + (moving ? ' is-moving' : '')}>
              <svg
                className="map-svg"
                viewBox={`0 0 ${layout.view.w} ${layout.view.h}`}
                role="img"
                aria-label="Карта тем постов канала"
              >
                <defs>
                  <filter id="map-blur" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="1.6" />
                  </filter>
                </defs>

                {view.mode === 'timeline' && (
                  <g className="map-axis" aria-hidden="true">
                    {layout.ticks.map((tick) => (
                      <g key={tick.label}>
                        <line
                          x1={timelineOrientation === 'v' ? 0 : tick.pos}
                          y1={timelineOrientation === 'v' ? tick.pos : 4.6}
                          x2={timelineOrientation === 'v' ? layout.view.w : tick.pos}
                          y2={timelineOrientation === 'v' ? tick.pos : layout.view.h}
                        />
                        <text
                          x={timelineOrientation === 'v' ? 1.6 : tick.pos}
                          y={timelineOrientation === 'v' ? tick.pos - 1.6 : 3.4}
                        >
                          {tick.label}
                        </text>
                      </g>
                    ))}
                    {timelineOrientation === 'h' &&
                      clusters.map((cluster) => (
                        <text
                          key={cluster.id}
                          className="map-lane-label"
                          x={0.9}
                          y={layout.laneStart + cluster.id * layout.laneSize + 2.6}
                          fill={colorOf(cluster.id)}
                          opacity={
                            view.cluster === null || view.cluster === cluster.id ? 0.75 : 0.2
                          }
                        >
                          {cluster.label}
                        </text>
                      ))}
                  </g>
                )}

                <DotLayer
                  points={points}
                  layout={layout}
                  activeCluster={view.cluster}
                  onHover={onHover}
                  onSelect={onSelect}
                />

                {clusterLabels &&
                  clusters.map((cluster) => {
                    const anchor = clusterLabels.get(cluster.id);
                    const shown =
                      !!anchor &&
                      anchor.count >= 3 &&
                      (view.cluster === null || view.cluster === cluster.id);
                    return (
                      <text
                        key={cluster.id}
                        className="map-cluster-label"
                        fill={colorOf(cluster.id)}
                        style={{
                          transform: `translate(${(anchor?.x ?? 0).toFixed(2)}px, ${(
                            anchor?.y ?? 0
                          ).toFixed(2)}px)`,
                          opacity: shown ? 1 : 0,
                        }}
                      >
                        {cluster.label}
                      </text>
                    );
                  })}
              </svg>

              {visibleCount === 0 && (
                <p className="map-empty">
                  {view.cluster !== null && view.year
                    ? `В ${view.year} году постов на эту тему не было.`
                    : 'Здесь пока нет постов.'}
                </p>
              )}

              {hoveredPlaced && hoveredPreview && (
                <div
                  className="map-tooltip"
                  style={{
                    left: `${relX * 100}%`,
                    top: `${relY * 100}%`,
                    transform: `translate(${relX > 0.6 ? '-100%' : '0'}, ${
                      relY > 0.6 ? '-110%' : '12px'
                    })`,
                  }}
                >
                  <div className="map-tooltip-date">{hoveredPreview.date}</div>
                  <div className="map-tooltip-text">{hoveredPreview.preview}</div>
                </div>
              )}
            </div>
          </>
        )}
      </section>

      {selectedPost && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedPostId(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Пост с карты тем"
        >
          <div className="modal-card" onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              className="modal-close"
              onClick={() => setSelectedPostId(null)}
              aria-label="Закрыть"
            >
              ×
            </button>
            <ul className="post-list">
              <PostItem post={selectedPost} clusterLabel={labelOf.get(selectedPost.cluster)} />
            </ul>
          </div>
        </div>
      )}
    </>
  );
}

// Точки вынесены в мемоизированный слой: ховер и открытие модалки живут в родителе и больше
// не перерисовывают все 472 круга. Позиции — CSS-переменные, интерполирует их браузер.
const DotLayer = memo(function DotLayer({
  points,
  layout,
  activeCluster,
  onHover,
  onSelect,
}: {
  points: TimedPoint[];
  layout: Layout;
  activeCluster: number | null;
  onHover: (point: TimedPoint | null) => void;
  onSelect: (id: number) => void;
}) {
  const styleOf = (point: TimedPoint, index: number): CSSProperties => {
    const placed = layout.placed.get(point.id);
    return {
      '--map-x': `${(placed?.x ?? 0).toFixed(2)}px`,
      '--map-y': `${(placed?.y ?? 0).toFixed(2)}px`,
      '--map-stagger': `${Math.min(index * 0.5, 120).toFixed(0)}ms`,
    } as CSSProperties;
  };
  const isVisible = (point: TimedPoint) =>
    (layout.placed.get(point.id)?.visible ?? false) &&
    (activeCluster === null || activeCluster === point.c);

  return (
    <>
      <g className="map-glow-layer" filter="url(#map-blur)" aria-hidden="true">
        {points.map((point, index) => (
          <circle
            key={point.id}
            className="map-glow"
            r={3.2}
            fill={colorOf(point.c)}
            style={{ ...styleOf(point, index), opacity: isVisible(point) ? 0.13 : 0 }}
          />
        ))}
      </g>
      <g className="map-dot-layer">
        {points.map((point, index) => {
          const visible = isVisible(point);
          return (
            <circle
              key={point.id}
              className="map-dot"
              r={1.05}
              fill={colorOf(point.c)}
              stroke="transparent"
              strokeWidth={5}
              style={{
                ...styleOf(point, index),
                opacity: visible ? 0.95 : 0,
                pointerEvents: visible ? 'auto' : 'none',
              }}
              onPointerEnter={() => onHover(point)}
              onPointerLeave={() => onHover(null)}
              onClick={() => onSelect(point.id)}
            />
          );
        })}
      </g>
    </>
  );
});
