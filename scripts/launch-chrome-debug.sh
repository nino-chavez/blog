#!/bin/bash

# Launch Chrome with remote debugging enabled for MCP
# This allows the Chrome DevTools MCP server to control the browser

# Default port (can be overridden with first argument)
PORT=${1:-9222}

# User data directory to avoid conflicts with regular Chrome
USER_DATA_DIR="/tmp/chrome-debug-profile-${PORT}"

echo "🚀 Launching Chrome with remote debugging on port ${PORT}..."
echo "📁 Using user data directory: ${USER_DATA_DIR}"
echo ""
echo "To connect MCP, make sure the Chrome DevTools MCP server is configured in ~/.cursor/mcp.json"
echo "Press Ctrl+C to stop Chrome when done."
echo ""

# Launch Chrome with remote debugging
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
  --remote-debugging-port=${PORT} \
  --user-data-dir="${USER_DATA_DIR}" \
  --disable-web-security \
  --disable-features=IsolateOrigins,site-per-process \
  2>&1 | grep -v "^\[.*\]$"

echo ""
echo "✅ Chrome debug session ended."

