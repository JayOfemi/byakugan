import { Constants } from '../Constants';

// Wraps a small RoBERTa AI-text classifier (ONNX) run in-browser via
// transformers.js. Loaded lazily on request, like the grammar engine, so the
// instant heuristic check stays a zero-download default. The model weights
// download to the device; the user's text is classified locally and never sent.
class ModelDetectorClass {
	private pipe: any = null;
	private setupPromise: Promise<void> | null = null;

	private async doSetup(): Promise<void> {
		const transformers: any = await import('@huggingface/transformers');
		// Force remote-only so it does not probe for a local model path first.
		transformers.env.allowLocalModels = false;
		this.pipe = await transformers.pipeline('text-classification', Constants.Model.Id, { dtype: Constants.Model.Dtype });
	}

	private async ensure(): Promise<void> {
		if (this.pipe) return;
		if (!this.setupPromise) this.setupPromise = this.doSetup();
		try {
			await this.setupPromise;
		} catch (e) {
			this.setupPromise = null;
			throw e;
		}
	}

	// P(AI) in 0..1, averaged over word-bounded chunks since RoBERTa caps near
	// 512 tokens. Long text samples its opening chunks rather than all of it.
	async aiProbability(text: string): Promise<number> {
		await this.ensure();
		const chunks = chunkText(text, Constants.Model.MaxCharsPerChunk, Constants.Model.MaxChunks);
		if (chunks.length === 0) return 0.5;
		let sum = 0;
		for (const chunk of chunks) {
			// Default returns the top label; aiScore derives P(AI) from it.
			const out = await this.pipe(chunk);
			sum += aiScore(out);
		}
		return sum / chunks.length;
	}
}

// The model labels are "Fake" (machine) and "Real" (human). Pull the machine
// probability whichever label the runtime returns first.
function aiScore(out: unknown): number {
	const arr = Array.isArray(out) ? out : [out];
	for (const item of arr) {
		const o = item as { label?: unknown; score?: unknown };
		const label = String(o.label ?? '');
		const score = typeof o.score === 'number' ? o.score : 0;
		if (/fake|label_0/i.test(label)) return score;
		if (/real|label_1/i.test(label)) return 1 - score;
	}
	return 0.5;
}

function chunkText(text: string, maxChars: number, maxChunks: number): string[] {
	const trimmed = text.trim();
	if (!trimmed) return [];
	if (trimmed.length <= maxChars) return [trimmed];
	const chunks: string[] = [];
	let i = 0;
	while (i < trimmed.length && chunks.length < maxChunks) {
		let end = Math.min(i + maxChars, trimmed.length);
		if (end < trimmed.length) {
			const lastSpace = trimmed.lastIndexOf(' ', end);
			if (lastSpace > i) end = lastSpace;
		}
		chunks.push(trimmed.slice(i, end).trim());
		i = end;
	}
	return chunks;
}

export const ModelDetector = new ModelDetectorClass();
