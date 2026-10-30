import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'blog'>;

/** Published posts, newest first. Drafts show up only in `npm run dev`. */
export async function getPosts(): Promise<Post[]> {
  const posts = await getCollection('blog', ({ data }) => import.meta.env.DEV || !data.draft);
  return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export const postUrl = (p: Post) => `/blog/${p.id}/`;

/** Words of prose, ignoring fenced code blocks. */
export function wordCount(body = ''): number {
  return body.replace(/```[\s\S]*?```/g, ' ').split(/\s+/).filter(Boolean).length;
}

export function readingTime(body = ''): number {
  return Math.max(1, Math.round(wordCount(body) / 220));
}

export const slugifyTag = (tag: string) =>
  tag.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export function formatDate(d: Date, lang: 'en' | 'de' = 'en') {
  return d.toLocaleDateString(lang === 'de' ? 'de-DE' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
}
