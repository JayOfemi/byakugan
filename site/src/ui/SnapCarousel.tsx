import type { ReactNode } from 'react';

interface Props {
	children: ReactNode;
	className?: string;
}

// A horizontal scroll-snap row with peek padding: a second scroll axis without a
// library, so a designed horizontal scroll moment is trivial instead of bespoke
// per app. Snapping is layout, not
// animation, so it is reduced-motion safe. Children should carry snap-start and
// their own width (for example w-72 shrink-0 snap-start).
export default function SnapCarousel({ children, className = '' }: Props) {
	return (
		<div className={`flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-6 px-6 pb-4 accent-scroll ${className}`}>
			{children}
		</div>
	);
}
