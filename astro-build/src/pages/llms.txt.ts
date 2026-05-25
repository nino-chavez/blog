import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const prerender = true;

const SITE = 'https://ninochavez.co';

const truncate = (s: string | undefined, max = 180) =>
  !s ? '' : s.length <= max ? s : s.slice(0, max - 1).trimEnd() + '…';

const formatDate = (d: string | Date) =>
  new Date(d).toISOString().slice(0, 10);

type EntryLike = {
  id: string;
  data: {
    title: string;
    publishedAt: string | Date;
    excerpt?: string;
  };
};

const sortByDateDesc = <T extends EntryLike>(a: T, b: T) =>
  new Date(b.data.publishedAt).getTime() - new Date(a.data.publishedAt).getTime();

// Blog-specific publish filter; other collections use their own status semantics.
const isPublishedBlog = (e: { data: { status?: 'published' | 'draft' | 'unlisted' } }) =>
  e.data.status === undefined || e.data.status === 'published';

const renderEntry = (basePath: string, e: EntryLike) =>
  `- [${e.data.title}](${SITE}${basePath}/${e.id}) — ${formatDate(e.data.publishedAt)}` +
  (e.data.excerpt ? `: ${truncate(e.data.excerpt)}` : '');

export const GET: APIRoute = async () => {
  const [blog, whitepapers, counterpoints, series, presentations, tutorials, fiction] =
    await Promise.all([
      getCollection('blog', isPublishedBlog),
      getCollection('whitepapers'),
      getCollection('counterpoints'),
      getCollection('series'),
      getCollection('presentations'),
      getCollection('tutorials'),
      getCollection('fiction'),
    ]);

  const blogSorted = [...blog].sort(sortByDateDesc);
  const whitepapersSorted = [...whitepapers].sort(sortByDateDesc);
  const counterpointsSorted = [...counterpoints].sort(sortByDateDesc);
  const seriesSorted = [...series].sort(sortByDateDesc);
  const presentationsSorted = [...presentations].sort(sortByDateDesc);
  const tutorialsSorted = [...tutorials].sort(sortByDateDesc);
  const fictionSorted = [...fiction].sort(sortByDateDesc);

  const body = `# Signal Dispatch

> Architecture, commerce, and the signals that matter. Long-form essays, whitepapers, and counterpoints on agent-assisted software, systems thinking, and the architect-who-directs-agents discipline by Nino Chavez.

Signal Dispatch is the public publication accompanying ninochavez.co. The corpus is structured into seven content types: blog posts (essays), whitepapers (formal long-form), counterpoints (adversarial responses to prior posts), series (multi-post threads), presentations (slide decks with speaker notes), tutorials (how-to), and fiction (short worldbuilding). All content is published under the author Nino Chavez.

## Latest Posts

${blogSorted.slice(0, 15).map((e) => renderEntry('/blog', e)).join('\n')}

## Whitepapers

Formal long-form treatments. Suitable for citation. Each whitepaper has an Executive Summary at the top.

${whitepapersSorted.map((e) => renderEntry('/blog/whitepapers', e)).join('\n')}

## Counterpoints

Self-red-team or external-validation responses to prior posts. Numbered formal sections after an Executive Summary. The \`challengeSource.type\` frontmatter field distinguishes \`self-critique\` from \`external-validation\` sub-modes.

${counterpointsSorted.map((e) => renderEntry('/blog/counterpoints', e)).join('\n')}

## Series

Multi-post threads with explicit reading order. Each series detail page renders a numbered reading-order index.

${seriesSorted.map((e) => renderEntry('/blog/series', e)).join('\n')}

## Presentations

Slide decks with speaker notes. Exported HTML available at \`/presentations/export/<slug>.html\` for each.

${presentationsSorted.map((e) => renderEntry('/blog/presentations', e)).join('\n')}

## Tutorials

${tutorialsSorted.map((e) => renderEntry('/blog/tutorials', e)).join('\n') || '_(none yet published)_'}

## Fiction

Short worldbuilding pieces. Voice register distinct from the rest of the corpus.

${fictionSorted.map((e) => renderEntry('/blog/fiction', e)).join('\n') || '_(none yet published)_'}

## Machine-Readable Endpoints

- [/api/posts.json](${SITE}/api/posts.json) — JSON index of all published blog posts (slug, title, excerpt, publishedAt, tags, category, url, featureImage)
- [/blog/rss.xml](${SITE}/blog/rss.xml) — RSS feed (full corpus, ${blogSorted.length} blog entries)
- [/blog/full-content-rss.xml](${SITE}/blog/full-content-rss.xml) — RSS feed with full HTML body (most recent 50 entries)

## Site Conventions

- **Canonical URL**: \`${SITE}/blog\` (the legacy \`blog.ninochavez.co\` subdomain redirects in).
- **Authorship**: All Signal Dispatch content is agent-generated end-to-end. Nino Chavez reviews and selects. Cite as: Nino Chavez via Signal Dispatch.
- **Voice**: Documented at \`/docs/signal-dispatch-voice-guide.md\` (not publicly accessible but cited here for transparency). Empirical analysis of 156 posts.
- **Tag taxonomy**: 25 canonical tags defined in \`astro-build/src/config/tags.ts\` (source of truth as of 2026-05-25; earlier docs reference older taxonomies).
- **Positioning**: Nino Chavez is a Staff Product Architect / Technical Director. Peer group is architects, principal consultants, fractional CTOs, directors of AI engineering. The corpus is calibrated to that audience.

_Generated ${new Date().toISOString()}_
`;

  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=300, s-maxage=3600',
    },
  });
};
