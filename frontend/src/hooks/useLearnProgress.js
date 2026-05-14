import { useCallback, useState } from 'react';

const STORAGE_KEY = 'portfolio-learn-progress-v1';

function readProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function lessonProgressKey(courseSlug, lessonSlug) {
  return `${courseSlug}/${lessonSlug}`;
}

export function isLessonDone(courseSlug, lessonSlug) {
  return !!readProgress()[lessonProgressKey(courseSlug, lessonSlug)];
}

export function setLessonDone(courseSlug, lessonSlug, done) {
  const p = readProgress();
  const k = lessonProgressKey(courseSlug, lessonSlug);
  if (done) p[k] = true;
  else delete p[k];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
}

export function useLearnProgress() {
  const [, setVersion] = useState(0);
  const refresh = useCallback(() => setVersion((v) => v + 1), []);

  const isDone = (courseSlug, lessonSlug) => isLessonDone(courseSlug, lessonSlug);

  const toggle = useCallback(
    (courseSlug, lessonSlug) => {
      const next = !isLessonDone(courseSlug, lessonSlug);
      setLessonDone(courseSlug, lessonSlug, next);
      refresh();
    },
    [refresh]
  );

  return { isDone, toggle, refresh };
}
