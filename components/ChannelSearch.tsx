'use client';

import { useState } from 'react';
import type { PostMeta } from '@/lib/data';
import PostItem from './PostItem';

type Cluster = { id: number; label: string };
type SearchResult = PostMeta & {
  score: number;
  clusterLabel: string | null;
};

const SUGGESTIONS = [
  'Как искать работу за границей',
  'Собеседования в Wise',
  'Переезд в Лондон',
  'Как использовать ИИ в работе',
];

export default function ChannelSearch({
  clusters,
  years,
}: {
  clusters: Cluster[];
  years: string[];
}) {
  const [query, setQuery] = useState('');
  const [topic, setTopic] = useState<number | 'all'>('all');
  const [year, setYear] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'hybrid' | 'vector' | 'keyword' | null>(null);
  const [results, setResults] = useState<SearchResult[] | null>(null);

  function clearResults() {
    setResults(null);
    setMode(null);
    setError(null);
  }

  async function runSearch(e?: React.FormEvent, suggestedQuery?: string) {
    e?.preventDefault();
    const q = (suggestedQuery ?? query).trim();
    if (!q || loading) return;
    if (suggestedQuery) setQuery(suggestedQuery);
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: q,
          cluster: topic === 'all' ? null : topic,
          year: year === 'all' ? null : year,
        }),
      });
      if (!res.ok) throw new Error('Не удалось выполнить поиск.');
      const json = await res.json();
      setResults(json.results);
      setMode(json.mode);
    } catch {
      setError('Не удалось выполнить поиск. Попробуйте ещё раз.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="card channel-search">
      <h2 className="channel-section-heading">Поиск по постам</h2>

      <div className="search-suggestions" aria-label="Примеры запросов">
        {SUGGESTIONS.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            className="search-suggestion"
            onClick={() => void runSearch(undefined, suggestion)}
            disabled={loading}
          >
            {suggestion}
          </button>
        ))}
      </div>

      <form className="search-form" onSubmit={runSearch}>
        <div className="search-query-row">
          <input
            className="search-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="например: как использовать ИИ в работе"
            aria-label="Поисковый запрос"
          />
          <button className="search-button" type="submit" disabled={loading}>
            {loading ? 'Ищу…' : 'Найти'}
          </button>
        </div>

        <div className="search-filters">
          <label className="search-filter">
            <span>Тема</span>
            <select
              value={topic}
              onChange={(e) => {
                setTopic(e.target.value === 'all' ? 'all' : Number(e.target.value));
                clearResults();
              }}
            >
              <option value="all">Все темы</option>
              {clusters.map((cluster) => (
                <option key={cluster.id} value={cluster.id}>
                  {cluster.label}
                </option>
              ))}
            </select>
          </label>

          <label className="search-filter">
            <span>Год</span>
            <select
              value={year}
              onChange={(e) => {
                setYear(e.target.value);
                clearResults();
              }}
            >
              <option value="all">Все годы</option>
              {years.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        </div>
      </form>

      {mode === 'keyword' && results && (
        <p className="search-mode-note">
          Сейчас работает поиск по словам — поиск по смыслу включится после генерации эмбеддингов.
        </p>
      )}
      {error && <p className="search-error">{error}</p>}
      {results && results.length === 0 && (
        <p className="search-empty">Ничего не нашлось — измените запрос или фильтры.</p>
      )}
      {results && results.length > 0 && (
        <ul className="post-list search-results">
          {results.map((result) => (
            <PostItem
              key={result.id}
              post={result}
              clusterLabel={result.clusterLabel ?? undefined}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
