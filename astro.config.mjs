import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Change this if you deploy to a different domain.
export default defineConfig({
  site: 'https://mdislam.dev',
  trailingSlash: 'always',
  integrations: [
    sitemap({
      i18n: {
        defaultLocale: 'en',
        locales: { en: 'en-US', de: 'de-DE' },
      },
      // Leave out pages marked noindex (legal pages, small tag pages).
      filter: (page) => !/\/(404|impressum|datenschutz)\/?$|\/blog\/tag\//.test(page),
    }),
  ],
  markdown: {
    shikiConfig: { themes: { light: 'github-light', dark: 'github-dark' } },
  },
});
