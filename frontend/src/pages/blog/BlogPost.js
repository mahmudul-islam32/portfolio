import React, { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { usePost, usePosts } from '../../hooks/usePosts';
import { formatPostDate } from '../../data/posts';
import MarkdownLesson from '../../components/learn/MarkdownLesson';

const BlogPost = () => {
  const { slug } = useParams();
  const { post, loading, error } = usePost(slug);
  const { posts } = usePosts();

  useEffect(() => {
    if (!post) return undefined;
    const previous = document.title;
    document.title = `${post.title} — Mahmudul Islam`;
    return () => {
      document.title = previous;
    };
  }, [post]);

  const idx = post ? posts.findIndex((p) => p.slug === post.slug) : -1;
  const newer = idx > 0 ? posts[idx - 1] : null;
  const older = idx >= 0 && idx < posts.length - 1 ? posts[idx + 1] : null;

  if (loading) {
    return (
      <div className="site-inner blog-page">
        <p className="site-prose">Loading…</p>
      </div>
    );
  }

  if (!post || error) {
    return (
      <div className="site-inner blog-page">
        <p className="site-prose">That post could not be found.</p>
        <p className="post-more">
          <Link className="site-link" to="/blog">
            ← Back to all posts
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="site-inner blog-page">
      <article className="blog-post">
        <p className="post-more post-more--top">
          <Link className="site-link" to="/blog">
            ← All posts
          </Link>
        </p>
        <header className="blog-post__head">
          <p className="post-card__meta">
            <time dateTime={post.date}>{formatPostDate(post.date)}</time>
            <span aria-hidden>·</span>
            <span>{post.readingMinutes} min read</span>
          </p>
          <h1 className="blog-post__title">{post.title}</h1>
          {post.summary && <p className="blog-post__summary">{post.summary}</p>}
          {post.tags.length > 0 && (
            <div className="site-pills site-pills--tight">
              {post.tags.map((t) => (
                <span key={t} className="site-pill site-pill--sm">
                  {t}
                </span>
              ))}
            </div>
          )}
        </header>
        <MarkdownLesson markdown={post.body} />
        <nav className="learn-doc__pager" aria-label="More posts">
          {older ? (
            <Link to={`/blog/${older.slug}`} className="learn-doc__pager-link">
              ← {older.title}
            </Link>
          ) : (
            <span />
          )}
          {newer ? (
            <Link to={`/blog/${newer.slug}`} className="learn-doc__pager-link">
              {newer.title} →
            </Link>
          ) : (
            <span />
          )}
        </nav>
      </article>
    </div>
  );
};

export default BlogPost;
