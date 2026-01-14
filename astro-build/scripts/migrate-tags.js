#!/usr/bin/env node
/**
 * Tag Migration Script
 *
 * Migrates all blog post tags to the canonical tag system.
 * Run with --dry-run to preview changes without modifying files.
 *
 * Usage:
 *   node scripts/migrate-tags.js --dry-run   # Preview changes
 *   node scripts/migrate-tags.js             # Apply changes
 */

import fs from 'fs';
import path from 'path';

const BLOG_DIR = '/Users/nino/Workspace/dev/sites/signal-dispatch-blog/astro-build/src/content/blog';

// Canonical tag system (mirrored from tags.ts for standalone execution)
const TAG_MIGRATION_MAP = {
  // ai-development
  'ai coding': 'ai-development',
  'ai': 'ai-development',
  'genai': 'ai-development',
  'llm': 'ai-development',
  'ai workflows': 'ai-development',

  // ai-governance
  'ai governance': 'ai-governance',
  'governance': 'ai-governance',
  'ai ops': 'ai-governance',
  'ai-adoption': 'ai-governance',
  'ai-literacy': 'ai-governance',

  // agentic-systems
  'agentic software': 'agentic-systems',
  'agentic commerce': 'agentic-systems',
  'automation': 'agentic-systems',

  // architecture
  'architecture': 'architecture',
  'systems design': 'architecture',

  // commerce
  'commerce': 'commerce',
  'e-commerce': 'commerce',

  // consulting
  'consulting': 'consulting',
  'strategy': 'consulting',

  // leadership
  'leadership': 'leadership',

  // field-notes
  'field notes': 'field-notes',

  // reflection
  'personal growth': 'reflection',
  'self-awareness': 'reflection',
  'philosophy': 'reflection',
  'meaning': 'reflection',
  'therapy': 'reflection',
  'honesty': 'reflection',

  // signal-dispatch (meta posts)
  'meta': 'signal-dispatch',

  // engineering
  'engineering': 'engineering',
  'web development': 'engineering',
  'developer tools': 'engineering',
  'testing': 'engineering',
  'ux design': 'engineering',
  'accessibility': 'engineering',
  'svelte': 'engineering',
  'cli': 'engineering',

  // product-strategy
  'product strategy': 'product-strategy',

  // career
  'career': 'career',
  'higher education': 'career',
  'education': 'career',
  'productivity': 'career',
  'industry': 'career',

  // communication
  'communication': 'communication',
  'feedback': 'communication',

  // photography
  'practice': 'photography',

  // aegis-framework (keep as-is)
  'aegis-framework': 'aegis-framework',
};

// Tags to drop entirely
const DEPRECATED_TAGS = [
  'apple',
  'microsoft',
  'operating systems',
  'gen z',
  'patterns',
  'tools',
  'insights',
];

// Valid canonical tags
const VALID_TAGS = [
  'ai-development',
  'ai-governance',
  'agentic-systems',
  'architecture',
  'commerce',
  'consulting',
  'leadership',
  'field-notes',
  'deep-dive',
  'reflection',
  'tutorial',
  'aegis-framework',
  'signal-dispatch',
  'engineering',
  'product-strategy',
  'career',
  'communication',
  'photography',
];

function migrateTag(tag) {
  const normalized = tag.toLowerCase().trim();

  // Check if already valid
  if (VALID_TAGS.includes(normalized)) {
    return normalized;
  }

  // Check deprecation list
  if (DEPRECATED_TAGS.includes(normalized)) {
    return null;
  }

  // Check migration map
  if (TAG_MIGRATION_MAP[normalized]) {
    return TAG_MIGRATION_MAP[normalized];
  }

  // Unknown tag
  return { unknown: tag };
}

function extractTags(content) {
  const match = content.match(/^tags:\s*\[(.*?)\]/m);
  if (!match) return null;

  // Parse the tags array
  const tagsStr = match[1];
  const tags = tagsStr.split(',').map(t => {
    let tag = t.trim();
    // Remove quotes
    if ((tag.startsWith('"') && tag.endsWith('"')) ||
        (tag.startsWith("'") && tag.endsWith("'"))) {
      tag = tag.slice(1, -1);
    }
    return tag;
  }).filter(t => t.length > 0);

  return tags;
}

