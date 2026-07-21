import type { Metadata } from 'next';
import Link from 'next/link';
import { loadMap, loadPosts, makePreview } from '@/lib/data';
import ChannelExplorer, { type PreviewMap } from '@/components/ChannelExplorer';

export const metadata: Metadata = {
  title: 'pomazkov.js — поиск по каналу',
  description: 'Семантический поиск и карта тем по постам Telegram-канала pomazkov.js.',
  openGraph: {
    title: 'pomazkov.js — поиск по каналу',
    description: 'Семантический поиск и карта тем по постам Telegram-канала pomazkov.js.',
    type: 'website',
  },
};

export default async function ChannelPage() {
  const [map, posts] = await Promise.all([loadMap(), loadPosts()]);

  const previews: PreviewMap = {};
  for (const post of posts) {
    previews[post.id] = {
      preview: makePreview(post.text, 160),
      date: post.date.slice(0, 10),
      link: post.link,
    };
  }

  return (
    <div className="page">
      <header className="site-header">
        <div className="brand">
          <Link href="/">
            <span className="brand-name">Arsenii</span>
            <span className="brand-role">, Software Engineer</span>
          </Link>
        </div>
        <nav className="site-nav">
          <Link href="/">← Home</Link>
        </nav>
      </header>

      <section className="card channel-intro">
        <h1 className="channel-heading">My Telegram channel</h1>
        <p className="channel-copy">
          Search through the posts by meaning, not just keywords — or explore the topic map to see
          what the channel is about.
        </p>
        {map.sample && (
          <p className="channel-notice">
            Showing sample data — run the data pipeline (see README) to load real posts.
          </p>
        )}
      </section>

      <ChannelExplorer
        clusters={map.clusters}
        points={map.points}
        previews={previews}
      />

      <footer className="site-footer">
        <div className="footer-line">Made by me &copy;2026</div>
      </footer>
    </div>
  );
}
