# mdislam.dev – portfolio & blog

A static portfolio and blog built with [Astro](https://astro.build). English at `/`, German at `/de/`, blog at `/blog/`.

## Run it

```bash
npm install
npm run dev        # http://localhost:4321 (drafts are visible here)
npm run build      # production build into dist/
npm run preview    # check the production build locally
```

Needs Node.js 18.20+ (20 or 22 recommended).

## Write a blog post (daily)

```bash
npm run new-post "What I learned about Postgres indexes today"
npm run new-post "Mein Titel auf Deutsch" -- --de
```

This creates `src/content/blog/YYYY-MM-DD-your-title.md`. Write in Markdown, then change `draft: true` to `draft: false` and push. Frontmatter:

| Field | What it's for |
|---|---|
| `title` | Post title, also the Google headline (keep it under ~60 characters) |
| `description` | One sentence shown in Google and on LinkedIn previews (~150 characters) |
| `date` | Publish date |
| `tags` | e.g. `[python, fastapi]` – creates topic pages automatically |
| `lang` | `en` or `de` |
| `draft` | `true` hides the post in production |
| `updated` | Optional; set when you revise an old post |
| `image` | Optional social image path, e.g. `/og/my-post.png` (default: `/og.png`) |

Tags matter beyond topic pages: the end of every post lists up to three related posts, picked by how many tags they share, so reuse existing tags where they fit instead of inventing near-duplicates (`devops` rather than `dev-ops`). On `/blog/`, topics are sorted by post count, then alphabetically.

Images for posts go in `public/images/` and are referenced as `/images/name.png`.

## Edit your details

Everything about you (texts in EN and DE, experience, skills, references, Impressum data) is in **`src/data/profile.ts`**. Interface labels are in `src/i18n/ui.ts`.

- `workPermit`: fill in (e.g. "EU Blue Card") to show it in the fact sheet.
- `availability`: set to `''` to hide the green status line.
- Replace `public/Mahmudul_Islam_CV.pdf` when your CV changes.
- After changing the photo or title, run `node scripts/make-og.mjs` to regenerate the social preview image.

## SEO included

- Unique title, description and canonical URL on every page
- `hreflang` links between English and German home pages
- Open Graph / Twitter cards with a 1200×630 preview image
- JSON-LD: `ProfilePage`/`Person` (home), `Blog`, `BlogPosting` and `BreadcrumbList` (posts)
- `sitemap-index.xml`, `robots.txt`, RSS feed at `/rss.xml`
- Static HTML, optimised WebP portrait, self-hosted fonts, no JavaScript shipped

## Deploy (free)

**Netlify** (matches the privacy policy as written): push this folder to a GitHub repo → Netlify → *Add new site* → *Import from Git*. Build command `npm run build`, publish directory `dist`. Then add `mdislam.dev` under *Domain management*.

**Vercel / Cloudflare Pages / GitHub Pages** work the same way (build `npm run build`, output `dist`). If you use another host, update `legal.host` in `src/data/profile.ts` so the Datenschutzerklärung names the right provider.

If the domain changes, update `site` in `astro.config.mjs` and the sitemap line in `public/robots.txt`.

After going live: add the site in [Google Search Console](https://search.google.com/search-console), submit `https://mdislam.dev/sitemap-index.xml`, and put the link on LinkedIn and in your CV.

## Germany-specific notes

- **Impressum** (`/impressum/`) and **Datenschutz** (`/datenschutz/`) are required for a public site with a blog in Germany. They are templates, not legal advice; review them before launch.
- Fonts are bundled locally, not loaded from Google Fonts (embedding Google Fonts has led to GDPR claims in Germany).
- The site sets no cookies and has no tracking, so no cookie banner is needed. If you add analytics later, use a cookieless tool (e.g. Plausible) and update the privacy policy.
