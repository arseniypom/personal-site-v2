'use client';

import { useState } from 'react';

type SearchResult = {
  id: number;
  score: number;
  preview: string;
  date: string;
  link: string | null;
  cluster: string | null;
};

export default function ChannelSearch() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'vector' | 'keyword' | null>(null);
  const [results, setResults] = useState<SearchResult[] | null>(null);

  async function runSearch(e?: React.FormEvent) {
    e?.preventDefault();
    const q = query.trim();
    if (!q || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      });
      if (!res.ok) throw new Error(`Search failed (${res.status})`);
      const json = await res.json();
      setResults(json.results);
      setMode(json.mode);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="card channel-search">
      <h2 className="channel-section-heading">Поиск по постам</h2>
      <form className="search-form" onSubmit={runSearch}>
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
      </form>
      {mode === 'keyword' && results && (
        <p className="search-mode-note">
          Сейчас работает поиск по словам — поиск по смыслу включится после генерации эмбеддингов.
        </p>
      )}
      {error && <p className="search-error">{error}</p>}
      {results && results.length === 0 && (
        <p className="search-empty">Ничего не нашлось — попробуйте переформулировать.</p>
      )}
      {results && results.length > 0 && (
        <ul className="search-results">
          {results.map((r) => (
            <li key={r.id} className="search-result">
              <div className="search-result-meta">
                <span className="search-result-date">{r.date.slice(0, 10)}</span>
                {r.cluster && <span className="search-result-cluster">{r.cluster}</span>}
              </div>
              <p className="search-result-text">{r.preview}</p>
              {r.link && (
                <a
                  className="search-result-link"
                  href={r.link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Открыть пост →
                </a>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
