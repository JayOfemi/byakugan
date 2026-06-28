// Calibration harness for the AI-text detector. Replicates the feature logic
// with the formula constants pulled out as P, runs a labeled sample set, and
// prints where each lands. Tune P, re-run, until AI reads high and human reads
// low. Then port P back into site + mcp.

const P = {
	weights: { rhythm: 0.18, phrasing: 0.44, punct: 0.12, openers: 0.26 },
	rhythm: { lo: 0.10, span: 0.62 },
	phrasing: { base: 0.30, slope: 0.11, cap: 8 },
	punct: { base: 0.40, slope: 0.10, cap: 6 },
	openers: { base: 0.36, formulaic: 1.2, repeat: 0.5 },
	band: { humanBelow: 42, aiAtOrAbove: 58 },
};

const AiTellPhrases = [
	"delve", "delving into", "a rich tapestry", "testament to", "underscore",
	"navigate the complexities", "in today's world", "in the realm of",
	"ever-evolving", "ever-changing", "it is important to note", "it's important to note",
	"it is worth noting", "a myriad of", "a plethora of", "seamless", "leveraging",
	"a game-changer", "cutting-edge", "at the end of the day", "when it comes to",
	"first and foremost", "last but not least", "in conclusion", "to sum up",
	"holistic approach", "unlock the", "embark on", "pivotal role",
	"plays a crucial role", "plays a vital role", "meticulous", "a beacon of"
];

