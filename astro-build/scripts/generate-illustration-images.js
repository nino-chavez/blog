#!/usr/bin/env node
/**
 * Generate custom blog feature images for ALL posts using Gemini 2.0 Flash
 * NEW STYLE: Hand-drawn illustration aesthetic with distinctive visual identity
 *
 * Style Philosophy:
 * - Line-drawn illustrations with personality
 * - Warm, inviting but professional
 * - Each image tells a micro-story
 * - Distinctive and recognizable brand aesthetic
 *
 * Output: Optimized WebP images at 1200x675 (16:9), targeting 30-80KB
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
if (!GOOGLE_API_KEY) {
  console.error('Error: GOOGLE_API_KEY environment variable required');
  process.exit(1);
}

const BLOG_DIR = '/Users/nino/Workspace/dev/sites/signal-dispatch-blog/astro-build/src/content/blog';
const OUTPUT_DIR = '/Users/nino/Workspace/dev/sites/signal-dispatch-blog/astro-build/public/images/generated';
const PROGRESS_FILE = './illustration-generation-progress.json';

// Target dimensions for blog feature images (16:9 aspect ratio)
const TARGET_WIDTH = 1200;
const TARGET_HEIGHT = 675;
const WEBP_QUALITY = 85;

const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);

// NEW VISUAL STYLE SYSTEM: Illustration-based with category variations
const ILLUSTRATION_STYLES = {
  'AI & Automation': {
    background: 'Deep navy to midnight gradient (#0a1628 to #162447)',
    lineColor: 'Electric cyan lines (#00d9ff) with soft white accents',
    style: 'Technical blueprint meets organic flow - circuit-like patterns that feel alive',
    elements: 'robots with personality, flowing connection lines, geometric brain patterns, glowing nodes',
    personality: 'Curious and forward-looking, like a friendly guide into the future'
  },
  'Reflections': {
    background: 'Warm charcoal to soft brown gradient (#2d2d2d to #3d3428)',
    lineColor: 'Golden amber lines (#e8b86d) with cream highlights',
    style: 'Thoughtful sketches like journal marginalia - loose, contemplative, human',
    elements: 'open books, coffee cups, window views, single figures in thought, candles',
    personality: 'Introspective and warm, like a quiet conversation with a wise friend'
  },
  'Leadership': {
    background: 'Rich charcoal (#1a1a2e) with subtle purple undertones',
    lineColor: 'Warm gold (#c9a227) with silver accent lines',
    style: 'Confident architectural linework - strong but not rigid, like good mentorship',
    elements: 'lighthouses, mountain paths, bridges being built, hands reaching, compasses',
    personality: 'Authoritative but approachable, experienced but still learning'
  },
  'Commerce': {
    background: 'Dark slate with teal undertones (#0d1f22 to #1a3a3a)',
    lineColor: 'Bright teal (#2dd4bf) with orange accents (#f97316)',
    style: 'Clean isometric illustrations - systems and flows made visual',
    elements: 'shopping carts with wings, connected storefronts, flow charts that dance, coins in motion',
    personality: 'Strategic and energetic, seeing opportunity in complexity'
  },
  'Meta': {
    background: 'Deep purple-black gradient (#1a0a2e to #2d1b4e)',
    lineColor: 'Soft violet (#a78bfa) with pink highlights (#f472b6)',
    style: 'Escher-like impossible geometries - playful recursion',
    elements: 'hands drawing themselves, nested frames, mirrors reflecting mirrors, infinite staircases',
    personality: 'Intellectually playful, delighting in self-reference'
  },
  'Systems Thinking': {
    background: 'Dark blue-grey (#1e293b to #334155)',
    lineColor: 'Sky blue (#38bdf8) with green data accents (#4ade80)',
    style: 'Elegant diagrams that feel organic - where structure meets nature',
    elements: 'interconnected nodes, tree-like networks, gears as ecosystems, flowing data rivers',
    personality: 'Pattern-seeking and holistic, finding beauty in complexity'
  },
  'Consulting Practice': {
    background: 'Professional charcoal (#262626) with warm undertones',
    lineColor: 'Warm white (#f5f5f4) with copper accents (#f59e0b)',
    style: 'Whiteboard sketches come to life - energetic and collaborative',
    elements: 'sticky notes taking flight, collaborative diagrams, puzzle pieces connecting, lightbulbs',
    personality: 'Energetic problem-solver, collaborative spirit'
  },
  'Field Notes': {
    background: 'Kraft paper texture effect (#2a2520 to #3d3630)',
    lineColor: 'Pencil graphite grey (#94a3b8) with red annotation marks (#ef4444)',
    style: 'Field journal sketches - observational, annotated, authentic',
    elements: 'notebooks, binoculars, specimen drawings, maps with routes, timestamps',
    personality: 'Curious observer, documenting discoveries in real-time'
  },
  'Photography': {
    background: 'Deep black with subtle blue (#0a0a0a to #0f172a)',
    lineColor: 'Bright white (#ffffff) with film-strip amber (#fbbf24)',
    style: 'Camera viewfinder aesthetic - frames within frames',
    elements: 'lens apertures, film strips, light rays, composition grids, shutter clicks',
    personality: 'Visual storyteller, seeing the extraordinary in ordinary moments'
  },
  'default': {
    background: 'Rich charcoal gradient (#1f1f1f to #2d2d2d)',
    lineColor: 'Warm white (#e5e5e5) with teal accents (#14b8a6)',
    style: 'Clean editorial illustration - professional but with character',
    elements: 'abstract symbols relevant to the topic, elegant linework, thoughtful composition',
    personality: 'Thoughtful professional sharing hard-won insights'
  }
};

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

// Get category style or default
function getCategoryStyle(category) {
  if (!category) return ILLUSTRATION_STYLES.default;

  for (const [key, style] of Object.entries(ILLUSTRATION_STYLES)) {
    if (category.toLowerCase().includes(key.toLowerCase()) ||
        key.toLowerCase().includes(category.toLowerCase())) {
      return style;
    }
  }
  return ILLUSTRATION_STYLES.default;
}

// Generate unique visual concept from title
function extractVisualConcept(title) {
  // Map common themes to visual metaphors
  const conceptMap = {
    // AI & Tech concepts
    'ai': 'friendly robot assistant',
    'agent': 'autonomous helper character',
    'automation': 'self-moving gears and cogs',
    'machine': 'elegant mechanical creature',
    'algorithm': 'flowing decision tree',
    'neural': 'interconnected constellation',
    'model': 'architectural blueprint',
    'prompt': 'conversation bubbles',
    'llm': 'vast library with glowing books',
    'chatgpt': 'friendly dialogue illustration',
    'claude': 'thoughtful assistant character',

    // Strategy concepts
    'strategy': 'chess pieces in motion',
    'plan': 'roadmap with milestones',
    'framework': 'scaffolding being built',
    'architecture': 'elegant building cross-section',
    'design': 'drafting tools and sketches',
    'system': 'interconnected modules',

    // Human concepts
    'team': 'figures working together',
    'leadership': 'guide with lantern',
    'mentor': 'wise figure sharing knowledge',
    'growth': 'seedling becoming tree',
    'learning': 'books sprouting ideas',
    'career': 'winding path upward',
    'burnout': 'flame dimming but not out',
    'balance': 'tightrope walker',

    // Work concepts
    'consulting': 'whiteboard full of ideas',
    'meeting': 'heads coming together',
    'deadline': 'clock with wings',
    'project': 'construction crane building',
    'code': 'elegant flowing script',
    'build': 'hands assembling blocks',
    'ship': 'rocket preparing for launch',
    'deploy': 'paper airplane taking flight',

    // Commerce concepts
    'commerce': 'shop window with magic',
    'storefront': 'welcoming doorway with light',
    'customer': 'two figures exchanging',
    'market': 'bustling bazaar from above',
    'product': 'gift box being opened',
    'checkout': 'smooth flowing transaction',

    // Meta concepts
    'writing': 'pen leaving trail of stars',
    'blog': 'typewriter with wings',
    'voice': 'sound waves becoming shapes',
    'story': 'open book with world inside',
    'reflection': 'figure looking in mirror',
    'philosophy': 'thinker surrounded by symbols'
  };

  const titleLower = title.toLowerCase();
  for (const [keyword, concept] of Object.entries(conceptMap)) {
    if (titleLower.includes(keyword)) {
      return concept;
    }
  }

  return 'abstract symbols representing the core idea';
}

// Generate image prompt using new illustration style
function createImagePrompt(title, excerpt, category) {
  const style = getCategoryStyle(category);
  const visualConcept = extractVisualConcept(title);

  return `Create a sophisticated hand-drawn illustration for a professional blog header.

BLOG POST CONTEXT:
Title: "${title}"
${excerpt ? `Summary: "${excerpt.substring(0, 200)}"` : ''}
Visual Concept to Explore: ${visualConcept}

ILLUSTRATION STYLE (MUST FOLLOW PRECISELY):
Background: ${style.background}
Line Art Color: ${style.lineColor}
Drawing Style: ${style.style}
Visual Elements to Consider: ${style.elements}
Overall Personality: ${style.personality}

CRITICAL STYLE REQUIREMENTS:
1. HAND-DRAWN ILLUSTRATION AESTHETIC - looks like skillful pen/pencil work, NOT photorealistic
2. LINE ART FOCUS - bold confident strokes, varying line weights, organic feeling
3. LIMITED COLOR PALETTE - background gradient + 2-3 accent colors maximum
4. NEGATIVE SPACE IS KEY - minimum 35% breathing room, composition not cluttered
5. SINGLE STRONG FOCAL POINT - one main visual element that tells the story
6. SLIGHTLY WHIMSICAL - professional but with personality and charm
7. HORIZONTAL COMPOSITION - optimized for 16:9 landscape blog header format

WHAT TO INCLUDE:
- One central illustrated element that captures the post's essence
- Supporting linework that creates depth without clutter
- Subtle gradient background (not flat color)
- Organic imperfections that make it feel hand-crafted

WHAT TO ABSOLUTELY AVOID:
- NO text, letters, words, or typography of any kind
- NO realistic photographs or photographic elements
- NO faces with identifiable features (abstract figures OK)
- NO generic stock imagery (handshakes, laptops, lightbulbs unless stylized)
- NO busy or cluttered compositions
- NO harsh digital gradients - keep it organic

OUTPUT SPECIFICATIONS:
- Dimensions: 1200x675 pixels (16:9 aspect ratio)
- Style: Editorial illustration suitable for professional tech/business blog
- Feel: Like something you'd see in a thoughtful independent publication

Create an illustration that makes someone want to click and read the article.`;
}

// Process and optimize image to WebP
async function optimizeImage(inputBuffer, outputPath) {
  try {
    const result = await sharp(inputBuffer)
      .resize(TARGET_WIDTH, TARGET_HEIGHT, {
        fit: 'cover',
        position: 'center'
      })
      .webp({
        quality: WEBP_QUALITY,
        effort: 6,
      })
      .toFile(outputPath);

    return result;
  } catch (e) {
    throw new Error(`Image optimization failed: ${e.message}`);
  }
}

// Generate image using Gemini and convert to optimized WebP
async function generateImage(prompt, filename) {
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        responseModalities: ['image', 'text'],
      }
    });

    const result = await model.generateContent(prompt);
    const response = result.response;

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        const imageData = part.inlineData.data;
        const imageBuffer = Buffer.from(imageData, 'base64');

        const outputPath = path.join(OUTPUT_DIR, `${filename}.webp`);
        const optimizeResult = await optimizeImage(imageBuffer, outputPath);

        const fileSizeKB = Math.round(optimizeResult.size / 1024);

        return {
          path: `/images/generated/${filename}.webp`,
          fullPath: outputPath,
          size: fileSizeKB
        };
      }
    }

    return null;
  } catch (e) {
    throw e;
  }
}

// Update MDX file with new image
function updateMdxFile(filepath, newImagePath) {
  let content = fs.readFileSync(filepath, 'utf-8');

  // Check if featureImage already exists
  if (content.match(/featureImage:\s/)) {
    content = content.replace(
      /featureImage:\s*["'][^"']*["']/,
      `featureImage: "${newImagePath}"`
    );
  } else {
    // Add featureImage after excerpt or after category
    if (content.match(/excerpt:\s*["'][^"']*["']/)) {
      content = content.replace(
        /(excerpt:\s*["'][^"']*["'])/,
        `$1\nfeatureImage: "${newImagePath}"`
      );
    } else if (content.match(/category:\s/)) {
      content = content.replace(
        /(category:\s*["'][^"']*["'])/,
        `$1\nfeatureImage: "${newImagePath}"`
      );
    }
  }

  fs.writeFileSync(filepath, content);
}

// Load/save progress
function loadProgress() {
  if (fs.existsSync(PROGRESS_FILE)) {
    return JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf-8'));
  }
  return { completed: [], failed: [], skipped: [] };
}

function saveProgress(progress) {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
}

// Main function
async function main() {
  const args = process.argv.slice(2);
  const forceRegenerate = args.includes('--force');
  const specificFile = args.find(a => a.endsWith('.mdx'));

  // Create output directory
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const progress = forceRegenerate ? { completed: [], failed: [], skipped: [] } : loadProgress();
  let files = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.mdx'));

  // If specific file requested
  if (specificFile) {
    files = files.filter(f => f === specificFile || f.includes(specificFile));
  }

  // Filter out already completed
  const remaining = files.filter(f =>
    !progress.completed.includes(f) &&
    !progress.skipped.includes(f)
  );

  console.log('');
  console.log('🎨 Signal Dispatch Illustration Generator v3.0');
  console.log('   NEW: Hand-drawn illustration style');
  console.log('   Gemini 2.0 Flash + Sharp WebP Optimization\n');
  console.log(`📐 Output: ${TARGET_WIDTH}x${TARGET_HEIGHT} WebP @ quality ${WEBP_QUALITY}`);
  console.log(`📊 Status:`);
  console.log(`   Total posts: ${files.length}`);
  console.log(`   Completed: ${progress.completed.length}`);
  console.log(`   Failed: ${progress.failed.length}`);
  console.log(`   Remaining: ${remaining.length}`);
  if (forceRegenerate) console.log('   ⚠️  Force regenerate mode - all images will be regenerated');
  console.log('');
  console.log('='.repeat(60) + '\n');

  let count = 0;
  let totalSize = 0;
  let generatedCount = 0;

  for (const filename of remaining) {
    count++;
    const filepath = path.join(BLOG_DIR, filename);
    const content = fs.readFileSync(filepath, 'utf-8');
    const frontmatter = extractFrontmatter(content);

    if (!frontmatter || !frontmatter.title) {
      console.log(`[${count}/${remaining.length}] ⚠️  Skipping: ${filename} (no frontmatter)`);
      progress.skipped.push(filename);
      saveProgress(progress);
      continue;
    }

    const shortTitle = frontmatter.title.length > 45
      ? frontmatter.title.substring(0, 42) + '...'
      : frontmatter.title;

    console.log(`[${count}/${remaining.length}] 🖼️  ${shortTitle}`);
    console.log(`              Category: ${frontmatter.category || 'default'}`);

    try {
      const prompt = createImagePrompt(
        frontmatter.title,
        frontmatter.excerpt || frontmatter.metaDescription || '',
        frontmatter.category
      );

      const slug = filename.replace('.mdx', '');
      const result = await generateImage(prompt, slug);

      if (result) {
        updateMdxFile(filepath, result.path);
        totalSize += result.size;
        generatedCount++;
        console.log(`              ✅ Generated: ${result.size}KB`);
        progress.completed.push(filename);
        progress.failed = progress.failed.filter(f => f !== filename);
      } else {
        console.log(`              ❌ No image returned`);
        if (!progress.failed.includes(filename)) {
          progress.failed.push(filename);
        }
      }
    } catch (e) {
      const errorMsg = e.message || String(e);
      console.log(`              ❌ Error: ${errorMsg.substring(0, 50)}`);
      if (!progress.failed.includes(filename)) {
        progress.failed.push(filename);
      }
    }

    saveProgress(progress);

    // Rate limit - 5 seconds between requests to avoid API limits
    await new Promise(r => setTimeout(r, 5000));
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 Final Summary:');
  console.log(`   ✅ Completed: ${progress.completed.length}`);
  console.log(`   ❌ Failed: ${progress.failed.length}`);
  console.log(`   ⏭️  Skipped: ${progress.skipped.length}`);
  if (generatedCount > 0) {
    console.log(`   📦 Total size this run: ${Math.round(totalSize / 1024)}MB`);
    console.log(`   📏 Avg size per image: ${Math.round(totalSize / generatedCount)}KB`);
  }

  if (progress.failed.length > 0) {
    console.log('\n❌ Failed files (can retry):');
    progress.failed.slice(0, 10).forEach(f => console.log(`   - ${f}`));
    if (progress.failed.length > 10) {
      console.log(`   ... and ${progress.failed.length - 10} more`);
    }
  }

  console.log('\n✨ Done!');
}

main().catch(console.error);
