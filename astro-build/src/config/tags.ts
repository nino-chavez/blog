/**
 * Signal Dispatch - Canonical Tag System
 *
 * This file defines the ONLY allowed tags for blog posts.
 * All tags use kebab-case for consistency.
 *
 * IMPORTANT: Do not add new tags without updating this file.
 * Build validation will reject posts with unapproved tags.
 *
 * @see /CLAUDE.md for instructions on tag usage
 */

export const CANONICAL_TAGS = {
  // ═══════════════════════════════════════════════════════════════════════════
  // CORE DOMAINS - What the post is fundamentally about
  // ═══════════════════════════════════════════════════════════════════════════

  'ai-development': {
    label: 'AI Development',
    description: 'Building with AI tools, LLMs, AI-assisted coding, prompt engineering',
    replaces: ['AI Coding', 'AI', 'GenAI', 'llm', 'AI Workflows', 'ai-workflows', 'AI Coding']
  },

  'ai-governance': {
    label: 'AI Governance',
    description: 'Guardrails, policies, oversight, responsible AI, drift prevention',
    replaces: ['AI Governance', 'governance', 'ai-governance', 'AI Ops']
  },

  'agentic-systems': {
    label: 'Agentic Systems',
    description: 'Autonomous AI agents, multi-agent orchestration, agentic commerce',
    replaces: ['Agentic Software', 'Agentic Commerce', 'Automation', 'agentic-ai', 'ai-automation']
  },

  'architecture': {
    label: 'Architecture',
    description: 'System design, patterns, technical architecture, infrastructure',
    replaces: ['architecture', 'Systems Design', 'systems-thinking']
  },

  'commerce': {
    label: 'Commerce',
    description: 'Digital commerce, storefronts, e-commerce platforms, retail tech',
    replaces: ['Commerce', 'E-Commerce', 'commerce-strategy']
  },

  'consulting': {
    label: 'Consulting',
    description: 'Consulting practice, client work, advisory, professional services',
    replaces: ['Consulting', 'Strategy', 'consulting-practice', 'Consulting Practice']
  },

  'leadership': {
    label: 'Leadership',
    description: 'Managing people, teams, organizational dynamics, mentorship',
    replaces: ['Leadership', 'leadership']
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // CONTENT TYPE - How the post is framed
  // ═══════════════════════════════════════════════════════════════════════════

  'field-notes': {
    label: 'Field Notes',
    description: 'Real-time observations, work-in-progress, raw learnings',
    replaces: ['Field Notes']
  },

  'deep-dive': {
    label: 'Deep Dive',
    description: 'Technical explorations, thorough analysis, long-form investigation',
    replaces: []
  },

  'reflection': {
    label: 'Reflection',
    description: 'Introspective posts, personal growth, philosophy, meaning-making',
    replaces: ['Personal Growth', 'Self-Awareness', 'philosophy', 'meaning', 'therapy', 'honesty', 'personal-growth', 'Reflections', 'Philosophy']
  },

  'tutorial': {
    label: 'Tutorial',
    description: 'How-to content, step-by-step guides, practical instructions',
    replaces: []
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // FRAMEWORKS & PROJECTS - Signal Dispatch IP
  // ═══════════════════════════════════════════════════════════════════════════

  'aegis-framework': {
    label: 'Aegis Framework',
    description: 'Posts about the Aegis constitutional AI governance framework',
    replaces: ['aegis-framework']
  },

  'signal-dispatch': {
    label: 'Signal Dispatch',
    description: 'Meta posts about the blog itself, voice, process',
    replaces: ['Meta', 'meta']
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SKILLS & PRACTICES - Cross-cutting capabilities
  // ═══════════════════════════════════════════════════════════════════════════

  'engineering': {
    label: 'Engineering',
    description: 'Code, tools, craft, testing, web development, developer experience',
    replaces: ['Engineering', 'Web Development', 'Developer Tools', 'testing', 'UX Design', 'accessibility', 'svelte', 'cli', 'craft']
  },

  'product-strategy': {
    label: 'Product Strategy',
    description: 'Product thinking, roadmaps, prioritization, product management',
    replaces: ['Product Strategy']
  },

  'career': {
    label: 'Career',
    description: 'Career development, professional growth, education, industry trends',
    replaces: ['Career', 'Higher Education', 'Education', 'Productivity', 'industry']
  },

  'communication': {
    label: 'Communication',
    description: 'Writing, presenting, feedback, stakeholder management',
    replaces: ['communication', 'feedback']
  },

  'photography': {
    label: 'Photography',
    description: 'Photography practice, visual storytelling, camera craft',
    replaces: ['practice']
  }
} as const;

// Type for valid tag keys
export type CanonicalTag = keyof typeof CANONICAL_TAGS;

// Array of valid tag strings for validation
export const VALID_TAGS: CanonicalTag[] = Object.keys(CANONICAL_TAGS) as CanonicalTag[];

// Build a reverse lookup map: old tag -> new tag
export const TAG_MIGRATION_MAP: Record<string, CanonicalTag> = {};
for (const [newTag, config] of Object.entries(CANONICAL_TAGS)) {
  // Map the tag to itself (normalized)
  TAG_MIGRATION_MAP[newTag] = newTag as CanonicalTag;
  TAG_MIGRATION_MAP[newTag.toLowerCase()] = newTag as CanonicalTag;

  // Map all replaced tags
  for (const oldTag of config.replaces) {
    TAG_MIGRATION_MAP[oldTag] = newTag as CanonicalTag;
    TAG_MIGRATION_MAP[oldTag.toLowerCase()] = newTag as CanonicalTag;
  }
}

// Tags that should be dropped entirely (too specific or vague)
export const DEPRECATED_TAGS = [
  'apple',
  'microsoft',
  'Operating Systems',
  'Gen Z',
  'patterns',
  'tools',
  'Insights'
] as const;

/**
 * Validate a tag against the canonical list
 */
export function isValidTag(tag: string): tag is CanonicalTag {
  return VALID_TAGS.includes(tag as CanonicalTag);
}

/**
 * Migrate an old tag to its canonical form
 * Returns null if the tag should be dropped
 */
export function migrateTag(oldTag: string): CanonicalTag | null {
  // Check if it should be dropped
  if (DEPRECATED_TAGS.some(d => d.toLowerCase() === oldTag.toLowerCase())) {
    return null;
  }

  // Check migration map
  const normalized = TAG_MIGRATION_MAP[oldTag] || TAG_MIGRATION_MAP[oldTag.toLowerCase()];
  if (normalized) {
    return normalized;
  }

  // Unknown tag - will need manual review
  return null;
}

/**
 * Get tag metadata for display
 */
export function getTagMeta(tag: CanonicalTag) {
  return CANONICAL_TAGS[tag];
}