function updateTags(content, newTags) {
  const tagsStr = newTags.map(t => `"${t}"`).join(', ');
  return content.replace(
    /^tags:\s*\[.*?\]/m,
    `tags: [${tagsStr}]`
  );
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');

  console.log('');
  console.log('🏷️  Signal Dispatch Tag Migration');
  console.log('   Migrating to canonical tag system');
  console.log('');
  console.log(`   Mode: ${dryRun ? 'DRY RUN (no changes)' : 'LIVE (will modify files)'}`);
  console.log('');
  console.log('='.repeat(70));
  console.log('');

  const files = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.mdx'));

  const stats = {
    filesProcessed: 0,
    filesModified: 0,
    tagsRemapped: 0,
    tagsDropped: 0,
    unknownTags: new Set(),
  };

  const changes = [];

  for (const filename of files) {
    const filepath = path.join(BLOG_DIR, filename);
    const content = fs.readFileSync(filepath, 'utf-8');
    const oldTags = extractTags(content);

    if (!oldTags || oldTags.length === 0) continue;
    stats.filesProcessed++;

    const newTags = [];
    const fileChanges = { file: filename, from: [], to: [], dropped: [], unknown: [] };

    for (const oldTag of oldTags) {
      const result = migrateTag(oldTag);

      if (result === null) {
        // Dropped
        fileChanges.dropped.push(oldTag);
        stats.tagsDropped++;
      } else if (typeof result === 'object' && result.unknown) {
        // Unknown tag
        fileChanges.unknown.push(result.unknown);
        stats.unknownTags.add(result.unknown);
        // Keep it for manual review
        newTags.push(oldTag);
      } else {
        // Valid migration
        if (result !== oldTag.toLowerCase().trim()) {
          fileChanges.from.push(oldTag);
          fileChanges.to.push(result);
          stats.tagsRemapped++;
        }
        // Deduplicate
        if (!newTags.includes(result)) {
          newTags.push(result);
        }
      }
    }

    // Check if anything changed
    const changed = fileChanges.from.length > 0 ||
                    fileChanges.dropped.length > 0 ||
                    newTags.length !== oldTags.length;

    if (changed) {
      stats.filesModified++;
      changes.push({ ...fileChanges, newTags });

      if (!dryRun) {
        const newContent = updateTags(content, newTags);
        fs.writeFileSync(filepath, newContent);
      }
    }
  }

  // Report
  console.log('📊 Migration Summary');
  console.log('');
  console.log(`   Files processed:  ${stats.filesProcessed}`);
  console.log(`   Files modified:   ${stats.filesModified}`);
  console.log(`   Tags remapped:    ${stats.tagsRemapped}`);
  console.log(`   Tags dropped:     ${stats.tagsDropped}`);
  console.log(`   Unknown tags:     ${stats.unknownTags.size}`);
  console.log('');

  if (changes.length > 0) {
    console.log('='.repeat(70));
    console.log('');
    console.log('📝 Changes by File:');
    console.log('');

    for (const change of changes) {
      console.log(`   ${change.file}`);
      if (change.from.length > 0) {
        for (let i = 0; i < change.from.length; i++) {
          console.log(`      "${change.from[i]}" → "${change.to[i]}"`);
        }
      }
      if (change.dropped.length > 0) {
        console.log(`      Dropped: ${change.dropped.join(', ')}`);
      }
      if (change.unknown.length > 0) {
        console.log(`      ⚠️  Unknown: ${change.unknown.join(', ')}`);
      }
      console.log('');
    }
  }

  if (stats.unknownTags.size > 0) {
    console.log('='.repeat(70));
    console.log('');
    console.log('⚠️  Unknown Tags (need manual review):');
    console.log('');
    for (const tag of stats.unknownTags) {
      console.log(`   - "${tag}"`);
    }
    console.log('');
  }

  if (dryRun) {
    console.log('='.repeat(70));
    console.log('');
    console.log('ℹ️  This was a dry run. No files were modified.');
    console.log('   Run without --dry-run to apply changes.');
    console.log('');
  } else {
    console.log('='.repeat(70));
    console.log('');
    console.log('✅ Migration complete!');
    console.log('');
  }
}

main().catch(console.error);
