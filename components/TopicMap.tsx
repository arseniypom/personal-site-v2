'use client';

import { useMemo, useState } from 'react';
import { colorOf } from '@/lib/palette';

type Cluster = { id: number; label: string };
type Point = { id: number; x: number; y: number; c: number };
export type PreviewMap = Record<
  number,
  { preview: string; date: string; link: string | null }
>;

const VIEW_W = 100;
const VIEW_H = 64;

export default function TopicMap({
  clusters,
  points,
  previews,
}: {
  clusters: Cluster[];
  points: Point[];
  previews: PreviewMap;
}) {
  const [activeCluster, setActiveCluster] = useState<number | null>(null);
  const [hovered, setHovered] = useState<Point | null>(null);

  const labelPositions = useMemo(() => {
    return clusters.map((cluster) => {
      const own = points.filter((p) => p.c === cluster.id);
      const cx = own.reduce((s, p) => s + p.x, 0) / Math.max(own.length, 1);
      const cy = own.reduce((s, p) => s + p.y, 0) / Math.max(own.length, 1);
      return { cluster, x: cx * VIEW_W, y: cy * VIEW_H };
    });
  }, [clusters, points]);

  return (
    <section className="card channel-map">
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
            Каждая точка — пост; близкие по смыслу посты лежат рядом. Наведите на точку, чтобы
            увидеть превью, нажмите на тему, чтобы её подсветить.
          </p>
          <div className="map-legend">
            {clusters.map((cluster) => (
              <button
                key={cluster.id}
                type="button"
                className={
                  'map-legend-chip' +
                  (activeCluster === cluster.id ? ' is-active' : '') +
                  (activeCluster !== null && activeCluster !== cluster.id ? ' is-dimmed' : '')
                }
                style={{ borderColor: colorOf(cluster.id) }}
                onClick={() =>
                  setActiveCluster(activeCluster === cluster.id ? null : cluster.id)
                }
              >
                <span className="map-legend-dot" style={{ background: colorOf(cluster.id) }} />
                {cluster.label}
              </button>
            ))}
          </div>
          <div className="map-wrap">
            <svg
              className="map-svg"
              viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
              role="img"
              aria-label="Карта тем постов канала"
            >
              <defs>
                <filter id="map-blur" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="1.6" />
                </filter>
              </defs>
              <g filter="url(#map-blur)">
                {points.map((p) => (
                  <circle
                    key={`glow-${p.id}`}
                    cx={p.x * VIEW_W}
                    cy={p.y * VIEW_H}
                    r={3.2}
                    fill={colorOf(p.c)}
                    opacity={activeCluster === null || activeCluster === p.c ? 0.13 : 0.03}
                  />
                ))}
              </g>
              {points.map((p) => (
                <circle
                  key={p.id}
                  cx={p.x * VIEW_W}
                  cy={p.y * VIEW_H}
                  r={hovered?.id === p.id ? 1.5 : 1.05}
                  fill={colorOf(p.c)}
                  opacity={activeCluster === null || activeCluster === p.c ? 0.95 : 0.18}
                  style={{ cursor: 'pointer', transition: 'opacity 0.15s ease' }}
                  onMouseEnter={() => setHovered(p)}
                  onMouseLeave={() => setHovered(null)}
                />
              ))}
              {labelPositions.map(({ cluster, x, y }) => (
                <text
                  key={cluster.id}
                  x={x}
                  y={y}
                  className="map-cluster-label"
                  fill={colorOf(cluster.id)}
                  opacity={activeCluster === null || activeCluster === cluster.id ? 1 : 0.25}
                >
                  {cluster.label}
                </text>
              ))}
            </svg>
            {hovered && previews[hovered.id] && (
              <div
                className="map-tooltip"
                style={{
                  left: `${hovered.x * 100}%`,
                  top: `${hovered.y * 100}%`,
                  transform: `translate(${hovered.x > 0.6 ? '-100%' : '0'}, ${
                    hovered.y > 0.6 ? '-110%' : '12px'
                  })`,
                }}
              >
                <div className="map-tooltip-date">{previews[hovered.id].date}</div>
                <div className="map-tooltip-text">{previews[hovered.id].preview}</div>
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}
