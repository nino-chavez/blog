# MCP Chrome DevTools Setup Guide

This guide explains how to use the Chrome DevTools MCP server that's been configured for your workspace.

## ✅ Setup Complete

The Chrome DevTools MCP server has been added to your Cursor MCP configuration at `~/.cursor/mcp.json` using the `chrome-devtools-mcp` package.

## 🚀 How to Use

### Step 1: Launch Chrome with Remote Debugging

Before using the MCP server, you need to launch Chrome with remote debugging enabled:

**Option A: Use the helper script (Recommended)**
```bash
./scripts/launch-chrome-debug.sh
```

**Option B: Manual launch**
```bash
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
  --remote-debugging-port=9222 \
  --user-data-dir=/tmp/chrome-debug-profile
```

**Option C: Use a different port**
```bash
./scripts/launch-chrome-debug.sh 9223
```

### Step 2: Restart Cursor

After launching Chrome, **restart Cursor** to load the MCP server configuration.

### Step 3: Start Using Browser Control

Once Chrome is running with remote debugging and Cursor is restarted, you can ask me to:

- Navigate to URLs: "Navigate to localhost:5174"
- Click elements: "Click the submit button"
- Fill forms: "Fill out the contact form with test data"
- Check console logs: "Show me all console errors on this page"
- Monitor network: "Show me all network requests when I click this button"
- Take screenshots: "Take a screenshot of the current page"
- Inspect elements: "Check if the navigation menu is visible"

## 🔍 What the MCP Server Provides

The Chrome DevTools MCP server gives you access to:

1. **Browser Navigation** - Navigate to URLs, go back/forward, reload
2. **Element Interaction** - Click, type, select dropdowns, hover
3. **Console Access** - Read console logs, errors, warnings
4. **Network Monitoring** - Inspect network requests, responses, headers
5. **Page Inspection** - Get page HTML, take screenshots, evaluate JavaScript
6. **Performance** - Access performance metrics and timing data

## 📝 Example Use Cases

### Test Your Blog Locally
```
"Navigate to localhost:5174, check for console errors, and take a screenshot"
```

### Debug Network Issues
```
"Go to my blog post page and show me all failed network requests"
```

### Verify UI Components
```
"Navigate to localhost:5174, click on a blog post, and verify the article content renders correctly"
```

### Monitor Performance
```
"Load localhost:5174 and show me the page load time and any slow network requests"
```

## 🔒 Security Notes

- The remote debugging port (9222) should only be accessible on localhost
- Don't expose the debugging port to external networks
- Close the debug Chrome instance when you're done testing
- The script uses a separate user profile (`/tmp/chrome-debug-profile`) to avoid conflicts with your regular Chrome

## 🛠️ Troubleshooting

### Chrome won't launch
- Make sure Chrome is installed at `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`
- Check if port 9222 is already in use: `lsof -i :9222`
- Try using a different port: `./scripts/launch-chrome-debug.sh 9223`

### MCP server not connecting
- Ensure Chrome is running with `--remote-debugging-port=9222`
- Verify the MCP configuration in `~/.cursor/mcp.json`
- Restart Cursor after making configuration changes
- Check Cursor's MCP logs for connection errors

### Package not found
- The package will be automatically downloaded on first use via `npx`
- Ensure you have Node.js 20.19+ installed (you have v24.10.0 ✅)

## 📚 Additional Resources

- [Chrome DevTools Protocol Documentation](https://chromedevtools.github.io/devtools-protocol/)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [MCP Chrome DevTools Server](https://github.com/modelcontextprotocol/servers/tree/main/src/chrome-devtools)

