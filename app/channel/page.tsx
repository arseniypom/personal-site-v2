import type { Metadata } from 'next';
import { loadCurated, loadMap, loadPosts, makePreview, toMeta } from '@/lib/data';
import ChannelSearch from '@/components/ChannelSearch';
import TopicMap, { type PreviewMap } from '@/components/TopicMap';
import {
  ActivityRhythm,
  TopPosts,
  TopicsOverTime,
  type ChannelStats,
} from '@/components/ChannelInsights';
import StoryArcs from '@/components/StoryArcs';
import RandomPost from '@/components/RandomPost';

export const metadata: Metadata = {
  title: 'pomazkov.js',
  description: 'Поиск по каналу и карта тем тг-канала pomazkov.js',
  openGraph: {
    title: 'pomazkov.js',
    description: 'Поиск по каналу и карта тем тг-канала pomazkov.js',
    type: 'website',
  },
};

function formatDate(iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split('-');
  return `${d}.${m}.${y}`;
}

export default async function ChannelPage() {
  const [map, posts, curated] = await Promise.all([loadMap(), loadPosts(), loadCurated()]);

  const previews: PreviewMap = {};
  for (const post of posts) {
    previews[post.id] = {
      preview: makePreview(post.text, 160),
      date: post.date.slice(0, 10),
      link: post.link,
    };
  }

  const metas = posts
    .map((p) => toMeta(p))
    .sort((a, b) => a.date.localeCompare(b.date));
  const byId = new Map(metas.map((m) => [m.id, m]));

  // Hidden gems: long, substantial posts that got fewer reactions than the
  // typical post of their year (early posts naturally have fewer reactions,
  // so we normalize per year).
  const rxOf = (id: number) => byId.get(id)!.rx;
  const medianRxByYear = new Map<string, number>();
  for (const year of new Set(metas.map((m) => m.date.slice(0, 4)))) {
    const sorted = metas
      .filter((m) => m.date.slice(0, 4) === year)
      .map((m) => m.rx)
      .sort((a, b) => a - b);
    medianRxByYear.set(year, sorted[Math.floor(sorted.length / 2)] ?? 0);
  }
  const topIds = new Set(
    [...metas].sort((a, b) => b.rx - a.rx).slice(0, 15).map((m) => m.id),
  );
  const underratedExclude = new Set(curated.underratedExclude ?? []);
  const underratedIds = posts
    .filter((p) => p.text.length >= 600 && !topIds.has(p.id) && !underratedExclude.has(p.id))
    .map((p) => {
      const median = medianRxByYear.get(p.date.slice(0, 4)) || 1;
      return { id: p.id, score: rxOf(p.id) / median };
    })
    .filter((c) => c.score < 0.8)
    .sort((a, b) => a.score - b.score)
    .slice(0, 5)
    .map((c) => c.id);

  // Posting-rhythm stats
  const sortedDates = posts.map((p) => p.date).sort();
  let longestGapDays = 0;
  let longestGapFrom = '';
  let longestGapTo = '';
  for (let i = 1; i < sortedDates.length; i++) {
    const gap =
      (new Date(sortedDates[i]).getTime() - new Date(sortedDates[i - 1]).getTime()) / 86400000;
    if (gap > longestGapDays) {
      longestGapDays = Math.round(gap);
      longestGapFrom = formatDate(sortedDates[i - 1]);
      longestGapTo = formatDate(sortedDates[i]);
    }
  }
  const byMonth = new Map<string, number>();
  for (const m of metas) byMonth.set(m.date.slice(0, 7), (byMonth.get(m.date.slice(0, 7)) ?? 0) + 1);
  const [busiestMonth, busiestCount] = [...byMonth.entries()].sort((a, b) => b[1] - a[1])[0] ?? [
    '',
    0,
  ];

  const stats: ChannelStats = {
    totalPosts: posts.length,
    totalReactions: metas.reduce((s, m) => s + m.rx, 0),
    longestGapDays,
    longestGapFrom,
    longestGapTo,
    busiestMonth,
    busiestCount,
  };

  return (
    <div className="page">
      <header className="site-header">
        <div className="brand">
          <span className="brand-name">Arsenii</span>
          <span className="brand-role">, Software Engineer</span>
        </div>
      </header>

      <section className="card channel-intro">
        <div className="channel-title">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="channel-avatar" src="/channel-avatar.jpg" alt="Аватар канала" />
          <h1 className="channel-heading">
            <a
              className="channel-title-link"
              href="https://t.me/pomazkovjs"
              target="_blank"
              rel="noopener noreferrer"
            >
              @pomazkov.js
              <svg
                className="channel-title-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M7 17L17 7" />
                <path d="M9 7h8v8" />
              </svg>
            </a>
          </h1>
        </div>
        <p className="channel-copy">
          Занимательная статистика по каналу и векторный поиск по постам
        </p>
        {map.sample && (
          <p className="channel-notice">
            Показаны тестовые данные — запустите пайплайн из README, чтобы загрузить настоящие
            посты.
          </p>
        )}
      </section>

      <ActivityRhythm metas={metas} clusters={map.clusters} stats={stats} />

      <TopicMap clusters={map.clusters} points={map.points} previews={previews} />

      <StoryArcs curated={curated} byId={byId} />

      <TopPosts metas={metas} clusters={map.clusters} underratedIds={underratedIds} />

      <TopicsOverTime metas={metas} clusters={map.clusters} />

      <ChannelSearch />

      <RandomPost metas={metas} clusters={map.clusters} />

      <footer className="site-footer">
        {map.updatedAt && (
          <div className="footer-line">Обновлено {formatDate(map.updatedAt)}</div>
        )}
      </footer>
    </div>
  );
}
