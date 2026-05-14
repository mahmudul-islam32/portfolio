import React from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { getCourseBySlug } from '../../data/learn/catalog';

/** Sends `/learn/:courseSlug` to the first lesson (doc layout with sidebar). */
const LearnCourseRedirect = () => {
  const { courseSlug } = useParams();
  const course = getCourseBySlug(courseSlug || '');
  if (!course?.lessons?.length) {
    return <Navigate to="/learn" replace />;
  }
  const first = course.lessons[0];
  return <Navigate to={`/learn/${course.slug}/${first.slug}`} replace />;
};

export default LearnCourseRedirect;
