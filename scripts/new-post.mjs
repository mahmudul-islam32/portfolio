#!/usr/bin/env node
// Create a new blog post:   npm run new-post "My post title"
// German post:              npm run new-post "Mein Titel" -- --de
import { writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const args = process.argv.slice(2);
const de = args.includes('--de');
const title = args.filter((a) => !a.startsWith('--')).join(' ').trim();
if (!title) {
  console.error('Usage: npm run new-post "Your post title"   (add -- --de for a German post)');
  process.exit(1);
}

// Local date, not UTC, so a post written just after midnight gets today's date.
const now = new Date();
const today = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('-');
const slug = title.toLowerCase()
  .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
  .normalize('NFKD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 70);

const dir = join('src', 'content', 'blog');
mkdirSync(dir, { recursive: true });
const file = join(dir, `${today}-${slug}.md`);
if (existsSync(file)) { console.error(`Already exists: ${file}`); process.exit(1); }

writeFileSync(file, `---
title: "${title.replace(/"/g, '\\"')}"
description: "${de ? 'Ein Satz, der den Beitrag zusammenfasst (ca. 150 Zeichen, erscheint bei Google).' : 'One sentence that sums up the post (about 150 characters, shown in Google results).'}"
date: ${today}
tags: []
lang: ${de ? 'de' : 'en'}
draft: true
---

${de ? 'Hier schreiben. Setze `draft: false`, wenn der Beitrag online gehen soll.' : 'Write here. Set `draft: false` when the post is ready to go live.'}

## ${de ? 'Zwischenüberschrift' : 'A heading'}
`);
console.log(`Created ${file}`);
