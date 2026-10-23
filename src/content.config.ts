import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string().max(90),
    description: z.string().max(170), // shown in Google results – keep it ~150 characters
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    lang: z.enum(['en', 'de']).default('en'),
    draft: z.boolean().default(false),
    image: z.string().optional(), // optional social image, e.g. /og/my-post.png
  }),
});

export const collections = { blog };
