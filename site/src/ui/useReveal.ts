import { useCallback, useRef, useState } from 'react';
import type { CSSProperties } from 'react';

export type RevealFrom = 'bottom' | 'top' | 'left' | 'right' | 'auto';

export interface RevealOptions {
	// Where the element animates in from. 'auto' (default) uses the current
	// scroll direction: scrolling down reveals from the bottom, up from the top.
	from?: RevealFrom;
	distance?: number;
	delay?: number;
	once?: boolean;
	threshold?: number;
}

// One shared scroll-direction tracker for the whole app (drives 'auto').
let scrollDir: 'down' | 'up' = 'down';
if (typeof window !== 'undefined') {
	let lastY = window.scrollY;
	window.addEventListener(
		'scroll',
		() => {
			const y = window.scrollY;
			if (Math.abs(y - lastY) > 2) {
				scrollDir = y > lastY ? 'down' : 'up';
				lastY = y;
			}
		},
		{ passive: true }
	);
}

function offsetFor(from: RevealFrom, distance: number): string {
	const dir = from === 'auto' ? (scrollDir === 'up' ? 'top' : 'bottom') : from;
	if (dir === 'top') return `translateY(-${distance}px)`;
	if (dir === 'left') return `translateX(-${distance}px)`;
	if (dir === 'right') return `translateX(${distance}px)`;
	return `translateY(${distance}px)`;
}

// Reveal-on-appear. Returns a callback ref (assignable to any element) plus the
// inline style to spread on it. The element fades and slides into place the
// first time it enters the viewport, from the scroll direction by default, so
// the page assembles smoothly instead of popping in. Reduced motion shows it at
// once with no transform. Transform and opacity only, to hold the frame budget.
export function useReveal({ from = 'auto', distance = 16, delay = 0, once = true, threshold = 0.15 }: RevealOptions = {}) {
	const [shown, setShown] = useState(false);
	const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	const obs = useRef<IntersectionObserver | null>(null);

	const ref = useCallback(
		(node: HTMLElement | null) => {
			obs.current?.disconnect();
			obs.current = null;
			if (reduce) {
				setShown(true);
				return;
			}
			if (!node) return;
			const observer = new IntersectionObserver(
				entries => {
					for (const entry of entries) {
						if (entry.isIntersecting) {
							setShown(true);
							if (once) observer.disconnect();
						} else if (!once) {
							setShown(false);
						}
					}
				},
				{ threshold }
			);
			observer.observe(node);
			obs.current = observer;
		},
		[reduce, once, threshold]
	);

	const style: CSSProperties | undefined = reduce
		? undefined
		: {
			opacity: shown ? 1 : 0,
			transform: shown ? 'none' : offsetFor(from, distance),
			transition: `opacity 260ms ease-out ${delay}ms, transform 260ms ease-out ${delay}ms`,
			willChange: shown ? undefined : 'opacity, transform',
		};

	return { ref, style };
}
