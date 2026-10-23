/**
 * Minimal front-matter parser (no dependencies).
 * Supports `key: value` lines and `tags: [a, b, c]` lists between leading `---` fences.
 */
export function parseFrontmatter(raw) {
  const text = String(raw || '').replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
  const match = text.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return { data: {}, body: text.trim() };

  const data = {};
  match[1].split('\n').forEach((line) => {
    const idx = line.indexOf(':');
    if (idx === -1) return;
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    if (!key) return;
    if (value.startsWith('[') && value.endsWith(']')) {
      data[key] = value
        .slice(1, -1)
        .split(',')
        .map((v) => v.trim().replace(/^['"]|['"]$/g, ''))
        .filter(Boolean);
      return;
    }
    value = value.replace(/^['"]|['"]$/g, '');
    data[key] = value;
  });

  return { data, body: match[2].trim() };
}

export default parseFrontmatter;
