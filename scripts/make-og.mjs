// Regenerates public/og.png (social preview) and public/apple-touch-icon.png.
// Run: node scripts/make-og.mjs
import sharp from 'sharp';
import { readFileSync } from 'node:fs';

const photo = await sharp('src/data/portrait.png').resize(420, 420).png().toBuffer();
const b64 = photo.toString('base64');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <defs><clipPath id="c"><rect x="720" y="105" width="420" height="420" rx="18"/></clipPath></defs>
  <rect width="1200" height="630" fill="#14213a"/>
  <image href="data:image/png;base64,${b64}" x="720" y="105" width="420" height="420" clip-path="url(#c)"/>
  <text x="70" y="160" font-family="DejaVu Sans, Arial, sans-serif" font-size="28" fill="#8db4ef" font-weight="bold">Software Engineer · Backend &amp; Full-Stack</text>
  <text x="70" y="270" font-family="DejaVu Sans, Arial, sans-serif" font-size="84" fill="#f6f7f9" font-weight="bold" letter-spacing="-2">Mahmudul</text>
  <text x="70" y="365" font-family="DejaVu Sans, Arial, sans-serif" font-size="84" fill="#f6f7f9" font-weight="bold" letter-spacing="-2">Islam</text>
  <text x="70" y="450" font-family="DejaVu Sans, Arial, sans-serif" font-size="28" fill="#b2bccb">Python · TypeScript · LLM/RAG · Celle, Germany</text>
  <text x="70" y="540" font-family="DejaVu Sans Mono, monospace" font-size="26" fill="#f6f7f9">mdislam.dev</text>
</svg>`;

await sharp(Buffer.from(svg)).png().toFile('public/og.png');
await sharp(readFileSync('public/favicon.svg')).resize(180, 180).png().toFile('public/apple-touch-icon.png');
console.log('Wrote public/og.png and public/apple-touch-icon.png');
