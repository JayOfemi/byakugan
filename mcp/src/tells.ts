import { AiTellPhrases } from "./aiTells.js";

export type TellType = "stock-phrase" | "long-dash" | "formulaic-opener";

export interface Tell {
	type: TellType;
	start: number;
	end: number;
	text: string;
	note: string;
}

const OpenerTransitions = ["moreover", "furthermore", "additionally", "however", "consequently", "overall", "ultimately", "importantly", "notably", "indeed"];

function escapeRegex(s: string): string {
	return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Locates the exact character spans that read as AI: stock phrasing, long (em
// or en) dashes, and formulaic sentence openers. Deterministic; gives a model
// precise targets to rephrase rather than a vague judgement.
export function findTells(text: string): Tell[] {
	const tells: Tell[] = [];

	for (const phrase of AiTellPhrases) {
		const pattern = new RegExp("\\b" + escapeRegex(phrase), "gi");
		let m: RegExpExecArray | null;
		while ((m = pattern.exec(text)) !== null) {
			tells.push({ type: "stock-phrase", start: m.index, end: m.index + m[0].length, text: m[0], note: "Stock phrasing that AI writing overuses." });
			if (m.index === pattern.lastIndex) pattern.lastIndex++;
		}
	}

	for (let i = 0; i < text.length; i++) {
		const c = text.charCodeAt(i);
		if (c === 0x2014 || c === 0x2013) {
			tells.push({ type: "long-dash", start: i, end: i + 1, text: text[i], note: "A long dash, common in AI writing." });
		}
	}

	const openerPattern = new RegExp("(?:^|[.!?]\\s+)(" + OpenerTransitions.join("|") + ")\\b", "gi");
	let om: RegExpExecArray | null;
	while ((om = openerPattern.exec(text)) !== null) {
		const word = om[1];
		const start = om.index + om[0].length - word.length;
		tells.push({ type: "formulaic-opener", start, end: start + word.length, text: word, note: "A formulaic sentence opener common in AI writing." });
	}

	tells.sort((a, b) => a.start - b.start);
	return tells;
}
