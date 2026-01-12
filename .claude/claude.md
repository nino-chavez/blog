# Signal Dispatch - Project Instructions

## Repository Map

### Directory Structure
All content lives in the `astro-build/` subdirectory:
```
signal-dispatch-blog/
├── astro-build/
│   ├── src/content/blog/*.mdx           # Blog posts
│   ├── src/content/whitepapers/*.mdx    # Whitepapers
│   ├── src/content/presentations/*.mdx  # Presentations
│   ├── public/images/generated/         # Generated feature images
│   ├── public/presentations/export/     # Exported standalone HTML decks
│   └── scripts/                         # Utility scripts
├── docs/                                # Documentation (voice guide, etc.)
└── .claude/                             # Claude instructions
```

### Key Conventions
- All commands run from `astro-build/` directory
- MDX content in `astro-build/src/content/{blog,whitepapers,presentations}/`
- Voice guide enforcement via `/docs/signal-dispatch-voice-guide.md`
- Generated images in `astro-build/public/images/generated/`

### Critical Files (Review Required)
- `/docs/signal-dispatch-voice-guide.md` - Voice/tone standards
- `astro-build/astro.config.mjs` - Build configuration

### Off-Limits (Explicit Approval Required)
- `.env*` files - Environment configuration
- `astro.config.mjs` - Build/deployment config

---

## Content Types

### Blog Posts
- **Location**: `astro-build/src/content/blog/*.mdx`
- **Voice**: Signal Dispatch voice (see voice guide)
- **Format**: Conversational, uses MDX components (Callout, PullQuote)
- **Structure**: H2 sections with `---` dividers, short paragraphs

### Whitepapers
- **Location**: `astro-build/src/content/whitepapers/*.mdx`
- **Voice**: Formal analytical, but still grounded in Signal Dispatch perspective
- **Format**: Plain markdown (NO MDX components), heavy use of tables
- **Structure**: Executive Summary → Parts (I, II, III) → Appendix
- **Headers**: H1 for Parts, H2 for numbered sections (1.1, 1.2)

### Presentations
- **Location**: `astro-build/src/content/presentations/*.mdx`
- **Voice**: Executive briefing style, clear and direct
- **Format**: MDX with `<Slide>` components, markdown content within slides
- **Structure**: Title slide → Content slides → Summary/CTA slide
- **Output**: Web viewer + standalone HTML export

---

## Blog Post Workflow

When asked to create a **new blog post**, follow this workflow exactly:

### 1. Draft Content
Create file at `astro-build/src/content/blog/{slug}.mdx`

**Frontmatter template:**
```yaml
---
title: "Post Title"
publishedAt: "YYYY-MM-DDTHH:MM:SS.000Z"
author: "Nino Chavez"
excerpt: "Brief description (1-2 sentences)"
category: "Category Name"
tags: ["tag1", "tag2"]
featured: false
---
```

**Voice requirements** (reference `/docs/signal-dispatch-voice-guide.md`):
- Open with tension or uncomfortable truth, never thesis
- Show the work, not just conclusions
- Include self-interrogation without self-doubt
- End provisionally ("here's what I think today")
- Use intentional fragments for rhythm

**MDX components available:**
```mdx
import { Callout } from '@/components/mdx/Callout';
import { PullQuote } from '@/components/mdx/PullQuote';

<PullQuote>Key quote (max 1 per post)</PullQuote>

<Callout type="signal" title="Title">Content</Callout>
<!-- Types: signal, noise, insight, warning -->
```

### 2. Generate Feature Image
```bash
cd astro-build
export OPENROUTER_API_KEY=$(grep OPENROUTER_API_KEY .env | cut -d'=' -f2)
node scripts/generate-illustration-images.js --dir blog {filename}.mdx
```

### 3. Verify Build
```bash
cd astro-build
npm run build
```

### 4. Publish (if requested)
- Set `featured: true` in frontmatter if featured
- Commit and push:
```bash
git add -A
git commit -m "publish: {Post Title}"
git push
```

---

## Whitepaper Workflow

When asked to create a **new whitepaper**, follow this workflow exactly:

### 1. Draft Content
Create file at `astro-build/src/content/whitepapers/{slug}.mdx`

**Frontmatter template:**
```yaml
---
title: "Full Whitepaper Title"
publishedAt: "YYYY-MM-DDTHH:MM:SS.000Z"
author: "Nino Chavez"
excerpt: "Executive summary excerpt (2-3 sentences)"
category: "Category Name"
tags: ["tag1", "tag2"]
---
```

**Structure template:**
```markdown
# Executive Summary

[Overview paragraph]

**Key Findings:**
- Finding 1
- Finding 2

---

# Part I: [Section Title]

## 1.1 [Subsection]

Content with tables...

## 1.2 [Subsection]

---

# Part II: [Section Title]

## 2.1 [Subsection]

---

# Conclusion

---

# Appendix A: Key Terms

**Term**: Definition

---

# Appendix B: Data Sources & Methodology

- Source 1
- Source 2

---

*Signal Dispatch Research | Month Year*
```

**Whitepaper conventions:**
- NO MDX components (Callout, PullQuote) - plain markdown only
- Use tables liberally for data presentation
- Escape `<` characters in tables (use "Under 50ms" not "<50ms")
- H1 (`#`) for Executive Summary, Parts, Conclusion, Appendix
- H2 (`##`) for numbered sections within parts
- End with `*Signal Dispatch Research | Month Year*`

