/**
 * Big-Blueprint canonical portal shell
 *
 * Single source of truth for the meta-page shell across Front Door,
 * Prototype Studio, and Docs viewer. Injected as HTML on page load so
 * the three pages can't drift visually — they all consume this file.
 *
 * Origin: extracted from Rally HQ 2026-05-24 polish pass after V3a/T6/V4a
 * JTBD dry-run session. Should be promoted to wip/blueprint/template
 * as the canonical going-forward template (see _shell-version below).
 *
 * Usage in any portal page:
 *
 *   <header data-portal-shell="prototype"></header>
 *   ...
 *   <script src="/_portal-shell.js"></script>
 *
 * The `data-portal-shell` attribute value chooses which nav item gets the
 * active treatment: 'index' | 'prototype' | 'docs'.
 *
 * Project-level overrides (product name, brand color) are read from
 * window.PORTAL_SHELL_CONFIG if set BEFORE this script loads.
 */
(function () {
  'use strict'

  // Bump when the shell HTML or behavior changes. The drift check in
  // prep-deploy.sh compares this string against the template's version to
  // catch projects falling behind.
  const SHELL_VERSION = '2026-05-24.1'

  const DEFAULT_CONFIG = {
    productName: 'Project',
    docsLandingHref: '/docs/?doc=01-research'
  }

  const config = Object.assign({}, DEFAULT_CONFIG, window.PORTAL_SHELL_CONFIG || {})

  function escapeHtml(s) {
    return String(s ?? '')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;')
  }

  function renderShell(activePage) {
    const item = (id, label, href) => {
      const active = id === activePage ? ' class="active" aria-current="page"' : ''
      return `<a href="${href}"${active}>${escapeHtml(label)}</a>`
    }
    return `
      <div class="portal-shell-inner">
        <a href="/" class="brand-mark">
          ${escapeHtml(config.productName)}<span class="brand-mark-tag">Blueprint</span>
        </a>
        <nav class="portal-shell-nav" aria-label="Primary">
          ${item('index', 'Front door', '/')}
          ${item('prototype', 'Prototype', '/prototype/')}
          ${item('docs', 'Docs', config.docsLandingHref)}
        </nav>
      </div>`
  }

  function init() {
    const targets = document.querySelectorAll('header[data-portal-shell]')
    if (!targets.length) return
    targets.forEach((el) => {
      const active = el.getAttribute('data-portal-shell') || 'index'
      el.classList.add('portal-shell')
      el.innerHTML = renderShell(active)
      el.setAttribute('data-portal-shell-version', SHELL_VERSION)
    })
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }

  // Expose for drift checks + debugging
  window.__portalShell = { version: SHELL_VERSION, config }
})()
