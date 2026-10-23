import React from 'react';
import { Link } from 'react-router-dom';
import { usePosts } from '../hooks/usePosts';
import PostCard from './PostCard';

const LatestPosts = () => {
  const { posts, loading } = usePosts();
  if (loading || posts.length === 0) return null;

  return (
    <section id="blog" className="site-section">
      <div className="site-section__head">
        <p className="site-section__label">Tech blog</p>
        <h2 className="site-section__title">Latest posts</h2>
      </div>
      <div className="post-grid">
        {posts.slice(0, 3).map((p) => (
          <PostCard key={p.slug} post={p} />
        ))}
      </div>
      <p className="post-more">
        <Link className="site-link" to="/blog">
          All posts <span aria-hidden>→</span>
        </Link>
      </p>
    </section>
  );
};

export default LatestPosts;
