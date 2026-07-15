import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const testDir = dirname(fileURLToPath(import.meta.url));
const readJson = (base: string, path: string) => JSON.parse(readFileSync(join(base, path), "utf8"));
const repoRoot = join(testDir, "..", "..");
const mcpRoot = join(testDir, "..");

describe("claude plugin manifest", () => {
	it("keeps plugin.json version in lockstep with the MCP package.json", () => {
		expect(readJson(repoRoot, ".claude-plugin/plugin.json").version).toBe(readJson(mcpRoot, "package.json").version);
	});

	it("lists the repo-root plugin in the marketplace under the plugin name", () => {
		const plugin = readJson(repoRoot, ".claude-plugin/plugin.json");
		const entry = readJson(repoRoot, ".claude-plugin/marketplace.json").plugins.find((p: { name: string }) => p.name === plugin.name);
		expect(entry).toBeDefined();
		expect(entry.source).toBe("./");
	});
});
