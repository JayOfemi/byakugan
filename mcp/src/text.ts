export interface Token {
	word: string;
	start: number;
	end: number;
}

// A word is a run of letters or digits in any script, with optional internal
// apostrophes (straight or curly). Excludes lone apostrophes and punctuation.
const WordPattern = /[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu;

export function wordsIn(text: string): string[] {
	return text.match(WordPattern) ?? [];
}

export function tokenize(text: string): Token[] {
	const tokens: Token[] = [];
	for (const m of text.matchAll(WordPattern)) {
		const start = m.index ?? 0;
		tokens.push({ word: m[0].toLowerCase(), start, end: start + m[0].length });
	}
	return tokens;
}

export function splitSentences(text: string): string[] {
	return text
		.split(/(?<=[.!?])\s+/)
		.map(s => s.trim())
		.filter(s => s.length > 0);
}
