#!/usr/bin/env bash
# Signal Dispatch v2 Blueprint — prep for Cloudflare Pages deploy
#
# Copies v2 artifacts into blueprint/_docs/ so the Pages Function
# (functions/api/chat.js) can fetch them via the ASSETS binding, and so
# the docs viewer (docs/index.html) can render them as HTML.
#
# Initiative-specific (replaces the template's default SOURCES table).
# Preserves directory structure under _docs/ — the docs viewer fetches
# /_docs/<docId>.md where docId can contain slashes (e.g., v1-baseline/README).

set -euo pipefail
PORTAL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DOCS_OUT="$PORTAL_DIR/_docs"

mkdir -p "$DOCS_OUT"

# Clean slate — drop the previous corpus so removed/renamed docs don't linger.
# Leaves the directory itself in place.
find "$DOCS_OUT" -mindepth 1 -delete

# Source files relative to PORTAL_DIR. Each line is preserved at the same
# relative path under _docs/. Directories under _docs/ are auto-created.
SOURCES=(
  # Stage artifacts (v2 greenfield)
  "01-research.md"
  "02-design-principles.md"
  "03-prototype-plan.md"
  "04-fact-check.md"
  "04-fact-check-log.md"
  "05-documents.md"
  "06-deploy.md"
  "DECISIONS-NEEDED.md"
  # Portal conventions + prototype engineering rules
  "README.md"
  "CONVENTIONS.md"
  "prototype/DESIGN.md"
  # v1 baseline reference (carries forward as v2 input)
  "v1-baseline/README.md"
  "v1-baseline/00-inventory.md"
  "v1-baseline/01-diagnose.md"
  "v1-baseline/03-design-brief.md"
  "v1-baseline/strategy-summary.md"
  # Research inputs (salvageable for chat corpus context)
  "research/README.md"
  "research/competitive/README.md"
  "research/competitive/synthesis.md"
  "research/competitive/charity-wtf.md"
  "research/competitive/lethain.md"
  "research/competitive/pragmaticengineer.md"
  "research/competitive/simonwillison.md"
  "research/competitive/stratechery.md"
  # v2 cross-industry adjacencies (added 2026-05-25 per D6/D9)
  "research/competitive/daringfireball.md"
  "research/competitive/maggieappleton.md"
  "research/competitive/robinsloan.md"
  "research/competitive/lennysnewsletter.md"
  "research/personas/README.md"
  "research/personas/peer-architect.md"
  "research/personas/hiring-evaluator.md"
  "research/personas/ai-curious-ic.md"
  "research/personas/gaps.md"
  "research/funnel/README.md"
  "research/funnel/stages.md"
  "research/funnel/evidence.md"
  "research/funnel/gaps.md"
  # Design alternates (parallel-track designs evaluated against Stage 2 principles)
  "research/design-alternates/stitch-DESIGN.md"
)

count=0
missing=0
for src in "${SOURCES[@]}"; do
  if [ -f "$PORTAL_DIR/$src" ]; then
    dest_dir="$DOCS_OUT/$(dirname "$src")"
    mkdir -p "$dest_dir"
    cp -f "$PORTAL_DIR/$src" "$DOCS_OUT/$src"
    count=$((count + 1))
  else
    echo "  MISSING: $src" >&2
    missing=$((missing + 1))
  fi
done

# v1-baseline/02-prescription.yml is YAML, not markdown — copy as .md so the
# docs viewer (which expects .md) can render it as a code-fenced YAML block.
if [ -f "$PORTAL_DIR/v1-baseline/02-prescription.yml" ]; then
  mkdir -p "$DOCS_OUT/v1-baseline"
  {
    echo '# v1-baseline: 02-prescription.yml (rendered)'
    echo ''
    echo '> The v1 brownfield prescription, kept here for reference. Discarded for v2 input per [[v1-baseline/README]].'
    echo ''
    echo '```yaml'
    cat "$PORTAL_DIR/v1-baseline/02-prescription.yml"
    echo '```'
  } > "$DOCS_OUT/v1-baseline/02-prescription.md"
  count=$((count + 1))
fi

echo "Copied $count docs into $DOCS_OUT/"
if [ "$missing" -gt 0 ]; then
  echo "WARNING: $missing source(s) missing — check SOURCES table." >&2
fi
echo ""
echo "_docs/ tree:"
find "$DOCS_OUT" -type f -name '*.md' | sed "s|$DOCS_OUT/||" | sort
