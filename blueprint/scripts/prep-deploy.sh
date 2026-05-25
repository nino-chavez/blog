#!/usr/bin/env bash
# Blueprint Portal — prep for Cloudflare Pages deploy
#
# Copies strategic docs into portal/_docs/ so the Pages Function
# (functions/api/chat.js) can fetch them via the ASSETS binding, and so
# the docs viewer (docs/index.html) can render them as HTML.
#
# Customize the SOURCES table below for your project. Default assumes
# docs live one level up under blueprint/{research,docs}.

set -euo pipefail
PORTAL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BLUEPRINT_DIR="$(cd "$PORTAL_DIR/.." && pwd)"
DOCS_OUT="$PORTAL_DIR/_docs"

mkdir -p "$DOCS_OUT"

# Edit this table to map your blueprint's docs into the portal _docs/ folder.
# Format: <source-path-relative-to-BLUEPRINT_DIR> -> <slug-without-.md>
declare -a SOURCES=(
  "research/synthesis.md:research-synthesis"
  "DESIGN-PRINCIPLES.md:design-principles"
  "docs/cx-strategy.md:cx-strategy"
  "docs/roadmap.md:roadmap"
  "docs/gaps.md:gaps"
  "docs/feasibility.md:feasibility"
)

count=0
for entry in "${SOURCES[@]}"; do
  src="${entry%%:*}"
  slug="${entry##*:}"
  if [ -f "$BLUEPRINT_DIR/$src" ]; then
    cp -f "$BLUEPRINT_DIR/$src" "$DOCS_OUT/$slug.md"
    count=$((count + 1))
  fi
done

echo "Copied $count docs into $DOCS_OUT/"
ls -1 "$DOCS_OUT" 2>/dev/null
