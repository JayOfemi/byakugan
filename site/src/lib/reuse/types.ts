// A passage of the input that also appears in one of the reference documents.
// start/end are character offsets into the input text.
export interface OverlapPassage {
	start: number;
	end: number;
	text: string;
}

export interface OverlapResult {
	// 0..1 share of the input's words that sit inside a shared passage.
	overlapRatio: number;
	matchedWords: number;
	totalWords: number;
	passages: OverlapPassage[];
}
