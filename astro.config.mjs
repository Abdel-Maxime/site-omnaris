// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import react from '@astrojs/react';

import sitemap from '@astrojs/sitemap';

import imageOptimizer from './src/integrations/image-optimizer.mjs';

import mdx from '@astrojs/mdx';

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()]
  },
  site: 'https://www.omnaris.fr',
  integrations: [react(), sitemap(), imageOptimizer(), mdx()]
});