'use client';

import { useMemo, useState } from 'react';
import type { PostMeta } from '@/lib/data';
import { colorOf } from '@/lib/palette';
import PostItem from './PostItem';

type Cluster = { id: number; label: string };

export type ChannelStats = {
  totalPosts: number;
  totalReactions: number;
  longestGapDays: number;
  longestGapFrom: string;
  longestGapTo: string;
  busiestMonth: string; // YYYY-MM
  busiestCount: number;
};

const MONTHS = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
const MONTHS_FULL = [
  'январь',
  'февраль',
  'март',
  'апрель',
  'май',
  'июнь',
  'июль',
  'август',
  'сентябрь',
  'октябрь',
  'ноябрь',
  'декабрь',
];

function monthName(ym: string): string {
  const [y, m] = ym.split('-');
  return `${MONTHS_FULL[Number(m) - 1]} ${y}`;
}

function plural(n: number, one: string, few: string, many: string): string {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
  return many;
}

const postsWord = (n: number) => plural(n, 'пост', 'поста', 'постов');

/* ---------- Top posts by reactions ---------- */

export function TopPosts({
  metas,
  clusters,
  underratedIds,
}: {
  metas: PostMeta[];
  clusters: Cluster[];
  underratedIds: number[];
}) {
  const [topic, setTopic] = useState<number | null>(null);
  const labelOf = useMemo(() => new Map(clusters.map((c) => [c.id, c.label])), [clusters]);
  const underrated = useMemo(() => {
    const byId = new Map(metas.map((m) => [m.id, m]));
    return underratedIds.map((id) => byId.get(id)).filter(Boolean) as PostMeta[];
  }, [metas, underratedIds]);

  const shown = useMemo(() => {
    const pool = topic === null ? metas : metas.filter((m) => m.cluster === topic);
    return [...pool].sort((a, b) => b.rx - a.rx).slice(0, topic === null ? 10 : 5);
  }, [metas, topic]);

  return (
    <section className="card channel-panel">
      <h2 className="channel-section-heading">Лучшие посты</h2>
      <div className="map-legend">
        <button
          type="button"
          className={
            'map-legend-chip' +
            (topic === null ? ' is-active' : '') +
            (topic !== null ? ' is-dimmed' : '')
          }
          style={{ borderColor: 'rgba(255,255,255,0.35)' }}
          onClick={() => setTopic(null)}
        >
          Все темы
        </button>
        {clusters.map((c) => (
          <button
            key={c.id}
            type="button"
            className={
              'map-legend-chip' +
              (topic === c.id ? ' is-active' : '') +
              (topic !== null && topic !== c.id ? ' is-dimmed' : '')
            }
            style={{ borderColor: colorOf(c.id) }}
            onClick={() => setTopic(topic === c.id ? null : c.id)}
          >
            <span className="map-legend-dot" style={{ background: colorOf(c.id) }} />
            {c.label}
          </button>
        ))}
      </div>
      <ul className="post-list">
        {shown.map((m) => (
          <PostItem key={m.id} post={m} clusterLabel={labelOf.get(m.cluster)} />
        ))}
      </ul>

      {underrated.length > 0 && (
        <>
          <h3 className="channel-subheading">Недооценённые</h3>
          <p className="channel-map-hint">Хорошие лонгриды, которым досталось мало реакций.</p>
          <ul className="post-list">
            {underrated.map((m) => (
              <PostItem key={m.id} post={m} clusterLabel={labelOf.get(m.cluster)} />
            ))}
          </ul>
        </>
      )}
    </section>
  );
}

/* ---------- Topics over the years (stacked columns) ---------- */

