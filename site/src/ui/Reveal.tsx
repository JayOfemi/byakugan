import type { ReactNode } from 'react';
import { useReveal, type RevealOptions } from './useReveal';

interface Props extends RevealOptions {
	children: ReactNode;
	className?: string;
}

// Drop-in wrapper that reveals its content on appear (see useReveal). Renders a
// div, so apply the grid/layout classes to it directly. For an element that must
// be a specific tag (a list item, a landmark), call useReveal and spread its
// { ref, style } onto that element instead of wrapping.
export default function Reveal({ children, className = '', ...opts }: Props) {
	const { ref, style } = useReveal(opts);
	return (
		<div ref={ref} className={className} style={style}>
			{children}
		</div>
	);
}
