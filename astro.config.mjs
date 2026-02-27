import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://internet4all.com',
  integrations: [sitemap()],
  vite: {
    css: {
      preprocessorOptions: {}
    }
  }
});
