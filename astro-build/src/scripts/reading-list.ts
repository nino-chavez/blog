// Astro bundles this as a deferred module, after the article navigation is in the DOM.
const details = document.querySelector<HTMLDetailsElement>('#choose-another-post');
if (details) {
  const pageSize = 12;
  const params = new URLSearchParams(location.search);
  const query = (params.get('q') || '').trim();
  const current = details.dataset.currentId || '';
  const rows = Array.from(details.querySelectorAll<HTMLElement>('[data-reading-row]'));
  const matches = rows.filter((row) => [row.dataset.title, row.dataset.description, row.dataset.tags]
    .join(' ').includes(query.toLowerCase()));
  const defaultPage = !query ? Math.floor(Math.max(0, rows.findIndex((row) => row.dataset.slug === current)) / pageSize) + 1 : 1;
  const requestedPage = Number.parseInt(params.get('page') || String(defaultPage), 10) || 1;
  const totalPages = Math.max(1, Math.ceil(matches.length / pageSize));
  const page = Math.min(Math.max(1, requestedPage), totalPages);
  const visible = new Set(matches.slice((page - 1) * pageSize, page * pageSize));
  const origin = matches.some((row) => row.dataset.slug === params.get('from')) ? params.get('from')! : current;

  const context = (pageNumber: number, from?: string) => {
    const search = new URLSearchParams();
    if (query) search.set('q', query);
    search.set('page', String(pageNumber));
    if (from) search.set('from', from);
    return search.toString();
  };
  const archiveHref = (pageNumber: number, from?: string) =>
    `/blog/archive?${context(pageNumber, from)}#${from ? `post-${from}` : 'choose-another-post'}`;
  const articleHref = (slug: string, from: string) => `/blog/${slug}?${context(page, from)}`;

  rows.forEach((row) => {
    row.hidden = !visible.has(row);
    const link = row.querySelector<HTMLAnchorElement>('[data-reading-link]');
    if (link) link.href = articleHref(row.dataset.slug!, row.dataset.slug!);
  });
  details.querySelector<HTMLInputElement>('#reading-list-query')!.value = query;
  details.querySelector('[data-reading-count]')!.textContent = `${matches.length} ${matches.length === 1 ? 'post' : 'posts'}`;
  const filterMessage = details.querySelector<HTMLElement>('[data-reading-filter]')!;
  filterMessage.hidden = !query;
  if (query) {
    const clear = document.createElement('a');
    clear.href = '/blog/archive#choose-another-post';
    clear.textContent = 'Clear search';
    filterMessage.replaceChildren(document.createTextNode(`Results for “${query}” · `), clear);
  }
  details.querySelector<HTMLElement>('[data-reading-empty]')!.hidden = matches.length !== 0;
  details.querySelector('[data-reading-page-status]')!.textContent = `Page ${page} of ${totalPages}`;
  const previous = details.querySelector<HTMLAnchorElement>('[data-reading-previous]')!;
  const next = details.querySelector<HTMLAnchorElement>('[data-reading-next]')!;
  previous.hidden = page <= 1;
  previous.href = archiveHref(page - 1);
  next.hidden = page >= totalPages;
  next.href = archiveHref(page + 1);

  document.querySelectorAll<HTMLAnchorElement>('[data-reading-back]').forEach((link) => {
    const originRow = rows.find((row) => row.dataset.slug === origin);
    link.href = archiveHref(page, originRow && visible.has(originRow) ? origin : undefined);
    link.textContent = query ? 'Back to results' : 'Back to all posts';
  });
  const currentIndex = matches.findIndex((row) => row.dataset.slug === current);
  document.querySelectorAll<HTMLElement>('[data-reading-neighbor]').forEach((slot) => {
    const target = currentIndex >= 0 ? matches[currentIndex + (slot.dataset.readingNeighbor === 'newer' ? -1 : 1)] : undefined;
    slot.hidden = !target;
    if (!target) return;
    const label = document.createElement('span');
    label.textContent = slot.dataset.readingNeighbor === 'newer' ? 'Newer post' : 'Older post';
    const link = document.createElement('a');
    link.href = articleHref(target.dataset.slug!, origin);
    link.textContent = target.querySelector('[data-reading-link]')!.textContent;
    slot.replaceChildren(label, link);
  });

  const mobile = matchMedia('(max-width: 899px)');
  const returningToList = location.hash === '#choose-another-post' || location.hash.startsWith('#post-');
  details.open = !mobile.matches || returningToList || Boolean(query) && location.pathname.replace(/\/$/, '') === '/blog/archive';
  mobile.addEventListener('change', () => { details.open = !mobile.matches; });
  details.addEventListener('toggle', () => { if (!mobile.matches && !details.open) details.open = true; });
  const finish = () => requestAnimationFrame(() => {
    // Native fragment navigation settles at load; restore keyboard focus after it.
    if (returningToList && location.hash.startsWith('#post-')) {
      const returnedRow = document.getElementById(location.hash.slice(1));
      if (returnedRow && !returnedRow.hidden) returnedRow.querySelector<HTMLAnchorElement>('a')?.focus();
    }
    details.dataset.ready = 'true';
  });
  if (document.readyState === 'complete') finish();
  else window.addEventListener('load', finish, { once: true });
}
