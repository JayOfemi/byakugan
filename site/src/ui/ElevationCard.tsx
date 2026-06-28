import type { ReactNode, ElementType, Ref } from 'react';
import { useReveal, type RevealFrom } from './useReveal';

interface Props {
	children: ReactNode;
	as?: ElementType;
	// Depth step. Offset and blur grow with the level; the shadow is tinted to
	// the surface, never pure black (see ui.css).
	level?: 1 | 2 | 3;
	radius?: 'sm' | 'md' | 'lg';
	// Opt in to the frosted-glass material. Reserve it for a genuine over-content
	// layer (a modal over a busy page), not the resting surface of every tile.
	glass?: boolean;
	// Reveal on appear (default on, scroll-direction aware). Set reveal={false}
	// for a card that should not animate; from / revealDelay tune it.
	reveal?: boolean;
	from?: RevealFrom;
	revealDelay?: number;
	className?: string;
}

const SHADOW: Record<1 | 2 | 3, string> = {
	1: 'shadow-[var(--shadow-1)]',
	2: 'shadow-[var(--shadow-2)]',
	3: 'shadow-[var(--shadow-3)]',
};

const RADIUS: Record<'sm' | 'md' | 'lg', string> = {
	sm: 'rounded-lg',
	md: 'rounded-xl',
	lg: 'rounded-2xl',
};

// The default family surface. Depth comes from layered, surface-tinted shadows
// on one light source, not from glass on
// everything, and it reveals smoothly as it enters view. Vary level and radius
// by role so the page is not one uniform blob.
export default function ElevationCard({ children, as, level = 1, radius = 'md', glass = false, reveal = true, from = 'auto', revealDelay = 0, className = '' }: Props) {
	const Tag = (as ?? 'div') as ElementType;
	const { ref, style } = useReveal({ from, delay: revealDelay });
	const surface = glass ? 'glass' : 'bg-[var(--surface)] border border-[var(--surface-border)]';
	return (
		<Tag
			ref={reveal ? (ref as Ref<HTMLElement>) : undefined}
			style={reveal ? style : undefined}
			className={`${RADIUS[radius]} ${surface} ${SHADOW[level]} ${className}`}
		>
			{children}
		</Tag>
	);
}
