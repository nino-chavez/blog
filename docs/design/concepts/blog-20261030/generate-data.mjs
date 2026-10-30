import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../../../..');
const require = createRequire(path.join(root, 'astro-build/package.json'));
const matter = require('gray-matter');
const source = path.join(root, 'astro-build/src/content/blog');
const captures = path.join(here, 'evidence/content');
const sample = ['because-i-can-is-only-half-the-answer', 'the-rules-of-the-road-still-apply', 'the-hire-who-never-remembers', 'trying-to-teach-an-ai-how-i-edit-photos', 'setting-up-an-ai-native-dev-environment', 'spec-driven-development-with-multi-agent-orchestration'];
const posts = fs.readdirSync(source).filter(name => name.endsWith('.mdx')).map(name => {
  const { data, content } = matter(fs.readFileSync(path.join(source, name), 'utf8'));
  return { slug: name.slice(0, -4), data, content };
}).filter(p => (p.data.status ?? 'published') === 'published' && p.slug !== 'archive' && new Date(p.data.publishedAt) <= new Date('2026-10-30T23:59:59Z')).map(({ slug, data, content }) => {
  const post = { slug, title: data.title, excerpt: data.excerpt ?? '', date: new Date(data.publishedAt).toISOString(), category: data.category ?? '', tags: data.tags ?? [], series: data.series ?? null, minutes: Math.max(1, Math.ceil(content.split(/\s+/).length / 230)), url: `https://ninochavez.co/blog/${slug}` };
  if (sample.includes(slug)) {
    const capture = JSON.parse(fs.readFileSync(path.join(captures, `${slug}.json`), 'utf8'));
    if (capture.slug !== slug || !capture.html || capture.title !== data.title) throw new Error(`Capture mismatch: ${slug}`);
    post.html = capture.html;
    post.headings = capture.headings;
    const readTime = capture.readTime?.match(/(\d+)\s*min read/);
    if (readTime) post.minutes = Number(readTime[1]);
    if (data.featureImage) {
      fs.mkdirSync(path.join(here, 'assets'), { recursive: true });
      const file = path.basename(data.featureImage);
      fs.copyFileSync(path.join(root, 'astro-build/public', data.featureImage), path.join(here, 'assets', file));
      post.image = `assets/${file}`;
    }
  }
  return post;
}).sort((a, b) => b.date.localeCompare(a.date));
const seriesSource = path.join(root, 'astro-build/src/content/series/agentic-workflows-in-practice.mdx');
const series = matter(fs.readFileSync(seriesSource, 'utf8')).data;
fs.copyFileSync(path.join(root, 'astro-build/node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2'), path.join(here, 'assets/inter-latin-wght-normal.woff2'));
fs.copyFileSync(path.join(root, 'astro-build/node_modules/@fontsource-variable/inter/LICENSE'), path.join(here, 'assets/inter-LICENSE.txt'));
fs.writeFileSync(path.join(here, 'data.js'), `window.BLOG_DATA=${JSON.stringify({ capturedAt: '2026-10-30', sample, posts, series: { slug: 'agentic-workflows-in-practice', title: series.title, description: series.description } }).replaceAll('<', '\\u003c')};\n`);
console.log(`${posts.length} published entries; ${posts.filter(p => p.html).length} full article captures; drafts and unlisted entries excluded.`);
