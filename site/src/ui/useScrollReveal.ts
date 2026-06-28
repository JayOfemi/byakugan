import { useEffect, useRef, useState } from 'react';

// One-shot scroll reveal. Returns a ref plus whether the element has entered the
// viewport; the observer disconnects after the first intersection so back-scroll
// never re-triggers. Under prefers-reduced-motion it reveals immediately (static
// is the fallback). Pair with the .reveal / .is-in classes in ui.css, or drive
// your own transition from `shown`. For a staggered group, give each child its
// own hook (or one observer and a per-item delay) and vary the cadence per app.
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(threshold = 0.2) {
	const ref = useRef<T>(null);
	const [shown, setShown] = useState(false);

	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
			setShown(true);
			return;
		}
		const obs = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setShown(true);
					obs.disconnect();
				}
			},
			{ threshold }
		);
		obs.observe(el);
		return () => obs.disconnect();
	}, [threshold]);

	return { ref, shown };
}
