// The shape of an on-device detection read. This is deliberately a likelihood
// plus its reasoning, never a binary verdict. Every field is meant to be shown
// to the user so the number is explainable, not a black box.

export type Band = 'human' | 'mixed' | 'ai';
export type Confidence = 'low' | 'medium' | 'high';
export type Direction = 'ai' | 'human' | 'neutral';

export interface DetectionSignal {
	key: string;
	label: string;
	detail: string;
	direction: Direction;
	// 0..1, how strongly this signal leans in its direction.
	strength: number;
}

export interface DetectionResult {
	// True when the input is too short to read fairly. When set, the caller
	// shows the message in caveats[0] and ignores likelihood/band.
	tooShort: boolean;
	wordCount: number;
	// 0..100, higher reads more AI-like.
	likelihood: number;
	band: Band;
	confidence: Confidence;
	signals: DetectionSignal[];
	caveats: string[];
}
