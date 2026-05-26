/* Rally HQ Blueprint — Proto-nav + panels + comparison toggle + flow mode
 *
 * Reads the portal manifest from /_meta/index.json and the per-page metadata
 * from /_meta/<id>.json so the nav is auto-derived from filesystem instead
 * of hard-coded. Pages only need to declare their id:
 *
 *   window.PROTO_PAGE = { id: 'tournament' };
 *
 * Everything else (title, group, strategy, currentState) comes from the JSON.
 *
 * Flow mode: append ?flow=<flow-id> to any prototype URL. The footer nav shows
 * "step N of M" + prev/next buttons threading the flow's pages in order.
 *
 * Surface contract (from CONVENTIONS.md): everything this script renders is
 * harness chrome — it never modifies the prototype page's product UI. The
 * panels, comparison toggle, footer nav, and flow breadcrumb all live in
 * fixed-position layers above the page body.
 */
(function () {
  let MANIFEST = null;
  let CURRENT_META = null;
  let CURRENT_FLOW = null;

  // Reuse this script's ?v= cache-bust token for all _meta JSON fetches.
  // Without this the browser caches manifest + per-page JSON aggressively
  // and stale data keeps shipping after edits.
  const CACHE_BUST = (() => {
    const src = document.currentScript?.src || '';
    const match = src.match(/[?&]v=([^&]+)/);
    return match ? `?v=${match[1]}` : '';
  })();

  function el(tag, props = {}, ...children) {
    const node = document.createElement(tag);
    Object.entries(props).forEach(([k, v]) => {
      if (k === 'class') node.className = v;
      else if (k.startsWith('on')) node.addEventListener(k.slice(2).toLowerCase(), v);
      else if (k === 'html') node.innerHTML = v;
      else node.setAttribute(k, v);
    });
    children.flat().forEach(c => {
      if (c == null) return;
      node.appendChild(c.nodeType ? c : document.createTextNode(c));
    });
    return node;
  }

  function isProtoRoot() {
    const path = window.location.pathname;
    return path === '/' || path.endsWith('/index.html') || path.endsWith('/index');
  }

  // ─────────────── manifest + metadata loaders ───────────────

  async function loadManifest() {
    if (MANIFEST) return MANIFEST;
    const base = (isProtoRoot() ? '_meta/index.json' : '../_meta/index.json') + CACHE_BUST;
    try {
      const res = await fetch(base);
      if (!res.ok) throw new Error(`manifest HTTP ${res.status}`);
      MANIFEST = await res.json();
    } catch (err) {
      console.warn('proto-nav: manifest load failed', err);
      MANIFEST = { name: 'Blueprint', groups: [], pages: [], flows: [] };
    }
    return MANIFEST;
  }

  async function loadPageMeta(id) {
    if (!id) return null;
    const base = (isProtoRoot() ? `_meta/${id}.json` : `../_meta/${id}.json`) + CACHE_BUST;
    try {
      const res = await fetch(base);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn(`proto-nav: meta load failed for ${id}`, err);
      return null;
    }
  }

  function pageHref(id) {
    return isProtoRoot() ? `./pages/${id}.html` : `./${id}.html`;
  }

  // ─────────────── flow mode ───────────────

  function getFlowFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('flow');
  }

  function buildFlowBreadcrumb(flow, currentId) {
    const idx = flow.pages.indexOf(currentId);
    const prev = idx > 0 ? flow.pages[idx - 1] : null;
    const next = idx >= 0 && idx < flow.pages.length - 1 ? flow.pages[idx + 1] : null;
    const total = flow.pages.length;

    const wrap = el('div', { class: 'proto-flow-breadcrumb' },
      el('div', { class: 'flow-meta' },
        el('span', { class: 'flow-label' }, 'Flow:'),
        el('span', { class: 'flow-name' }, flow.label),
        el('span', { class: 'flow-step' }, `Step ${idx + 1} of ${total}`)
      ),
      el('div', { class: 'flow-actions' },
        prev ? el('a', {
          class: 'flow-nav-btn',
          href: `${pageHref(prev)}?flow=${flow.id}`,
          'aria-label': 'Previous page in flow'
        }, '← ', el('span', { class: 'flow-page-name' }, MANIFEST?._titleCache?.[prev] || prev))
        : el('span', { class: 'flow-nav-btn disabled' }, '← Start of flow'),
        next ? el('a', {
          class: 'flow-nav-btn primary',
          href: `${pageHref(next)}?flow=${flow.id}`,
          'aria-label': 'Next page in flow'
        }, el('span', { class: 'flow-page-name' }, MANIFEST?._titleCache?.[next] || next), ' →')
        : el('span', { class: 'flow-nav-btn disabled' }, 'End of flow →')
      )
    );
    document.body.appendChild(wrap);
  }

  // ─────────────── footer nav (auto-built from manifest) ───────────────

  function buildFooterNav(currentId) {
    const select = el('select', {
      onchange: (e) => {
        const id = e.target.value;
        window.location.href = id === 'index' ? (isProtoRoot() ? './index.html' : '../index.html') : pageHref(id);
      }
    });

    // Index option
    const indexOpt = el('option', { value: 'index' }, 'Portal index');
    if (currentId === 'index') indexOpt.selected = true;
    select.appendChild(indexOpt);

    // Group by manifest groups
    const groupLookup = Object.fromEntries((MANIFEST.groups || []).map(g => [g.id, g.label]));
    const byGroup = {};
    (MANIFEST.pages || []).forEach(id => {
      const meta = MANIFEST._cache?.[id];
      const groupId = meta?.group || 'other';
      (byGroup[groupId] = byGroup[groupId] || []).push({ id, title: meta?.title || id });
    });

    Object.entries(byGroup).forEach(([groupId, items]) => {
      const og = el('optgroup', { label: groupLookup[groupId] || groupId });
      items.forEach(p => {
        const opt = el('option', { value: p.id }, p.title);
        if (p.id === currentId) opt.selected = true;
        og.appendChild(opt);
      });
      select.appendChild(og);
    });

    // Footer nav is now a hidden affordance — top brand bar + slice header
    // + slice sidebar make it redundant. Keep the dropdown wired but render
    // it via the top brand bar's overflow menu (mobile + jump-to-page only).
    // The Shipped/Strategy drawer toggle buttons live in the slice header.
    const nav = el('div', { class: 'proto-footer-nav' },
      el('div', { class: 'nav-pages' },
        el('span', { class: 'tiny muted', style: 'margin-right: 8px' }, 'Jump to:'),
        select
      ),
      el('div', { class: 'nav-actions' },
        el('button', { id: 'toggle-current-state', onclick: () => togglePanel('current-state') }, '◀ Shipped'),
        el('button', { id: 'toggle-strategy', onclick: () => togglePanel('strategy') }, 'Strategy ▶')
      )
    );
    document.body.appendChild(nav);
  }

  // ─────────────── unified top bar (proto-nav.js, on every prototype page) ───────────────
  //
  // Single 56px region. Left: brand mark + breadcrumb. Right: compare toggle
  // (mounted later by buildCompareToggle) + trace badges + global nav.
  // Replaces the old two-bar stack (brand bar 36px + slice header 44px).

  function escapeHtml(s) {
    return String(s ?? '')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  // ─────────────── citation chip + overlay (replaces trace pills) ───────────────
  //
  // A single chip in the top bar lists short IDs (F4, R6, …) gated by a 2px
  // brand-rule. Clicking expands an overlay anchored below the chip showing
  // each citation's full title with a colored margin rule (gold = finding,
  // indigo = rule) — designed to read as a scholarly margin annotation, not
  // a status badge cluster.

  function resolveCitations(slice) {
    if (!slice) return [];
    const findings = slice.findings_cited || [];
    const principles = slice.principles_cited || [];
    const dict = MANIFEST?.citations || {};
    const lookup = (id, kind) => {
      const table = kind === 'finding' ? dict.findings : dict.rules;
      const entry = table?.[id];
      return {
        kind,
        id,
        short: entry?.short || id,
        title: entry?.title || null,
        source: entry?.source || null,
      };
    };
    return [
      ...findings.map(id => lookup(id, 'finding')),
      ...principles.map(id => lookup(id, 'rule')),
    ];
  }

  function renderCitationChip(rows) {
    const VISIBLE = 4;
    const visible = rows.slice(0, VISIBLE);
    const overflow = rows.length - VISIBLE;
    const codes = visible.map((r, i) =>
      (i > 0 ? `<span class="citation-sep">·</span>` : '') +
      `<span>${escapeHtml(r.short)}</span>`
    ).join('');
    const overflowHtml = overflow > 0
      ? `<span class="citation-overflow">+${overflow}</span>` : '';
    return `
      <button class="citation-chip" type="button"
              aria-haspopup="dialog" aria-controls="citation-overlay"
              aria-expanded="false"
              title="${rows.length} spec citation${rows.length === 1 ? '' : 's'} — click for detail">
        <span class="citation-codes">${codes}${overflowHtml}</span>
        <span class="citation-chevron" aria-hidden="true">▾</span>
      </button>`;
  }

  function renderCitationOverlay(rows) {
    const sources = Array.from(new Set(rows.map(r => r.source).filter(Boolean)));
    const sourceLine = sources.length === 1
      ? sources[0]
      : sources.length > 1 ? `${sources.length} sources` : '';
    const rowsHtml = rows.map(r => `
      <div class="citation-row ${r.kind === 'finding' ? 'is-finding' : ''}${r.title ? '' : ' unknown'}">
        <div class="rule" aria-hidden="true"></div>
        <div class="short">${escapeHtml(r.short)}</div>
        <div class="title">${escapeHtml(r.title || '(citation not found in manifest)')}</div>
      </div>`).join('');
    return `
      <div class="citation-overlay" id="citation-overlay" role="dialog" aria-label="Spec citations">
        <div class="citation-overlay-heading">
          <span>Cited spec evidence (${rows.length})</span>
          ${sourceLine ? `<span class="source-path">${escapeHtml(sourceLine)}</span>` : ''}
        </div>
        ${rowsHtml}
      </div>`;
  }

  function wireCitationChip() {
    const chip = document.querySelector('.proto-top-bar .citation-chip');
    const overlay = document.querySelector('.citation-overlay');
    if (!chip || !overlay) return;

    const close = () => {
      overlay.classList.remove('open');
      chip.setAttribute('aria-expanded', 'false');
    };
    const open = () => {
      const chipRect = chip.getBoundingClientRect();
      const bar = document.querySelector('.proto-top-bar');
      const barBottom = bar ? bar.getBoundingClientRect().bottom : 56;
      overlay.style.top = `${barBottom}px`;
      overlay.style.right = `${Math.max(16, window.innerWidth - chipRect.right)}px`;
      overlay.classList.add('open');
      chip.setAttribute('aria-expanded', 'true');
    };

    chip.addEventListener('click', (e) => {
      e.stopPropagation();
      if (overlay.classList.contains('open')) close(); else open();
    });
    document.addEventListener('click', (e) => {
      if (!overlay.classList.contains('open')) return;
      if (overlay.contains(e.target) || e.target === chip || chip.contains(e.target)) return;
      close();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.classList.contains('open')) close();
    });
    window.addEventListener('resize', () => {
      if (overlay.classList.contains('open')) {
        const rect = chip.getBoundingClientRect();
        overlay.style.top = `${rect.bottom + 2}px`;
        overlay.style.right = `${Math.max(16, window.innerWidth - rect.right)}px`;
      }
    });
  }

  function buildTopBar(slice, currentPageMeta) {
    // If the canonical portal-shell is already on the page, don't render
    // our own top bar — the meta-pages now consume _portal-shell.js as the
    // single source of truth for the brand mark + global nav. proto-nav.js
    // still handles strategy panels, citation chips, compare toggle, etc.
    // on prototype-mock pages (where there's no [data-portal-shell]).
    if (document.querySelector('header[data-portal-shell]')) return;

    const pageId = window.PROTO_PAGE?.id;
    const isFrontDoor = pageId === 'index';
    const isDocs = pageId === 'docs';
    const isPrototype = !isFrontDoor && !isDocs;

    // Front door + docs use the light shell variant — these pages ARE the
    // blueprint product, not mock surfaces. Prototype pages keep the dark
    // shell where the contrast separates reviewer chrome from mock content.
    if (isFrontDoor || isDocs) {
      document.body.classList.add('proto-shell-light');
    }

    const fullName = MANIFEST?.name || 'Project';
    const productName = fullName.replace(/\s*Blueprint\s*$/i, '').trim() || fullName;

    // Breadcrumb only renders inside Prototype (slice + page context)
    const crumbParts = [];
    if (isPrototype) {
      crumbParts.push(`<a href="/prototype/">Prototype</a>`);
      if (slice) {
        const surfaceAttr = slice.production_surface
          ? ` title="${escapeHtml(slice.production_surface)}"` : '';
        crumbParts.push(`<span class="sep">/</span>`);
        crumbParts.push(`<span class="slice-label"${surfaceAttr}>${escapeHtml(slice.label)}</span>`);
      }
      if (currentPageMeta && slice) {
        crumbParts.push(`<span class="sep">/</span>`);
        crumbParts.push(`<span class="page-label">${escapeHtml(currentPageMeta.title)}</span>`);
      }
    }

    const citationRows = resolveCitations(slice);
    const chipHtml = citationRows.length ? renderCitationChip(citationRows) : '';

    // Three-section nav with active highlighting
    const navItems = [
      { label: 'Front door', href: '/', active: isFrontDoor },
      { label: 'Prototype',  href: '/prototype/', active: isPrototype },
      { label: 'Docs',       href: '/docs/?doc=01-research', active: isDocs },
    ];
    const navHtml = navItems.map(n =>
      `<a href="${n.href}"${n.active ? ' class="is-active" aria-current="page"' : ''}>${n.label}</a>`
    ).join('');

    const bar = document.createElement('header');
    bar.className = 'proto-top-bar';
    bar.innerHTML = `
      <div class="proto-top-bar-inner">
        <div class="top-bar-lead">
          <a href="/" class="brand-mark">
            ${escapeHtml(productName)}<span class="brand-mark-tag">Blueprint</span>
          </a>
          ${crumbParts.length ? `<nav class="top-bar-crumb" aria-label="Breadcrumb">${crumbParts.join('')}</nav>` : ''}
        </div>
        <div class="top-bar-actions">
          ${chipHtml}
          ${currentPageMeta?.chrome && currentPageMeta.chrome !== 'specialized' ? `<button class="chrome-toggle" type="button" title="Toggle production-chrome preview"><span class="toggle-dot"></span>production chrome</button>` : ''}
          <nav class="top-bar-nav" aria-label="Primary">
            ${navHtml}
          </nav>
        </div>
      </div>
    `;
    document.body.insertBefore(bar, document.body.firstChild);

    if (citationRows.length) {
      const overlayWrap = document.createElement('div');
      overlayWrap.innerHTML = renderCitationOverlay(citationRows);
      document.body.appendChild(overlayWrap.firstElementChild);
      wireCitationChip();
    }

    // Wire chrome toggle (sticky preference in localStorage)
    const toggle = bar.querySelector('.chrome-toggle');
    if (toggle) {
      const KEY = 'signal-dispatch-blueprint-chrome-preview';
      if (localStorage.getItem(KEY) === '1') {
        document.body.classList.add('show-production-chrome');
      }
      toggle.addEventListener('click', () => {
        const on = document.body.classList.toggle('show-production-chrome');
        localStorage.setItem(KEY, on ? '1' : '0');
      });
    }

    // Lifecycle strip — only on tournament-state pages (skip cross-phase)
    if (currentPageMeta?.lifecycle_phase && currentPageMeta.lifecycle_phase !== 'cross-phase') {
      const stripHtml = renderLifecycleStrip(currentPageMeta);
      const stripEl = document.createElement('nav');
      stripEl.className = 'proto-lifecycle-strip';
      stripEl.setAttribute('aria-label', 'Tournament lifecycle phase');
      stripEl.innerHTML = stripHtml;
      bar.insertAdjacentElement('afterend', stripEl);
    }
  }

  function renderLifecycleStrip(meta) {
    const phases = [
      { id: 'setup',           label: 'Setup' },
      { id: 'pre-event',       label: 'Pre-event' },
      { id: 'game-day',        label: 'Game day' },
      { id: 'post-event',      label: 'Post-event' },
      { id: 'between-events',  label: 'Between events' },
    ];
    const current = meta.lifecycle_phase;
    const adapts = new Set(meta.lifecycle_phase_adapts || []);
    const cells = phases.map((p, i) => {
      const cls = [
        'lifecycle-cell',
        p.id === current ? 'is-current' : '',
        adapts.has(p.id) ? 'is-adapt' : '',
      ].filter(Boolean).join(' ');
      const sep = i < phases.length - 1 ? '<span class="lifecycle-sep" aria-hidden="true">›</span>' : '';
      return `<span class="${cls}" data-phase="${p.id}"><span class="lifecycle-dot" aria-hidden="true"></span><span class="lifecycle-label">${p.label}</span></span>${sep}`;
    }).join('');
    return `<div class="proto-lifecycle-inner">
      <span class="lifecycle-leader" title="Tournament lifecycle — see docs/tournament-lifecycle.md">lifecycle</span>
      ${cells}
    </div>`;
  }

  function togglePanel(which) {
    const sel = which === 'strategy' ? '.strategy-panel' : '.current-state-panel';
    const panel = document.querySelector(sel);
    if (!panel) return;
    panel.classList.toggle('open');
  }

  // ─────────────── panels (built from meta) ───────────────

  function buildStrategyPanel(meta) {
    if (!meta || !meta.strategy) return;
    const s = meta.strategy;
    // Helper to render content that may contain markdown-ish inline syntax
    const render = (text) => text || '';

    // Build the systems-position block (phase + chrome) if declared
    const systemsParts = [];
    if (meta.lifecycle_phase) {
      const adapts = (meta.lifecycle_phase_adapts || []).join(', ');
      const adaptsLine = adapts ? ` <span class="tiny muted">(adapts to ${escapeHtml(adapts)})</span>` : '';
      systemsParts.push(`<div><span class="tiny mono muted" style="text-transform: uppercase; letter-spacing: 0.06em;">Lifecycle</span> <strong>${escapeHtml(meta.lifecycle_phase)}</strong>${adaptsLine}</div>`);
    }
    if (meta.chrome) {
      const adapts = (meta.chrome_adapts || []).join(', ');
      const adaptsLine = adapts ? ` <span class="tiny muted">(adapts to ${escapeHtml(adapts)})</span>` : '';
      // Was a link to /docs/?doc=chrome-system (template default that
       // doesn't exist in this initiative); rendered as plain text instead.
       // Restore as link if/when a chrome-system doc lands in _docs/.
       const chromeText = `<strong>${escapeHtml(meta.chrome)}</strong>`;
       systemsParts.push(`<div style="margin-top: 4px;"><span class="tiny mono muted" style="text-transform: uppercase; letter-spacing: 0.06em;">Chrome</span> ${chromeText}${adaptsLine}</div>`);
    }

    const panel = el('aside', { class: 'strategy-panel', id: 'strategy-panel' },
      el('button', { class: 'panel-close', onclick: () => togglePanel('strategy') }, '×'),
      el('h3', {}, 'Strategy'),
      el('p', { class: 'tiny muted mt-4' }, `Page: ${meta.title}`),
      ...(systemsParts.length ? [el('div', { class: 'panel-section panel-systems', html: systemsParts.join('') })] : []),
      el('div', { class: 'panel-section' },
        el('h4', {}, 'The decision'),
        el('p', { html: render(s.decision) })
      ),
      el('div', { class: 'panel-section' },
        el('h4', {}, 'The why'),
        el('p', { html: render(s.why) })
      ),
      el('div', { class: 'panel-section' },
        el('h4', {}, 'Shipped state'),
        el('p', { html: render(s.shipped) })
      ),
      el('div', { class: 'panel-section' },
        el('h4', {}, 'The gap'),
        el('p', { html: render(s.gap) })
      ),
      el('div', { class: 'panel-section' },
        el('h4', {}, 'Open question'),
        el('p', { html: render(s.question) })
      )
    );
    document.body.appendChild(panel);
  }

  function buildCurrentStatePanel(meta) {
    if (!meta || !meta.currentState) return;
    const cs = meta.currentState;
    const panel = el('aside', { class: 'current-state-panel', id: 'current-state-panel' },
      el('button', { class: 'panel-close', onclick: () => togglePanel('current-state') }, '×'),
      el('h3', {}, 'Shipped state'),
      el('p', { class: 'tiny muted mt-4' }, cs.route ? `Route: ${cs.route}` : 'No equivalent surface today'),
      el('div', { class: 'panel-section' },
        el('h4', {}, 'What exists today'),
        el('p', { html: cs.summary || '<em>No equivalent surface in shipped Rally HQ.</em>' })
      ),
      cs.sourceFiles && cs.sourceFiles.length ? el('div', { class: 'panel-section' },
        el('h4', {}, 'Source files'),
        ...cs.sourceFiles.map(f => el('p', {}, el('code', {}, f)))
      ) : null,
      el('div', { class: 'panel-section' },
        el('h4', {}, 'Annotation'),
        el('p', { html: cs.annotation || 'See strategy panel for proposed changes.' })
      )
    );
    document.body.appendChild(panel);
  }

  // ─────────────── side-by-side comparison toggle ───────────────

  function buildCompareToggle() {
    const hasProposed = document.querySelector('.proposed-view');
    const hasShipped = document.querySelector('.shipped-view');
    if (!(hasProposed && hasShipped)) return;

    const root = document.querySelector('[data-compare-root]') || document.body;
    if (!root.hasAttribute('data-view')) root.setAttribute('data-view', 'proposed');

    function setView(v) {
      root.setAttribute('data-view', v);
      toggle.querySelectorAll('button').forEach(b => {
        const active = b.dataset.view === v;
        b.classList.toggle('active', active);
        b.setAttribute('aria-pressed', active ? 'true' : 'false');
      });
    }

    // Tab-style view switch: three options with sentence-case labels,
    // hairline separators between, brand underline on the active one.
    // Click any label to switch modes; mode persists via data-view on the
    // compare root (page body or a [data-compare-root] container).
    const toggle = el('div', {
      class: 'compare-toggle',
      role: 'group',
      'aria-label': 'View mode'
    },
      el('button', {
        'data-view': 'proposed', class: 'active', type: 'button',
        'aria-pressed': 'true',
        onclick: () => setView('proposed'),
        title: 'Show the proposed design'
      }, 'Proposed'),
      el('button', {
        'data-view': 'split', type: 'button',
        'aria-pressed': 'false',
        onclick: () => setView('split'),
        title: 'Side-by-side: proposed vs shipped'
      }, 'Compare'),
      el('button', {
        'data-view': 'shipped', type: 'button',
        'aria-pressed': 'false',
        onclick: () => setView('shipped'),
        title: 'Show the current shipped surface'
      }, 'Shipped')
    );

    // Preferred mount order:
    //   1. Inside the unified top bar's action cluster (lives WITH breadcrumb + trace badges)
    //   2. Explicit [data-compare-toggle-mount] in the page (legacy override)
    //   3. Floating pill in the top-right of the viewport (fallback)
    const topBarActions = document.querySelector('.proto-top-bar .top-bar-actions');
    const explicitMount = document.querySelector('[data-compare-toggle-mount]');
    if (topBarActions) {
      // Mount as first child so it sits left of the trace badges + nav
      topBarActions.insertBefore(toggle, topBarActions.firstChild);
      if (explicitMount) explicitMount.style.display = 'none';
    } else if (explicitMount) {
      explicitMount.appendChild(toggle);
    } else {
      // Fallback: floating pill, top-right, fixed-positioned
      const floating = el('div', { class: 'compare-toggle-floating' }, toggle);
      document.body.appendChild(floating);
    }
  }

  // ─────────────── footer (version surface) ───────────────

  function buildFooter() {
    if (window.PROTO_PAGE?.id === 'index') return;
    const name = MANIFEST?.name || 'Project';
    const version = MANIFEST?.version || '';
    const build = MANIFEST?.build || '';

    const footer = document.createElement('footer');
    footer.className = 'proto-footer';
    footer.innerHTML = `
      <div class="proto-footer-inner">
        <div class="proto-footer-mark">
          <span class="proto-footer-product">${escapeHtml(name)}</span>
          ${version ? `<span class="proto-footer-version">${escapeHtml(version)}</span>` : ''}
        </div>
        <div class="proto-footer-meta">
          ${build ? `<span class="proto-footer-build">built ${escapeHtml(build)}</span>` : ''}
          ${build ? `<span class="sep">·</span>` : ''}
          <span class="proto-footer-context">design prototype — not production</span>
        </div>
      </div>
    `;
    document.body.appendChild(footer);
  }

  // ─────────────── slice metadata loader + shell ───────────────

  let CURRENT_SLICE = null;

  async function loadSliceMeta(id) {
    if (!id) return null;
    const base = (isProtoRoot() ? `_meta/slices/${id}.json` : `../_meta/slices/${id}.json`) + CACHE_BUST;
    try {
      const res = await fetch(base);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn(`proto-nav: slice meta load failed for ${id}`, err);
      return null;
    }
  }

  // Custom inline SVG — a "sequence" mark for flow rows. Two small nodes
  // connected by a hairline. Drawn directly (not Heroicons / Lucide).
  const FLOW_ICON_SVG = `
    <svg class="row-icon" viewBox="0 0 14 14" width="11" height="11" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.3">
      <rect x="0.7" y="2.7" width="4" height="4" rx="0.6"/>
      <path d="M 4.7 4.7 L 8 4.7 Q 9.3 4.7 9.3 6 L 9.3 7.3"/>
      <rect x="7.3" y="7.3" width="4" height="4" rx="0.6"/>
    </svg>`;

  function buildSliceSidebar(slice) {
    const sidebar = document.createElement('aside');
    sidebar.className = 'proto-slice-sidebar';

    const pages = (slice.pages || [])
      .map(id => MANIFEST._cache?.[id])
      .filter(Boolean);

    const flowsTouching = (MANIFEST.flows || []).filter(f =>
      (slice.flows_touching_this_slice || []).includes(f.id) ||
      (f.pages || []).some(p => (slice.pages || []).includes(p))
    );

    // Singleton-slice affordance: when this slice only has one page,
    // surface a short list of other slices so the sidebar isn't a stub.
    const isSingleton = (slice.pages?.length || 0) <= 1;
    const currentSliceId = slice.id;
    const otherSlices = isSingleton
      ? (MANIFEST.slices || [])
          .filter(id => id !== currentSliceId)
          .map(id => MANIFEST._sliceCache?.[id])
          .filter(Boolean)
          .map(s => {
            const firstPageMeta = MANIFEST._cache?.[(s.pages || [])[0]];
            return {
              id: s.id,
              label: s.label,
              href: firstPageMeta?.route || (s.pages?.[0] ? pageHref(s.pages[0]) : '/prototype/'),
            };
          })
      : [];

    sidebar.innerHTML = `
      <div class="slice-sidebar-section">
        <h4>${escapeHtml(slice.label)}</h4>
        <p class="slice-sidebar-summary">${slice.summary || ''}</p>
      </div>
      <div class="slice-sidebar-section">
        <h5>pages</h5>
        <ul class="slice-sidebar-list">
          ${pages.map(p => `
            <li>
              <a href="${p.route}" class="${p.id === window.PROTO_PAGE?.id ? 'active' : ''}">
                <span class="page-title">${escapeHtml(p.title)}</span>
                ${p.phase ? `<span class="page-phase">${escapeHtml(p.phase.toLowerCase())}</span>` : ''}
              </a>
            </li>
          `).join('')}
        </ul>
      </div>
      ${flowsTouching.length ? `
        <div class="slice-sidebar-section">
          <h5>flows</h5>
          <ul class="slice-sidebar-list slice-sidebar-flows">
            ${flowsTouching.map(f => `
              <li>
                <a href="${pageHref((f.pages || [])[0])}?flow=${f.id}">
                  ${FLOW_ICON_SVG}
                  <span class="page-title flow-title">${escapeHtml(f.label)}</span>
                  <span class="flow-pages">${(f.pages || []).length}p</span>
                </a>
              </li>
            `).join('')}
          </ul>
        </div>
      ` : ''}
      ${otherSlices.length ? `
        <div class="slice-sidebar-section slice-sidebar-other">
          <h5>other slices</h5>
          <ul class="slice-sidebar-list">
            ${otherSlices.map(s => `
              <li>
                <a href="${s.href}">
                  <span class="page-title">${escapeHtml(s.label)}</span>
                </a>
              </li>
            `).join('')}
          </ul>
        </div>
      ` : ''}
    `;
    document.body.appendChild(sidebar);

    document.body.classList.add('proto-has-sidebar');
  }

  // ─────────────── init ───────────────

  // Apply the demo tournament's per-event accent from the manifest, so every
  // tournament-scoped surface (Public + Authenticated when scoped) renders the
  // same accent. Replaces per-page `:root { --tournament-accent: ... }` blocks.
  // Pages opt in via meta.uses_tournament_accent === true OR meta.chrome === 'public'.
  function applyTournamentAccent(meta) {
    const demo = MANIFEST?.demo_tournament;
    if (!demo) return;
    const optedIn = meta?.uses_tournament_accent === true || meta?.chrome === 'public';
    if (!optedIn) return;
    if (demo.accent) document.documentElement.style.setProperty('--tournament-accent', demo.accent);
    if (demo.accent_soft) document.documentElement.style.setProperty('--tournament-accent-soft', demo.accent_soft);
  }

  async function init() {
    await loadManifest();

    // Prefetch all page meta into a title cache so the footer + flow nav can name pages
    if (MANIFEST.pages?.length) {
      MANIFEST._cache = {};
      MANIFEST._titleCache = {};
      await Promise.all(
        MANIFEST.pages.map(async id => {
          const m = await loadPageMeta(id);
          if (m) {
            MANIFEST._cache[id] = m;
            MANIFEST._titleCache[id] = m.title;
          }
        })
      );
    }

    // Prefetch slice meta so the sidebar's "other slices" group has labels
    if (MANIFEST.slices?.length) {
      MANIFEST._sliceCache = {};
      await Promise.all(
        MANIFEST.slices.map(async id => {
          const m = await loadSliceMeta(id);
          if (m) MANIFEST._sliceCache[id] = m;
        })
      );
    }

    const pageId = window.PROTO_PAGE?.id || 'index';
    CURRENT_META = MANIFEST._cache?.[pageId] || null;

    // Expose to window for the chat widget and other consumers
    if (CURRENT_META) {
      window.PROTO_PAGE = { ...window.PROTO_PAGE, ...CURRENT_META };
    }

    // Flow handling
    const flowId = getFlowFromUrl();
    if (flowId) {
      CURRENT_FLOW = (MANIFEST.flows || []).find(f => f.id === flowId);
      if (CURRENT_FLOW && CURRENT_FLOW.pages.includes(pageId)) {
        buildFlowBreadcrumb(CURRENT_FLOW, pageId);
      }
    }

    // Resolve slice metadata first so the top bar can render breadcrumb +
    // trace badges in a single pass (one DOM insert, no flash of bare brand).
    const sliceId = CURRENT_META?.slice;
    if (sliceId) {
      CURRENT_SLICE = MANIFEST._sliceCache?.[sliceId] || await loadSliceMeta(sliceId);
    }

    // Resolve per-event accent before any UI renders so chrome + content read
    // the same variable on first paint. See applyTournamentAccent().
    applyTournamentAccent(CURRENT_META);

    // Unified top bar — brand + breadcrumb + actions in one 56px region.
    buildTopBar(CURRENT_SLICE, CURRENT_META);

    if (CURRENT_SLICE) {
      buildSliceSidebar(CURRENT_SLICE);
    }

    buildFooterNav(pageId);
    buildStrategyPanel(CURRENT_META);
    buildCurrentStatePanel(CURRENT_META);
    buildCompareToggle();
    buildFooter();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
