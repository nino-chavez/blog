# Signal Dispatch - Project Instructions

## Repository Map

### Directory Structure
All content lives in the `astro-build/` subdirectory:
```
signal-dispatch-blog/
├── astro-build/
│   ├── src/content/blog/*.mdx      # Blog posts
│   ├── src/content/whitepapers/*.mdx # Whitepapers
│   ├── public/images/generated/    # Generated feature images
│   └── scripts/                    # Utility scripts
├── docs/                           # Documentation (voice guide, etc.)
└── .claude/                        # Claude instructions
```

### Key Conventions
- All commands run from `astro-build/` directory
- MDX content in `astro-build/src/content/blog/` or `astro-build/src/content/whitepapers/`
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

## Image Generation Script

The script `astro-build/scripts/generate-illustration-images.js` handles feature image generation.

**Usage:**
```bash
# Blog posts (default)
node scripts/generate-illustration-images.js --dir blog {filename}.mdx

# Whitepapers
node scripts/generate-illustration-images.js --dir whitepapers {filename}.mdx

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
- **Blog vs Whitepaper**: Blog posts are conversational with MDX; whitepapers are formal with tables
