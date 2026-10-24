import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

const site = process.env.SITE_URL || 'https://fundacionpedrofranco.com';
if (site && new URL(site).protocol !== 'https:') throw new Error('SITE_URL debe usar HTTPS.');

export default defineConfig({
  site,
  output: 'static',
  trailingSlash: 'always',
  integrations: site ? [sitemap()] : [],
  compressHTML: true,
});
