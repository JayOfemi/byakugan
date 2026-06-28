# AI Checker

Check whether writing reads as AI, on your own machine, then improve how it reads. Free and open source.

Two ways to use it.

## 1. In your browser

A static web app. Paste your text and get a read on how AI-like it sounds, with a plain-language explanation, a grammar pass, and a check against your own documents for reuse. Everything runs in the page, and nothing you paste leaves the browser.

Run it locally:

```
cd site
npm install
npm run dev
```

## 2. Inside the AI you already use

A mcp server for your AI assistant (Claude Desktop, an IDE, any MCP client). It gives that AI a detection read plus the exact phrases that read as AI, so your own AI can check and rewrite your writing, on your machine.

For Claude Desktop, add this to `claude_desktop_config.json` and restart:

```json
{
  "mcpServers": {
    "ai-checker": {
      "command": "npx",
      "args": ["-y", "@jayofemi/ai-checker"]
    }
  }
}
```

Then tell your AI "use ai-checker to check this text" and paste what you want checked. Full setup, the tools, and how to verify it are in [mcp/README.md](mcp/README.md).

## What to expect

AI-text detection is a signal, not a verdict, and it is biased against non-native English writers. It is shown as a likelihood with its confidence, never a yes/no judgement. Stiff, even, stock-phrase-heavy writing reads high; varied, personal writing reads low. Use it on your own work.

## Layout

- `site/` - the browser checker, a static web app. See [site/README.md](site/README.md).
- `mcp/` - the MCP server and TypeScript library. See [mcp/README.md](mcp/README.md).

Each folder is its own package with its own build. Node 22 (`.nvmrc`).

## License

MIT. Copyright (c) 2026 Jay Ofemi.
