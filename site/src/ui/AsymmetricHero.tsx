import type { ReactNode } from 'react';

type Variant = 'asymmetric' | 'split' | 'type-first' | 'problem-solution';

interface Props {
	variant?: Variant;
	// The big type. For type-first this is the whole composition.
	headline: ReactNode;
	// Sub-copy, CTAs, eyebrow, whatever supports the headline.
	supporting?: ReactNode;
	// A real product view or scene. Omitted by type-first.
	visual?: ReactNode;
	// Full Tailwind class strings (responsive prefixes included) for the two
	// columns in the asymmetric variant. Set these per app so siblings do not
	// share one silhouette; the defaults are a starting shape, not the shape.
	textClass?: string;
	visualClass?: string;
	className?: string;
}

// First-viewport scaffold that gives the fold a composed scene instead of the
// centered logo-subhead-button stack.
// Pick a variant by content and break the center axis. The asymmetric column
// spans are props on purpose: vary them per app so the component cannot
// manufacture one house layout.
export default function AsymmetricHero({
	variant = 'asymmetric',
	headline,
	supporting,
	visual,
	textClass = 'col-span-12 md:col-span-7 md:col-start-1',
	visualClass = 'col-span-12 md:col-span-5 md:col-start-8 md:mt-16',
	className = '',
}: Props) {
	if (variant === 'type-first') {
		return (
			<section className={`flex min-h-[70vh] items-end ${className}`}>
				<div className="w-full">
					{headline}
					{supporting}
				</div>
			</section>
		);
	}

	if (variant === 'split') {
		return (
			<section className={`grid min-h-[80vh] items-center gap-10 md:grid-cols-2 ${className}`}>
				<div>
					{headline}
					{supporting}
				</div>
				<div>{visual}</div>
			</section>
		);
	}

	if (variant === 'problem-solution') {
		return (
			<section className={`grid gap-10 md:grid-cols-12 ${className}`}>
				<div className="md:col-span-6 md:col-start-1">
					{headline}
					{supporting}
				</div>
				<div className="md:col-span-5 md:col-start-8 md:mt-28">{visual}</div>
			</section>
		);
	}

	// asymmetric (default): offset 12-col split, type and visual on different rows.
	return (
		<section className={`grid grid-cols-12 gap-10 ${className}`}>
			<div className={textClass}>
				{headline}
				{supporting}
			</div>
			{visual && <div className={visualClass}>{visual}</div>}
		</section>
	);
}
