/**
 * Signal Dispatch Visual Language - AI Image Generation Prompts
 *
 * These prompts define the visual aesthetic for AI-generated images.
 * All images should reinforce the "signal in the noise" brand identity.
 *
 * Color Palette:
 * - Primary gradient: Violet (#8b5cf6) → Orange (#f97316)
 * - Background: Dark slate/charcoal
 * - Accent: Electric orange for "signal" moments
 */

export const STYLE_SUFFIX = `
  Dark background with deep charcoal tones.
  Violet (#8b5cf6) and orange (#f97316) color accents.
  Clean editorial aesthetic, sophisticated minimal style.
  No text, no watermarks, no people.
  High contrast, professional quality.
  16:9 aspect ratio composition.
`;

export const PROMPT_TEMPLATES = {
  // Core category prompts
  aiAutomation: `Abstract digital illustration showing neural network patterns emerging from static noise.
    Data streams organizing into coherent pathways.
    Geometric nodes connected by glowing lines.
    ${STYLE_SUFFIX}`,

  systemsThinking: `Abstract illustration of interconnected nodes forming a coherent structure from chaos.
    Constellation aesthetic with organic network patterns.
    Multiple elements converging into unified system.
    ${STYLE_SUFFIX}`,

  leadership: `Abstract illustration of scattered geometric elements converging into unified direction.
    Signal emerging from noise visualization.
    Arrows or vectors aligning from chaos to order.
    ${STYLE_SUFFIX}`,

  consulting: `Abstract business illustration showing clarity emerging from complexity.
    Clean geometric lines cutting through visual noise.
    Organized structure rising from tangled patterns.
    ${STYLE_SUFFIX}`,

  photography: `Abstract lens flare and light refraction visualization.
    Focus emerging from blur, depth of field concept.
    Light rays converging through aperture shapes.
    ${STYLE_SUFFIX}`,

  meta: `Abstract illustration of recursive patterns and self-referential geometry.
    Mirrors and reflections creating infinite depth.
    Contemplative, introspective visual metaphor.
    ${STYLE_SUFFIX}`,

  fieldNotes: `Abstract illustration of scattered data points organizing into readable patterns.
    Raw observations becoming structured insights.
    Field guide aesthetic with organic data visualization.
    ${STYLE_SUFFIX}`,

  reflections: `Abstract illustration of still water surface with geometric ripples.
    Contemplative mood with mirror-like reflections.
    Calm clarity emerging from disturbance.
    ${STYLE_SUFFIX}`,

  // Thematic prompts for specific post types
  velocity: `Abstract speed visualization with motion blur and light trails.
    Dynamic movement from chaos to directed flow.
    Energy and momentum visual metaphor.
    ${STYLE_SUFFIX}`,

  architecture: `Abstract technical blueprint with layered systems visualization.
    Structural integrity emerging from component chaos.
    Engineering precision with organic flow.
    ${STYLE_SUFFIX}`,

  strategy: `Abstract chess-like strategic visualization.
    Multiple paths converging to optimal route.
    Decision tree aesthetic with highlighted solution.
    ${STYLE_SUFFIX}`,

  learning: `Abstract knowledge absorption visualization.
    Information flowing into organized structures.
    Growth and expansion from central point.
    ${STYLE_SUFFIX}`,

  // Whitepaper-specific prompts
  whitepaperHero: `Premium editorial illustration for research publication.
    Abstract data visualization with sophisticated composition.
    Professional, authoritative aesthetic.
    ${STYLE_SUFFIX}`,

  whitepaperDiagram: `Clean technical diagram aesthetic.
    Flowchart-inspired abstract visualization.
    Clear visual hierarchy with connected elements.
    ${STYLE_SUFFIX}`,
};

// Category to prompt mapping
export const CATEGORY_PROMPT_MAP: Record<string, keyof typeof PROMPT_TEMPLATES> = {
  'AI & Automation': 'aiAutomation',
  'Systems Thinking': 'systemsThinking',
  Leadership: 'leadership',
  'Consulting Practice': 'consulting',
  Photography: 'photography',
  Meta: 'meta',
  'Field Notes': 'fieldNotes',
  Reflections: 'reflections',
  Examples: 'architecture',
};

// Get prompt for a category, with fallback
export function getPromptForCategory(category: string): string {
  const promptKey = CATEGORY_PROMPT_MAP[category];
  if (promptKey && PROMPT_TEMPLATES[promptKey]) {
    return PROMPT_TEMPLATES[promptKey];
  }
  // Default to systems thinking as most versatile
  return PROMPT_TEMPLATES.systemsThinking;
}

// Generate variation prompt
export function getVariationPrompt(basePrompt: string, variationIndex: number): string {
  const variations = [
    'Emphasize geometric patterns.',
    'Focus on organic flowing forms.',
    'Highlight the transition from chaos to order.',
    'Emphasize network connectivity.',
    'Focus on light and shadow contrast.',
  ];
  return `${basePrompt} ${variations[variationIndex % variations.length]}`;
}
