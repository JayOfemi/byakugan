// One grammar problem found by the on-device checker. start/end are character
// offsets into the checked text; suggestions[0] is the first fix (an empty
// string means "remove this span").
export interface GrammarIssue {
	start: number;
	end: number;
	message: string;
	kind: string;
	problemText: string;
	suggestions: string[];
}
