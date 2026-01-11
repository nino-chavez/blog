#!/usr/bin/env node
/**
 * Export presentation to standalone HTML file
 *
 * Takes an MDX presentation and generates a self-contained HTML deck
 * that can be opened directly in a browser or shared offline.
 *
 * Usage:
 *   node scripts/export-presentation-html.js <slug>
 *   node scripts/export-presentation-html.js neuro-symbolic-convergence
 */

import fs from 'fs';
import path from 'path';

const BASE_DIR = '/Users/nino/Workspace/dev/sites/signal-dispatch-blog/astro-build';
const CONTENT_DIR = `${BASE_DIR}/src/content/presentations`;
const OUTPUT_DIR = `${BASE_DIR}/public/presentations/export`;

// Extract frontmatter from MDX file
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
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      }
      if (value.startsWith("'") && value.endsWith("'")) {
        value = value.slice(1, -1);
      }
      frontmatter[keyMatch[1]] = value;
    }
  }

  return frontmatter;
}

// Extract slides from MDX content
function extractSlides(content) {
  // Remove frontmatter
  const bodyMatch = content.match(/^---\n[\s\S]*?\n---\n([\s\S]*)$/);
  if (!bodyMatch) return [];

  const body = bodyMatch[1];

  // Split by <Slide> components
  const slideRegex = /<Slide(?:\s+[^>]*)?>[\s\S]*?<\/Slide>/g;
  const slides = body.match(slideRegex) || [];

  return slides.map((slide, index) => {
    // Extract layout attribute if present
    const layoutMatch = slide.match(/layout=["']([^"']+)["']/);
    const layout = layoutMatch ? layoutMatch[1] : 'default';

    // Extract content between tags
    const contentMatch = slide.match(/<Slide[^>]*>([\s\S]*)<\/Slide>/);
    const slideContent = contentMatch ? contentMatch[1].trim() : '';

    return {
      index: index + 1,
      layout,
      content: slideContent
    };
  });
}

