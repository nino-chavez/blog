# Creating Gamma Presentation Posts

This guide shows how to create blog posts that embed Gamma presentations using the `create-post` script.

## Quick Start

```bash
npm run create-post
```

## Option 1: Regular Blog Post

If you select option **1** (Regular post), you'll be prompted for:

1. **Title** - Post title
2. **Category** - AI & Automation, Consulting, Architecture, etc.
3. **Tags** - Comma-separated list
4. **Featured** - y/n (appears in featured section)
5. **Source** - gemini/linkedin/original
6. **Source URL** - Optional external link
7. **Content** - Paste your markdown content (Ctrl+D when done)

### Example: Regular Post

```
Post type?
  1. Regular post (text content)
  2. Gamma presentation
Choice (1/2): 1

Title: My Thoughts on AI Architecture
Category: AI & Automation
Tags: ai, architecture, design
Featured? (y/n): n
Source (gemini/linkedin/original): gemini
Source URL (optional, press enter to skip):

📄 Paste your content (press Ctrl+D when done):

# Introduction

This is my blog post content...

[Press Ctrl+D]

✅ Blog post created successfully!
```

---

## Option 2: Gamma Presentation Post

If you select option **2** (Gamma presentation), you'll be prompted for:

1. **Title** - Post title
2. **Category** - Category for the presentation
3. **Tags** - Comma-separated tags
4. **Featured** - y/n (appears in featured section)
5. **Gamma ID** - Your presentation ID from Gamma.app
6. **Excerpt** - Brief description (for SEO and list page)
7. **Supporting Content** - Optional markdown below the presentation

### Getting Your Gamma Presentation ID

1. Open your presentation in Gamma.app
2. Click the **Share** button
3. Find the **Embed** option
4. Your URL will look like: `https://gamma.app/docs/YOUR-PRESENTATION-ID`
5. Copy just the `YOUR-PRESENTATION-ID` part

### Example: Gamma Post

```
Post type?
  1. Regular post (text content)
  2. Gamma presentation
Choice (1/2): 2

Title: Q4 2024 Performance Review
Category: Business
Tags: presentations, quarterly-review, performance
Featured? (y/n): y
Gamma presentation ID (from https://gamma.app/docs/YOUR-ID): abc123xyz456
Excerpt (brief description of the presentation): Quarterly performance highlights and strategic initiatives

Add supporting content below the presentation? (y/n): n

✅ Blog post created successfully!
   Type: Gamma Presentation
   File: src/content/blog/q4-2024-performance-review.mdx
   Slug: q4-2024-performance-review
   Gamma ID: abc123xyz456
   Preview: https://gamma.app/docs/abc123xyz456

📦 Next steps:
   1. Review the file in VS Code
   2. Verify Gamma presentation is public/shareable
   3. Test embed works: npm run dev
   4. git add src/content/blog/q4-2024-performance-review.mdx
   5. git commit -m "Add new Gamma presentation"
   6. git push
```

---

## What Gets Created

### Regular Post Structure

```mdx
---
title: "My Post Title"
publishedAt: "2025-10-23T12:00:00Z"
author: "Nino Chavez"
excerpt: "Auto-generated from first 200 chars..."
category: "AI & Automation"
tags: ["ai", "automation"]
featured: false
source: "gemini"
---

Your markdown content here...
```

### Gamma Post Structure

```mdx
---
title: "Q4 2024 Performance Review"
slug: "q4-2024-performance-review"
publishedAt: "2025-10-23T12:00:00Z"
author: "Nino Chavez"
excerpt: "Quarterly performance highlights and strategic initiatives"
category: "Business"
tags: ["presentations", "quarterly-review", "performance"]
featured: true
source: "gamma"
gammaId: "abc123xyz456"
presentationType: "gamma"
---

## About This Presentation

This presentation covers q4 2024 performance review.

<!-- Add any supporting content, context, or notes here -->
```

---

## How Gamma Posts Render

When published, Gamma posts will:

1. **Show the presentation first** - Full-width responsive embed (16:9 aspect ratio)
2. **Display supporting content below** - Any markdown you add
3. **Include a presentation badge** - Visual indicator on the blog list page
4. **Maintain all SEO metadata** - Title, excerpt, tags all indexed

### Example Layout

```
┌─────────────────────────────────┐
│ Post Header (title, date, etc) │
├─────────────────────────────────┤
│                                 │
│   [Gamma Presentation Embed]    │
│     (Responsive 16:9)           │
│                                 │
├─────────────────────────────────┤
│ Supporting Content (optional)   │
│ - Context                       │
│ - Additional notes              │
│ - Related links                 │
├─────────────────────────────────┤
│ Share buttons, related posts    │
└─────────────────────────────────┘
```

---

## Important Notes

### Before Publishing

1. **Make presentation public** - Ensure your Gamma presentation is shareable
2. **Test the embed** - Run `npm run dev` and navigate to your post
3. **Verify the ID** - Check that the correct presentation loads
4. **Review metadata** - Title, excerpt, and tags are SEO-critical

### Troubleshooting

**Presentation not loading?**
- Check that the Gamma ID is correct (no extra spaces)
- Verify presentation is public/shareable in Gamma
- Check browser console for errors

**Badge not showing?**
- Ensure `gammaId` field is present in frontmatter
- Run `npm run build` to regenerate manifest
- Clear browser cache

**Wrong excerpt showing?**
- Edit the `excerpt` field in frontmatter
- Avoid using quotes inside the excerpt
- Keep it under 200 characters

---

## Tips

### When to Use Gamma Posts

- ✅ Presentation is the primary content
- ✅ Visual/slide-based content
- ✅ Conference talks, webinars, reports
- ✅ Data-heavy content better shown visually

### When to Use Regular Posts

- ✅ Long-form written content
- ✅ Code-heavy tutorials
- ✅ Narrative storytelling
- ✅ Text-based analysis

### Hybrid Approach

You can add supporting content to Gamma posts:

```mdx
---
gammaId: "your-id"
# ... other frontmatter
---

## Presentation Summary

[Presentation embeds here automatically]

## Key Takeaways

- Point 1
- Point 2
- Point 3

## Additional Resources

- [Link 1](#)
- [Link 2](#)
```

---

## Automation Ideas

### Future Enhancements

1. **Batch creation** - Create multiple posts from a CSV
2. **Gamma API integration** - Auto-fetch presentation metadata
3. **Thumbnail generation** - Auto-create preview images
4. **Publishing schedule** - Set future publish dates

---

## Support

For issues or questions:
- Check the [example Gamma post](/gamma-integration-example)
- Review the [GammaEmbed component](../src/components/GammaEmbed.tsx)
- See [BlogPostPage](../src/pages/BlogPostPage.tsx) for rendering logic
