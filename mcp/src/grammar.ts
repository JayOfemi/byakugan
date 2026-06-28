import { LocalLinter, Dialect } from "harper.js";
// binaryInlined ships the WASM as a data URL, so there is no file path to
// resolve (the separate-file binary breaks on Windows). Same choice as the site.
import { binaryInlined } from "harper.js/binaryInlined";

export interface GrammarIssue {
	start: number;
	end: number;
	message: string;
	kind: string;
	problemText: string;
	suggestions: string[];
}

// Harper's grammar engine (Rust compiled to WASM) is set up once and reused. The
// MCP runs it on the main thread with LocalLinter, the Node counterpart to the
// browser checker's WorkerLinter.
let linterPromise: Promise<LocalLinter> | null = null;

function getLinter(): Promise<LocalLinter> {
	if (!linterPromise) {
		linterPromise = (async () => {
			const linter = new LocalLinter({ binary: binaryInlined, dialect: Dialect.American });
			await linter.setup();
			return linter;
		})();
	}
	return linterPromise;
}

// Runs the rule-based grammar and style check over the text and returns each
// issue with its span, message, the flagged text, and suggested fixes.
export async function checkGrammar(text: string): Promise<GrammarIssue[]> {
	const linter = await getLinter();
	const lints = await linter.lint(text);
	return lints.map((raw): GrammarIssue => {
		const lint = raw as any;
		const span = lint.span();
		return {
			start: span.start,
			end: span.end,
			message: lint.message(),
			kind: lint.lint_kind_pretty(),
			problemText: lint.get_problem_text(),
			suggestions: lint.suggestions().map((s: any) => s.get_replacement_text()),
		};
	});
}
