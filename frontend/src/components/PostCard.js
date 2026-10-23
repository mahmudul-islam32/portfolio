import React from 'react';
import { Link } from 'react-router-dom';
import { formatPostDate } from '../data/posts';

const PostCard = ({ post }) => (
  <Link to={`/blog/${post.slug}`} className="site-card post-card">
    <p className="post-card__meta">
      <time dateTime={post.date}>{formatPostDate(post.date)}</time>
      <span aria-hidden>·</span>
      <span>{post.readingMinutes} min read</span>
    </p>
    <h3 className="post-card__title">{post.title}</h3>
    {post.summary && <p className="post-card__summary">{post.summary}</p>}
    {post.tags.length > 0 && (
      <div className="site-pills site-pills--tight">
        {post.tags.map((t) => (
          <span key={t} className="site-pill site-pill--sm">
            {t}
          </span>
        ))}
      </div>
    )}
  </Link>
);

export default PostCard;
