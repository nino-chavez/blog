// URL-owned reading context is shared by the archive and focused native articles.
interface Essay { slug: string; title: string; description: string; tags: string[]; }
const list = document.querySelector<HTMLElement>('[data-reading-list]');
const reader = document.querySelector<HTMLElement>('[data-reading-context]');
const root = list || reader;
if (root) {
  const rows = Array.from(list?.querySelectorAll<HTMLElement>('[data-reading-row]') || []);
  const entries: Essay[] = list ? rows.map(row => ({ slug: row.dataset.slug!, title: row.querySelector('[data-reading-link]')!.textContent!, description: row.dataset.description || '', tags: JSON.parse(row.dataset.tags || '[]') })) : JSON.parse(reader!.querySelector('[data-reading-index]')!.textContent || '[]');
  const params = new URLSearchParams(location.search);
  const query = (params.get('q') || '').trim();
  const subject = params.get('subject') || list?.dataset.subject || '';
  const current = reader?.dataset.currentId || '';
  const matches = entries.filter(post => (!subject || post.tags.includes(subject)) && [post.title, post.description, ...post.tags].join(' ').toLowerCase().includes(query.toLowerCase()));
  const defaultPage = !query && !subject ? Math.floor(Math.max(0, entries.findIndex(post => post.slug === current)) / 12) + 1 : 1;
  const totalPages = Math.max(1, Math.ceil(matches.length / 12));
  const page = Math.min(Math.max(1, Number.parseInt(params.get('page') || String(defaultPage), 10) || 1), totalPages);
  const visible = new Set(matches.slice((page - 1) * 12, page * 12).map(post => post.slug));
  const requestedOrigin = params.get('from') || current;
  const origin = matches.some(post => post.slug === requestedOrigin) ? requestedOrigin : '';
  const context = (pageNumber: number, from?: string) => {
    const search = new URLSearchParams();
    if (query) search.set('q', query);
    if (subject) search.set('subject', subject);
    search.set('page', String(pageNumber));
    if (from) search.set('from', from);
    return search.toString();
  };
  const archiveHref = (pageNumber: number, from?: string) => `/blog/archive?${context(pageNumber, from)}#${from ? `post-${from}` : 'choose-another-post'}`;
  const articleHref = (slug: string, from: string) => `/blog/${slug}?${context(page, from)}`;
  if (list) {
    rows.forEach(row => {
      row.hidden = !visible.has(row.dataset.slug!);
      row.querySelector<HTMLAnchorElement>('[data-reading-link]')!.href = articleHref(row.dataset.slug!, row.dataset.slug!);
    });
    list.querySelector<HTMLInputElement>('#reading-list-query')!.value = query;
    list.querySelector<HTMLInputElement>('[data-reading-subject]')!.value = subject;
    list.querySelector('[data-reading-count]')!.textContent = `${matches.length} ${matches.length === 1 ? 'essay' : 'essays'}`;
    const labels: Record<string, string> = JSON.parse(list.dataset.subjectLabels || '{}');
    const filter = list.querySelector<HTMLElement>('[data-reading-filter]')!;
    filter.hidden = !query && !subject;
    if (query || subject) {
      const clear = document.createElement('a');
      clear.href = '/blog/archive#choose-another-post';
      clear.textContent = 'Clear filters';
      filter.replaceChildren(document.createTextNode([subject ? labels[subject] || subject : '', query ? `“${query}”` : ''].filter(Boolean).join(' · ') + ' · '), clear);
    }
    document.querySelectorAll<HTMLAnchorElement>('.subject-nav a[data-subject]').forEach(link => {
      if (link.dataset.subject === subject) { link.setAttribute('aria-current', 'page'); link.closest('details')?.setAttribute('open', ''); }
      else link.removeAttribute('aria-current');
    });
    const allSubjects = document.querySelector<HTMLAnchorElement>('.subject-nav a[href="/blog/archive"]');
    if (subject) allSubjects?.removeAttribute('aria-current');
    list.querySelector<HTMLElement>('[data-reading-empty]')!.hidden = matches.length !== 0;
    list.querySelector<HTMLElement>('[data-reading-pages]')!.hidden = matches.length === 0;
    list.querySelector('[data-reading-page-status]')!.textContent = `Page ${page} of ${totalPages}`;
    const previous = list.querySelector<HTMLAnchorElement>('[data-reading-previous]')!;
    const next = list.querySelector<HTMLAnchorElement>('[data-reading-next]')!;
    previous.hidden = page <= 1; previous.href = archiveHref(page - 1);
    next.hidden = page >= totalPages; next.href = archiveHref(page + 1);
  }
  document.querySelectorAll<HTMLAnchorElement>('[data-reading-back]').forEach(link => {
    link.href = archiveHref(page, visible.has(origin) ? origin : undefined);
    link.textContent = query || subject ? 'Back to results' : 'All essays';
  });
  const currentIndex = matches.findIndex(post => post.slug === current);
  document.querySelectorAll<HTMLElement>('[data-reading-neighbor]').forEach(slot => {
    const target = currentIndex >= 0 ? matches[currentIndex + (slot.dataset.readingNeighbor === 'newer' ? -1 : 1)] : undefined;
    slot.hidden = !target;
    if (!target) return;
    const label = document.createElement('span');
    label.textContent = slot.dataset.readingNeighbor === 'newer' ? 'Newer essay' : 'Older essay';
    const link = document.createElement('a');
    link.href = articleHref(target.slug, origin); link.textContent = target.title;
    slot.replaceChildren(label, link);
  });
  const finish = () => requestAnimationFrame(() => {
    if (list && location.hash.startsWith('#post-')) {
      const row = document.getElementById(location.hash.slice(1));
      if (row && !row.hidden) row.querySelector<HTMLAnchorElement>('a')?.focus();
    }
    root.dataset.ready = 'true';
  });
  if (document.readyState === 'complete') finish(); else window.addEventListener('load', finish, { once: true });
}
