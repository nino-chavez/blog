#!/usr/bin/env npx tsx
/**
 * Generate AI images for Signal Dispatch categories
 *
 * Uses Google Imagen 3 to generate category-specific hero images.
 * Images are saved to /public/generated/categories/
 *
 * Usage:
 *   npx tsx scripts/generate-category-images.ts
 *   npx tsx scripts/generate-category-images.ts --category="AI & Automation"
 *   npx tsx scripts/generate-category-images.ts --dry-run
 *
 * Requires:
 *   GOOGLE_API_KEY in .env.local
 */

import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import {
  PROMPT_TEMPLATES,
  CATEGORY_PROMPT_MAP,
  getVariationPrompt,
} from '../src/lib/ai/prompts/signal-dispatch';

// Configuration
const OUTPUT_DIR = path.join(process.cwd(), 'public/generated/categories');
const VARIANTS_PER_CATEGORY = 3;
const RATE_LIMIT_MS = 2000; // 2 seconds between requests

// Category configuration with slug mapping
const CATEGORIES = [
  { name: 'AI & Automation', slug: 'ai-automation', variants: 5 },
  { name: 'Systems Thinking', slug: 'systems-thinking', variants: 3 },
  { name: 'Leadership', slug: 'leadership', variants: 3 },
  { name: 'Consulting Practice', slug: 'consulting', variants: 3 },
  { name: 'Photography', slug: 'photography', variants: 2 },
  { name: 'Meta', slug: 'meta', variants: 3 },
  { name: 'Field Notes', slug: 'field-notes', variants: 3 },
  { name: 'Reflections', slug: 'reflections', variants: 3 },
];

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const config = {
    dryRun: false,
    category: null as string | null,
  };

  for (const arg of args) {
    if (arg === '--dry-run') {
      config.dryRun = true;
    } else if (arg.startsWith('--category=')) {
      config.category = arg.split('=')[1].replace(/"/g, '');
    }
  }

  return config;
}

// Simulate image generation for dry run
async function simulateGeneration(prompt: string): Promise<Buffer> {
  console.log(`  [DRY RUN] Would generate with prompt:\n    "${prompt.slice(0, 100)}..."`);
  // Return a placeholder 1x1 pixel PNG
  return Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'base64'
  );
}

// Generate image using Gemini 2.5 Flash Image (Nano Banana)
async function generateImage(prompt: string, dryRun: boolean): Promise<Buffer> {
  if (dryRun) {
    return simulateGeneration(prompt);
  }

  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error('GOOGLE_API_KEY not found in environment. Add it to .env.local');
  }

  // Use Gemini 2.5 Flash Image model with generateContent API
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `Generate a high-quality 16:9 aspect ratio image based on this description:\n\n${prompt}`,
              },
            ],
          },
        ],
        generationConfig: {
          responseModalities: ['IMAGE', 'TEXT'],
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${error}`);
  }

  const data = await response.json();

  // Response format: { candidates: [{ content: { parts: [{ inlineData: { data: "base64...", mimeType: "..." } }] } }] }
  const candidates = data.candidates;
  if (!candidates || !candidates[0]?.content?.parts) {
    console.log('API Response:', JSON.stringify(data, null, 2));
    throw new Error('No content returned from API');
  }

  // Find the image part in the response
  const imagePart = candidates[0].content.parts.find(
    (part: { inlineData?: { data: string; mimeType: string } }) => part.inlineData?.mimeType?.startsWith('image/')
  );

  if (!imagePart?.inlineData?.data) {
    console.log('API Response parts:', JSON.stringify(candidates[0].content.parts, null, 2));
    throw new Error('No image data in API response');
  }

  return Buffer.from(imagePart.inlineData.data, 'base64');
}

// Slugify category name for filename
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// Main generation function
async function generateCategoryImages() {
  const config = parseArgs();

  console.log('\n🎨 Signal Dispatch Category Image Generator\n');
  console.log(`Mode: ${config.dryRun ? 'DRY RUN (no images will be generated)' : 'LIVE'}`);

  // Filter categories if specific one requested
  let categoriesToProcess = CATEGORIES;
  if (config.category) {
    categoriesToProcess = CATEGORIES.filter(
      (c) => c.name.toLowerCase() === config.category!.toLowerCase()
    );
    if (categoriesToProcess.length === 0) {
      console.error(`Category "${config.category}" not found.`);
      console.log('Available categories:', CATEGORIES.map((c) => c.name).join(', '));
      process.exit(1);
    }
  }

  // Create output directory
  if (!existsSync(OUTPUT_DIR)) {
    await mkdir(OUTPUT_DIR, { recursive: true });
    console.log(`Created output directory: ${OUTPUT_DIR}\n`);
  }

  // Track stats
  let generated = 0;
  let failed = 0;
  const startTime = Date.now();

  // Generate images for each category
  for (const category of categoriesToProcess) {
    console.log(`\n📁 ${category.name} (${category.variants} variants)`);
    console.log('─'.repeat(50));

    const promptKey = CATEGORY_PROMPT_MAP[category.name];
    const basePrompt = promptKey
      ? PROMPT_TEMPLATES[promptKey]
      : PROMPT_TEMPLATES.systemsThinking;

    for (let i = 0; i < category.variants; i++) {
      const variantNum = i + 1;
      const prompt = getVariationPrompt(basePrompt, i);
      const filename = `${category.slug}-${variantNum}.webp`;
      const outputPath = path.join(OUTPUT_DIR, filename);

      console.log(`\n  Variant ${variantNum}/${category.variants}: ${filename}`);

      try {
        const imageBuffer = await generateImage(prompt, config.dryRun);

        if (!config.dryRun) {
          await writeFile(outputPath, imageBuffer);
          console.log(`  ✅ Saved to ${outputPath}`);
        } else {
          console.log(`  ✅ [DRY RUN] Would save to ${outputPath}`);
        }

        generated++;

        // Rate limiting between API calls
        if (!config.dryRun && i < category.variants - 1) {
          console.log(`  ⏳ Rate limiting (${RATE_LIMIT_MS}ms)...`);
          await new Promise((resolve) => setTimeout(resolve, RATE_LIMIT_MS));
        }
      } catch (error) {
        console.error(`  ❌ Failed: ${error instanceof Error ? error.message : error}`);
        failed++;
      }
    }
  }

  // Summary
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log('\n' + '═'.repeat(50));
  console.log('📊 Generation Complete\n');
  console.log(`  ✅ Generated: ${generated}`);
  console.log(`  ❌ Failed: ${failed}`);
  console.log(`  ⏱️  Time: ${elapsed}s`);

  if (!config.dryRun && generated > 0) {
    const estimatedCost = (generated * 0.03).toFixed(2);
    console.log(`  💰 Estimated cost: ~$${estimatedCost}`);
  }

  console.log('\n');
}

// Run
generateCategoryImages().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