### 2. Generate Feature Image
```bash
cd astro-build
export OPENROUTER_API_KEY=$(grep OPENROUTER_API_KEY .env | cut -d'=' -f2)
node scripts/generate-illustration-images.js --dir whitepapers {filename}.mdx
```

### 3. Verify Build
```bash
cd astro-build
npm run build
```

### 4. Publish (if requested)
- Commit and push:
```bash
git add -A
git commit -m "publish: {Whitepaper Title}"
git push
```

---

## Presentation Workflow

When asked to create a **new presentation**, follow this workflow exactly:

### 1. Draft Content
Create file at `astro-build/src/content/presentations/{slug}.mdx`

**Frontmatter template:**
```yaml
---
title: "Presentation Title"
publishedAt: "YYYY-MM-DDTHH:MM:SS.000Z"
author: "Nino Chavez"
excerpt: "Brief description of the presentation"
category: "Category Name"
tags: ["tag1", "tag2"]
duration: "15 min"
audience: "Target audience description"
mode: "executive-advisory"  # or "technical-deep-dive" or "workshop"
---
```

**Structure template:**
```mdx
import { Slide } from '@/components/presentations';

<Slide layout="title">
# Presentation Title

Subtitle or tagline

*Author Name • Date*
</Slide>

<Slide>
## Section Header

- Key point one
- Key point two
- Key point three
</Slide>

<Slide layout="quote">
> "Memorable quote that captures the core insight."

— Attribution
</Slide>

<Slide layout="split">
<div>
### Left Column
Content for left side
</div>
<div>
### Right Column
Content for right side
</div>
</Slide>

<Slide>
## Summary

**Key Takeaways:**
1. First takeaway
2. Second takeaway
3. Third takeaway
</Slide>
```

**Slide layouts available:**
- `default` - Centered content (default)
- `title` - Large title with gradient text
- `split` - Two-column layout
- `table` - Optimized for data tables
- `image` - Full-bleed image with overlay
- `quote` - Large quote with decorative styling

**Presentation conventions:**
- Use `<Slide>` component for each slide
- One concept per slide
- Bullet points for scannability
- Tables for data comparison
- Keep text concise (presentation, not document)

### 2. Generate Feature Image
```bash
cd astro-build
export OPENROUTER_API_KEY=$(grep OPENROUTER_API_KEY .env | cut -d'=' -f2)
node scripts/generate-illustration-images.js --dir presentations {filename}.mdx
```

### 3. Export Standalone HTML
```bash
cd astro-build
node scripts/export-presentation-html.js {slug}
```
Output: `public/presentations/export/{slug}.html`

### 4. Verify Build
```bash
cd astro-build
npm run build
```

### 5. Publish (if requested)
- Commit and push:
```bash
git add -A
git commit -m "publish: {Presentation Title}"
git push
```

---

## Image Generation Script

The script `astro-build/scripts/generate-illustration-images.js` handles feature image generation.

**Usage:**
```bash
# Blog posts (default)
node scripts/generate-illustration-images.js --dir blog {filename}.mdx

# Whitepapers
node scripts/generate-illustration-images.js --dir whitepapers {filename}.mdx

# Presentations
node scripts/generate-illustration-images.js --dir presentations {filename}.mdx

# Force regenerate existing
node scripts/generate-illustration-images.js --dir blog --force {filename}.mdx
```

**Requirements:**
- `OPENROUTER_API_KEY` environment variable (from `.env` file)
- Run from `astro-build/` directory

**Output:**
- Generates WebP image at `public/images/generated/{slug}.webp`
- Automatically updates frontmatter with `featureImage` path

---

## Presentation Export Script

The script `astro-build/scripts/export-presentation-html.js` generates standalone HTML decks.

**Usage:**
```bash
cd astro-build
node scripts/export-presentation-html.js {slug}
```

**Output:**
- Self-contained HTML file at `public/presentations/export/{slug}.html`
- Includes Tailwind CDN, all styles inlined
- Works offline, shareable as single file
- Keyboard navigation (arrow keys)
- Progress indicator

---

## Common Categories

- AI & Automation
- Leadership
- Meta (self-reflective posts)
- Field Notes
- Consulting Practice
- Systems Thinking
- Commerce

---

## Voice Guide Summary

**CRITICAL**: Reference `/docs/signal-dispatch-voice-guide.md` for full details.

### Key Principles
1. Open with tension or questions, never thesis statements
2. Show the work, not just conclusions
3. Include self-interrogation without self-doubt
4. End provisionally ("here's what I think today")
5. Use intentional fragments for rhythm
6. Avoid corporate jargon and academic distance
7. Ground in actual experience, not theory

### Voice Checklist (Blog Posts)
- [ ] Opens with tension or uncomfortable truth
- [ ] Shows evolution ("I used to think X, now I think Y")
- [ ] Includes self-interrogation
- [ ] Uses "I" not "you should"
- [ ] Provisional conclusions
- [ ] Short paragraphs (1-3 sentences)
- [ ] `---` dividers between H2 sections
- [ ] Mix of long/short sentences

---

## Common Commands

All commands run from `astro-build/` directory:

```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run preview  # Preview production build
```

---

## Important Notes

- **Voice over perfection**: Preserve rough edges if they sound authentic
- **Show the work**: Meta-awareness is a feature, not a bug
- **Evidence over theory**: Ground posts in actual experience
- **Public practice**: It's okay to be figuring things out in the post itself
- **Content type selection**:
  - **Blog posts**: Conversational exploration with MDX components
  - **Whitepapers**: Formal analysis with data tables
  - **Presentations**: Executive briefings with slide-based delivery
