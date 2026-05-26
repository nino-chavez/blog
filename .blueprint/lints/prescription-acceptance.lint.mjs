#!/usr/bin/env node
// prescription-acceptance.lint.mjs
//
// Fails when a Stage 3+ commit lands while load-bearing decisions in the
// prescription document are still `status: provisional` (or have no status,
// which defaults to provisional).
//
// Pattern source: Lopopolo, "Harness engineering: leveraging Codex in an
// agent-first world" (OpenAI, 2026-02-11). Specifically the "promote rule
// to code with remediation instructions injected into the error message"
// pattern.
//
// Blog schema (signal-dispatch-v2): reads `provisional:` array from
// blueprint/prescription.yml. Each entry has `decision`, `name`,
// `provisional_value`, optional `status: provisional | accepted | rejected | modified`.
// Absence of `status` defaults to provisional.
//
// Stage classification heuristic:
//   Stage 1-2 (research, prescription, methodology work) — files under
//   blueprint/research/, blueprint/, .blueprint/, decisions/, docs/.
//   Stage 3+ (prototype, src changes, etc.) — everything else.
//
// Exit codes:
//   0 — pass (no provisional decisions, OR commit is Stage 1-2 only)
//   1 — fail (Stage 3+ work attempted with provisional decisions)
//   2 — config error (prescription file missing or schema malformed)

import { readFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join } from 'node:path';

const REPO_ROOT = execSync('git rev-parse --show-toplevel', { encoding: 'utf8' }).trim();

const CANDIDATE_PRESCRIPTION_PATHS = [
  'blueprint/prescription.yml',
  'blueprint/prescription.yaml',
  '.blueprint/prescription.yml',
  'decisions/01-prescription.yml',
];

// Stage 1-2 scopes — methodology + research + decision work allowed without
// gating on decision status.
const STAGE_LOW_SCOPES = [
  'blueprint/',
  '.blueprint/',
  'decisions/',
  'docs/',
  'research/',
];

function findPrescription() {
  for (const p of CANDIDATE_PRESCRIPTION_PATHS) {
    const full = join(REPO_ROOT, p);
    if (existsSync(full)) return { path: p, full };
  }
  return null;
}

function parseScalar(s) {
  s = s.trim();
  // Strip inline YAML comments (only outside quoted strings).
  // YAML spec: `#` starts a comment when preceded by whitespace.
  if (!s.startsWith('"') && !s.startsWith("'")) {
    const commentIdx = s.indexOf(' #');
    if (commentIdx >= 0) s = s.slice(0, commentIdx).trim();
  }
  if (s === '' || s === 'null' || s === '~') return null;
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    return s.slice(1, -1);
  }
  return s;
}

// Minimal extractor for the documented blog schema:
//   provisional:
//     - decision: D1
//       name: "..."
//       provisional_value: "..."
//       status: provisional   # optional; absence = provisional
//
// Also supports a generic `bets:` array with the same shape for cross-consumer
// portability (rally-hq, website-nc-v3, etc.).
function extractDecisions(content) {
  const lines = content.split('\n');
  const decisions = [];
  let inSection = false;
  let sectionIndent = -1;
  let current = null;

  for (const raw of lines) {
    const line = raw.replace(/\r$/, '');
    if (/^(provisional|bets):\s*$/.test(line)) {
      // Flush any open section before starting a new one
      if (current) { decisions.push(current); current = null; }
      inSection = true;
      sectionIndent = -1;
      continue;
    }
    if (!inSection) continue;

    // Detect end of section: next top-level key (no leading whitespace).
    if (/^[a-zA-Z_]/.test(line)) {
      if (current) decisions.push(current);
      current = null;
      inSection = false;
      continue;
    }

    // Item start: "  - decision: D1" or "  - id: D1"
    const itemStart = line.match(/^(\s+)-\s+(\w+):\s*(.*)$/);
    if (itemStart) {
      if (current) decisions.push(current);
      current = { [itemStart[2]]: parseScalar(itemStart[3]) };
      sectionIndent = itemStart[1].length;
      continue;
    }

    // Field of current item
    const field = line.match(/^(\s+)(\w+):\s*(.*)$/);
    if (field && current) {
      // Only treat as a field if indent is deeper than the item-dash indent
      if (field[1].length > sectionIndent) {
        current[field[2]] = parseScalar(field[3]);
      }
    }
  }
  if (current) decisions.push(current);
  return decisions;
}

function decisionId(d) {
  return d.decision ?? d.id ?? '(no id)';
}

function decisionName(d) {
  return d.name ?? d.summary ?? d.provisional_value ?? '(no name)';
}

function getStagedFiles() {
  try {
    const out = execSync('git diff --cached --name-only', { encoding: 'utf8' });
    return out.split('\n').filter(Boolean);
  } catch {
    return [];
  }
}

function isStage3Work(stagedFiles) {
  return stagedFiles.some(f => !STAGE_LOW_SCOPES.some(scope => f.startsWith(scope)));
}

const prescription = findPrescription();
if (!prescription) {
  console.error('[prescription-acceptance] No prescription file found. Searched:');
  CANDIDATE_PRESCRIPTION_PATHS.forEach(p => console.error(`  - ${p}`));
  console.error('Create one with a provisional[] (or bets[]) array before running this lint.');
  process.exit(2);
}

const content = readFileSync(prescription.full, 'utf8');
const decisions = extractDecisions(content);

if (decisions.length === 0) {
  console.error(`[prescription-acceptance] No provisional[] or bets[] entries found in ${prescription.path}.`);
  console.error('Expected schema (blog):');
  console.error('  provisional:');
  console.error('    - decision: D1');
  console.error('      name: "..."');
  console.error('      provisional_value: "..."');
  console.error('      status: provisional   # optional; absence = provisional');
  process.exit(2);
}

const unresolved = decisions.filter(d => {
  const s = d.status;
  return !s || s === 'provisional';
});

const staged = getStagedFiles();
const stage3 = isStage3Work(staged);

if (unresolved.length > 0 && stage3) {
  const stage3Files = staged.filter(f => !STAGE_LOW_SCOPES.some(s => f.startsWith(s)));
  console.error('BLOCKED by prescription-acceptance lint.');
  console.error('');
  console.error(`Stage 3+ work attempted with ${unresolved.length} unresolved decision(s) in ${prescription.path}:`);
  unresolved.forEach(d => {
    console.error(`  - ${decisionId(d)}: ${decisionName(d)}`);
  });
  console.error('');
  console.error(`Fix: in ${prescription.path}, set each decision's status to one of:`);
  console.error('  - accepted   (move forward as written)');
  console.error('  - rejected   (do not pursue; remove dependent Stage 3 work)');
  console.error('  - modified   (revised; include the revision inline)');
  console.error('');
  console.error('Then re-stage the prescription file and commit.');
  console.error('');
  console.error('Stage 3+ files staged this commit:');
  stage3Files.forEach(f => console.error(`  - ${f}`));
  process.exit(1);
}

console.log(`[prescription-acceptance] OK — ${decisions.length} decision(s) total, ${unresolved.length} unresolved, stage3=${stage3}`);
process.exit(0);
