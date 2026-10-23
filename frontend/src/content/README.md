# Blog posts

Each post is one Markdown file in this folder:

    YYYY-MM-DD-your-slug.md

- The date (`YYYY-MM-DD`) and slug come from the file name. The slug becomes the URL: `/blog/your-slug`.
- Posts are listed newest first.
- The file starts with front matter:

```
---
title: Post title
summary: One or two sentences shown on the cards and under the title.
tags: [Tag one, Tag two]
---
```

- The body is regular Markdown (GFM tables and fenced code blocks with highlighting work). Start with `##` headings, because the page title is rendered from `title`.
