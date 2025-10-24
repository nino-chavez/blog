#!/usr/bin/env tsx
/**
 * Local Blog Post Creator
 *
 * Simple script to create MDX blog posts from Gemini content or Gamma presentations
 * Run: npm run create-post
 */

import fs from 'fs/promises';
import path from 'path';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function escapeYamlString(str: string): string {
  // If string contains quotes, escape them properly for YAML
  if (str.includes('"')) {
    return `'${str.replace(/'/g, "''")}'`;
  }
  return `"${str}"`;
}

async function main() {
  console.log('📝 Signal Dispatch Blog Post Creator\n');

  // Ask post type
  const postType = await question('Post type?\n  1. Regular post (text content)\n  2. Gamma presentation\nChoice (1/2): ');
  const isGammaPost = postType === '2' || postType.toLowerCase().includes('gamma');

  console.log('');

  // Get metadata
  const title = await question('Title: ');
  const category = await question('Category (AI & Automation, Consulting, Architecture, etc.): ');
  const tags = await question('Tags (comma-separated): ');
  const featured = await question('Featured? (y/n): ');

  let gammaId = '';
  let source = '';
  let sourceUrl = '';

  if (isGammaPost) {
    gammaId = await question('Gamma presentation ID (from https://gamma.app/docs/YOUR-ID): ');
    source = 'gamma';
  } else {
    source = await question('Source (gemini/linkedin/original): ');
    sourceUrl = await question('Source URL (optional, press enter to skip): ');
  }

  let content = '';
  let excerpt = '';
  let frontmatter = '';

  if (isGammaPost) {
    // Gamma post: minimal content, presentation is the main content
    excerpt = await question('Excerpt (brief description of the presentation): ');

    // Generate frontmatter for Gamma post
    frontmatter = `---
title: ${escapeYamlString(title)}
slug: "${generateSlug(title)}"
publishedAt: "${new Date().toISOString()}"
author: "Nino Chavez"
excerpt: ${escapeYamlString(excerpt)}
category: "${category}"
tags: [${tags.split(',').map(t => `"${t.trim()}"`).join(', ')}]
featured: ${featured.toLowerCase() === 'y' || featured.toLowerCase() === 'yes'}
source: "gamma"
gammaId: "${gammaId}"
presentationType: "gamma"
---`;

    // Optional supporting content
    const addContent = await question('\nAdd supporting content below the presentation? (y/n): ');

    if (addContent.toLowerCase() === 'y' || addContent.toLowerCase() === 'yes') {
      console.log('\n📄 Paste your content (press Ctrl+D when done):\n');

      const contentLines: string[] = [];
      const contentRl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: false
      });

      for await (const line of contentRl) {
        contentLines.push(line);
      }

      content = contentLines.join('\n').trim();
    } else {
      content = `## About This Presentation

This presentation covers ${title.toLowerCase()}.

<!-- Add any supporting content, context, or notes here -->`;
    }

  } else {
    // Regular post: full content required
    console.log('\n📄 Paste your content (press Ctrl+D when done):\n');

    const contentLines: string[] = [];
    const contentRl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: false
    });

    for await (const line of contentRl) {
      contentLines.push(line);
    }

    content = contentLines.join('\n').trim();

    if (!content) {
      console.error('❌ No content provided');
      process.exit(1);
    }

    // Generate excerpt (first 200 chars)
    excerpt = content.substring(0, 200).replace(/\n/g, ' ').trim() + '...';

    // Generate frontmatter for regular post
    frontmatter = `---
title: ${escapeYamlString(title)}
publishedAt: "${new Date().toISOString()}"
author: "Nino Chavez"
excerpt: ${escapeYamlString(excerpt)}
category: "${category}"
tags: [${tags.split(',').map(t => `"${t.trim()}"`).join(', ')}]
featured: ${featured.toLowerCase() === 'y' || featured.toLowerCase() === 'yes'}
source: "${source}"${sourceUrl ? `\nsourceUrl: "${sourceUrl}"` : ''}
---`;
  }

  // Create full MDX content
  const mdxContent = `${frontmatter}\n\n${content}`;

  // Generate filename
  const slug = generateSlug(title);
  const filename = `${slug}.mdx`;
  const filepath = path.join(process.cwd(), 'src', 'content', 'blog', filename);

  // Write file
  await fs.writeFile(filepath, mdxContent, 'utf-8');

  console.log('\n✅ Blog post created successfully!');
  console.log(`   Type: ${isGammaPost ? 'Gamma Presentation' : 'Regular Post'}`);
  console.log(`   File: src/content/blog/${filename}`);
  console.log(`   Slug: ${slug}`);

  if (isGammaPost) {
    console.log(`   Gamma ID: ${gammaId}`);
    console.log(`   Preview: https://gamma.app/docs/${gammaId}`);
  }

  console.log('\n📦 Next steps:');
  console.log('   1. Review the file in VS Code');
  if (isGammaPost) {
    console.log('   2. Verify Gamma presentation is public/shareable');
    console.log('   3. Test embed works: npm run dev');
  }
  console.log(`   ${isGammaPost ? '4' : '2'}. git add src/content/blog/${filename}`);
  console.log(`   ${isGammaPost ? '5' : '3'}. git commit -m "Add new ${isGammaPost ? 'Gamma presentation' : 'blog post'}"`);
  console.log(`   ${isGammaPost ? '6' : '4'}. git push`);

  rl.close();
  process.exit(0);
}

main().catch((error) => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});