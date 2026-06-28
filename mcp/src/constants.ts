// MCP server display name, the public product brand. The repo and codename stay
// "byakugan"; the product surface is "ai-checker".
export const SERVER_NAME = "ai-checker";
export const SERVER_VERSION = "1.0.0";

export const Detect = {
	// Below this many words there is too little signal to give a fair read.
	MinWords: 40,
	MediumConfidenceWords: 120,
	HighConfidenceWords: 300,
	// Likelihood band cutoffs on the 0..100 scale (calibrated 2026-06-27
	// against a labeled human/AI sample set; symmetric around the midpoint).
	HumanBelow: 42,
	AiAtOrAbove: 58
} as const;

export const Reuse = {
	// k-word shingle length. 5 catches real reused passages without firing on
	// everyday short phrases.
	ShingleSize: 5
} as const;
