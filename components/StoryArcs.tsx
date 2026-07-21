import type { Curated, PostMeta } from '@/lib/data';

// Curated reading paths: the channel's story as a timeline of milestones,
// plus multi-part post series worth reading in order.
export default function StoryArcs({
  curated,
  byId,
}: {
  curated: Curated;
  byId: Map<number, PostMeta>;
}) {
  const timeline = curated.timeline
    .map((t) => ({ ...t, post: byId.get(t.id) }))
    .filter((t) => t.post);
  const series = curated.series
    .map((s) => ({ ...s, posts: s.ids.map((id) => byId.get(id)).filter(Boolean) as PostMeta[] }))
    .filter((s) => s.posts.length > 0);

  if (timeline.length === 0 && series.length === 0) return null;

  return (
    <section className="card channel-panel">
      <h2 className="channel-section-heading">История канала</h2>
      <p className="channel-map-hint">От банка в Москве до финтеха в Лондоне — в постах.</p>

      <ol className="timeline">
        {timeline.map(({ id, label, post }, i) => (
          <li key={id} className="timeline-item">
            <span className="timeline-dot">{i + 1}</span>
            <div className="timeline-body">
              <span className="timeline-date">{post!.date}</span>
              {post!.link ? (
                <a
                  className="timeline-label"
                  href={post!.link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {label} →
                </a>
              ) : (
                <span className="timeline-label">{label}</span>
              )}
            </div>
          </li>
        ))}
      </ol>

      {series.length > 0 && (
        <>
          <h3 className="channel-subheading">Серии постов</h3>
          <div className="series-grid">
            {series.map((s) => (
              <article key={s.title} className="series-card">
                <h4 className="series-title">{s.title}</h4>
                <p className="series-desc">{s.description}</p>
                <div className="series-parts">
                  {s.posts.map((p, i) =>
                    p.link ? (
                      <a
                        key={p.id}
                        className="series-part"
                        href={p.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={p.date}
                      >
                        Ч{i + 1}
                      </a>
                    ) : (
                      <span key={p.id} className="series-part">
                        Ч{i + 1}
                      </span>
                    ),
                  )}
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
