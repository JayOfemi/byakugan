import type { GrammarIssue } from './types';

// Wraps Harper's WorkerLinter (Rust compiled to WASM, running in a web worker).
// Loaded lazily on first use so the detector stays a zero-download instant
// check; the grammar engine downloads only when the user asks for it.
class GrammarCheckerClass {
	private linter: { lint(text: string): Promise<unknown[]> } | null = null;
	private setupPromise: Promise<void> | null = null;

	private async doSetup(): Promise<void> {
		// harper.js 2.x requires the WASM binary be passed in. binaryInlined ships
		// it as a data URL, so there is no separate .wasm asset for the worker to
		// resolve under the bundler.
		const harper: any = await import('harper.js');
		const binMod: any = await import('harper.js/binaryInlined');
		const linter = new harper.WorkerLinter({ binary: binMod.binaryInlined, dialect: harper.Dialect.American });
		await linter.setup();
		this.linter = linter;
	}

	private async ensure(): Promise<void> {
		if (this.linter) return;
		if (!this.setupPromise) this.setupPromise = this.doSetup();
		try {
			await this.setupPromise;
		} catch (e) {
			// Let a later attempt retry rather than caching the failure forever.
			this.setupPromise = null;
			throw e;
		}
	}

	async check(text: string): Promise<GrammarIssue[]> {
		await this.ensure();
		const lints = await this.linter!.lint(text);
		return lints.map((raw) => {
			const lint = raw as any;
			const span = lint.span();
			return {
				start: span.start,
				end: span.end,
				message: lint.message(),
				kind: lint.lint_kind_pretty(),
				problemText: lint.get_problem_text(),
				suggestions: lint.suggestions().map((s: any) => s.get_replacement_text())
			};
		});
	}

	// Apply the first suggestion of each fixable issue, right to left so earlier
	// offsets stay valid, skipping any issue that overlaps one already applied.
	applyAll(text: string, issues: GrammarIssue[]): string {
		const fixable = issues
			.filter(i => i.suggestions.length > 0)
			.sort((a, b) => b.start - a.start);
		let out = text;
		let boundary = text.length;
		for (const i of fixable) {
			if (i.end > boundary) continue;
			out = out.slice(0, i.start) + i.suggestions[0] + out.slice(i.end);
			boundary = i.start;
		}
		return out;
	}
}

export const GrammarChecker = new GrammarCheckerClass();