// Convert basic markdown to HTML
function markdownToHtml(markdown) {
  let html = markdown;

  // Code blocks (must be before inline code)
  html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang, code) => {
    return `<pre class="code-block"><code>${escapeHtml(code.trim())}</code></pre>`;
  });

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Headers
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
    if (!match.includes('class="ol-item"')) {
      return `<ul>${match}</ul>`;
    }
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

  // Paragraphs (lines that aren't already wrapped)
  const lines = html.split('\n');
  const processed = lines.map(line => {
    const trimmed = line.trim();
    if (!trimmed) return '';
    if (trimmed.startsWith('<')) return line;
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

// Generate the standalone HTML
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
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            'brand-violet': '#7c3aed',
            'brand-orange': '#ea580c',
            'brand-slate': '#09090b',
          },
          fontFamily: {
            'display': ['Inter', 'system-ui', 'sans-serif'],
          }
        }
      }
    }
  </script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
    body {
      font-family: 'Inter', system-ui, sans-serif;
      background: #09090b;
      color: #fafafa;
      overflow: hidden;
    }

    .slide {
      display: none;
      min-height: 100vh;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      background: linear-gradient(to bottom right, #09090b, #18181b, #09090b);
    }

    .slide.active {
      display: flex;
      animation: fadeIn 0.4s ease-out;
    }

    .slide-content {
      max-width: 64rem;
      width: 100%;
      text-align: center;
    }

    .slide[data-layout="table"] .slide-content,
    .slide[data-layout="split"] .slide-content {
      text-align: left;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    h1 {
      font-size: 3.5rem;
      font-weight: 800;
      line-height: 1.1;
      margin-bottom: 1.5rem;
      letter-spacing: -0.025em;
    }

    h2 {
      font-size: 2.5rem;
      font-weight: 700;
      line-height: 1.2;
      margin-bottom: 1.5rem;
      letter-spacing: -0.025em;
    }

    h3 {
      font-size: 1.5rem;
      font-weight: 600;
      color: #a1a1aa;
      margin-bottom: 1rem;
    }

    p {
      font-size: 1.5rem;
      color: #a1a1aa;
      line-height: 1.6;
      margin-bottom: 1rem;
    }

    strong { color: #fafafa; font-weight: 600; }
    em { color: #7c3aed; }

    ul, ol {
      font-size: 1.25rem;
      color: #a1a1aa;
      text-align: left;
      margin: 1.5rem auto;
      max-width: 48rem;
    }

    li { margin-bottom: 0.75rem; line-height: 1.8; }

    code {
      font-family: 'JetBrains Mono', monospace;
      background: rgba(39, 39, 42, 0.8);
      color: #7c3aed;
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;
      font-size: 0.9em;
    }

    .code-block {
      background: #18181b;
      border: 1px solid #27272a;
      border-radius: 0.75rem;
      padding: 1.5rem;
      overflow-x: auto;
      text-align: left;
      margin: 1.5rem 0;
    }

    .code-block code {
      background: transparent;
      padding: 0;
      color: #06b6d4;
      font-size: 1rem;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin: 1.5rem 0;
      font-size: 1.125rem;
    }

    th {
      background: rgba(124, 58, 237, 0.1);
      color: #fafafa;
      font-weight: 600;
      padding: 1rem;
      text-align: left;
      border-bottom: 2px solid #7c3aed;
    }

    td {
      padding: 1rem;
      color: #a1a1aa;
      border-bottom: 1px solid #27272a;
    }

    tr:hover td { background: rgba(39, 39, 42, 0.3); }

    /* Navigation */
    nav {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 50;
      background: rgba(9, 9, 11, 0.9);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid rgba(39, 39, 42, 0.5);
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
      background: linear-gradient(to bottom right, #7c3aed, #ea580c);
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
      border: 1px solid #3f3f46;
      background: transparent;
      color: #a1a1aa;
    }

    .nav-btn:hover:not(:disabled) {
      border-color: #52525b;
      color: #fafafa;
    }

    .nav-btn:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }

    .nav-btn-primary {
      background: #7c3aed;
      border-color: #7c3aed;
      color: #fafafa;
    }

    .nav-btn-primary:hover:not(:disabled) {
      background: rgba(124, 58, 237, 0.8);
    }

    .slide-counter {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.875rem;
      color: #71717a;
      min-width: 60px;
      text-align: center;
    }

    .progress-bar {
      position: fixed;
      top: 57px;
      left: 0;
      right: 0;
      height: 2px;
      background: #27272a;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(to right, #7c3aed, #ea580c);
      transition: width 0.3s;
    }

    /* Responsive */
    @media (max-width: 768px) {
      h1 { font-size: 2.5rem; }
      h2 { font-size: 1.75rem; }
      p { font-size: 1.125rem; }
      .slide { padding: 1rem; }
    }
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
      <span class="text-white/90 font-semibold hidden sm:inline">${escapeHtml(frontmatter.title || 'Presentation')}</span>
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
  <main>
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
        slide.classList.toggle('active', i + 1 === target);
      });

      currentSlide = target;
      currentSlideEl.textContent = currentSlide;
      progressEl.style.width = (currentSlide / totalSlides * 100) + '%';

      prevBtn.disabled = currentSlide === 1;
      nextBtn.disabled = currentSlide === totalSlides;
    }

    prevBtn.addEventListener('click', () => goToSlide(currentSlide - 1));
    nextBtn.addEventListener('click', () => goToSlide(currentSlide + 1));

    document.addEventListener('keydown', (e) => {
      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
        case ' ':
        case 'PageDown':
          e.preventDefault();
          goToSlide(currentSlide + 1);
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
        case 'PageUp':
          e.preventDefault();
          goToSlide(currentSlide - 1);
          break;
        case 'Home':
          e.preventDefault();
          goToSlide(1);
          break;
        case 'End':
          e.preventDefault();
          goToSlide(totalSlides);
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
          } else {
            document.exitFullscreen();
          }
          break;
      }
    });

    // Initialize
    goToSlide(1);
  </script>

  <footer style="position: fixed; bottom: 0; left: 0; right: 0; padding: 0.5rem; text-align: center; font-size: 0.75rem; color: #52525b; background: rgba(9, 9, 11, 0.8);">
    ${escapeHtml(frontmatter.author || 'Nino Chavez')} &middot; Signal Dispatch &middot; ${new Date().getFullYear()}
  </footer>
</body>
</html>`;
}

// Main function
async function main() {
  const args = process.argv.slice(2);
  const slug = args.find(a => !a.startsWith('-'));

  if (!slug) {
    console.error('Usage: node scripts/export-presentation-html.js <slug>');
    console.error('Example: node scripts/export-presentation-html.js neuro-symbolic-convergence');
    process.exit(1);
  }

  const filename = slug.endsWith('.mdx') ? slug : `${slug}.mdx`;
  const filepath = path.join(CONTENT_DIR, filename);

  if (!fs.existsSync(filepath)) {
    console.error(`Error: Presentation not found: ${filepath}`);
    process.exit(1);
  }

  // Create output directory
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  console.log('');
  console.log('📽️  Signal Dispatch Presentation Exporter');
  console.log('   Generating standalone HTML deck\n');

  // Read and parse content
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

  // Generate HTML
  const html = generateStandaloneHtml(frontmatter, slides);

  // Write output
  const outputSlug = slug.replace('.mdx', '');
  const outputPath = path.join(OUTPUT_DIR, `${outputSlug}.html`);
  fs.writeFileSync(outputPath, html);

  const fileSizeKB = Math.round(fs.statSync(outputPath).size / 1024);

  console.log(`   Output: ${outputPath}`);
  console.log(`   Size: ${fileSizeKB}KB`);
  console.log('\n✨ Done! Open the HTML file directly in a browser.');
}

main().catch(console.error);
