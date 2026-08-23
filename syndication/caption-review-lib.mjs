import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const BLOG = resolve(HERE, '..')

export const REVIEW_INPUTS = {
  voiceGuide: resolve(BLOG, 'docs/signal-dispatch-voice-guide.md'),
  readerContract: resolve(BLOG, 'reader-contract.json'),
  referenceCaption: resolve(HERE, 'captions/linkedin/blog--nobody-owns-what-the-agent-leaves-running.md'),
}

const digest = (parts) => {
  const hash = createHash('sha256')
  for (const path of parts) {
    if (!existsSync(path)) throw new Error(`review input missing: ${path}`)
    hash.update(path.split('/').pop())
    hash.update('\0')
    hash.update(readFileSync(path))
    hash.update('\0')
  }
  return hash.digest('hex')
}

function sourceFiles(item) {
  const slug = item.id.split('/').slice(1).join('/')
  if (['blog', 'tutorials', 'whitepapers'].includes(item.collection)) {
    return [resolve(BLOG, 'astro-build/src/content', item.collection, `${slug}.mdx`)]
  }

  const group = item.collection === 'demos' ? 'demos' : 'applied'
  const dir = resolve(BLOG, '..', 'nc-demos', group, slug)
  return [resolve(dir, 'meta.json'), resolve(dir, 'deck.html')].filter(existsSync)
}

export function reviewHashes(item) {
  const caption = resolve(HERE, item.routes.linkedin.caption)
  const sources = sourceFiles(item)
  if (!sources.length) throw new Error(`${item.id}: no source files available for editorial review`)

  return {
    caption: digest([caption]),
    source: digest(sources),
    voiceGuide: digest([REVIEW_INPUTS.voiceGuide]),
    readerContract: digest([REVIEW_INPUTS.readerContract]),
    referenceCaption: digest([REVIEW_INPUTS.referenceCaption]),
  }
}

export function reviewMismatches(item, receipt) {
  if (!receipt) return ['missing review receipt']
  const current = reviewHashes(item)
  return Object.entries(current)
    .filter(([key, value]) => receipt.hashes?.[key] !== value)
    .map(([key]) => `${key} changed after review`)
}
