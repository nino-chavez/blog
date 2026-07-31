import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const prerender = true;

const SITE = 'https://ninochavez.co';

const collections = [
  {
    name: 'blog',
    basePath: '/blog',
    kind: 'Essay',
    visible: (data: { status?: string }) =>
      data.status === undefined || data.status === 'published',
  },
  {
    name: 'whitepapers',
    basePath: '/blog/whitepapers',
    kind: 'Whitepaper',
    visible: () => true,
  },
  {
    name: 'presentations',
    basePath: '/blog/presentations',
    kind: 'Presentation',
    visible: () => true,
  },
  {
    name: 'tutorials',
    basePath: '/blog/tutorials',
    kind: 'Tutorial',
    visible: () => true,
  },
  {
    name: 'counterpoints',
    basePath: '/blog/counterpoints',
    kind: 'Counterpoint',
    visible: () => true,
  },
  {
    name: 'fiction',
    basePath: '/blog/fiction',
    kind: 'Fiction',
    visible: (data: { status?: string }) => data.status !== 'draft',
  },
] as const;

const isoDate = (value: string | Date) =>
  new Date(value).toISOString().slice(0, 10);

export const GET: APIRoute = async () => {
  const items = [];
  const seriesMembership = new Map<string, number>();

  for (const collection of collections) {
    const entries = await getCollection(collection.name);

    for (const entry of entries) {
      if (!collection.visible(entry.data)) continue;

      if (
        collection.kind === 'Essay' &&
        entry.data.series?.slug
      ) {
        seriesMembership.set(
          entry.data.series.slug,
          (seriesMembership.get(entry.data.series.slug) ?? 0) + 1,
        );
      }

      items.push({
        slug: entry.id,
        title: entry.data.title,
        excerpt: entry.data.excerpt ?? '',
        publishedAt: isoDate(entry.data.publishedAt),
        kind: collection.kind,
        category:
          entry.data.category ??
          (collection.kind === 'Fiction' ? 'Fiction' : 'Uncategorized'),
        tags: Array.isArray(entry.data.tags) ? entry.data.tags : [],
        href: `${SITE}${collection.basePath}/${entry.id}`,
      });
    }
  }

  items.sort(
    (a, b) =>
      b.publishedAt.localeCompare(a.publishedAt) ||
      a.title.localeCompare(b.title),
  );

  const seriesEntries = await getCollection('series');
  const series = seriesEntries
    .map((entry) => ({
      slug: entry.id,
      title: entry.data.title,
      description: entry.data.description,
      publishedAt: isoDate(entry.data.publishedAt),
      status: entry.data.status ?? 'active',
      articleCount: seriesMembership.get(entry.id) ?? 0,
      href: `${SITE}/blog/series/${entry.id}`,
    }))
    .sort(
      (a, b) =>
        b.publishedAt.localeCompare(a.publishedAt) ||
        a.title.localeCompare(b.title),
    );

  const kinds = collections.map((collection) => collection.kind);
  const kindCounts = Object.fromEntries(
    kinds.map((kind) => [
      kind,
      items.filter((item) => item.kind === kind).length,
    ]),
  );
  const categories = [...new Set(items.map((item) => item.category))].sort();
  const years = [
    ...new Set(items.map((item) => item.publishedAt.slice(0, 4))),
  ].sort((a, b) => b.localeCompare(a));

  return new Response(
    JSON.stringify(
      {
        schemaVersion: 1,
        source: 'apps/blog/astro-build',
        sourceRevision: import.meta.env.CF_PAGES_COMMIT_SHA ?? null,
        generatedAt: new Date().toISOString(),
        latestPublishedAt: items[0]?.publishedAt ?? null,
        publicPieceCount: items.length,
        kindCounts,
        categories,
        years,
        items,
        series,
      },
      null,
      2,
    ),
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Cache-Control':
          'public, max-age=300, s-maxage=300, stale-while-revalidate=3600',
        'Content-Type': 'application/json; charset=utf-8',
      },
    },
  );
};
