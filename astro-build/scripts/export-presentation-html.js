#!/usr/bin/env node
/**
 * Export presentation to standalone HTML file
 *
 * Takes an MDX presentation and generates a self-contained HTML deck
 * that can be opened directly in a browser or shared offline.
 *
 * Transforms React/MDX components (Card, SectionLabel, Callout, etc.)
 * into HTML with the Signal Dispatch presentation design system CSS.
 *
 * Usage:
 *   node scripts/export-presentation-html.js <slug>
 *   node scripts/export-presentation-html.js beyond-chat-agentic-workflows
 */

import fs from 'fs';
import path from 'path';

const BASE_DIR = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const CONTENT_DIR = `${BASE_DIR}/src/content/presentations`;
const OUTPUT_DIR = `${BASE_DIR}/public/presentations/export`;

// ============================================
// FRONTMATTER PARSER
// ============================================
function extractFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;

  const frontmatter = {};
  const lines = match[1].split('\n');

  for (const line of lines) {
    if (line.match(/^\s+-\s/)) continue;
    const keyMatch = line.match(/^(\w+):\s*(.*)$/);
    if (keyMatch) {
      let value = keyMatch[2].trim();
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
      frontmatter[keyMatch[1]] = value;
    }
  }

  return frontmatter;
}

// ============================================
// SLIDE EXTRACTOR
// ============================================
function extractSlides(content) {
  const bodyMatch = content.match(/^---\n[\s\S]*?\n---\n([\s\S]*)$/);
  if (!bodyMatch) return [];

  const body = bodyMatch[1];
  const slideRegex = /<Slide(?:\s+[^>]*)?>[\s\S]*?<\/Slide>/g;
  const slides = body.match(slideRegex) || [];

  return slides.map((slide, index) => {
    const layoutMatch = slide.match(/layout=["']([^"']+)["']/);
    const layout = layoutMatch ? layoutMatch[1] : 'default';

    const contentMatch = slide.match(/<Slide[^>]*>([\s\S]*)<\/Slide>/);
    const slideContent = contentMatch ? contentMatch[1].trim() : '';

    return { index: index + 1, layout, content: slideContent };
  });
}

