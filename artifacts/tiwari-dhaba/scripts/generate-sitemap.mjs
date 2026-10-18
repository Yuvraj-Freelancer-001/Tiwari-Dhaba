import { writeFile } from 'node:fs/promises';
const site = (process.env.SITE_URL || '').trim().replace(/\/$/, '');
if (!site || !/^https?:\/\//i.test(site)) {
  console.warn('SITE_URL is not set; skipping sitemap.xml. Set SITE_URL to the deployed HTTPS origin to generate an absolute sitemap.');
  process.exit(0);
}
const paths = ['', 'menu', 'rooms', 'gallery', 'reviews', 'privacy-policy'];
const urls = paths.map(path => `  <url><loc>${site}/${path}</loc></url>`).join('\n');
await writeFile(new URL('../dist/public/sitemap.xml', import.meta.url), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
console.log('Generated sitemap.xml for', site);
