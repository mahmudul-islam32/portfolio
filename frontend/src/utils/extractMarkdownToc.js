import GithubSlugger from 'github-slugger';

/**
 * Build "On this page" entries from ## and ### lines (matches rehype-slug + github-slugger ordering).
 * @param {string} markdown
 * @returns {{ level: number, text: string, id: string }[]}
 */
export function extractMarkdownToc(markdown) {
  const slugger = new GithubSlugger();
  const toc = [];
  if (!markdown) return toc;

  for (const raw of markdown.split('\n')) {
    const line = raw.trim();
    const m = /^(#{2,3})\s+(.+)$/.exec(line);
    if (!m) continue;
    const level = m[1].length;
    const text = m[2].replace(/\s+#+\s*$/, '').trim();
    const id = slugger.slug(text);
    toc.push({ level, text, id });
  }
  return toc;
}