// ============================================
// COMPONENT TRANSFORMER
// Converts React/MDX components to HTML with
// design system CSS classes
// ============================================
function transformComponents(html) {
  // Remove import statements
  html = html.replace(/^import\s+.*$/gm, '');

  // <TitleBadge>text</TitleBadge> → design system badge
  html = html.replace(
    /<TitleBadge(?:\s+[^>]*)?>([\s\S]*?)<\/TitleBadge>/g,
    '<div class="title-badge"><span class="pulse-dot"></span>$1</div>'
  );

  // <SectionLabel color="X">text</SectionLabel> → design system label
  html = html.replace(
    /<SectionLabel\s+color=["']([^"']+)["']>([\s\S]*?)<\/SectionLabel>/g,
    '<div class="section-label $1">$2</div>'
  );
  // SectionLabel without color
  html = html.replace(
    /<SectionLabel>([\s\S]*?)<\/SectionLabel>/g,
    '<div class="section-label violet">$1</div>'
  );

  // <Callout color="X">content</Callout> → design system callout
  html = html.replace(
    /<Callout\s+color=["']([^"']+)["']>([\s\S]*?)<\/Callout>/g,
    '<div class="callout $1"><p>$2</p></div>'
  );
  // Callout without color
  html = html.replace(
    /<Callout>([\s\S]*?)<\/Callout>/g,
    '<div class="callout violet"><p>$1</p></div>'
  );

  // <Card variant="X">content</Card> → design system card
  html = html.replace(
    /<Card\s+variant=["']([^"']+)["'](?:\s+[^>]*)?>([\s\S]*?)<\/Card>/g,
    '<div class="card $1">$2</div>'
  );
  // Card without variant
  html = html.replace(
    /<Card>([\s\S]*?)<\/Card>/g,
    '<div class="card">$1</div>'
  );

  // <CodeBlock>content</CodeBlock> → code block
  html = html.replace(
    /<CodeBlock(?:\s+[^>]*)?>(?:\{`([\s\S]*?)`\}|(?:\{)?([\s\S]*?)(?:\})?)<\/CodeBlock>/g,
    (_, backtickContent, plainContent) => {
      const content = (backtickContent || plainContent || '').trim();
      return `<pre class="code-block"><code>${escapeHtml(content)}</code></pre>`;
    }
  );

  // Convert className to class
  html = html.replace(/className=/g, 'class=');

  // Convert JSX expressions in text: {`content`} → content
  html = html.replace(/\{`([^`]*)`\}/g, '$1');

  // Convert JSX self-closing br
  html = html.replace(/<br\s*\/>/g, '<br>');

  return html;
}

// ============================================
// MARKDOWN TO HTML CONVERTER
// Only processes text lines, preserves HTML
// ============================================
function markdownToHtml(text) {
  // First transform components
  let html = transformComponents(text);

  // Code blocks (must be before other processing)
  html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (_, _lang, code) => {
    return `<pre class="code-block"><code>${escapeHtml(code.trim())}</code></pre>`;
  });

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Headers (only convert lines that aren't inside HTML tags)
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

  // Bold and italic
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

  // Lists
  html = html.replace(/^(\d+)\. (.+)$/gm, '<li class="ol-item">$2</li>');
  html = html.replace(/^- (.+)$/gm, '<li>$1</li>');

  // Wrap consecutive list items
  html = html.replace(/(<li class="ol-item">[\s\S]*?<\/li>\n?)+/g, '<ol>$&</ol>');
  html = html.replace(/(<li>[\s\S]*?<\/li>\n?)+/g, (match) => {
    if (!match.includes('class="ol-item"')) return `<ul>${match}</ul>`;
    return match;
  });

  // Tables
  html = html.replace(/\|(.+)\|\n\|[-| ]+\|\n((?:\|.+\|\n?)+)/g, (_, header, rows) => {
    const headerCells = header.split('|').filter(c => c.trim()).map(c => `<th>${c.trim()}</th>`).join('');
    const bodyRows = rows.trim().split('\n').map(row => {
      const cells = row.split('|').filter(c => c.trim()).map(c => `<td>${c.trim()}</td>`).join('');
      return `<tr>${cells}</tr>`;
    }).join('');
    return `<table><thead><tr>${headerCells}</tr></thead><tbody>${bodyRows}</tbody></table>`;
  });

  // Paragraphs: wrap orphan text lines (not already HTML, not empty)
  const lines = html.split('\n');
  const processed = lines.map(line => {
    const trimmed = line.trim();
    if (!trimmed) return '';
    // Don't wrap lines that are already HTML tags, or inside JSX
    if (trimmed.startsWith('<') || trimmed.startsWith('{') || trimmed.startsWith('|')) return line;
    // Don't wrap if it looks like a continuation of HTML content
    if (trimmed.match(/^[a-z]+=/)) return line;
    return `<p>${trimmed}</p>`;
  });
  html = processed.join('\n');

  // Clean up empty paragraphs
  html = html.replace(/<p>\s*<\/p>/g, '');

  return html;
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ============================================
// DESIGN SYSTEM CSS
// Extracted from [slug].astro presentation
// viewer — the single source of truth
// ============================================
const DESIGN_SYSTEM_CSS = `
    /* ============================================
       SIGNAL DISPATCH PRESENTATION DESIGN SYSTEM
       Based on Signal Forge reference implementation
       ============================================ */

    /* CSS Custom Properties (Design Tokens) */
    :root {
      --brand-violet: #6366f1;
      --brand-navy: #1e1b4b;
      --brand-slate: #0f172a;
      --accent-cyan: #06b6d4;
      --accent-emerald: #10b981;
      --accent-amber: #f59e0b;
    }

    body {
      font-family: 'Inter', system-ui, sans-serif;
      background: var(--brand-slate);
      color: #fafafa;
      margin: 0;
      overflow: hidden;
    }

    /* ============================================
       PRESENTATION CONTAINER
       ============================================ */
    .presentation-container {
      position: fixed;
      top: 59px;
      left: 0;
      right: 0;
      bottom: 28px;
      font-family: 'Inter', system-ui, sans-serif;
      overflow: hidden;
    }

    /* ============================================
       BASE SLIDE STYLING
       ============================================ */
    .presentation-container .slide {
      display: none;
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      flex-direction: column;
      background: linear-gradient(to bottom right, var(--brand-slate), var(--brand-navy), var(--brand-slate));
      overflow-y: auto;
      overflow-x: hidden;
      padding: 3rem 2rem 4rem 2rem;
      box-sizing: border-box;
    }

    .presentation-container .slide.active {
      display: flex;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .presentation-container .slide.active {
      animation: fadeIn 0.4s ease-out;
    }

    @keyframes pulse-slow {
      0%, 100% { opacity: 0.4; }
      50% { opacity: 1; }
    }
    .animate-pulse-slow { animation: pulse-slow 3s ease-in-out infinite; }

    /* ============================================
       TYPOGRAPHY
       ============================================ */
    .presentation-container .slide h1 {
      font-size: 3.75rem;
      font-weight: 800;
      color: #fafafa;
      line-height: 1.1;
      letter-spacing: -0.025em;
      margin-bottom: 1.5rem;
    }

    .presentation-container .slide h2 {
      font-size: 2.25rem;
      font-weight: 700;
      color: #fafafa;
      line-height: 1.2;
      letter-spacing: -0.025em;
      margin-bottom: 3rem;
    }

    .presentation-container .slide h3 {
      font-size: 1.25rem;
      font-weight: 700;
      color: #fafafa;
      line-height: 1.3;
      margin-bottom: 1rem;
    }

    .presentation-container .slide p {
      font-size: 1.125rem;
      color: rgba(255, 255, 255, 0.7);
      line-height: 1.7;
      margin-bottom: 1rem;
    }

    .presentation-container .slide strong {
      color: #fafafa;
      font-weight: 600;
    }

    .presentation-container .slide em {
      color: var(--accent-cyan);
      font-style: italic;
    }

    /* ============================================
       SECTION LABELS
       ============================================ */
    .presentation-container .section-label {
      font-size: 0.875rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin-bottom: 1rem;
    }

    .presentation-container .section-label.amber { color: var(--accent-amber); }
    .presentation-container .section-label.cyan { color: var(--accent-cyan); }
    .presentation-container .section-label.emerald { color: var(--accent-emerald); }
    .presentation-container .section-label.violet { color: var(--brand-violet); }
    .presentation-container .section-label.red { color: #f87171; }
    .presentation-container .section-label.rose { color: #fb7185; }
    .presentation-container .section-label.neutral { color: rgba(255, 255, 255, 0.4); }

    /* ============================================
       CONTENT CARDS
       ============================================ */
    .presentation-container .card {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 1rem;
      padding: 1.5rem;
      margin-bottom: 2rem;
    }

    .presentation-container .card.highlighted {
      background: linear-gradient(to bottom right, rgba(99, 102, 241, 0.2), rgba(6, 182, 212, 0.1));
      border-color: rgba(99, 102, 241, 0.3);
      box-shadow: 0 0 40px rgba(99, 102, 241, 0.3);
    }

    .presentation-container .card.terminal {
      background: rgba(0, 0, 0, 0.4);
    }

    .presentation-container .card.warning {
      background: rgba(239, 68, 68, 0.1);
      border-color: rgba(239, 68, 68, 0.2);
    }

    .presentation-container .card.success {
      background: rgba(16, 185, 129, 0.1);
      border-color: rgba(16, 185, 129, 0.2);
    }

    /* ============================================
       CALLOUT BLOCKS
       ============================================ */
    .presentation-container .callout {
      background: linear-gradient(to right, rgba(99, 102, 241, 0.1), transparent);
      border-left: 4px solid var(--brand-violet);
      padding: 1.5rem;
      border-radius: 0 0.75rem 0.75rem 0;
      margin-top: 2rem;
    }

    .presentation-container .callout.amber {
      background: linear-gradient(to right, rgba(245, 158, 11, 0.1), transparent);
      border-left-color: var(--accent-amber);
    }

    .presentation-container .callout.cyan {
      background: linear-gradient(to right, rgba(6, 182, 212, 0.1), transparent);
      border-left-color: var(--accent-cyan);
    }

    .presentation-container .callout.emerald {
      background: linear-gradient(to right, rgba(16, 185, 129, 0.1), transparent);
      border-left-color: var(--accent-emerald);
    }

    .presentation-container .callout.violet {
      background: linear-gradient(to right, rgba(99, 102, 241, 0.1), transparent);
      border-left-color: var(--brand-violet);
    }

    .presentation-container .callout.rose {
      background: linear-gradient(to right, rgba(251, 113, 133, 0.1), transparent);
      border-left-color: #fb7185;
    }

    .presentation-container .callout.red {
      background: linear-gradient(to right, rgba(239, 68, 68, 0.1), transparent);
      border-left-color: #f87171;
    }

    .presentation-container .callout p {
      font-size: 1.125rem;
      color: rgba(255, 255, 255, 0.9);
      margin-bottom: 0;
    }

    /* ============================================
       TITLE BADGE
       ============================================ */
    .presentation-container .title-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background: rgba(99, 102, 241, 0.2);
      border: 1px solid rgba(99, 102, 241, 0.3);
      border-radius: 9999px;
      color: var(--brand-violet);
      font-size: 0.875rem;
      font-weight: 500;
      margin-bottom: 2rem;
    }

    .presentation-container .title-badge .pulse-dot {
      width: 0.5rem;
      height: 0.5rem;
      border-radius: 50%;
      background: var(--brand-violet);
      animation: pulse-slow 3s ease-in-out infinite;
    }

    /* ============================================
       LISTS
       ============================================ */
    .presentation-container .slide ul,
    .presentation-container .slide ol {
      font-size: 1.125rem;
      color: rgba(255, 255, 255, 0.7);
      line-height: 1.8;
      text-align: left;
      margin: 1.5rem 0;
      padding-left: 0;
      list-style: none;
    }

    .presentation-container .slide li {
      margin-bottom: 0.75rem;
      padding-left: 1.5rem;
      position: relative;
    }

    .presentation-container .slide ul li::before {
      content: '\\2192';
      position: absolute;
      left: 0;
      color: var(--brand-violet);
      font-weight: 600;
    }

    /* Suppress arrows for list-none (inline markers) */
    .presentation-container .slide ul.list-none li::before {
      display: none;
    }
    .presentation-container .slide ul.list-none li {
      padding-left: 0;
    }

    .presentation-container .slide ol { counter-reset: item; }
    .presentation-container .slide ol li { counter-increment: item; }
    .presentation-container .slide ol li::before {
      content: counter(item);
      position: absolute;
      left: 0;
      width: 1.5rem;
      height: 1.5rem;
      background: rgba(99, 102, 241, 0.2);
      color: var(--brand-violet);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      font-weight: 700;
      top: 0.2rem;
    }

    /* ============================================
       CODE BLOCKS
       ============================================ */
    .presentation-container .slide code {
      font-family: 'JetBrains Mono', monospace;
      background: rgba(0, 0, 0, 0.4);
      color: var(--accent-cyan);
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;
      font-size: 0.9em;
    }

    .presentation-container .slide pre,
    .presentation-container .code-block {
      background: rgba(0, 0, 0, 0.4);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 0.75rem;
      padding: 1rem 1.5rem;
      overflow-x: auto;
      text-align: left;
      margin: 1.5rem 0;
    }

    .presentation-container .slide pre code,
    .presentation-container .code-block code {
      background: transparent;
      padding: 0;
      font-size: 0.875rem;
      white-space: pre;
    }

    /* ============================================
       TABLES
       ============================================ */
    .presentation-container .slide table {
      width: 100%;
      border-collapse: collapse;
      margin: 1.5rem 0;
      font-size: 1rem;
      overflow: hidden;
      border-radius: 0.75rem;
      border: 1px solid rgba(255, 255, 255, 0.1);
      background: rgba(255, 255, 255, 0.03);
    }

    .presentation-container .slide th {
      background: rgba(255, 255, 255, 0.05);
      color: rgba(255, 255, 255, 0.6);
      font-weight: 600;
      padding: 1rem 1.25rem;
      text-align: left;
      text-transform: uppercase;
      font-size: 0.75rem;
      letter-spacing: 0.05em;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .presentation-container .slide td {
      padding: 1rem 1.25rem;
      color: rgba(255, 255, 255, 0.7);
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }

    .presentation-container .slide tr:last-child td { border-bottom: none; }
    .presentation-container .slide tr:hover td { background: rgba(255, 255, 255, 0.03); }

    /* ============================================
       BLOCKQUOTES
       ============================================ */
    .presentation-container .slide blockquote {
      border-left: 4px solid var(--brand-violet);
      padding-left: 1.5rem;
      font-size: 1.5rem;
      font-style: italic;
      color: rgba(255, 255, 255, 0.7);
      margin: 2rem 0;
    }

    .presentation-container .slide blockquote p {
      font-size: inherit;
      margin-bottom: 0;
    }

    /* ============================================
       LAYOUT: TITLE SLIDE
       ============================================ */
    .presentation-container .slide[data-layout="title"] {
      justify-content: center;
      align-items: center;
      text-align: center;
    }

    .presentation-container .slide[data-layout="title"] > div {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }

    .presentation-container .slide[data-layout="title"] h1 {
      font-size: 3.75rem;
      background: linear-gradient(to right, #fafafa, rgba(250, 250, 250, 0.6));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 1.5rem;
      text-align: center;
    }

    .presentation-container .slide[data-layout="title"] p {
      font-size: 1.25rem;
      color: rgba(255, 255, 255, 0.5);
      max-width: 600px;
      text-align: center;
      margin-left: auto;
      margin-right: auto;
    }

    .presentation-container .slide[data-layout="title"] p strong {
      font-size: 1.5rem;
      color: rgba(255, 255, 255, 0.8);
      display: block;
      margin-bottom: 2rem;
      text-align: center;
    }

    .presentation-container .slide[data-layout="title"] em {
      font-size: 0.875rem;
      color: rgba(255, 255, 255, 0.3);
      display: block;
      margin-top: 3rem;
      text-align: center;
    }

    /* ============================================
       LAYOUT: DEFAULT
       ============================================ */
    .presentation-container .slide[data-layout="default"] {
      justify-content: center;
      align-items: center;
    }

    .presentation-container .slide[data-layout="default"] > div {
      max-width: 64rem;
      width: 100%;
    }

    /* ============================================
       LAYOUT: TABLE
       ============================================ */
    .presentation-container .slide[data-layout="table"] {
      justify-content: center;
      align-items: center;
    }

    .presentation-container .slide[data-layout="table"] > div {
      max-width: 64rem;
      width: 100%;
    }

    /* ============================================
       LAYOUT: GRID
       ============================================ */
    .presentation-container .slide[data-layout="grid"] {
      justify-content: center;
      align-items: center;
    }

    .presentation-container .slide[data-layout="grid"] > div {
      max-width: 64rem;
      width: 100%;
    }

    /* ============================================
       LAYOUT: QUOTE
       ============================================ */
    .presentation-container .slide[data-layout="quote"] {
      justify-content: center;
      align-items: center;
      text-align: center;
    }

    .presentation-container .slide[data-layout="quote"] blockquote {
      font-size: 2rem;
      border-left: none;
      padding: 0;
      text-align: center;
      max-width: 800px;
    }

    .presentation-container .slide[data-layout="quote"] blockquote::before {
      content: '\\201C';
      font-size: 5rem;
      color: var(--brand-violet);
      line-height: 1;
      display: block;
      margin-bottom: 0.5rem;
    }

    /* ============================================
       NAVIGATION
       ============================================ */
    nav {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 50;
      background: rgba(15, 23, 42, 0.95);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      padding: 0.75rem 1.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .nav-title {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .nav-icon {
      width: 2rem;
      height: 2rem;
      border-radius: 0.5rem;
      background: linear-gradient(to bottom right, var(--brand-violet), #ea580c);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .nav-controls {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .nav-btn {
      padding: 0.375rem 0.75rem;
      font-size: 0.875rem;
      font-weight: 500;
      border-radius: 0.5rem;
      transition: all 0.15s;
      cursor: pointer;
      border: 1px solid rgba(255, 255, 255, 0.15);
      background: transparent;
      color: rgba(255, 255, 255, 0.6);
    }

    .nav-btn:hover:not(:disabled) {
      border-color: rgba(255, 255, 255, 0.3);
      color: #fafafa;
    }

    .nav-btn:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }

    .nav-btn-primary {
      background: var(--brand-violet);
      border-color: var(--brand-violet);
      color: #fafafa;
    }

    .nav-btn-primary:hover:not(:disabled) {
      background: rgba(99, 102, 241, 0.8);
    }

    .slide-counter {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.875rem;
      color: rgba(255, 255, 255, 0.4);
      min-width: 60px;
      text-align: center;
    }

    .progress-bar {
      position: fixed;
      top: 57px;
      left: 0;
      right: 0;
      height: 2px;
      background: rgba(255, 255, 255, 0.1);
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(to right, var(--brand-violet), #ea580c);
      transition: width 0.3s;
    }

    /* ============================================
       RESPONSIVE - TABLET
       ============================================ */
    @media (max-width: 768px) {
      .presentation-container .slide {
        padding: 4rem 1.25rem 2rem 1.25rem;
      }

      .presentation-container .slide h1 { font-size: 2.25rem; margin-bottom: 1rem; }
      .presentation-container .slide h2 { font-size: 1.75rem; margin-bottom: 2rem; }
      .presentation-container .slide h3 { font-size: 1.125rem; }
      .presentation-container .slide p { font-size: 1rem; line-height: 1.6; }

      .presentation-container .slide[data-layout="title"] h1 { font-size: 2.25rem; }
      .presentation-container .slide[data-layout="title"] p strong { font-size: 1.25rem; margin-bottom: 1.5rem; }

      .presentation-container .card { padding: 1.25rem; margin-bottom: 1.5rem; }
      .presentation-container .callout { padding: 1.25rem; margin-top: 1.5rem; }
      .presentation-container .callout p { font-size: 1rem; }
    }

    /* ============================================
       RESPONSIVE - MOBILE
       ============================================ */
    @media (max-width: 480px) {
      .presentation-container .slide {
        padding: 3.5rem 1rem 1.5rem 1rem;
        min-height: calc(100vh - 48px);
      }

      .presentation-container .slide h1 { font-size: 1.75rem; }
      .presentation-container .slide h2 { font-size: 1.375rem; margin-bottom: 1.5rem; }
      .presentation-container .slide h3 { font-size: 1rem; }
      .presentation-container .slide p { font-size: 0.9375rem; }

      .presentation-container .slide[data-layout="title"] h1 { font-size: 1.75rem; }

      .presentation-container .card { padding: 1rem; margin-bottom: 1rem; border-radius: 0.75rem; }
      .presentation-container .callout { padding: 1rem; margin-top: 1rem; }
      .presentation-container .callout p { font-size: 0.9375rem; }
      .presentation-container .section-label { font-size: 0.75rem; }
      .presentation-container .title-badge { padding: 0.25rem 0.625rem; font-size: 0.6875rem; margin-bottom: 1rem; }
    }
`;

// ============================================
// HTML GENERATOR
// ============================================
function generateStandaloneHtml(frontmatter, slides) {
  const slideHtml = slides.map((slide, i) => {
    const content = markdownToHtml(slide.content);
    const activeClass = i === 0 ? ' active' : '';
    return `
    <section class="slide${activeClass}" data-slide="${slide.index}" data-layout="${slide.layout}">
      <div class="slide-content">
        ${content}
      </div>
    </section>`;
  }).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(frontmatter.title || 'Presentation')}</title>
  <meta name="author" content="${escapeHtml(frontmatter.author || 'Nino Chavez')}">
  <meta name="description" content="${escapeHtml(frontmatter.excerpt || '')}">
  <script src="https://cdn.tailwindcss.com"><\/script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            'brand-violet': '#6366f1',
            'brand-navy': '#1e1b4b',
            'brand-slate': '#0f172a',
          },
          fontFamily: {
            display: ['Inter', 'system-ui', 'sans-serif'],
          }
        }
      }
    }
  <\/script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
${DESIGN_SYSTEM_CSS}
  </style>
</head>
<body>
  <!-- Navigation -->
  <nav>
    <div class="nav-title">
      <div class="nav-icon">
        <svg class="w-4 h-4" fill="none" stroke="white" viewBox="0 0 24 24" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
        </svg>
      </div>
      <span style="color: rgba(255,255,255,0.9); font-weight: 600;" class="hidden sm:inline">${escapeHtml(frontmatter.title || 'Presentation')}</span>
    </div>
    <div class="nav-controls">
      <button id="prevBtn" class="nav-btn" disabled>&larr; <span class="hidden sm:inline">Previous</span></button>
      <span class="slide-counter"><span id="currentSlide">1</span> / <span id="totalSlides">${slides.length}</span></span>
      <button id="nextBtn" class="nav-btn nav-btn-primary"><span class="hidden sm:inline">Next</span> &rarr;</button>
    </div>
  </nav>

  <div class="progress-bar">
    <div class="progress-fill" id="progress" style="width: ${(1 / slides.length) * 100}%"></div>
  </div>

  <!-- Slides -->
  <main class="presentation-container">
    ${slideHtml}
  </main>

  <script>
    const slides = document.querySelectorAll('.slide');
    const totalSlides = slides.length;
    let currentSlide = 1;

    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const currentSlideEl = document.getElementById('currentSlide');
    const progressEl = document.getElementById('progress');

    function goToSlide(n) {
      const target = Math.max(1, Math.min(n, totalSlides));
      if (target === currentSlide) return;

      slides.forEach((slide, i) => {
        const isTarget = i + 1 === target;
        slide.classList.toggle('active', isTarget);
        if (isTarget) slide.scrollTop = 0;
      });

      currentSlide = target;
      currentSlideEl.textContent = currentSlide;
      progressEl.style.width = (currentSlide / totalSlides * 100) + '%';

      prevBtn.disabled = currentSlide === 1;
      nextBtn.disabled = currentSlide === totalSlides;
    }

    prevBtn.addEventListener('click', () => goToSlide(currentSlide - 1));
    nextBtn.addEventListener('click', () => goToSlide(currentSlide + 1));

    function getActiveSlide() {
      return document.querySelector('.slide.active');
    }

    function isSlideScrollable(slide) {
      return slide && slide.scrollHeight > slide.clientHeight + 2;
    }

    function isAtScrollBottom(slide) {
      return slide.scrollTop + slide.clientHeight >= slide.scrollHeight - 2;
    }

    function isAtScrollTop(slide) {
      return slide.scrollTop <= 2;
    }

    document.addEventListener('keydown', (e) => {
      const active = getActiveSlide();
      const scrollable = isSlideScrollable(active);

      switch (e.key) {
        case 'ArrowRight': case 'PageDown':
          e.preventDefault();
          if (scrollable && !isAtScrollBottom(active)) {
            active.scrollBy({ top: active.clientHeight * 0.8, behavior: 'smooth' });
          } else {
            goToSlide(currentSlide + 1);
          }
          break;
        case ' ':
          e.preventDefault();
          if (scrollable && !isAtScrollBottom(active)) {
            active.scrollBy({ top: active.clientHeight * 0.8, behavior: 'smooth' });
          } else {
            goToSlide(currentSlide + 1);
          }
          break;
        case 'ArrowDown':
          if (scrollable && !isAtScrollBottom(active)) {
            // let native scroll happen
          } else {
            e.preventDefault();
            goToSlide(currentSlide + 1);
          }
          break;
        case 'ArrowLeft': case 'PageUp':
          e.preventDefault();
          if (scrollable && !isAtScrollTop(active)) {
            active.scrollBy({ top: -active.clientHeight * 0.8, behavior: 'smooth' });
          } else {
            goToSlide(currentSlide - 1);
          }
          break;
        case 'ArrowUp':
          if (scrollable && !isAtScrollTop(active)) {
            // let native scroll happen
          } else {
            e.preventDefault();
            goToSlide(currentSlide - 1);
          }
          break;
        case 'Home': e.preventDefault(); goToSlide(1); break;
        case 'End': e.preventDefault(); goToSlide(totalSlides); break;
        case 'f': case 'F':
          e.preventDefault();
          if (!document.fullscreenElement) document.documentElement.requestFullscreen();
          else document.exitFullscreen();
          break;
      }
    });

    goToSlide(1);
  <\/script>

  <footer style="position: fixed; bottom: 0; left: 0; right: 0; padding: 0.5rem; text-align: center; font-size: 0.75rem; color: rgba(255,255,255,0.3); background: rgba(15, 23, 42, 0.95); z-index: 40; border-top: 1px solid rgba(255,255,255,0.05);">
    ${escapeHtml(frontmatter.author || 'Nino Chavez')} &middot; Signal Dispatch &middot; ${new Date().getFullYear()}
  </footer>
</body>
</html>`;
}

// ============================================
// MAIN
// ============================================
async function main() {
  const args = process.argv.slice(2);
  const slug = args.find(a => !a.startsWith('-'));

  if (!slug) {
    console.error('Usage: node scripts/export-presentation-html.js <slug>');
    process.exit(1);
  }

  const filename = slug.endsWith('.mdx') ? slug : `${slug}.mdx`;
  const filepath = path.join(CONTENT_DIR, filename);

  if (!fs.existsSync(filepath)) {
    console.error(`Error: Presentation not found: ${filepath}`);
    process.exit(1);
  }

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  console.log('');
  console.log('📽️  Signal Dispatch Presentation Exporter');
  console.log('   Generating standalone HTML deck\n');

  const content = fs.readFileSync(filepath, 'utf-8');
  const frontmatter = extractFrontmatter(content);

  if (!frontmatter) {
    console.error('Error: Could not parse frontmatter');
    process.exit(1);
  }

  const slides = extractSlides(content);

  if (slides.length === 0) {
    console.error('Error: No slides found. Make sure content uses <Slide> components.');
    process.exit(1);
  }

  console.log(`   Title: ${frontmatter.title}`);
  console.log(`   Slides: ${slides.length}`);

  const html = generateStandaloneHtml(frontmatter, slides);

  const outputSlug = slug.replace('.mdx', '');
  const outputPath = path.join(OUTPUT_DIR, `${outputSlug}.html`);
  fs.writeFileSync(outputPath, html);

  const fileSizeKB = Math.round(fs.statSync(outputPath).size / 1024);

  console.log(`   Output: ${outputPath}`);
  console.log(`   Size: ${fileSizeKB}KB`);
  console.log('\n✨ Done! Open the HTML file directly in a browser.');
}

main().catch(console.error);
