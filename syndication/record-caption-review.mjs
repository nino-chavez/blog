#!/usr/bin/env node
// Records an explicit semantic review. This command does not perform the review.
// Run it only after reading the current caption, source, voice guide, reader
// contract, and reference caption. Their hashes make the receipt stale whenever
// another session changes any of those inputs.

import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { reviewHashes } from './caption-review-lib.mjs'

const HERE = dirname(fileURLToPath(import.meta.url))
const QUEUE = resolve(HERE, 'queue.json')
const RECEIPTS = resolve(HERE, 'caption-review-receipts.json')
const args = process.argv.slice(2)
const value = (flag) => {
  const at = args.indexOf(flag)
  return at >= 0 ? args[at + 1] : null
}

const id = value('--id')
const reviewedBy = value('--reviewed-by')
if (!id || !reviewedBy || !args.includes('--confirm-reviewed')) {
  console.error(
    'Usage: node syndication/record-caption-review.mjs --id <queue-id> ' +
      '--reviewed-by <name> --confirm-reviewed\n' +
      'The confirmation means the current caption was compared with its source, ' +
      'voice guide, reader contract, and reference caption.'
  )
  process.exit(1)
}

const queue = JSON.parse(readFileSync(QUEUE, 'utf8'))
const item = queue.items.find((candidate) => candidate.id === id)
if (!item?.routes?.linkedin?.caption) {
  console.error(`${id}: queued LinkedIn caption not found`)
  process.exit(1)
}

const ledger = JSON.parse(readFileSync(RECEIPTS, 'utf8'))
ledger.receipts[id] = {
  reviewedAt: new Date().toISOString(),
  reviewedBy,
  hashes: reviewHashes(item),
}

writeFileSync(RECEIPTS, `${JSON.stringify(ledger, null, 2)}\n`)
console.log(`${id}: editorial review receipt recorded`)
