import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://howtofishgamehelp.com',
  output: 'static',
  trailingSlash: 'always',
  integrations: [
    sitemap({
      filter: (page) => !['/search/', '/404/', '/contact/'].some((route) => page.includes(route)),
    }),
  ],
  build: {
    format: 'directory',
  },
});
