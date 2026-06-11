#!/usr/bin/env node
/**
 * Generate custom blog feature images using OpenRouter (GPT-5 Image)
 * Hand-drawn illustration aesthetic with distinctive visual identity
 *
 * Style Philosophy:
 * - Line-drawn illustrations with personality
 * - Warm, inviting but professional
 * - Each image tells a micro-story
 * - Distinctive and recognizable brand aesthetic
 *
 * Pipeline: concept (gemini-2.5-flash) → render (gpt-5-image, retried)
 *           → sharp 1200x675 WebP → QA gate (mechanical + vision judge)
 *           → frontmatter update
 *
 * State: a post is "done" when public/images/generated/<slug>.webp exists.
 * No side-state file. Explicitly named files always regenerate; --force
 * regenerates everything.
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

if (!['blog', 'whitepapers', 'presentations', 'tutorials', 'counterpoints'].includes(CONTENT_TYPE)) {
  console.error('Error: --dir must be "blog", "whitepapers", "presentations", "tutorials", or "counterpoints"');
  process.exit(1);
}

const BASE_DIR = process.cwd(); // Works both locally and in GitHub Actions
const CONTENT_DIR = `${BASE_DIR}/src/content/${CONTENT_TYPE}`;
const OUTPUT_DIR = `${BASE_DIR}/public/images/generated`;

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
  'Counterpoints': {
    background: 'Deep charcoal with cool teal undertones (#0d1a1a to #1a2f2f)',
    lineColor: 'Sharp teal lines (#0d9488) with cool white accents (#e2e8f0)',
    style: 'Analytical diagrams with tension - opposing forces, balanced structures under scrutiny',
    elements: 'scales tipping, magnifying glasses over text, chess counter-moves, two paths diverging, fractured mirrors',
    personality: 'Intellectually rigorous, adversarial but fair, the loyal opposition'
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

// Pull the base64 image payload out of an OpenRouter chat response, wherever it hides
function extractImageBase64(message) {
  // OpenRouter format: images[].image_url.url
  if (message?.images && Array.isArray(message.images) && message.images.length > 0) {
    const imageData = message.images[0];
    if (imageData?.image_url?.url) return imageData.image_url.url.replace(/^data:image\/\w+;base64,/, '');
    if (typeof imageData === 'string') return imageData.replace(/^data:image\/\w+;base64,/, '');
    if (imageData?.url) return imageData.url.replace(/^data:image\/\w+;base64,/, '');
    if (imageData?.b64_json) return imageData.b64_json;
    throw new Error(`Unknown image format: ${JSON.stringify(imageData).substring(0, 100)}`);
  }
  // Content-array format (image_url parts or Gemini-style inline_data)
  if (message?.content && Array.isArray(message.content)) {
    for (const part of message.content) {
      if (part.type === 'image_url' && part.image_url?.url) {
        return part.image_url.url.replace(/^data:image\/\w+;base64,/, '');
      }
      if (part.inline_data?.data) {
        return part.inline_data.data;
      }
    }
  }
  throw new Error(`No image found in response. Keys: ${Object.keys(message || {}).join(', ')}`);
}

// One render call. Throws on transport errors, empty responses, or missing image.
async function fetchImageBuffer(prompt) {
  const response = await openrouter.chat.completions.create({
    model: 'openai/gpt-5-image',
    modalities: ['text', 'image'],
    messages: [{ role: 'user', content: prompt }]
  });

  const base64Data = extractImageBase64(response.choices?.[0]?.message);
  const buffer = Buffer.from(base64Data, 'base64');
  if (buffer.length < 10 * 1024) {
    throw new Error(`Image payload suspiciously small (${buffer.length} bytes)`);
  }
  return buffer;
}

const MIN_OUTPUT_KB = 20;

// QA gate. Mechanical checks are free and run first; the vision judge
// (~$0.001/check) only confirms what a script can't. A judge that errors
// fails OPEN — flaky QA must not block generation.
async function qaImage(outputPath, visualConcept) {
  const stat = fs.statSync(outputPath);
  if (stat.size < MIN_OUTPUT_KB * 1024) {
    return { pass: false, reason: `output only ${Math.round(stat.size / 1024)}KB — likely blank or corrupt` };
  }
  const meta = await sharp(outputPath).metadata();
  if (meta.width !== TARGET_WIDTH || meta.height !== TARGET_HEIGHT) {
    return { pass: false, reason: `dimensions ${meta.width}x${meta.height}, expected ${TARGET_WIDTH}x${TARGET_HEIGHT}` };
  }

  try {
    const b64 = fs.readFileSync(outputPath).toString('base64');
    const response = await openrouter.chat.completions.create({
      model: 'google/gemini-2.5-flash',
      max_tokens: 150,
      temperature: 0,
      messages: [{
        role: 'user',
        content: [
          { type: 'image_url', image_url: { url: `data:image/webp;base64,${b64}` } },
          {
            type: 'text',
            text: `You are QA for blog header illustrations. The intended scene: "${visualConcept}".

Check the image against these rules:
1. No text, letters, words, or typography anywhere
2. Hand-drawn illustration style, not photorealistic
3. Not blank, garbled, or visually corrupted
4. Subject plausibly matches the intended scene
5. One clear focal point, not cluttered

Respond with ONLY JSON: {"pass": true} or {"pass": false, "reason": "<which rule failed and why, briefly>"}`
          }
        ]
      }]
    });

    const text = response.choices?.[0]?.message?.content?.trim() || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('judge returned no JSON');
    const verdict = JSON.parse(jsonMatch[0]);
    return { pass: verdict.pass !== false, reason: verdict.reason };
  } catch (e) {
    console.log(`              ⚠️  Vision QA unavailable (${e.message.substring(0, 60)}) — passing image through`);
    return { pass: true, reason: 'judge unavailable' };
  }
}

const MAX_ATTEMPTS = 3;

// Generate → optimize → QA, retrying on transient API failures and QA rejections
async function generateImage(prompt, filename, visualConcept) {
  const outputPath = path.join(OUTPUT_DIR, `${filename}.webp`);
  let lastError = null;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      if (attempt > 1) {
        const backoffMs = attempt * 4000;
        console.log(`              🔁 Attempt ${attempt}/${MAX_ATTEMPTS} (waiting ${backoffMs / 1000}s)...`);
        await new Promise(r => setTimeout(r, backoffMs));
      }

      const buffer = await fetchImageBuffer(prompt);
      const optimizeResult = await optimizeImage(buffer, outputPath);

      const qa = await qaImage(outputPath, visualConcept);
      if (!qa.pass) {
        lastError = new Error(`QA rejected: ${qa.reason}`);
        console.log(`              🚫 QA rejected (attempt ${attempt}): ${qa.reason}`);
        continue;
      }
      console.log(`              🔍 QA passed${qa.reason === 'judge unavailable' ? ' (mechanical checks only)' : ''}`);

      return {
        path: `/images/generated/${filename}.webp`,
        fullPath: outputPath,
        size: Math.round(optimizeResult.size / 1024)
      };
    } catch (e) {
      lastError = e;
      console.log(`              ⚠️  Attempt ${attempt} failed: ${(e.message || String(e)).substring(0, 80)}`);
    }
  }

  // A rejected/partial image left on disk would read as "done" to the
  // filesystem-derived state — remove it so the failure stays visible.
  if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
  throw lastError || new Error('Image generation failed after retries');
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

// Main function
async function main() {
  const args = process.argv.slice(2);
  const forceRegenerate = args.includes('--force');
  const specificFile = args.find(a => a.endsWith('.mdx'));

  // Create output directory
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  let files = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.mdx'));

  // If specific file requested
  if (specificFile) {
    files = files.filter(f => f === specificFile || f.includes(specificFile));
  }

  // State is the filesystem: a post is done when its generated webp exists.
  // Explicitly named files always regenerate; --force regenerates everything.
  const hasImage = (f) => fs.existsSync(path.join(OUTPUT_DIR, `${f.replace('.mdx', '')}.webp`));
  const remaining = files.filter(f => forceRegenerate || specificFile || !hasImage(f));

  console.log('');
  console.log('🎨 Signal Dispatch Illustration Generator v5.0');
  console.log('   OpenRouter + GPT-5 Image + QA gate');
  console.log('   Hand-drawn illustration style + Sharp WebP Optimization\n');
  console.log(`📂 Content type: ${CONTENT_TYPE}`);
  console.log(`📐 Output: ${TARGET_WIDTH}x${TARGET_HEIGHT} WebP @ quality ${WEBP_QUALITY}`);
  console.log(`📊 Status:`);
  console.log(`   Total ${CONTENT_TYPE}: ${files.length}`);
  console.log(`   Already have images: ${files.filter(hasImage).length}`);
  console.log(`   To generate: ${remaining.length}`);
  if (forceRegenerate) console.log('   ⚠️  Force regenerate mode - all images will be regenerated');
  console.log('');
  console.log('='.repeat(60) + '\n');

  const succeeded = [];
  const failed = [];
  const skipped = [];

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
      skipped.push(filename);
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
      const result = await generateImage(prompt, slug, visualConcept);

      const mdxUpdated = updateMdxFile(filepath, result.path);
      totalSize += result.size;
      generatedCount++;
      if (mdxUpdated) {
        console.log(`              ✅ Generated: ${result.size}KB (image + MDX updated)`);
        succeeded.push(filename);
      } else {
        console.log(`              ⚠️  Generated: ${result.size}KB (image only - MDX update failed)`);
        failed.push(filename);
      }
    } catch (e) {
      const errorMsg = e.message || String(e);
      console.log(`              ❌ Error: ${errorMsg.substring(0, 80)}`);
      failed.push(filename);
    }

    // Rate limit - 2 seconds between requests (OpenRouter is more generous)
    await new Promise(r => setTimeout(r, 2000));
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 Run Summary:');
  console.log(`   ✅ Generated: ${succeeded.length}`);
  console.log(`   ❌ Failed: ${failed.length}`);
  console.log(`   ⏭️  Skipped: ${skipped.length}`);
  if (generatedCount > 0) {
    console.log(`   📦 Total size this run: ${Math.round(totalSize / 1024)}MB`);
    console.log(`   📏 Avg size per image: ${Math.round(totalSize / generatedCount)}KB`);
  }

  if (failed.length > 0) {
    console.log('\n❌ Failed this run (re-run to retry — no image on disk means it stays in the queue):');
    failed.forEach(f => console.log(`   - ${f}`));
    process.exitCode = 1;
  }

  console.log('\n✨ Done!');
}

main().catch(console.error);
