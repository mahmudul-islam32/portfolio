import rss from '@astrojs/rss';
import { getPosts, postUrl } from '../lib/blog';
import { profile } from '../data/profile';

export async function GET(context) {
  const posts = await getPosts();
  return rss({
    title: `${profile.name} – Blog`,
    description: 'Notes on backend engineering, Python, TypeScript and LLM/RAG in production.',
    site: context.site,
    items: posts.map((p) => ({
      title: p.data.title,
      description: p.data.description,
      pubDate: p.data.date,
      link: postUrl(p),
      categories: p.data.tags,
    })),
    customData: '<language>en</language>',
  });
}
