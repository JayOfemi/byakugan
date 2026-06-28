import { useEffect, useRef, useState } from 'react';
import type { GrammarIssue } from '../lib/grammar/types';
import { ElevationCard } from '../ui';

interface Props {
	ran: boolean;
	loading: boolean;
	error: string | null;
	issues: GrammarIssue[];
	fixedText: string | null;
	onCheck: () => void;
	onFixAll: () => void;
	onReplace: () => void;
	onDismissFix: () => void;
}

export default function GrammarPanel({ ran, loading, error, issues, fixedText, onCheck, onFixAll, onReplace, onDismissFix }: Props) {
	const fixableCount = issues.filter(i => i.suggestions.length > 0).length;
	const [copied, setCopied] = useState(false);
	const revisedRef = useRef<HTMLDivElement>(null);

	// Bring the revised text into view when a fix is produced.
	useEffect(() => {
		if (fixedText !== null) {
			const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
			revisedRef.current?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
		}
	}, [fixedText]);

	function onCopy() {
		if (fixedText === null) return;
		navigator.clipboard?.writeText(fixedText).then(() => {
			setCopied(true);
			window.setTimeout(() => setCopied(false), 1500);
		});
	}

	return (
		<ElevationCard level={2} radius="lg" className="p-5 sm:p-6">
			<div className="flex items-center justify-between gap-3">
				<h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">Grammar</h2>
				{ran && !loading && fixableCount > 0 && fixedText === null && (
					<button onClick={onFixAll} className="btn btn-primary">Fix all</button>
				)}
			</div>

			{!ran && !loading && !error && (
				<div className="mt-3">
					<button onClick={onCheck} className="btn btn-ghost">Check grammar</button>
					<p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">Runs a grammar checker on your device. The first run downloads it once.</p>
				</div>
			)}

			{loading && <p className="mt-3 text-sm text-neutral-500 dark:text-neutral-400">Loading the grammar checker...</p>}

			{error && (
				<div className="mt-3">
					<p className="text-sm text-rose-700 dark:text-rose-400">{error}</p>
					<button onClick={onCheck} className="btn btn-ghost mt-2">Try again</button>
				</div>
			)}

			{ran && !loading && !error && issues.length === 0 && (
				<p className="mt-3 text-sm text-emerald-700 dark:text-emerald-400">No grammar issues found.</p>
			)}

			{ran && !loading && issues.length > 0 && (
				<ul className="mt-4 space-y-3">
					{issues.map((issue, i) => (
						<li key={i} className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-800">
							<div className="flex items-center justify-between gap-3">
								<span className="font-medium">{issue.message}</span>
								<span className="shrink-0 rounded-full bg-neutral-500/10 px-2 py-0.5 text-xs font-medium text-neutral-500 dark:text-neutral-400">{issue.kind}</span>
							</div>
							{issue.problemText && (
								<p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
									<span className="line-through">{issue.problemText}</span>
									{issue.suggestions.length > 0 && (
										<span className="text-emerald-700 dark:text-emerald-400"> {issue.suggestions[0] ? `becomes "${issue.suggestions[0]}"` : 'should be removed'}</span>
									)}
								</p>
							)}
						</li>
					))}
				</ul>
			)}

			{/* The fix is shown here as a new copy. The original input is never
			    overwritten, so nothing the user typed is lost. */}
			{fixedText !== null && (
				<div ref={revisedRef} className="mt-4 scroll-mt-8 border-t border-neutral-200/70 pt-4 dark:border-neutral-800/70">
					<div className="flex items-center justify-between gap-3">
						<h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Revised text</h3>
						<button onClick={onDismissFix} className="text-sm font-medium text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200">Dismiss</button>
					</div>
					<p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Your original text above is untouched. Copy this version, or replace your text with it.</p>
					<label htmlFor="grammar-revised" className="sr-only">Revised text</label>
					<textarea id="grammar-revised" readOnly value={fixedText} className="field accent-scroll mt-3 h-40 resize-y" />
					<div className="mt-3 flex gap-2">
						<button onClick={onCopy} className="btn btn-ghost">{copied ? 'Copied' : 'Copy'}</button>
						<button onClick={onReplace} className="btn btn-primary">Replace my text</button>
					</div>
				</div>
			)}
		</ElevationCard>
	);
}