export function TopicsOverTime({
  metas,
  clusters,
}: {
  metas: PostMeta[];
  clusters: Cluster[];
}) {
  const [selected, setSelected] = useState<{ year: string; cluster: number } | null>(null);
  const labelOf = useMemo(() => new Map(clusters.map((c) => [c.id, c.label])), [clusters]);

  const years = useMemo(() => {
    const byYear = new Map<string, Map<number, number>>();
    for (const m of metas) {
      const y = m.date.slice(0, 4);
      if (!byYear.has(y)) byYear.set(y, new Map());
      const row = byYear.get(y)!;
      row.set(m.cluster, (row.get(m.cluster) ?? 0) + 1);
    }
    return [...byYear.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([year, counts]) => ({
        year,
        total: [...counts.values()].reduce((s, n) => s + n, 0),
        counts,
      }));
  }, [metas]);

  const maxTotal = Math.max(...years.map((y) => y.total), 1);

  const drilldown = useMemo(() => {
    if (!selected) return null;
    return metas
      .filter((m) => m.date.slice(0, 4) === selected.year && m.cluster === selected.cluster)
      .sort((a, b) => b.rx - a.rx);
  }, [metas, selected]);

  return (
    <section className="card channel-panel">
      <h2 className="channel-section-heading">Темы по годам</h2>
      <div className="topics-chart" role="img" aria-label="Число постов по годам и темам">
        {years.map(({ year, total, counts }) => (
          <div key={year} className="topics-col">
            <div className="topics-col-total">{total}</div>
            <div className="topics-col-bar" style={{ height: `${(total / maxTotal) * 100}%` }}>
              {clusters
                .filter((c) => (counts.get(c.id) ?? 0) > 0)
                .map((c) => {
                  const n = counts.get(c.id)!;
                  const isSel = selected?.year === year && selected?.cluster === c.id;
                  const dim = selected !== null && !isSel;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      className={'topics-seg' + (isSel ? ' is-selected' : '')}
                      style={{
                        flexGrow: n,
                        background: colorOf(c.id),
                        opacity: dim ? 0.25 : 0.92,
                      }}
                      onClick={() => setSelected(isSel ? null : { year, cluster: c.id })}
                      aria-label={`${labelOf.get(c.id)}, ${year}: ${n} ${postsWord(n)}`}
                    >
                      <span className="viz-tooltip">
                        {labelOf.get(c.id)} · {year} · {n} {postsWord(n)}
                      </span>
                    </button>
                  );
                })}
            </div>
            <div className="topics-col-year">{year}</div>
          </div>
        ))}
      </div>
      <div className="viz-legend">
        {clusters.map((c) => (
          <span key={c.id} className="viz-legend-item">
            <span className="map-legend-dot" style={{ background: colorOf(c.id) }} />
            {c.label}
          </span>
        ))}
      </div>

      {selected && drilldown && (
        <div className="viz-drilldown">
          <div className="viz-drilldown-head">
            <h3 className="channel-subheading">
              {labelOf.get(selected.cluster)} · {selected.year} · {drilldown.length}{' '}
              {postsWord(drilldown.length)}
            </h3>
            <button type="button" className="viz-clear" onClick={() => setSelected(null)}>
              Сбросить ×
            </button>
          </div>
          <ul className="post-list">
            {drilldown.map((m) => (
              <PostItem key={m.id} post={m} compact />
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

/* ---------- Posting rhythm: calendar heatmap + fun stats + random post ---------- */

export function ActivityRhythm({
  metas,
  clusters,
  stats,
}: {
  metas: PostMeta[];
  clusters: Cluster[];
  stats: ChannelStats;
}) {
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const labelOf = useMemo(() => new Map(clusters.map((c) => [c.id, c.label])), [clusters]);
  const [randomPost, setRandomPost] = useState<PostMeta | null>(null);

  const { yearRows, maxMonth } = useMemo(() => {
    const byMonth = new Map<string, number>();
    for (const m of metas) {
      const ym = m.date.slice(0, 7);
      byMonth.set(ym, (byMonth.get(ym) ?? 0) + 1);
    }
    const yearsList = [...new Set(metas.map((m) => m.date.slice(0, 4)))].sort();
    const rows = yearsList.map((y) => ({
      year: y,
      months: MONTHS.map((_, i) => {
        const ym = `${y}-${String(i + 1).padStart(2, '0')}`;
        return { ym, count: byMonth.get(ym) ?? 0 };
      }),
    }));
    return { yearRows: rows, maxMonth: Math.max(...byMonth.values(), 1) };
  }, [metas]);

  const monthPosts = useMemo(() => {
    if (!selectedMonth) return null;
    return metas
      .filter((m) => m.date.slice(0, 7) === selectedMonth)
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [metas, selectedMonth]);

  return (
    <section className="card channel-panel">
      <h2 className="channel-section-heading">Активность</h2>

      <div className="stat-tiles">
        <div className="stat-tile is-yellow">
          <div className="stat-tile-value">{stats.totalPosts}</div>
          <div className="stat-tile-label">{postsWord(stats.totalPosts)} с февраля 2022</div>
        </div>
        <div className="stat-tile is-purple">
          <div className="stat-tile-value">{stats.totalReactions.toLocaleString('ru-RU')}</div>
          <div className="stat-tile-label">
            {plural(stats.totalReactions, 'реакция', 'реакции', 'реакций')}
          </div>
        </div>
        <div className="stat-tile is-orange">
          <div className="stat-tile-value">
            {stats.longestGapDays} {plural(stats.longestGapDays, 'день', 'дня', 'дней')}
          </div>
          <div className="stat-tile-label">самая долгая пауза</div>
        </div>
        <div className="stat-tile">
          <div className="stat-tile-value">
            {stats.busiestCount} {postsWord(stats.busiestCount)}
          </div>
          <div className="stat-tile-label">рекордный месяц · {monthName(stats.busiestMonth)}</div>
        </div>
      </div>

      <div className="heatmap" role="img" aria-label="Число постов по месяцам">
        <div className="heatmap-row heatmap-header">
          <span className="heatmap-year" />
          {MONTHS.map((m) => (
            <span key={m} className="heatmap-month-label">
              <span className="heatmap-month-full">{m}</span>
              <span className="heatmap-month-short">{m[0].toUpperCase()}</span>
            </span>
          ))}
        </div>
        {yearRows.map(({ year, months }) => (
          <div key={year} className="heatmap-row">
            <span className="heatmap-year">{year}</span>
            {months.map(({ ym, count }) => {
              const isSel = selectedMonth === ym;
              return (
                <button
                  key={ym}
                  type="button"
                  className={'heatmap-cell' + (isSel ? ' is-selected' : '')}
                  style={{
                    background:
                      count === 0
                        ? 'rgba(255,255,255,0.04)'
                        : `rgba(255, 217, 77, ${0.15 + 0.85 * (count / maxMonth)})`,
                  }}
                  onClick={() => setSelectedMonth(isSel ? null : ym)}
                  disabled={count === 0}
                  aria-label={`${monthName(ym)}: ${count} ${postsWord(count)}`}
                >
                  <span className="viz-tooltip">
                    {monthName(ym)} · {count} {postsWord(count)}
                  </span>
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {selectedMonth && monthPosts && (
        <div className="viz-drilldown">
          <div className="viz-drilldown-head">
            <h3 className="channel-subheading">
              {monthName(selectedMonth)} · {monthPosts.length} {postsWord(monthPosts.length)}
            </h3>
            <button type="button" className="viz-clear" onClick={() => setSelectedMonth(null)}>
              Сбросить ×
            </button>
          </div>
          <ul className="post-list">
            {monthPosts.map((m) => (
              <PostItem key={m.id} post={m} clusterLabel={labelOf.get(m.cluster)} compact />
            ))}
          </ul>
        </div>
      )}

      <div className="random-post">
        <button
          type="button"
          className="search-button"
          onClick={() => setRandomPost(metas[Math.floor(Math.random() * metas.length)])}
        >
          {randomPost ? 'Ещё один' : 'Случайный пост'}
        </button>
        {randomPost && (
          <ul className="post-list">
            <PostItem post={randomPost} clusterLabel={labelOf.get(randomPost.cluster)} />
          </ul>
        )}
      </div>
    </section>
  );
}
