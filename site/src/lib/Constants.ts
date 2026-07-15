export const Constants = {
	Product: {
		// The public product brand shown across the site.
		Name: 'AI Checker',
		Domain: 'aichecker.jayofemi.com',
		Version: '1.0.2',
		Tagline: 'Check whether your writing reads as AI, privately.',
		// The one canonical privacy line. Reuse this verbatim wherever the
		// promise appears so it never drifts into several wordings.
		Privacy: 'Your text never leaves this page.'
	},
	Links: {
		GitHub: 'https://github.com/JayOfemi/byakugan'
	},
	Detect: {
		// Below this many words there is too little signal to give a fair read.
		MinWords: 40,
		// Word counts where the read gets steadier.
		MediumConfidenceWords: 120,
		HighConfidenceWords: 300,
		// Likelihood band cutoffs on the 0..100 scale (calibrated 2026-06-27
		// against a labeled human/AI sample set; symmetric around the midpoint).
		HumanBelow: 42,
		AiAtOrAbove: 58
	},
	Reuse: {
		// k-word shingle length. 5 catches real reused passages without firing
		// on everyday short phrases.
		ShingleSize: 5
	},
	Model: {
		// Small RoBERTa AI-text classifier (ONNX) run in-browser via
		// transformers.js. Trained on older (GPT-2 era) text, so it is a second
		// opinion, not authoritative.
		Id: 'onnx-community/roberta-base-openai-detector-ONNX',
		Dtype: 'q8',
		MaxCharsPerChunk: 1200,
		MaxChunks: 6,
		// How much the model counts against the heuristic when both are present.
		Weight: 0.6
	},
	Ui: {
		// Length of the check animation before the result appears, in ms. Paced so
		// the eye opens first, then the veins and scan play out (see index.css).
		ScanMs: 2200
	}
} as const;
