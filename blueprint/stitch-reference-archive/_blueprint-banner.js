/**
 * Blueprint preview banner for Stitch-sourced prototype pages.
 *
 * Stitch pages ship as production-quality mockups; the heavy dark
 * proto-top-bar overlay from proto-nav.js fights their design. This is
 * the lightweight alternative: one thin band at the top that identifies
 * the page as a v2 design preview and links back to the portal.
 *
 * Pages opt in by setting window.BLUEPRINT_PAGE = { id, title } BEFORE
 * loading this script.
 */
(function () {
  'use strict';

  const cfg = window.BLUEPRINT_PAGE || {};
  const id = cfg.id || 'unknown';
  const title = cfg.title || id;

  const band = document.createElement('div');
  band.id = 'blueprint-banner';
  band.style.cssText = [
    'position: fixed', 'top: 0', 'left: 0', 'right: 0', 'z-index: 9999',
    'background: #001B29', 'color: #FDFCF0',
    'font-family: "JetBrains Mono", ui-monospace, SFMono-Regular, monospace',
    'font-size: 11px', 'font-weight: 600',
    'letter-spacing: 0.08em', 'text-transform: uppercase',
    'padding: 8px 20px',
    'display: flex', 'align-items: center', 'justify-content: space-between',
    'gap: 16px',
    'border-bottom: 2px solid #008B94'
  ].join(';');

  band.innerHTML = `
    <div style="display: flex; align-items: center; gap: 16px; min-width: 0">
      <span style="color: #008B94">▣ BLUEPRINT PREVIEW</span>
      <span style="opacity: 0.5">·</span>
      <span style="color: #FDFCF0">Signal Dispatch v2 — ${title}</span>
      <span style="opacity: 0.5; font-weight: 400; text-transform: none; letter-spacing: 0; font-style: italic">design surface only — not a live publication</span>
    </div>
    <div style="display: flex; align-items: center; gap: 12px; flex-shrink: 0">
      <a href="/" style="color: #FDFCF0; text-decoration: none; padding: 4px 12px; border: 1px solid #FDFCF0">← Portal</a>
      <a href="/docs/?doc=01-research" style="color: #FDFCF0; text-decoration: none; padding: 4px 12px; border: 1px solid #FDFCF0">Research</a>
    </div>
  `;

  function mount() {
    document.body.insertBefore(band, document.body.firstChild);
    document.body.style.paddingTop = (band.offsetHeight + 'px');
    // Stitch pages use position:fixed top:0 for their own nav — push it down
    const stickyHeaders = document.querySelectorAll('header.fixed, header[class*="fixed"]');
    stickyHeaders.forEach(h => {
      const cs = getComputedStyle(h);
      if (cs.position === 'fixed' && parseInt(cs.top || '0') === 0) {
        h.style.top = band.offsetHeight + 'px';
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
