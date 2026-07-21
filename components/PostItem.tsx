import type { PostMeta } from '@/lib/data';
import { colorOf } from '@/lib/palette';

// One post row: date, topic chip, reactions, preview and the Telegram link.
// Used by every post list on the channel page (top posts, series, drill-downs).
export default function PostItem({
  post,
  clusterLabel,
  compact = false,
}: {
  post: PostMeta;
  clusterLabel?: string;
  compact?: boolean;
}) {
  return (
    <li className={'post-item' + (compact ? ' is-compact' : '')}>
      <div className="post-item-meta">
        <span className="post-item-date">{post.date}</span>
        {clusterLabel && (
          <span
            className="post-item-cluster"
            style={{ color: colorOf(post.cluster) }}
          >
            <span
              className="post-item-cluster-dot"
              style={{ background: colorOf(post.cluster) }}
            />
            {clusterLabel}
          </span>
        )}
        {post.rx > 0 && (
          <span className="post-item-reactions" title={`Реакции: ${post.rx}`}>
            {post.topE} {post.rx}
          </span>
        )}
      </div>
      <p className="post-item-text">{post.preview}</p>
      {post.link && (
        <a
          className="post-item-link"
          href={post.link}
          target="_blank"
          rel="noopener noreferrer"
        >
          Открыть в Telegram →
        </a>
      )}
    </li>
  );
}
