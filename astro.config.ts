import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://howtofishgamehelp.com',
  output: 'static',
  trailingSlash: 'always',
  vite: {
    environments: {
      astro: {
        // Astro's content-sync runner needs these CommonJS packages prebundled.
        optimizeDeps: { include: ['picomatch', 'source-map-js'] },
      },
    },
  },
  integrations: [
    sitemap({
      filter: (page) => !['/search/', '/404/'].some((route) => page.includes(route)),
    }),
  ],
  build: {
    format: 'directory',
  },
});
