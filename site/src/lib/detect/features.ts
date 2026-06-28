import { AiTellPhrases } from './aiTells';

// Transparent linguistic features behind the on-device signal. Each returns an
// "ai-ness" in 0..1 (0.5 is neutral, above leans AI, below leans human) plus a plain-language
// detail. A feature sets abstain when it had no input to read, so the blend
// drops it instead of counting it as a real neutral reading.

export interface FeatureReading {
	key: string;
	label: string;
	aiNess: number;
	detail: string;
	abstain?: boolean;
}

export interface ParsedText {
	sentences: string[];
	words: string[];
	wordCount: number;
}

function clamp01(n: number): number {
	if (n < 0) return 0;
	if (n > 1) return 1;
	return n;
}

// A word is a run of letters or digits in any script, with optional internal
// apostrophes. Excludes lone apostrophes and punctuation.
const WordPattern = /[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu;

export function wordsIn(text: string): string[] {
	return text.match(WordPattern) ?? [];
}

export function parseText(text: string): ParsedText {
	const sentences = text
		.split(/(?<=[.!?])\s+/)
		.map(s => s.trim())
		.filter(s => s.length > 0);
	const words = wordsIn(text);
	return { sentences, words, wordCount: words.length };
}

// Humans vary sentence length a lot; machine prose tends to march at an even
// pace. Reads the spread of sentence lengths (coefficient of variation).
export function readRhythm(p: ParsedText): FeatureReading {
	const lengths = p.sentences.map(s => wordsIn(s).length).filter(n => n > 0);
	if (lengths.length < 2) {
		return { key: 'rhythm', label: 'Sentence rhythm', aiNess: 0.5, detail: 'Not enough sentences to read the rhythm.', abstain: true };
	}
	const mean = lengths.reduce((a, b) => a + b, 0) / lengths.length;
	const variance = lengths.reduce((a, b) => a + (b - mean) ** 2, 0) / lengths.length;
	const cv = mean > 0 ? Math.sqrt(variance) / mean : 0;
	// Low cv reads very even (AI-ward); high cv reads spiky (human-ward).
	const aiNess = clamp01(1 - (cv - 0.10) / 0.62);
	const detail = aiNess > 0.55
		? 'Sentences run unusually even in length, which reads more like AI writing.'
		: aiNess < 0.45
			? 'Sentence lengths vary the way human writing usually does.'
			: 'Sentence lengths fall in between, not clearly even or varied.';
	return { key: 'rhythm', label: 'Sentence rhythm', aiNess, detail };
}

// Density of stock phrases that machine prose overuses (see aiTells). Each
// phrase counts once, matched on a word boundary so a stem cannot fire mid-word.
export function readPhrasing(p: ParsedText, raw: string): FeatureReading {
	const lower = raw.toLowerCase();
	let hits = 0;
	const found: string[] = [];
	for (const phrase of AiTellPhrases) {
		const pattern = new RegExp('\\b' + phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
		if (pattern.test(lower)) {
			hits++;
			if (found.length < 4) found.push(phrase);
		}
	}
	const per100 = p.wordCount > 0 ? (hits / p.wordCount) * 100 : 0;
	const aiNess = clamp01(0.30 + Math.min(per100, 8) * 0.11);
	const detail = found.length > 0
		? `Found stock phrasing that AI writing leans on, like "${found.join('", "')}".`
		: 'No stock phrasing of the kind AI writing tends to repeat.';
	return { key: 'phrasing', label: 'Stock phrasing', aiNess, detail };
}

// Em and en dashes show up heavily in machine prose, and our own house wording
// bans them, so a clean human draft tends to avoid them. Referenced by code
// point so no banned dash glyph sits in the source.
export function readPunctuation(raw: string, wordCount: number): FeatureReading {
	const dashes = new Set([0x2014, 0x2013]);
	let count = 0;
	for (let i = 0; i < raw.length; i++) {
		if (dashes.has(raw.charCodeAt(i))) count++;
	}
	const per100 = wordCount > 0 ? (count / wordCount) * 100 : 0;
	const aiNess = clamp01(0.40 + Math.min(per100, 6) * 0.10);
	const detail = count > 0
		? 'Uses long dashes, a punctuation habit common in AI writing.'
		: 'No long dashes.';
	return { key: 'punctuation', label: 'Punctuation habits', aiNess, detail };
}

// Machine prose often opens sentences with formulaic transitions and reuses the
// same opening word. Reads how varied the sentence openers are.
export function readOpeners(p: ParsedText): FeatureReading {
	if (p.sentences.length < 3) {
		return { key: 'openers', label: 'Sentence openers', aiNess: 0.5, detail: 'Not enough sentences to read the openers.', abstain: true };
	}
	const transitions = ['moreover', 'furthermore', 'additionally', 'however', 'consequently', 'overall', 'ultimately', 'importantly', 'notably', 'indeed'];
	const firstWords: Record<string, number> = {};
	let formulaic = 0;
	for (const s of p.sentences) {
		const lower = s.toLowerCase();
		const m = lower.match(/[\p{L}\p{N}']+/u);
		const first = m ? m[0] : '';
		if (first) firstWords[first] = (firstWords[first] ?? 0) + 1;
		for (const t of transitions) {
			if (lower.startsWith(t)) { formulaic++; break; }
		}
	}
	const counts = Object.values(firstWords);
	const topRepeat = counts.length > 0 ? Math.max(...counts) : 0;
	const n = p.sentences.length;
	const repeatRate = (topRepeat - 1) / n;
	const formulaicRate = formulaic / n;
	const aiNess = clamp01(0.36 + formulaicRate * 1.2 + repeatRate * 0.5);
	const detail = aiNess > 0.55
		? 'Sentences tend to start the same way or lean on the same linking words.'
		: 'Sentence openers are varied.';
	return { key: 'openers', label: 'Sentence openers', aiNess, detail };
}
