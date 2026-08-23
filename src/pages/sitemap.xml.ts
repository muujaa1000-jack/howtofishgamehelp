import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';
import { categories, guidePath, site } from '../config/site';

function escapeXml(value: string) {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&apos;');
}

export const GET: APIRoute = async () => {
  const guides = await getCollection('guides', ({ data }) => !data.draft && !data.noindex);
  const urls: Array<{ path: string; lastmod?: string }> = [
    { path: '/' },
    { path: '/about/' },
    ...(site.contactEmailEnabled ? [{ path: '/contact/' }] : []),
    { path: '/privacy/' },
    { path: '/terms/' },
    { path: '/disclaimer/' },
    ...categories.map((category) => {
      const dates = guides.filter((guide) => guide.data.category === category.slug).map((guide) => guide.data.updatedAt.getTime());
      return { path: `/${category.slug}/`, lastmod: dates.length ? new Date(Math.max(...dates)).toISOString().slice(0, 10) : undefined };
    }),
    ...guides.map((guide) => ({
      path: guidePath(guide.data.category, guide.data.slug),
      lastmod: guide.data.updatedAt.toISOString().slice(0, 10),
    })),
  ];

  const body = urls
    .sort((a, b) => a.path.localeCompare(b.path))
    .map(({ path, lastmod }) => `<url><loc>${escapeXml(new URL(path, site.url).toString())}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}</url>`)
    .join('');

  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}</urlset>\n`, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
