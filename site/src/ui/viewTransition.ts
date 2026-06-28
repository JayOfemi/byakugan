// Same-document View Transitions helper. Wraps a state update in a native
// crossfade when the API is supported and motion is allowed; otherwise it just
// runs the update. Zero dependencies, no motion library.
type WithViewTransition = Document & {
	startViewTransition?: (callback: () => void) => unknown;
};

export function withViewTransition(update: () => void): void {
	const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	const doc = document as WithViewTransition;
	if (reduce || typeof doc.startViewTransition !== 'function') {
		update();
		return;
	}
	doc.startViewTransition(update);
}
