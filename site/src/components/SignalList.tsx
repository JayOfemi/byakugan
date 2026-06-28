import type { Direction, DetectionSignal } from '../lib/detect/types';
import { useReveal } from '../ui/useReveal';

interface Props {
	signals: DetectionSignal[];
}

const chipClass: Record<Direction, string> = {
	ai: 'bg-rose-500/10 text-rose-700 dark:text-rose-400',
	human: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
	neutral: 'bg-neutral-500/10 text-neutral-600 dark:text-neutral-400'
};

const chipLabel: Record<Direction, string> = {
	ai: 'leans AI',
	human: 'leans human',
	neutral: 'no clear signal'
};

// Each row reveals on appear with a small stagger, so the read assembles row by
// row rather than popping in all at once.
function SignalRow({ signal, index }: { signal: DetectionSignal; index: number }) {
	const { ref, style } = useReveal({ delay: index * 55 });
	return (
		<li ref={ref} style={style} className="rounded-xl border border-[var(--surface-border)] bg-[var(--surface)] p-3.5 shadow-[var(--shadow-1)]">
			<div className="flex items-center justify-between gap-3">
				<span className="font-medium">{signal.label}</span>
				<span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${chipClass[signal.direction]}`}>
					{chipLabel[signal.direction]}
				</span>
			</div>
			<p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{signal.detail}</p>
		</li>
	);
}

export default function SignalList({ signals }: Props) {
	return (
		<ul className="space-y-3">
			{signals.map((s, i) => (
				<SignalRow key={s.key} signal={s} index={i} />
			))}
		</ul>
	);
}
