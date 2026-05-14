import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, Navigate, NavLink, useParams } from 'react-router-dom';
import { getCourseBySlug, getCourseLesson, getLessonMarkdown } from '../../data/learn/catalog';
import { extractMarkdownToc } from '../../utils/extractMarkdownToc';
import MarkdownLesson from '../../components/learn/MarkdownLesson';
import LessonNavIcon from '../../components/learn/LessonNavIcon';
import { useLearnProgress } from '../../hooks/useLearnProgress';

const LearnLessonDoc = () => {
  const { courseSlug, lessonSlug } = useParams();
  const articleRef = useRef(null);
  const [copyMsg, setCopyMsg] = useState('');

  const pair = useMemo(() => {
    if (!courseSlug || !lessonSlug) return undefined;
    return getCourseLesson(courseSlug, lessonSlug);
  }, [courseSlug, lessonSlug]);

  const markdown = useMemo(
    () => (courseSlug && lessonSlug ? getLessonMarkdown(courseSlug, lessonSlug) : ''),
    [courseSlug, lessonSlug]
  );

  const toc = useMemo(() => extractMarkdownToc(markdown), [markdown]);
  const [activeId, setActiveId] = useState(() => toc[0]?.id || '');
  const { isDone, toggle } = useLearnProgress();

  useEffect(() => {
    setActiveId(toc[0]?.id || '');
  }, [lessonSlug, toc]);

  useEffect(() => {
    const rootEl = articleRef.current;
    if (!rootEl) return undefined;
    const headings = rootEl.querySelectorAll('h2[id], h3[id]');
    if (!headings.length) return undefined;

    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.target.getBoundingClientRect().top - b.target.getBoundingClientRect().top);
        const id = visible[0]?.target?.id;
        if (id) setActiveId(id);
      },
      { rootMargin: '-12% 0px -62% 0px', threshold: [0, 0.25, 0.5, 1] }
    );

    headings.forEach((h) => obs.observe(h));
    return () => obs.disconnect();
  }, [markdown, lessonSlug]);

  if (!courseSlug || !lessonSlug) {
    return <Navigate to="/learn" replace />;
  }

  if (!pair) {
    const c = getCourseBySlug(courseSlug);
    if (c?.lessons?.length) {
      return <Navigate to={`/learn/${c.slug}/${c.lessons[0].slug}`} replace />;
    }
    return <Navigate to="/learn" replace />;
  }

  const { course, lesson } = pair;
  const idx = course.lessons.findIndex((l) => l.slug === lesson.slug);
  const prev = idx > 0 ? course.lessons[idx - 1] : null;
  const next = idx >= 0 && idx < course.lessons.length - 1 ? course.lessons[idx + 1] : null;

  const copyPage = async () => {
    const text = `# ${lesson.title}\n${window.location.href}\n\n---\n\n${markdown}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopyMsg('Copied');
      setTimeout(() => setCopyMsg(''), 2000);
    } catch {
      setCopyMsg('Could not copy');
      setTimeout(() => setCopyMsg(''), 2500);
    }
  };

  const done = isDone(course.slug, lesson.slug);

  return (
    <div className="learn-doc-page">
      <div className="learn-doc-breadcrumb learn-doc-breadcrumb--inner">
        <Link to="/learn">Courses</Link>
        <span aria-hidden="true">/</span>
        <span className="learn-doc-breadcrumb__text">{course.title}</span>
        <span aria-hidden="true">/</span>
        <span className="learn-doc-breadcrumb__text">{lesson.title}</span>
      </div>

      <div className="learn-doc">
        <aside className="learn-doc__sidebar learn-doc__sidebar--left" aria-label="Lessons">
          <p className="learn-doc__sidebar-title">Lessons</p>
          <nav className="learn-doc__lesson-nav">
            {course.lessons.map((l) => (
              <NavLink
                key={l.slug}
                to={`/learn/${course.slug}/${l.slug}`}
                className={({ isActive }) =>
                  `learn-doc__lesson-link${isActive ? ' learn-doc__lesson-link--active' : ''}`
                }
              >
                <span className="learn-doc__lesson-link-icon" aria-hidden>
                  <LessonNavIcon name={l.icon} />
                </span>
                <span className="learn-doc__lesson-link-text">{l.title}</span>
                {isDone(course.slug, l.slug) ? (
                  <span className="learn-doc__lesson-check" title="Complete" aria-hidden>
                    ✓
                  </span>
                ) : (
                  <span className="learn-doc__lesson-check learn-doc__lesson-check--empty" aria-hidden />
                )}
              </NavLink>
            ))}
          </nav>
        </aside>

        <article className="learn-doc__article" ref={articleRef}>
          <header className="learn-doc__article-head">
            <div className="learn-doc__article-eyebrow">
              <LessonNavIcon name={lesson.icon} className="learn-doc__article-eyebrow-icon" />
              <span>{lesson.title}</span>
            </div>
            <div className="learn-doc__article-head-row">
              <h1 className="learn-doc__article-title">{lesson.title}</h1>
              <div className="learn-doc__article-actions">
                <button type="button" className="learn-doc__btn" onClick={copyPage}>
                  {copyMsg || 'Copy page'}
                </button>
                <button
                  type="button"
                  className={`learn-doc__btn learn-doc__btn--primary${done ? ' is-on' : ''}`}
                  onClick={() => toggle(course.slug, lesson.slug)}
                  aria-pressed={done}
                >
                  {done ? 'Completed' : 'Mark complete'}
                </button>
              </div>
            </div>
          </header>

          {markdown ? (
            <MarkdownLesson markdown={markdown} />
          ) : (
            <p className="site-prose">Lesson content will appear here.</p>
          )}

          <nav className="learn-doc__pager" aria-label="Previous and next lesson">
            {prev ? (
              <Link to={`/learn/${course.slug}/${prev.slug}`} className="learn-doc__pager-link learn-doc__pager-link--prev">
                ← {prev.title}
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link to={`/learn/${course.slug}/${next.slug}`} className="learn-doc__pager-link learn-doc__pager-link--next">
                {next.title} →
              </Link>
            ) : (
              <span />
            )}
          </nav>
        </article>

        <aside className="learn-doc__sidebar learn-doc__sidebar--right" aria-label="On this page">
          <p className="learn-doc__sidebar-title">On this page</p>
          {toc.length === 0 ? (
            <p className="learn-doc__toc-empty">No headings yet.</p>
          ) : (
            <nav className="learn-doc__toc">
              {toc.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className={`learn-doc__toc-link learn-doc__toc-link--h${item.level}${activeId === item.id ? ' is-active' : ''}`}
                >
                  {item.text}
                </a>
              ))}
            </nav>
          )}
        </aside>
      </div>
    </div>
  );
};

export default LearnLessonDoc;
