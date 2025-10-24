# Signal Dispatch - Project Instructions

## Project Overview

This is the Signal Dispatch blog - Nino Chavez's technical blog covering AI automation, systems thinking, leadership, and consulting practice.

**Tech Stack**: Astro, TypeScript, Tailwind CSS, MDX content

## Voice & Tone

**CRITICAL**: When writing or editing blog posts, you MUST reference:
`/docs/signal-dispatch-voice-guide.md`

This guide defines the actual Signal Dispatch voice based on empirical analysis of 156 published posts.

### Key Voice Principles (Summary)

1. **Open with tension or questions**, never with thesis statements
2. **Show the work**, not just conclusions
3. **Include self-interrogation** without self-doubt
4. **End provisionally** ("here's what I think today")
5. **Use intentional fragments** for rhythm
6. **Avoid corporate jargon** and academic distance
7. **Ground in actual experience**, not theory

### Before Publishing ANY Post

Verify against the voice guide checklist:
- [ ] Opens with tension or uncomfortable truth
- [ ] Shows evolution ("I used to think X, now I think Y")
- [ ] Includes self-interrogation
- [ ] Uses "I" not "you should"
- [ ] Provisional conclusions
- [ ] Bold section headers
- [ ] Mix of long/short sentences
- [ ] Specific examples from experience

## Content Structure

### Blog Posts Location
`/src/content/blog/*.mdx`

### Frontmatter Template
```yaml
---
title: "Post Title"
publishedAt: "ISO-8601 timestamp"
author: "Nino Chavez"
excerpt: "Brief description"
category: "Category Name"
tags: ["tag1", "tag2"]
featured: false
---
```

### Common Categories
- AI & Automation
- Leadership
- Meta (self-reflective posts)
- Field Notes
- Consulting Practice
- Examples

## Workflow for New Posts

1. **Ideation**: Identify the tension or uncomfortable truth
2. **Structure**: Choose template from voice guide
3. **Draft**: Write following voice patterns
4. **Review**: Check against voice guide checklist
5. **Frontmatter**: Add proper metadata
6. **Verify**: Run `npm run build` to catch errors

## Common Commands

- `npm run dev` - Start dev server
- `npm run build` - Build for production
- `npm run sitemap` - Regenerate sitemap

## Important Notes

- **Voice over perfection**: Preserve rough edges if they sound authentic
- **Show the work**: Meta-awareness is a feature, not a bug
- **Evidence over theory**: Ground posts in actual experience
- **Public practice**: It's okay to be figuring things out in the post itself
