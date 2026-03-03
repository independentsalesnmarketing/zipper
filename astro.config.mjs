import { defineConfig } from 'astro/config';
// Sitemap disabled — generated manually via scripts/generate-sitemap.mjs for 19K+ pages
// import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://internet4all.com',
  integrations: [],
  vite: {
    css: {
      preprocessorOptions: {}
    }
  }
});
