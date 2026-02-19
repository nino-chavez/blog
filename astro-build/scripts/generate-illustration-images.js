#!/usr/bin/env node
/**
 * Generate custom blog feature images using OpenRouter (Flux/DALL-E)
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

import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
if (!OPENROUTER_API_KEY) {
  console.error('Error: OPENROUTER_API_KEY environment variable required');
  process.exit(1);
}

// Parse --dir flag (blog or whitepapers, defaults to blog)
const args = process.argv.slice(2);
const dirFlagIndex = args.findIndex(a => a === '--dir');
const CONTENT_TYPE = dirFlagIndex !== -1 && args[dirFlagIndex + 1]
  ? args[dirFlagIndex + 1]
  : 'blog';

if (!['blog', 'whitepapers', 'presentations'].includes(CONTENT_TYPE)) {
  console.error('Error: --dir must be "blog", "whitepapers", or "presentations"');
  process.exit(1);
}

const BASE_DIR = process.cwd(); // Works both locally and in GitHub Actions
const CONTENT_DIR = `${BASE_DIR}/src/content/${CONTENT_TYPE}`;
const OUTPUT_DIR = `${BASE_DIR}/public/images/generated`;
const PROGRESS_FILE = `./illustration-generation-progress-${CONTENT_TYPE}.json`;

// Target dimensions for blog feature images (16:9 aspect ratio)
const TARGET_WIDTH = 1200;
const TARGET_HEIGHT = 675;
const WEBP_QUALITY = 85;

// Initialize OpenRouter client (OpenAI-compatible)
const openrouter = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: OPENROUTER_API_KEY,
  defaultHeaders: {
    'HTTP-Referer': 'https://blog.ninochavez.co',
    'X-Title': 'Signal Dispatch Blog'
  }
});

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

// Extract clean post body text from MDX content
function extractPostBody(content) {
  // Strip frontmatter
  let body = content.replace(/^---\n[\s\S]*?\n---/, '');

  // Strip MDX import statements
  body = body.replace(/^import\s+.*$/gm, '');

  // Strip MDX component tags (self-closing and paired)
  body = body.replace(/<\/?[A-Z][A-Za-z]*[^>]*>/g, '');

  // Collapse multiple blank lines
  body = body.replace(/\n{3,}/g, '\n\n');

  return body.trim().substring(0, 3000);
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

// Use LLM to generate a content-aware visual concept from the full post
async function generateVisualConcept(title, excerpt, category, postBody) {
  try {
    const response = await openrouter.chat.completions.create({
      model: 'google/gemini-2.5-flash',
      messages: [
        {
          role: 'user',
          content: `You are a visual concept designer for a professional blog called Signal Dispatch. Read the following blog post and propose a single, specific visual scene that captures the post's core argument or tension.

TITLE: ${title}
CATEGORY: ${category || 'general'}
EXCERPT: ${excerpt || ''}

POST BODY:
${postBody}

INSTRUCTIONS:
- Identify the post's central argument, tension, or insight
- Propose ONE specific visual scene (not a generic metaphor) that illustrates it
- The scene should be concrete enough for an illustrator to draw
- 2-3 sentences maximum
- Avoid cliches: no robots, lightbulbs, handshakes, puzzle pieces, or generic tech imagery
- Think about what makes THIS post different from others on similar topics

Respond with ONLY the visual scene description, nothing else.`
        }
      ],
      max_tokens: 200,
      temperature: 0.7
    });

    const concept = response.choices?.[0]?.message?.content?.trim();
    if (concept && concept.length > 20) {
      return concept;
    }
    throw new Error('Response too short or empty');
  } catch (e) {
    console.log(`              ⚠️  Visual concept LLM failed (${e.message}), using keyword fallback`);
    return extractVisualConcept(title);
  }
}

// Generate image prompt using new illustration style
function createImagePrompt(title, excerpt, category, visualConcept) {
  const style = getCategoryStyle(category);

  return `Create a sophisticated hand-drawn illustration for a professional blog header.

BLOG POST CONTEXT:
Title: "${title}"
${excerpt ? `Summary: "${excerpt.substring(0, 200)}"` : ''}
SCENE TO ILLUSTRATE: ${visualConcept}

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

// Generate image using OpenRouter (GPT-5 Image) via chat completions
async function generateImage(prompt, filename) {
  try {
    // Use chat completions with image modality
    const response = await openrouter.chat.completions.create({
      model: 'openai/gpt-5-image',
      modalities: ['text', 'image'],
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    // Extract image from response
    const message = response.choices?.[0]?.message;

    // Check for images array (OpenRouter format: images[].image_url.url)
    if (message?.images && Array.isArray(message.images) && message.images.length > 0) {
      const imageData = message.images[0];
      let base64Data;

      // OpenRouter returns: { type: 'image_url', image_url: { url: 'data:image/png;base64,...' } }
      if (imageData?.image_url?.url) {
        base64Data = imageData.image_url.url.replace(/^data:image\/\w+;base64,/, '');
      } else if (typeof imageData === 'string') {
        base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
      } else if (imageData?.url) {
        base64Data = imageData.url.replace(/^data:image\/\w+;base64,/, '');
      } else if (imageData?.b64_json) {
        base64Data = imageData.b64_json;
      } else {
        throw new Error(`Unknown image format: ${JSON.stringify(imageData).substring(0, 100)}`);
      }

      const imageBuffer = Buffer.from(base64Data, 'base64');
      const outputPath = path.join(OUTPUT_DIR, `${filename}.webp`);
      const optimizeResult = await optimizeImage(imageBuffer, outputPath);
      const fileSizeKB = Math.round(optimizeResult.size / 1024);

      return {
        path: `/images/generated/${filename}.webp`,
        fullPath: outputPath,
        size: fileSizeKB
      };
    }

    // Check for content array with image parts
    if (message?.content && Array.isArray(message.content)) {
      for (const part of message.content) {
        if (part.type === 'image_url' && part.image_url?.url) {
          const base64Data = part.image_url.url.replace(/^data:image\/\w+;base64,/, '');
          const imageBuffer = Buffer.from(base64Data, 'base64');
          const outputPath = path.join(OUTPUT_DIR, `${filename}.webp`);
          const optimizeResult = await optimizeImage(imageBuffer, outputPath);
          const fileSizeKB = Math.round(optimizeResult.size / 1024);

          return {
            path: `/images/generated/${filename}.webp`,
            fullPath: outputPath,
            size: fileSizeKB
          };
        }
        // Also check for inline_data format (Gemini style)
        if (part.inline_data?.data) {
          const imageBuffer = Buffer.from(part.inline_data.data, 'base64');
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
    }

    // Debug: log the actual response structure
    throw new Error(`No image found in response. Keys: ${Object.keys(message || {}).join(', ')}. Images type: ${typeof message?.images}`);
  } catch (e) {
    throw e;
  }
}

// Update MDX file with new image
function updateMdxFile(filepath, newImagePath) {
  console.log(`              📝 Updating MDX file...`);
  console.log(`              📝 Filepath: ${filepath}`);
  console.log(`              📝 Image path: ${newImagePath}`);

  try {
    // Verify file exists
    if (!fs.existsSync(filepath)) {
      console.error(`              ❌ MDX file not found: ${filepath}`);
      return false;
    }

    let content = fs.readFileSync(filepath, 'utf-8');
    const originalContent = content;

    // Check if featureImage already exists - just update it
    if (content.match(/^featureImage:\s/m)) {
      console.log(`              📝 Updating existing featureImage`);
      content = content.replace(
        /^featureImage:\s*"[^"]*"/m,
        `featureImage: "${newImagePath}"`
      );
    } else {
      console.log(`              📝 Adding new featureImage field`);
      // Add featureImage on its own line after category line
      const lines = content.split('\n');
      let inserted = false;

      for (let i = 0; i < lines.length; i++) {
        if (lines[i].match(/^category:\s*["']/)) {
          console.log(`              📝 Found category at line ${i}: "${lines[i].substring(0, 40)}..."`);
          // Insert featureImage after this line
          lines.splice(i + 1, 0, `featureImage: "${newImagePath}"`);
          inserted = true;
          break;
        }
      }

      if (!inserted) {
        console.log(`              📝 Category not found, trying excerpt fallback`);
        // Fallback: insert after excerpt line
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].match(/^excerpt:\s*["']/)) {
            // Find the end of excerpt (might be multi-line)
            let j = i;
            while (j < lines.length && !lines[j].match(/"$/)) {
              j++;
            }
            lines.splice(j + 1, 0, `featureImage: "${newImagePath}"`);
            inserted = true;
            console.log(`              📝 Inserted after excerpt at line ${j}`);
            break;
          }
        }
      }

      if (!inserted) {
        console.error(`              ❌ Could not find category or excerpt to insert featureImage`);
        return false;
      }

      content = lines.join('\n');
    }

    // Verify content was actually modified
    if (content === originalContent) {
      console.error(`              ❌ Content was not modified!`);
      return false;
    }

    // Write the file
    fs.writeFileSync(filepath, content);

    // Verify the write by reading back
    const verifyContent = fs.readFileSync(filepath, 'utf-8');
    if (verifyContent.includes(`featureImage: "${newImagePath}"`)) {
      console.log(`              ✅ MDX updated and verified`);
      return true;
    } else {
      console.error(`              ❌ Write verification failed - featureImage not found in file`);
      return false;
    }
  } catch (err) {
    console.error(`              ❌ Error updating MDX: ${err.message}`);
    return false;
  }
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
  let files = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.mdx'));

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
  console.log('🎨 Signal Dispatch Illustration Generator v4.0');
  console.log('   OpenRouter + GPT-5 Image');
  console.log('   Hand-drawn illustration style + Sharp WebP Optimization\n');
  console.log(`📂 Content type: ${CONTENT_TYPE}`);
  console.log(`📐 Output: ${TARGET_WIDTH}x${TARGET_HEIGHT} WebP @ quality ${WEBP_QUALITY}`);
  console.log(`📊 Status:`);
  console.log(`   Total ${CONTENT_TYPE}: ${files.length}`);
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
    const filepath = path.join(CONTENT_DIR, filename);
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
      const postBody = extractPostBody(content);
      const visualConcept = await generateVisualConcept(
        frontmatter.title,
        frontmatter.excerpt || frontmatter.metaDescription || '',
        frontmatter.category,
        postBody
      );
      console.log(`              🧠 Visual concept: ${visualConcept.substring(0, 80)}...`);

      const prompt = createImagePrompt(
        frontmatter.title,
        frontmatter.excerpt || frontmatter.metaDescription || '',
        frontmatter.category,
        visualConcept
      );

      const slug = filename.replace('.mdx', '');
      const result = await generateImage(prompt, slug);

      if (result) {
        const mdxUpdated = updateMdxFile(filepath, result.path);
        totalSize += result.size;
        generatedCount++;
        if (mdxUpdated) {
          console.log(`              ✅ Generated: ${result.size}KB (image + MDX updated)`);
          progress.completed.push(filename);
          progress.failed = progress.failed.filter(f => f !== filename);
        } else {
          console.log(`              ⚠️  Generated: ${result.size}KB (image only - MDX update failed)`);
          // Still mark as needing attention
          if (!progress.failed.includes(filename)) {
            progress.failed.push(filename);
          }
        }
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

    // Rate limit - 2 seconds between requests (OpenRouter is more generous)
    await new Promise(r => setTimeout(r, 2000));
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
