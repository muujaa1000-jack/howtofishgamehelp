import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { guidePath, site } from '../config/site';

export async function GET(context: { site?: URL }) {
  const entries = await getCollection('guides', ({ data }) => !data.draft && !data.noindex);
  return rss({
    title: `${site.name} updates`,
    description: site.description,
    site: context.site ?? new URL(site.url),
    items: entries.sort((a, b) => b.data.updatedAt.valueOf() - a.data.updatedAt.valueOf()).map((entry) => ({
      title: entry.data.title,
      description: entry.data.description,
      pubDate: entry.data.updatedAt,
      link: guidePath(entry.data.category, entry.data.slug),
    })),
  });
}

