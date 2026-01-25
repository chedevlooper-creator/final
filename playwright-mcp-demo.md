# Playwright MCP Server Setup & Demonstration

## ✅ Setup Complete

The Playwright MCP server has been successfully configured in `blackbox_mcp_settings.json` with the following configuration:

```json
{
  "mcpServers": {
    "github.com/executeautomation/mcp-playwright": {
      "command": "npx",
      "args": ["-y", "@executeautomation/playwright-mcp-server"]
    }
  }
}
```

## 🎭 Server Capabilities

The Playwright MCP server provides the following browser automation capabilities:

### Available Tools:

1. **playwright_navigate** - Navigate to a URL in the browser
2. **playwright_screenshot** - Take a screenshot of the current page
3. **playwright_click** - Click on an element
4. **playwright_fill** - Fill in form fields
5. **playwright_evaluate** - Execute JavaScript in the browser context
6. **playwright_resize** - Resize browser viewport or emulate devices (143 device presets!)
7. **playwright_codegen** - Generate test code
8. **playwright_scrape** - Web scraping capabilities

### Device Emulation Feature (v1.0.10+)

The server supports 143 real device presets including:
- iPhone models (iPhone 13, iPhone 14 Pro, etc.)
- iPad models (iPad Pro 11, iPad Air, etc.)
- Android devices (Pixel, Galaxy series)
- Desktop browsers

## 🚀 Demonstration

### Example 1: Navigate and Screenshot

To demonstrate the server's capabilities, you can use it to:

1. **Navigate to a website**
   ```
   Use the playwright_navigate tool to visit https://example.com
   ```

2. **Take a screenshot**
   ```
   Use the playwright_screenshot tool to capture the page
   ```

3. **Test device emulation**
   ```
   Use playwright_resize with device: "iPhone 13" to test mobile view
   ```

### Example 2: Web Scraping

```
1. Navigate to a webpage
2. Use playwright_evaluate to extract data
3. Use playwright_scrape to get structured content
```

### Example 3: Form Automation

```
1. Navigate to a form page
2. Use playwright_fill to enter data
3. Use playwright_click to submit
4. Use playwright_screenshot to verify result
```

## 📝 Usage Notes

- The server runs in **stdio mode** by default (recommended for Claude Desktop)
- Browser binaries are **automatically installed** on first use
- Logs are written to `~/playwright-mcp-server.log`
- Supports Chromium, Firefox, and WebKit browsers

## 🔧 Alternative: HTTP Mode

For VS Code or remote deployments, you can run the server in HTTP mode:

```bash
npx @executeautomation/playwright-mcp-server --port 8931
```

Then configure with:
```json
{
  "url": "http://localhost:8931/mcp",
  "type": "http"
}
```

## 📚 Resources

- GitHub: https://github.com/executeautomation/mcp-playwright
- Documentation: https://executeautomation.github.io/mcp-playwright/
- API Reference: https://executeautomation.github.io/mcp-playwright/docs/playwright-web/Supported-Tools

## ✨ Next Steps

The MCP server is now ready to use! You can:

1. Restart your MCP client to load the new server
2. Use any of the playwright tools listed above
3. Test browser automation capabilities
4. Explore device emulation features
5. Generate test code automatically

---

**Status**: ✅ MCP Server Configured and Ready
**Server Name**: github.com/executeautomation/mcp-playwright
**Mode**: stdio (Standard)
**Package**: @executeautomation/playwright-mcp-server
