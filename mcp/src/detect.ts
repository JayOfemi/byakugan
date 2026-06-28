import { Detect } from "./constants.js";
import { AiTellPhrases } from "./aiTells.js";
import { wordsIn, splitSentences } from "./text.js";

export type Band = "human" | "mixed" | "ai";
export type Confidence = "low" | "medium" | "high";
export type Direction = "ai" | "human" | "neutral";

export interface DetectionSignal {
	key: string;
	label: string;
	detail: string;
	direction: Direction;
	strength: number;
}

export interface DetectionResult {
	tooShort: boolean;
	wordCount: number;
	likelihood: number;
	band: Band;
	confidence: Confidence;
	signals: DetectionSignal[];
	caveats: string[];
}

interface ParsedText {
	sentences: string[];
	wordCount: number;
}

interface FeatureReading {
	key: string;
	label: string;
	aiNess: number;
	detail: string;
	abstain?: boolean;
}

const NotAVerdict = "This is a probability and can be wrong in both directions. Treat it as a second opinion, never proof.";
const BiasWarning = "Detectors like this one flag people who write English as a second language more often. A high score is not proof a person used AI.";
const ShortInput = "Add more text. Below about 40 words there is too little signal for a fair read.";
const StillShort = "This is on the short side, so the read is shaky. More text gives a steadier result.";

function clamp01(n: number): number {
	if (n < 0) return 0;
	if (n > 1) return 1;
	return n;
}

function parseText(text: string): ParsedText {
	return { sentences: splitSentences(text), wordCount: wordsIn(text).length };
}

function readRhythm(p: ParsedText): FeatureReading {
	const lengths = p.sentences.map(s => wordsIn(s).length).filter(n => n > 0);
	if (lengths.length < 2) {
		return { key: "rhythm", label: "Sentence rhythm", aiNess: 0.5, detail: "Not enough sentences to read the rhythm.", abstain: true };
	}
	const mean = lengths.reduce((a, b) => a + b, 0) / lengths.length;
	const variance = lengths.reduce((a, b) => a + (b - mean) ** 2, 0) / lengths.length;
	const cv = mean > 0 ? Math.sqrt(variance) / mean : 0;
	const aiNess = clamp01(1 - (cv - 0.10) / 0.62);
	const detail = aiNess > 0.55
		? "Sentences run unusually even in length, which reads more like AI writing."
		: aiNess < 0.45
			? "Sentence lengths vary the way human writing usually does."
			: "Sentence lengths fall in between, not clearly even or varied.";
	return { key: "rhythm", label: "Sentence rhythm", aiNess, detail };
}

