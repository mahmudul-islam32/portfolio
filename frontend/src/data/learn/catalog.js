import { RAG_LESSON_MARKDOWN } from './ragLessonMarkdown';

/** @typedef {{ slug: string, order: number, title: string, summary: string, icon: 'book'|'code'|'layers'|'search'|'cpu'|'git'|'sparkles'|'chart'|'rocket' }} LessonMeta */

/** @typedef {{ slug: string, title: string, description: string, level: string, lessons: LessonMeta[] }} CourseMeta */

/** @type {CourseMeta[]} */
export const learnCourses = [
  {
    slug: 'rag-zero-to-useful',
    title: 'RAG from zero to useful',
    description:
      'A practical path from “I have documents” to “users get grounded answers.” Chunking, embeddings, retrieval, prompts, and evaluation—without hand-wavy magic.',
    level: 'Intermediate',
    lessons: [
      { slug: 'what-problem-rag-solves', order: 1, title: 'What problem RAG solves', summary: 'Ground answers in your data instead of stale model weights.', icon: 'book' },
      { slug: 'documents-and-chunking', order: 2, title: 'Documents and chunking', summary: 'Split text safely, keep metadata, and avoid garbage chunks.', icon: 'layers' },
      { slug: 'embeddings-in-one-pass', order: 3, title: 'Embeddings in one pass', summary: 'Batch embed, version models, and re-embed when content drifts.', icon: 'cpu' },
      { slug: 'vector-vs-keyword-search', order: 4, title: 'Vector vs keyword search', summary: 'Dense vs sparse retrieval and when to combine them.', icon: 'search' },
      { slug: 'minimal-rag-pipeline', order: 5, title: 'A minimal RAG pipeline', summary: 'Ingest → retrieve → prompt → answer with logging.', icon: 'code' },
      { slug: 'retrieval-quality', order: 6, title: 'Improving retrieval quality', summary: 'top-k, MMR, filters, rerankers, and debugging misses.', icon: 'git' },
      { slug: 'grounding-prompts', order: 7, title: 'Prompts that stay on the evidence', summary: 'Citations, refusals, and trimming noisy context.', icon: 'sparkles' },
      { slug: 'rag-evaluation', order: 8, title: 'Evaluating RAG without guesswork', summary: 'Golden sets, retrieval hits, and faithfulness checks.', icon: 'chart' },
      { slug: 'rag-production', order: 9, title: 'Toward production', summary: 'Latency, cost, refresh, PII, and tracing.', icon: 'rocket' },
    ],
  },
];

/**
 * @param {string} courseSlug
 * @returns {CourseMeta | undefined}
 */
export function getCourseBySlug(courseSlug) {
  return learnCourses.find((c) => c.slug === courseSlug);
}

/**
 * @param {string} courseSlug
 * @param {string} lessonSlug
 * @returns {{ course: CourseMeta, lesson: LessonMeta } | undefined}
 */
export function getCourseLesson(courseSlug, lessonSlug) {
  const course = getCourseBySlug(courseSlug);
  if (!course) return undefined;
  const lesson = course.lessons.find((l) => l.slug === lessonSlug);
  if (!lesson) return undefined;
  return { course, lesson };
}

/**
 * @param {string} courseSlug
 * @param {string} lessonSlug
 * @returns {string}
 */
export function getLessonMarkdown(courseSlug, lessonSlug) {
  if (courseSlug !== 'rag-zero-to-useful') return '';
  return RAG_LESSON_MARKDOWN[lessonSlug] || '';
}
