import { useEffect, useRef } from 'react';

// Element-relative cursor glow. Sets --glow-x / --glow-y (px, relative to the
// element) and --glow-opacity on the ref'd element from a throttled pointer
// handler, so a child layer can paint a radial highlight that tracks the cursor.
// This adds a glow anchored to a real effect, in place of a decorative
// body::before wash.
// Disabled under prefers-reduced-motion.
export function useCursorGlow<T extends HTMLElement = HTMLDivElement>() {
	const ref = useRef<T>(null);

	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

		let raf = 0;
		const onMove = (e: PointerEvent) => {
			if (raf) return;
			raf = requestAnimationFrame(() => {
				raf = 0;
				const r = el.getBoundingClientRect();
				el.style.setProperty('--glow-x', `${(e.clientX - r.left).toFixed(1)}px`);
				el.style.setProperty('--glow-y', `${(e.clientY - r.top).toFixed(1)}px`);
			});
		};
		const onEnter = () => el.style.setProperty('--glow-opacity', '1');
		const onLeave = () => el.style.setProperty('--glow-opacity', '0');

		el.addEventListener('pointermove', onMove);
		el.addEventListener('pointerenter', onEnter);
		el.addEventListener('pointerleave', onLeave);
		return () => {
			el.removeEventListener('pointermove', onMove);
			el.removeEventListener('pointerenter', onEnter);
			el.removeEventListener('pointerleave', onLeave);
			if (raf) cancelAnimationFrame(raf);
		};
	}, []);

	return ref;
}