function readPhrasing(p: ParsedText, raw: string): FeatureReading {
	const lower = raw.toLowerCase();
	let hits = 0;
	const found: string[] = [];
	for (const phrase of AiTellPhrases) {
		const pattern = new RegExp("\\b" + phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
		if (pattern.test(lower)) {
			hits++;
			if (found.length < 4) found.push(phrase);
		}
	}
	const per100 = p.wordCount > 0 ? (hits / p.wordCount) * 100 : 0;
	const aiNess = clamp01(0.30 + Math.min(per100, 8) * 0.11);
	const detail = found.length > 0
		? `Found stock phrasing that AI writing leans on, like "${found.join('", "')}".`
		: "No stock phrasing of the kind AI writing tends to repeat.";
	return { key: "phrasing", label: "Stock phrasing", aiNess, detail };
}

// Em and en dashes show up heavily in AI prose. Referenced by code point so no
// banned dash glyph sits in the source.
function readPunctuation(raw: string, wordCount: number): FeatureReading {
	const dashes = new Set([0x2014, 0x2013]);
	let count = 0;
	for (let i = 0; i < raw.length; i++) {
		if (dashes.has(raw.charCodeAt(i))) count++;
	}
	const per100 = wordCount > 0 ? (count / wordCount) * 100 : 0;
	const aiNess = clamp01(0.40 + Math.min(per100, 6) * 0.10);
	const detail = count > 0
		? "Uses long dashes, a punctuation habit common in AI writing."
		: "No long dashes.";
	return { key: "punctuation", label: "Punctuation habits", aiNess, detail };
}

function readOpeners(p: ParsedText): FeatureReading {
	if (p.sentences.length < 3) {
		return { key: "openers", label: "Sentence openers", aiNess: 0.5, detail: "Not enough sentences to read the openers.", abstain: true };
	}
	const transitions = ["moreover", "furthermore", "additionally", "however", "consequently", "overall", "ultimately", "importantly", "notably", "indeed"];
	const firstWords: Record<string, number> = {};
	let formulaic = 0;
	for (const s of p.sentences) {
		const lower = s.toLowerCase();
		const m = lower.match(/[\p{L}\p{N}']+/u);
		const first = m ? m[0] : "";
		if (first) firstWords[first] = (firstWords[first] ?? 0) + 1;
		for (const t of transitions) {
			if (lower.startsWith(t)) {
				formulaic++;
				break;
			}
		}
	}
	const counts = Object.values(firstWords);
	const topRepeat = counts.length > 0 ? Math.max(...counts) : 0;
	const n = p.sentences.length;
	const repeatRate = (topRepeat - 1) / n;
	const formulaicRate = formulaic / n;
	const aiNess = clamp01(0.36 + formulaicRate * 1.2 + repeatRate * 0.5);
	const detail = aiNess > 0.55
		? "Sentences tend to start the same way or lean on the same linking words."
		: "Sentence openers are varied.";
	return { key: "openers", label: "Sentence openers", aiNess, detail };
}

// Runs the linguistic features, blends them into a 0..100 likelihood, and
// returns the read with its reasoning and caveats. Pure and deterministic.
export function detect(text: string): DetectionResult {
	const p = parseText(text);
	const wordCount = p.wordCount;

	if (wordCount < Detect.MinWords) {
		return {
			tooShort: true,
			wordCount,
			likelihood: 0,
			band: "mixed",
			confidence: "low",
			signals: [],
			caveats: [ShortInput]
		};
	}

	const weighted = [
		{ r: readRhythm(p), w: 0.18 },
		{ r: readPhrasing(p, text), w: 0.44 },
		{ r: readPunctuation(text, wordCount), w: 0.12 },
		{ r: readOpeners(p), w: 0.26 }
	];

	const active = weighted.filter(x => !x.r.abstain);
	const totalW = active.reduce((sum, x) => sum + x.w, 0);
	const aiNess = totalW > 0
		? active.reduce((sum, x) => sum + x.r.aiNess * x.w, 0) / totalW
		: 0.5;
	const likelihood = Math.round(clamp01(aiNess) * 100);

	const signals: DetectionSignal[] = weighted.map(({ r }) => {
		const lean = r.aiNess - 0.5;
		let direction: Direction = "neutral";
		if (!r.abstain && lean > 0) direction = "ai";
		else if (!r.abstain && lean < 0) direction = "human";
		return {
			key: r.key,
			label: r.label,
			detail: r.detail,
			direction,
			strength: r.abstain ? 0 : Math.min(Math.abs(lean) * 2, 1)
		};
	});

	const band: Band = likelihood < Detect.HumanBelow
		? "human"
		: likelihood >= Detect.AiAtOrAbove
			? "ai"
			: "mixed";

	let confidence: Confidence = "low";
	if (wordCount >= Detect.HighConfidenceWords) confidence = "high";
	else if (wordCount >= Detect.MediumConfidenceWords) confidence = "medium";

	const aiStrong = signals.some(s => s.direction === "ai" && s.strength > 0.5);
	const humanStrong = signals.some(s => s.direction === "human" && s.strength > 0.5);
	if (aiStrong && humanStrong) {
		confidence = confidence === "high" ? "medium" : "low";
	}

	const caveats = [NotAVerdict, BiasWarning];
	if (wordCount < Detect.MediumConfidenceWords) caveats.push(StillShort);

	return { tooShort: false, wordCount, likelihood, band, confidence, signals, caveats };
}
