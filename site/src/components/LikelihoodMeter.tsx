import type { Band } from '../lib/detect/types';

interface Props {
	likelihood: number;
	band: Band;
}

const bandPhrase: Record<Band, string> = {
	human: 'Reads more like human writing',
	mixed: 'Reads like a mix of both',
	ai: 'Reads more like AI writing'
};

const fillColor: Record<Band, string> = {
	human: 'bg-emerald-500',
	mixed: 'bg-amber-500',
	ai: 'bg-rose-500'
};

const textColor: Record<Band, string> = {
	human: 'text-emerald-700 dark:text-emerald-400',
	mixed: 'text-amber-700 dark:text-amber-400',
	ai: 'text-rose-700 dark:text-rose-400'
};

export default function LikelihoodMeter({ likelihood, band }: Props) {
	return (
		<div>
			<div className="flex items-baseline justify-between gap-3">
				<span className={`text-3xl font-semibold ${textColor[band]}`}>{likelihood}% AI-like</span>
				<span className={`text-right text-sm font-medium ${textColor[band]}`}>{bandPhrase[band]}</span>
			</div>
			<div
				className="mt-3 h-3 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800"
				role="progressbar"
				aria-valuemin={0}
				aria-valuemax={100}
				aria-valuenow={likelihood}
				aria-label="How AI-like the text reads"
			>
				<div className={`meter-fill h-full rounded-full ${fillColor[band]}`} style={{ width: `${likelihood}%` }} />
			</div>
		</div>
	);
}
