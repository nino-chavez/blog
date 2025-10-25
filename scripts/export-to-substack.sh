#!/bin/bash
# Export Signal Dispatch blog post to Substack-ready HTML

if [ -z "$1" ]; then
  echo "Usage: ./scripts/export-to-substack.sh <post-slug>"
  echo "Example: ./scripts/export-to-substack.sh from-gsd-to-just-handle-it"
  exit 1
fi

POST_SLUG="$1"
POST_FILE="src/content/blog/${POST_SLUG}.mdx"

if [ ! -f "$POST_FILE" ]; then
  echo "❌ Error: Post not found: $POST_FILE"
  exit 1
fi

echo "📄 Converting: $POST_SLUG"

# Strip frontmatter (everything between first two ---) and convert to HTML
sed '1,/^---$/d; /^---$/,/^---$/d' "$POST_FILE" | \
  pandoc -f markdown -t html | \
  pbcopy -Prefer html

echo "✅ HTML copied to clipboard!"
echo "📋 Ready to paste into Substack editor"
echo ""
echo "Next steps:"
echo "1. Open Substack editor"
echo "2. Paste (Cmd+V)"
echo "3. Add feature image manually from:"
echo "   https://images.unsplash.com/photo-1454165804606-c3d57bc86b40"
