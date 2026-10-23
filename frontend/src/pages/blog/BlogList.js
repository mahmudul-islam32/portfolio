import React from 'react';
import { usePosts } from '../../hooks/usePosts';
import PostCard from '../../components/PostCard';

const BlogList = () => {
  const { posts, loading, error } = usePosts();

  return (
    <div className="site-inner blog-page">
      <header className="site-section blog-page__intro">
        <p className="site-section__label">Tech blog</p>
        <h1 className="site-section__title">Notes on building software</h1>
        <p className="site-prose blog-page__desc">
          Short, practical write-ups on engineering, architecture, and the tools I work with.
        </p>
      </header>
      {loading && <p className="site-prose">Loading posts…</p>}
      {error && <p className="site-prose">Posts could not be loaded right now.</p>}
      {!loading && !error && posts.length === 0 && <p className="site-prose">No posts yet.</p>}
      <div className="post-grid post-grid--list">
        {posts.map((p) => (
          <PostCard key={p.slug} post={p} />
        ))}
      </div>
    </div>
  );
};

export default BlogList;
