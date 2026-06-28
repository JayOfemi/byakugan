import { test, expect } from "vitest";
import { checkGrammar } from "../src/grammar.js";

// Loads Harper's WASM binary on first run, so allow a generous timeout.
test("flags a grammar error and offers a fix", async () => {
	const issues = await checkGrammar("I has a apple.");
	expect(issues.length).toBeGreaterThan(0);
	expect(issues.some(i => i.suggestions.length > 0)).toBe(true);
}, 30000);

test("leaves clean text without grammar issues", async () => {
	const issues = await checkGrammar("The quick brown fox jumps over the lazy dog.");
	expect(issues.length).toBe(0);
}, 30000);
