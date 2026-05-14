import React from 'react';
import { Link } from 'react-router-dom';
import { learnCourses } from '../../data/learn/catalog';

const LearnCourseGrid = () => {
  return (
    <div className="site-inner learn-hub">
      <header className="learn-hub__intro site-section learn-hero--tight">
        <p className="site-section__label">Learn with me</p>
        <h1 className="site-section__title">Courses</h1>
        <p className="site-prose learn-hub__desc">
          Open a course to jump straight into the first lesson—sidebar navigation, examples, tables, and copyable code on every page.
        </p>
      </header>

      <section className="learn-hub__grid-section site-section" aria-label="Course list">
        <ul className="learn-course-grid">
          {learnCourses
            .filter((course) => course.lessons?.length)
            .map((course) => (
            <li key={course.slug}>
              <Link
                to={`/learn/${course.slug}/${course.lessons[0].slug}`}
                className="learn-course-card site-card"
              >
                <p className="learn-course-card__level">{course.level}</p>
                <h2 className="learn-course-card__title">{course.title}</h2>
                <p className="learn-course-card__summary">{course.description}</p>
                <p className="learn-course-card__meta">{course.lessons.length} lessons</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default LearnCourseGrid;