const WordPattern = /[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu;
const wordsIn = (t) => t.match(WordPattern) ?? [];
const splitSentences = (t) => t.split(/(?<=[.!?])\s+/).map(s => s.trim()).filter(Boolean);
const clamp01 = (n) => n < 0 ? 0 : n > 1 ? 1 : n;
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function readRhythm(sentences) {
	const lengths = sentences.map(s => wordsIn(s).length).filter(n => n > 0);
	if (lengths.length < 2) return { aiNess: 0.5, abstain: true };
	const mean = lengths.reduce((a, b) => a + b, 0) / lengths.length;
	const variance = lengths.reduce((a, b) => a + (b - mean) ** 2, 0) / lengths.length;
	const cv = mean > 0 ? Math.sqrt(variance) / mean : 0;
	return { aiNess: clamp01(1 - (cv - P.rhythm.lo) / P.rhythm.span) };
}

function readPhrasing(raw, wordCount) {
	const lower = raw.toLowerCase();
	let hits = 0;
	for (const phrase of AiTellPhrases) {
		if (new RegExp("\\b" + escapeRe(phrase), "i").test(lower)) hits++;
	}
	const per100 = wordCount > 0 ? (hits / wordCount) * 100 : 0;
	return { aiNess: clamp01(P.phrasing.base + Math.min(per100, P.phrasing.cap) * P.phrasing.slope), hits };
}

function readPunctuation(raw, wordCount) {
	let count = 0;
	for (let i = 0; i < raw.length; i++) {
		const c = raw.charCodeAt(i);
		if (c === 0x2014 || c === 0x2013) count++;
	}
	const per100 = wordCount > 0 ? (count / wordCount) * 100 : 0;
	return { aiNess: clamp01(P.punct.base + Math.min(per100, P.punct.cap) * P.punct.slope) };
}

function readOpeners(sentences) {
	if (sentences.length < 3) return { aiNess: 0.5, abstain: true };
	const transitions = ["moreover", "furthermore", "additionally", "however", "consequently", "overall", "ultimately", "importantly", "notably", "indeed"];
	const firstWords = {};
	let formulaic = 0;
	for (const s of sentences) {
		const lower = s.toLowerCase();
		const m = lower.match(/[\p{L}\p{N}']+/u);
		const first = m ? m[0] : "";
		if (first) firstWords[first] = (firstWords[first] ?? 0) + 1;
		for (const t of transitions) { if (lower.startsWith(t)) { formulaic++; break; } }
	}
	const counts = Object.values(firstWords);
	const topRepeat = counts.length > 0 ? Math.max(...counts) : 0;
	const n = sentences.length;
	const repeatRate = (topRepeat - 1) / n;
	const formulaicRate = formulaic / n;
	return { aiNess: clamp01(P.openers.base + formulaicRate * P.openers.formulaic + repeatRate * P.openers.repeat) };
}

function detect(text) {
	const sentences = splitSentences(text);
	const wordCount = wordsIn(text).length;
	const r = [
		{ a: readRhythm(sentences), w: P.weights.rhythm },
		{ a: readPhrasing(text, wordCount), w: P.weights.phrasing },
		{ a: readPunctuation(text, wordCount), w: P.weights.punct },
		{ a: readOpeners(sentences), w: P.weights.openers },
	];
	const active = r.filter(x => !x.a.abstain);
	const totalW = active.reduce((s, x) => s + x.w, 0);
	const aiNess = totalW > 0 ? active.reduce((s, x) => s + x.a.aiNess * x.w, 0) / totalW : 0.5;
	const likelihood = Math.round(clamp01(aiNess) * 100);
	const band = likelihood < P.band.humanBelow ? "human" : likelihood >= P.band.aiAtOrAbove ? "ai" : "mixed";
	return { likelihood, band, parts: r.map(x => x.a.aiNess.toFixed(2)) };
}

const ai = [
	"In today's world, artificial intelligence is fundamentally reshaping the way we live and work. From healthcare to finance, organizations are leveraging cutting-edge technologies to unlock unprecedented value. Moreover, these tools empower teams to navigate the complexities of a rapidly evolving landscape. It is important to note that, at the end of the day, success hinges on a holistic approach. As we embark on this transformative journey, one thing remains clear, the future is bright and the possibilities are truly endless.",
	"The concept of sustainability has become a pivotal cornerstone of modern society. Furthermore, it plays a crucial role in shaping policies across every sector. Businesses, governments, and individuals alike must work together to foster meaningful change. Indeed, a myriad of challenges remain, yet the opportunities are equally vast. Ultimately, by embracing innovation and collaboration, we can build a more resilient and equitable world for generations to come.",
	"Our platform delivers a seamless, end-to-end experience designed to meet the needs of today's demanding users. By harnessing the power of data, we provide actionable insights that drive real results. First and foremost, we prioritize security and transparency at every step. Whether you are a small startup or a global enterprise, our solution scales effortlessly to support your growth. Simply put, we are committed to helping you succeed in an ever-changing digital landscape.",
	"Throughout history, great civilizations have risen and fallen, leaving behind a rich tapestry of culture and achievement. Each era serves as a testament to human ingenuity and resilience. When it comes to understanding the past, it is worth noting that context is everything. From the bustling markets of ancient Rome to the meticulous craftsmanship of the Renaissance, these moments continue to inspire us. In conclusion, the lessons of history remain as relevant today as they were centuries ago.",
	"Success is not merely a destination but a continuous journey of growth and self-discovery. To unlock your full potential, you must first embrace the challenges that lie ahead. Additionally, surrounding yourself with positive influences plays a vital role in your development. Remember, every setback is simply an opportunity in disguise. As you embark on this path, stay focused, stay determined, and never lose sight of your goals. The power to transform your life lies within you.",
];

const human = [
	"I burned the rice again. Third time this week. My roommate keeps telling me to just use the rice cooker, but there's something stubborn in me that wants to do it on the stove like my grandmother did, even though hers always came out perfect and mine comes out like little rocks. Maybe next time. Probably not.",
	"Honestly I don't get the hype around that show. Everyone at work won't shut up about it. I watched two episodes and the whole time I just kept thinking about how nobody actually talks like that. Great costumes though. The costumes were genuinely incredible, I'll give it that much, but I'm not going back for a third try.",
	"The bug turned out to be a race condition, of course it did. Two requests hitting the same cache key, one writing while the other read a half-baked value. Took me four hours and an embarrassing amount of console logging to find it. Fixed in one line. That is always how these things go, somehow.",
	"The lake was dead still that morning. Not a ripple. My dad cut the engine and we just drifted for a while, neither of us saying much. He pointed at a heron standing in the shallows and we watched it not move for what felt like ten minutes. Then it stabbed the water and came up with a fish, and we both laughed.",
	"People keep asking me why I quit. The honest answer is boring. I wasn't burned out or chasing some big dream. I just woke up one Tuesday and realized I had stopped caring whether the thing shipped or not, and that scared me more than being broke would. So I left. No real regrets, most days.",
	"Decent coffee, terrible wifi, and the music was way too loud for a place that is supposedly built for working. I got maybe an hour of real work done before I gave up and just watched people instead. The barista was nice though, remembered my order from last time. I'll probably go back, which honestly says something about me.",
];

function run(label, set) {
	console.log(`\n=== ${label} ===`);
	for (const t of set) {
		const d = detect(t);
		console.log(`${String(d.likelihood).padStart(3)} ${d.band.padEnd(6)} [${d.parts.join(" ")}]  ${t.slice(0, 42)}...`);
	}
}

console.log("params:", JSON.stringify(P.band), JSON.stringify(P.weights));
run("AI (want high, >= 62)", ai);
run("HUMAN (want low, < 40)", human);
