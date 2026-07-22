import type { Metadata } from 'next';
import { loadCurated, loadMap, loadPosts, toMeta } from '@/lib/data';
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

  const metas = posts
    .map((p) => toMeta(p))
    .sort((a, b) => a.date.localeCompare(b.date));
  const previews: PreviewMap = Object.fromEntries(metas.map((m) => [m.id, m]));
  const byId = new Map(metas.map((m) => [m.id, m]));

  // Posting-rhythm stats
  const byMonth = new Map<string, number>();
  for (const m of metas) byMonth.set(m.date.slice(0, 7), (byMonth.get(m.date.slice(0, 7)) ?? 0) + 1);
  const [busiestMonth, busiestCount] = [...byMonth.entries()].sort((a, b) => b[1] - a[1])[0] ?? [
    '',
    0,
  ];
  const startMonth = metas[0]?.date.slice(0, 7) ?? '';
  const dataThroughMonth = (map.updatedAt ?? metas[metas.length - 1]?.date ?? '').slice(0, 7);
  const [startYear, startMonthNumber] = startMonth.split('-').map(Number);
  const [endYear, endMonthNumber] = dataThroughMonth.split('-').map(Number);
  const monthsInArchive =
    startYear && endYear
      ? (endYear - startYear) * 12 + endMonthNumber - startMonthNumber + 1
      : 1;

  const stats: ChannelStats = {
    totalPosts: posts.length,
    totalReactions: metas.reduce((s, m) => s + m.rx, 0),
    averagePostsPerMonth: posts.length / Math.max(monthsInArchive, 1),
    startMonth,
    dataThroughMonth,
    busiestMonth,
    busiestCount,
  };
  const years = [...new Set(metas.map((m) => m.date.slice(0, 4)))].sort().reverse();

  return (
    <div className="page">
      <header className="site-header">
        <div className="brand">
          <span className="brand-name">Arsenii</span>
          <span className="brand-role">, Software Engineer</span>
        </div>
      </header>

      <section className="card channel-intro">
        <div className="channel-intro-content">
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
            Архив @pomazkov.js – {posts.length} постов о разработке, карьере, релокации и ИИ.
            Изучайте канал по темам или найдите нужное по смыслу.
          </p>
          <div className="channel-intro-actions" aria-label="Навигация по архиву">
            <a className="channel-intro-action is-primary" href="#channel-search">
              Найти пост <span aria-hidden="true">↓</span>
            </a>
            <a className="channel-intro-action is-secondary" href="#topic-map">
              Изучить темы
            </a>
          </div>
          {map.sample && (
            <p className="channel-notice">
              Показаны тестовые данные — запустите пайплайн из README, чтобы загрузить настоящие
              посты.
            </p>
          )}
        </div>
      </section>

      <ActivityRhythm metas={metas} clusters={map.clusters} stats={stats} />

      <TopicMap clusters={map.clusters} points={map.points} previews={previews} />

      <StoryArcs curated={curated} byId={byId} />

      <TopPosts metas={metas} clusters={map.clusters} />

      <TopicsOverTime metas={metas} clusters={map.clusters} />

      <ChannelSearch clusters={map.clusters} years={years} />

      <RandomPost metas={metas} clusters={map.clusters} />

      <footer className="site-footer">
        {map.updatedAt && (
          <div className="footer-line">Обновлено {formatDate(map.updatedAt)}</div>
        )}
      </footer>
    </div>
  );
}
