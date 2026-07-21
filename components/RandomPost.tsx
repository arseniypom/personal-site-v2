'use client';

import { useEffect, useMemo, useState } from 'react';
import type { PostMeta } from '@/lib/data';
import PostItem from './PostItem';

type Cluster = { id: number; label: string };

export default function RandomPost({
  metas,
  clusters,
}: {
  metas: PostMeta[];
  clusters: Cluster[];
}) {
  const [post, setPost] = useState<PostMeta | null>(null);
  const labelOf = useMemo(() => new Map(clusters.map((c) => [c.id, c.label])), [clusters]);

  const pick = () => setPost(metas[Math.floor(Math.random() * metas.length)]);
  const close = () => setPost(null);

  useEffect(() => {
    if (!post) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [post]);

  return (
    <>
      <div className="random-post-row">
        <button type="button" className="search-button" onClick={pick}>
          Случайный пост
        </button>
      </div>

      {post && (
        <div className="modal-overlay" onClick={close} role="dialog" aria-modal="true">
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="modal-close" onClick={close} aria-label="Закрыть">
              ×
            </button>
            <ul className="post-list">
              <PostItem post={post} clusterLabel={labelOf.get(post.cluster)} />
            </ul>
            <div className="modal-actions">
              <button type="button" className="search-button" onClick={pick}>
                Ещё один
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
