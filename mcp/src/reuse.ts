import { Reuse } from "./constants.js";
import { tokenize, type Token } from "./text.js";

export interface OverlapPassage {
	start: number;
	end: number;
	text: string;
}

export interface OverlapResult {
	overlapRatio: number;
	matchedWords: number;
	totalWords: number;
	passages: OverlapPassage[];
}

function shingleKey(tokens: Token[], i: number, k: number): string {
	let key = tokens[i].word;
	for (let j = i + 1; j < i + k; j++) key += " " + tokens[j].word;
	return key;
}

function referenceShingles(references: string[], k: number): Set<string> {
	const set = new Set<string>();
	for (const ref of references) {
		const toks = tokenize(ref);
		for (let i = 0; i + k <= toks.length; i++) set.add(shingleKey(toks, i, k));
	}
	return set;
}

// Compares the input against the pooled reference documents using k-word
// shingles. A word counts as overlapping when it sits inside a shingle that
// also appears in a reference. Returns the overlap share and the verbatim
// shared passages. Local only; it never touches the network.
export function checkOverlap(text: string, references: string[]): OverlapResult {
	const k = Reuse.ShingleSize;
	const tokens = tokenize(text);
	const totalWords = tokens.length;
	const refSet = referenceShingles(references, k);

	const matched = new Array<boolean>(totalWords).fill(false);
	if (refSet.size > 0) {
		for (let i = 0; i + k <= totalWords; i++) {
			if (refSet.has(shingleKey(tokens, i, k))) {
				for (let j = i; j < i + k; j++) matched[j] = true;
			}
		}
	}

	const passages: OverlapPassage[] = [];
	let i = 0;
	while (i < totalWords) {
		if (!matched[i]) {
			i++;
			continue;
		}
		const runStart = i;
		while (i < totalWords && matched[i]) i++;
		const start = tokens[runStart].start;
		const end = tokens[i - 1].end;
		passages.push({ start, end, text: text.slice(start, end) });
	}

	const matchedWords = matched.reduce((n, m) => (m ? n + 1 : n), 0);
	const overlapRatio = totalWords > 0 ? matchedWords / totalWords : 0;
	return { overlapRatio, matchedWords, totalWords, passages };
}
