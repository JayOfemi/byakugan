#!/usr/bin/env node
// MCP server: exposes the deterministic AI-text analysis as tools an AI can call.

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { SERVER_NAME, SERVER_VERSION } from "./constants.js";
import { detect } from "./detect.js";
import { findTells } from "./tells.js";
import { checkOverlap } from "./reuse.js";
import { checkGrammar } from "./grammar.js";

const textSchema = z.string().min(1).describe("The text to analyze.");

const server = new McpServer({ name: SERVER_NAME, version: SERVER_VERSION });

server.registerTool(
	"detect_ai_text",
	{
		title: "Detect AI text",
		description:
			"Score how likely a passage reads as AI-written, fully on-device, with a per-signal breakdown and a confidence band. Returns a 0 to 100 likelihood, never a yes/no verdict. The signal is directional and biased against non-native English writers, so treat it as a second opinion and not proof. Get a read here, then call find_ai_tells to locate the spans worth rewriting.",
		inputSchema: { text: textSchema },
	},
	async ({ text }) => {
		return { content: [{ type: "text", text: JSON.stringify(detect(text)) }] };
	},
);

server.registerTool(
	"find_ai_tells",
	{
		title: "Find AI tells",
		description:
			"Locate the exact character spans that read as AI, covering stock phrasing, long dashes, and formulaic sentence openers. Returns a list of spans with start, end, the matched text, and a note. Use these to rephrase only the flagged parts and leave the rest of the writing intact. Deterministic.",
		inputSchema: { text: textSchema },
	},
	async ({ text }) => {
		const tells = findTells(text);
		return { content: [{ type: "text", text: JSON.stringify({ count: tells.length, tells }) }] };
	},
);

server.registerTool(
	"check_reuse",
	{
		title: "Check reuse overlap",
		description:
			"Compare the text against reference documents you provide, using word shingles, and return the share of overlap and the verbatim shared passages. This is a local check against the documents passed in. It does not search the web or any plagiarism database. Deterministic.",
		inputSchema: {
			text: textSchema,
			references: z.array(z.string()).min(1).describe("One or more of your own documents to compare against."),
		},
	},
	async ({ text, references }) => {
		return { content: [{ type: "text", text: JSON.stringify(checkOverlap(text, references)) }] };
	},
);

server.registerTool(
	"check_grammar",
	{
		title: "Check grammar",
		description:
			"Run a rule-based grammar and style check over the text, fully on-device, and return each issue with its character span, a message, the flagged text, and suggested fixes. Use it to tidy grammar and phrasing, before or after rewriting the flagged AI tells. Deterministic.",
		inputSchema: { text: textSchema },
	},
	async ({ text }) => {
		const issues = await checkGrammar(text);
		return { content: [{ type: "text", text: JSON.stringify({ count: issues.length, issues }) }] };
	},
);

const transport = new StdioServerTransport();
await server.connect(transport);
