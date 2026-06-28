import { Constants } from '../Constants';
import { parseText, readRhythm, readPhrasing, readPunctuation, readOpeners } from './features';
import type { Band, Confidence, DetectionResult, DetectionSignal, Direction } from './types';

// Honest framing the UI always shows. Detection is a directional signal, so
// these caveats ride along with every read.
const NotAVerdict = 'This is a probability. Treat it as a second opinion, and remember it can be wrong in both directions.';
const BiasWarning = 'Checkers like this one flag people who write English as a second language more often. A high score is not proof a person used AI.';
const StillShort = 'This is on the short side, so the read is shaky. More text gives a steadier result.';

function clamp01(n: number): number {
	if (n < 0) return 0;
	if (n > 1) return 1;
	return n;
}

// Runs the linguistic features, blends them into a 0..100 likelihood, and
// returns the read with its reasoning and caveats. Pure and synchronous; the
// model-backed signal will slot in behind this same shape later.
export function detect(text: string): DetectionResult {
	const p = parseText(text);
	const wordCount = p.wordCount;

	if (wordCount < Constants.Detect.MinWords) {
		const need = Constants.Detect.MinWords - wordCount;
		return {
			tooShort: true,
			wordCount,
			likelihood: 0,
			band: 'mixed',
			confidence: 'low',
			signals: [],
			caveats: [`This is ${wordCount} ${wordCount === 1 ? 'word' : 'words'}. The check needs at least ${Constants.Detect.MinWords} words, so add about ${need} more.`]
		};
	}

	const weighted = [
		{ r: readRhythm(p), w: 0.18 },
		{ r: readPhrasing(p, text), w: 0.44 },
		{ r: readPunctuation(text, wordCount), w: 0.12 },
		{ r: readOpeners(p), w: 0.26 }
	];

	// Features that abstain (no data) drop out of the blend and their weight is
	// redistributed, rather than counted as a real 0.5 reading.
	const active = weighted.filter(x => !x.r.abstain);
	const totalW = active.reduce((sum, x) => sum + x.w, 0);
	const aiNess = totalW > 0
		? active.reduce((sum, x) => sum + x.r.aiNess * x.w, 0) / totalW
		: 0.5;
	const likelihood = Math.round(clamp01(aiNess) * 100);

	const signals: DetectionSignal[] = weighted.map(({ r }) => {
		const lean = r.aiNess - 0.5;
		let direction: Direction = 'neutral';
		if (!r.abstain && lean > 0) direction = 'ai';
		else if (!r.abstain && lean < 0) direction = 'human';
		return {
			key: r.key,
			label: r.label,
			detail: r.detail,
			direction,
			strength: r.abstain ? 0 : Math.min(Math.abs(lean) * 2, 1)
		};
	});

	const band: Band = likelihood < Constants.Detect.HumanBelow
		? 'human'
		: likelihood >= Constants.Detect.AiAtOrAbove
			? 'ai'
			: 'mixed';

	let confidence: Confidence = 'low';
	if (wordCount >= Constants.Detect.HighConfidenceWords) confidence = 'high';
	else if (wordCount >= Constants.Detect.MediumConfidenceWords) confidence = 'medium';

	// If strong signals point both ways, the read is shakier, so step down.
	const aiStrong = signals.some(s => s.direction === 'ai' && s.strength > 0.5);
	const humanStrong = signals.some(s => s.direction === 'human' && s.strength > 0.5);
	if (aiStrong && humanStrong) {
		confidence = confidence === 'high' ? 'medium' : 'low';
	}

	const caveats = [NotAVerdict, BiasWarning];
	if (wordCount < Constants.Detect.MediumConfidenceWords) caveats.push(StillShort);

	return { tooShort: false, wordCount, likelihood, band, confidence, signals, caveats };
}

const ModelCaveat = 'The deeper check is based mostly on older AI writing, so it can miss text from newer AI. Treat it as one more opinion.';

// Folds a model probability (0..1, the chance the text is AI) into a heuristic
// result as a strong extra signal and re-blends the likelihood. Weighted toward
// the model, but not absolutely, since this detector is trained on older text.
export function combineWithModel(base: DetectionResult, aiProbability: number): DetectionResult {
	const lean = aiProbability - 0.5;
	const modelSignal: DetectionSignal = {
		key: 'model',
		label: 'Deeper check',
		detail: `The deeper check reads this as about ${Math.round(aiProbability * 100)}% likely AI.`,
		direction: lean > 0 ? 'ai' : lean < 0 ? 'human' : 'neutral',
		strength: Math.min(Math.abs(lean) * 2, 1)
	};
	const w = Constants.Model.Weight;
	const blended = aiProbability * w + (base.likelihood / 100) * (1 - w);
	const likelihood = Math.round(clamp01(blended) * 100);
	const band: Band = likelihood < Constants.Detect.HumanBelow
		? 'human'
		: likelihood >= Constants.Detect.AiAtOrAbove
			? 'ai'
			: 'mixed';
	return {
		...base,
		likelihood,
		band,
		signals: [...base.signals, modelSignal],
		caveats: [...base.caveats, ModelCaveat]
	};
}
