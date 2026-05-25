/* Rally HQ Blueprint — Annotation overlay
 *
 * Opt-in stakeholder note-taking. Enable per-session via:
 *   localStorage.setItem('rally-anno-enabled', 'true')
 *   then reload.
 *
 * Or click the bottom-left "💬" FAB and toggle "annotation mode" → click
 * any element on the page to drop a note. Notes persist in localStorage
 * keyed by page id + a stable selector path.
 *
 * Notes are LOCAL ONLY (per-browser). For cross-stakeholder sharing,
 * the next iteration will sync to a Pages KV namespace via a Function.
 *
 * Per CONVENTIONS.md: annotation chrome lives outside the product UI
 * (FAB + popover + list panel are all fixed-position overlays).
 */
(function () {
  const STORAGE_KEY = 'rally-anno-notes-v1';
  const ENABLED_KEY = 'rally-anno-enabled';
  let MODE_ON = false;
  let PAGE_ID = null;
  let NOTES = [];           // [{ id, pageId, selector, x, y, body, createdAt, resolved }]
  let LIST_PANEL_OPEN = false;
  let POPOVER = null;

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

  function loadNotes() {
    try {
      NOTES = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch {
      NOTES = [];
    }
  }
  function saveNotes() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(NOTES));
    } catch { /* quota etc */ }
  }

  // Compute a stable-enough selector path for an element.
  // Not bullet-proof (HTML changes will invalidate notes), but good enough
  // for a same-version stakeholder review.
  function computeSelector(node) {
    if (!node || node === document.body) return 'body';
    const path = [];
    let cur = node;
    while (cur && cur !== document.body && cur.nodeType === 1 && path.length < 6) {
      let sel = cur.tagName.toLowerCase();
      if (cur.id) {
        sel += `#${cur.id}`;
        path.unshift(sel);
        break;
      }
      if (cur.className && typeof cur.className === 'string') {
        const cls = cur.className.split(/\s+/).filter(Boolean).slice(0, 2).join('.');
        if (cls) sel += `.${cls}`;
      }
      const parent = cur.parentElement;
      if (parent) {
        const sameTag = Array.from(parent.children).filter(c => c.tagName === cur.tagName);
        if (sameTag.length > 1) {
          sel += `:nth-of-type(${sameTag.indexOf(cur) + 1})`;
        }
      }
      path.unshift(sel);
      cur = cur.parentElement;
    }
    return path.join(' > ');
  }

  function pageNotes() {
    return NOTES.filter(n => n.pageId === PAGE_ID);
  }

  // ─────────────── FAB + count badge ───────────────

  let FAB_EL = null;
  function buildFab() {
    FAB_EL = el('button', {
      class: 'anno-fab',
      title: 'Annotations',
      onclick: toggleListPanel
    }, '💬');
    const count = pageNotes().filter(n => !n.resolved).length;
    if (count > 0) {
      FAB_EL.appendChild(el('span', { class: 'badge-count' }, String(count)));
    }
    document.body.appendChild(FAB_EL);
  }
  function refreshFabCount() {
    if (!FAB_EL) return;
    const existing = FAB_EL.querySelector('.badge-count');
    if (existing) existing.remove();
    const count = pageNotes().filter(n => !n.resolved).length;
    if (count > 0) {
      FAB_EL.appendChild(el('span', { class: 'badge-count' }, String(count)));
    }
  }

  // ─────────────── list panel ───────────────

  let LIST_PANEL = null;
  function buildListPanel() {
    LIST_PANEL = el('div', { class: 'anno-list-panel' });
    document.body.appendChild(LIST_PANEL);
  }

  function renderListPanel() {
    if (!LIST_PANEL) return;
    LIST_PANEL.innerHTML = '';
    const notes = pageNotes();
    const open = notes.filter(n => !n.resolved);
    const resolved = notes.filter(n => n.resolved);

    const header = el('div', { class: 'anno-list-header' },
      el('h3', {}, `Annotations · ${notes.length}`),
      el('div', { style: 'display: flex; gap: 8px;' },
        el('button', {
          class: MODE_ON ? 'btn-primary' : 'btn-ghost',
          style: 'padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 600;' + (MODE_ON ? ' background: var(--brand-600); color: white;' : ''),
          onclick: toggleAnnotateMode
        }, MODE_ON ? '✓ Annotating' : '+ Add'),
        el('button', {
          style: 'padding: 4px 10px; font-size: 12px;',
          onclick: toggleListPanel
        }, '×')
      )
    );

    const body = el('div', { class: 'anno-list-body' });

    if (notes.length === 0) {
      body.appendChild(el('div', { class: 'anno-list-empty' },
        'No notes yet. Click "+ Add" then click any element on the page to drop a note.'
      ));
    } else {
      open.forEach(n => body.appendChild(buildListItem(n)));
      if (resolved.length) {
        body.appendChild(el('h4', {
          style: 'font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-muted); margin: 12px 8px 4px;'
        }, `Resolved · ${resolved.length}`));
        resolved.forEach(n => body.appendChild(buildListItem(n)));
      }
    }

    LIST_PANEL.appendChild(header);
    LIST_PANEL.appendChild(body);
  }

  function buildListItem(note) {
    const when = new Date(note.createdAt).toLocaleString(undefined, {
      month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
    });
    return el('div', {
      class: 'anno-item',
      onclick: () => focusNote(note)
    },
      el('div', { class: 'anno-item-meta' },
        el('span', {}, note.resolved ? '✓ Resolved' : '● Open'),
        el('span', {}, when)
      ),
      el('div', { class: 'anno-item-body' }, note.body.slice(0, 200))
    );
  }

  function toggleListPanel() {
    LIST_PANEL_OPEN = !LIST_PANEL_OPEN;
    LIST_PANEL.classList.toggle('open', LIST_PANEL_OPEN);
    if (LIST_PANEL_OPEN) renderListPanel();
  }

  function focusNote(note) {
    // Try to scroll the annotated element into view
    try {
      const target = document.querySelector(note.selector);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } catch { /* invalid selector */ }
  }

  // ─────────────── annotate mode + element clicking ───────────────

  function toggleAnnotateMode() {
    MODE_ON = !MODE_ON;
    document.body.classList.toggle('anno-mode-active', MODE_ON);
    if (LIST_PANEL_OPEN) renderListPanel();
    if (MODE_ON && LIST_PANEL_OPEN) {
      LIST_PANEL_OPEN = false;
      LIST_PANEL.classList.remove('open');
    }
  }

  function isHarnessChrome(node) {
    if (!node) return true;
    return Boolean(
      node.closest('.anno-fab') ||
      node.closest('.anno-popover') ||
      node.closest('.anno-list-panel') ||
      node.closest('.anno-marker') ||
      node.closest('.proto-footer-nav') ||
      node.closest('.strategy-panel') ||
      node.closest('.current-state-panel') ||
      node.closest('.proto-flow-breadcrumb') ||
      node.closest('.chat-window') ||
      node.closest('.chat-fab')
    );
  }

  function onDocumentClick(e) {
    if (!MODE_ON) return;
    if (isHarnessChrome(e.target)) return;

    e.preventDefault();
    e.stopPropagation();

    const target = e.target;
    const rect = target.getBoundingClientRect();
    const selector = computeSelector(target);

    showPopover({
      mode: 'create',
      anchorX: rect.left + window.scrollX + rect.width / 2,
      anchorY: rect.bottom + window.scrollY + 8,
      selector,
      pageX: e.pageX,
      pageY: e.pageY
    });
  }

  // ─────────────── popover (create/edit) ───────────────

  function dismissPopover() {
    if (POPOVER) {
      POPOVER.remove();
      POPOVER = null;
    }
  }

  function showPopover({ mode, anchorX, anchorY, selector, pageX, pageY, note }) {
    dismissPopover();

    const isEdit = mode === 'edit';
    const ta = el('textarea', {
      placeholder: isEdit ? '' : 'What\'s the note?',
      autofocus: 'true'
    });
    if (isEdit) ta.value = note.body;

    const popover = el('div', { class: 'anno-popover' },
      el('h4', {}, isEdit ? 'Edit annotation' : 'New annotation'),
      el('div', { class: 'anno-meta' }, isEdit
        ? `Created ${new Date(note.createdAt).toLocaleString()}`
        : `Selector: ${selector.slice(-80)}`
      ),
      ta,
      el('div', { class: 'anno-actions' },
        isEdit ? el('button', {
          class: 'btn-secondary',
          onclick: () => { deleteNote(note.id); dismissPopover(); }
        }, 'Delete') : null,
        isEdit ? el('button', {
          class: 'btn-secondary',
          onclick: () => { toggleResolved(note.id); dismissPopover(); }
        }, note.resolved ? 'Reopen' : 'Resolve') : null,
        el('button', { class: 'btn-secondary', onclick: dismissPopover }, 'Cancel'),
        el('button', {
          class: 'btn-primary',
          onclick: () => {
            const body = ta.value.trim();
            if (!body) return;
            if (isEdit) {
              updateNote(note.id, body);
            } else {
              addNote({ selector, pageX, pageY, body });
            }
            dismissPopover();
          }
        }, isEdit ? 'Save' : 'Save')
      )
    );

    popover.style.left = `${Math.min(anchorX - 180, window.innerWidth - 380)}px`;
    popover.style.top = `${Math.min(anchorY, window.innerHeight - 280) + window.scrollY}px`;

    document.body.appendChild(popover);
    POPOVER = popover;
    setTimeout(() => ta.focus(), 0);
  }

  // ─────────────── CRUD ───────────────

  function addNote({ selector, pageX, pageY, body }) {
    const note = {
      id: `n-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      pageId: PAGE_ID,
      selector,
      x: pageX,
      y: pageY,
      body,
      createdAt: Date.now(),
      resolved: false
    };
    NOTES.push(note);
    saveNotes();
    drawMarker(note);
    refreshFabCount();
    if (LIST_PANEL_OPEN) renderListPanel();
  }

  function updateNote(id, body) {
    const n = NOTES.find(x => x.id === id);
    if (!n) return;
    n.body = body;
    saveNotes();
    if (LIST_PANEL_OPEN) renderListPanel();
  }

  function deleteNote(id) {
    NOTES = NOTES.filter(x => x.id !== id);
    saveNotes();
    document.querySelectorAll(`[data-anno-id="${id}"]`).forEach(m => m.remove());
    refreshFabCount();
    if (LIST_PANEL_OPEN) renderListPanel();
  }

  function toggleResolved(id) {
    const n = NOTES.find(x => x.id === id);
    if (!n) return;
    n.resolved = !n.resolved;
    saveNotes();
    const marker = document.querySelector(`[data-anno-id="${id}"]`);
    if (marker) marker.classList.toggle('resolved', n.resolved);
    refreshFabCount();
    if (LIST_PANEL_OPEN) renderListPanel();
  }

  // ─────────────── markers ───────────────

  function drawMarker(note) {
    const marker = el('button', {
      class: `anno-marker${note.resolved ? ' resolved' : ''}`,
      'data-anno-id': note.id,
      title: note.body.slice(0, 80),
      onclick: (e) => {
        e.preventDefault();
        e.stopPropagation();
        const rect = e.target.getBoundingClientRect();
        showPopover({
          mode: 'edit',
          anchorX: rect.left + window.scrollX,
          anchorY: rect.bottom + window.scrollY + 8,
          note
        });
      }
    }, '!');
    // Position absolutely against the document
    marker.style.left = `${note.x - 12}px`;
    marker.style.top = `${note.y - 12}px`;
    document.body.appendChild(marker);
  }

  function drawAllMarkers() {
    pageNotes().forEach(drawMarker);
  }

  // ─────────────── init ───────────────

  function init() {
    PAGE_ID = window.PROTO_PAGE?.id || 'index';
    loadNotes();

    // If never enabled on this device, don't show anything yet.
    // Tester flow: open devtools, run `localStorage.setItem('rally-anno-enabled','true')`, reload.
    if (localStorage.getItem(ENABLED_KEY) !== 'true') return;

    buildListPanel();
    buildFab();
    drawAllMarkers();

    document.addEventListener('click', onDocumentClick, true);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose a console helper so testers can enable it from any page
  window.rallyAnno = {
    enable: () => { localStorage.setItem(ENABLED_KEY, 'true'); location.reload(); },
    disable: () => { localStorage.setItem(ENABLED_KEY, 'false'); location.reload(); },
    export: () => JSON.stringify(NOTES, null, 2),
    clear: () => { NOTES = []; saveNotes(); location.reload(); }
  };
})();
