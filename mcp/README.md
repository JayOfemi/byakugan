# AI Checker (MCP) [![byakugan MCP server](https://glama.ai/mcp/servers/JayOfemi/byakugan/badges/score.svg)](https://glama.ai/mcp/servers/JayOfemi/byakugan)

AI-text checks inside the AI assistant you already use, on your machine. Add it to your MCP client and it gives that assistant a detection read, the exact phrases that read as AI, a reuse check, and a grammar pass, so the assistant can act on them without your text going to a website. Because the rewriting runs on your own model, a stronger model gives better results than the small one the site runs in the browser. Ships as an MCP server and a TypeScript library.

## Install

Add it to your MCP client's config. For Claude Desktop, open Settings, then Developer, then Edit Config, and add:

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

Restart the client. For other MCP clients (IDEs and the like), point them at the command `npx -y @jayofemi/ai-checker` over stdio.

## Use

Ask the assistant in plain language:

- "use ai-checker to check whether this reads as AI" (then paste your text)
- "use ai-checker to find the parts that read as AI, then rewrite only those"
- "use ai-checker to check this draft against my notes for reuse"
- "use ai-checker to grammar-check this draft"

The server returns the analysis; the assistant rewrites from it.

## The tools

The server is deterministic. It hands the assistant precise local analysis to work from, and does not rewrite text itself.

- **detect_ai_text** - a 0 to 100 likelihood that the text reads as AI, with a per-signal breakdown and a confidence band. Never a yes/no verdict.
- **find_ai_tells** - the exact character spans that read as AI (stock phrasing, long dashes, formulaic openers), so the assistant rephrases only those.
- **check_reuse** - shingle-overlap against reference documents you pass in, with the shared passages. A local check against what you provide, not a web search.
- **check_grammar** - a rule-based grammar and style check (Harper), returning each issue with its span, a message, the flagged text, and suggested fixes. Deterministic.

## Use as a library

```
npm install @jayofemi/ai-checker
```

```ts
import { detect, findTells, checkOverlap, checkGrammar } from '@jayofemi/ai-checker';

detect("Your text here.");                   // likelihood, band, confidence, signals, caveats
findTells("Your text here.");                // the spans that read as AI
checkOverlap("your draft", ["a reference"]); // shingle overlap
await checkGrammar("Your text here.");       // grammar issues with fixes (async)
```

## What to expect

Detection is a directional signal, not proof, and it is biased against non-native English writers. Even, formulaic, stock-phrase-heavy writing reads as more AI-like. Treat it as a second opinion and use it on your own writing.

## Develop

```
npm install
npm run build
npm test
```

Verify the server with the MCP Inspector:

```
npx @modelcontextprotocol/inspector node dist/server.js
```

It opens a local UI; connect over stdio, list the tools, and call them. Or run the server directly with `npm run mcp`.

## License

MIT. Copyright (c) 2026 Jay Ofemi.
