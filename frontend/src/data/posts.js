import { parseFrontmatter } from '../utils/frontmatter';

/**
 * Blog posts live in `src/content/posts/YYYY-MM-DD-slug.md`.
 * The date and slug come from the file name; the rest from front matter
 * (title, summary, tags). See `src/content/posts/README.md`.
 */
const context = require.context('../content/posts', false, /\.md$/);

const FILE_RE = /^\.\/(\d{4}-\d{2}-\d{2})-(.+)\.md$/;

const entries = context
  .keys()
  .map((key) => {
    const m = key.match(FILE_RE);
    if (!m) return null;
    return { date: m[1], slug: m[2], url: context(key) };
  })
  .filter(Boolean)
  .sort((a, b) => (a.date === b.date ? a.slug.localeCompare(b.slug) : b.date.localeCompare(a.date)));

const cache = new Map();

function wordsToMinutes(text) {
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

async function loadEntry(entry) {
  if (!cache.has(entry.slug)) {
    cache.set(
      entry.slug,
      fetch(entry.url)
        .then((res) => {
          if (!res.ok) throw new Error(`Could not load post ${entry.slug}`);
          return res.text();
        })
        .then((raw) => {
          const { data, body } = parseFrontmatter(raw);
          return {
            slug: entry.slug,
            date: entry.date,
            title: data.title || entry.slug.replace(/-/g, ' '),
            summary: data.summary || '',
            tags: Array.isArray(data.tags) ? data.tags : [],
            readingMinutes: wordsToMinutes(body),
            body,
          };
        })
    );
  }
  return cache.get(entry.slug);
}

/** All posts, newest first. */
export function loadPosts() {
  return Promise.all(entries.map(loadEntry));
}

/** One post by slug, or null. */
export function loadPost(slug) {
  const entry = entries.find((e) => e.slug === slug);
  return entry ? loadEntry(entry) : Promise.resolve(null);
}

export function formatPostDate(date) {
  const d = new Date(`${date}T12:00:00`);
  if (Number.isNaN(d.getTime())) return date;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}
