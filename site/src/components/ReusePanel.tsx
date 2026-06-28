import { useState, useEffect } from 'react';
import { checkOverlap } from '../lib/reuse/reuse';
import type { OverlapResult } from '../lib/reuse/types';
import { ElevationCard } from '../ui';

interface Props {
	text: string;
}

export default function ReusePanel({ text }: Props) {
	const [references, setReferences] = useState<string[]>([]);
	const [draft, setDraft] = useState('');
	const [result, setResult] = useState<OverlapResult | null>(null);

	// The result is for the text as it was, so drop it when the text changes.
	useEffect(() => {
		setResult(null);
	}, [text]);

	function addReference() {
		const trimmed = draft.trim();
		if (!trimmed) return;
		setReferences(prev => [...prev, trimmed]);
		setDraft('');
		setResult(null);
	}

	function removeReference(index: number) {
		setReferences(prev => prev.filter((_, i) => i !== index));
		setResult(null);
	}

	function onCheck() {
		setResult(checkOverlap(text, references));
	}

	const percent = result ? Math.round(result.overlapRatio * 100) : 0;

	return (
		<ElevationCard level={2} radius="lg" className="p-5 sm:p-6">
			<h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">Reuse check</h2>
			<p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Compares your text against documents you add here, looking for reused passages. It does not search the web.</p>

			{references.length > 0 && (
				<ul className="mt-4 space-y-2">
					{references.map((ref, i) => (
						<li key={i} className="flex items-center justify-between gap-3 rounded-lg border border-neutral-200 px-3 py-2 dark:border-neutral-800">
							<span className="truncate text-sm text-neutral-600 dark:text-neutral-400">Reference {i + 1}: {ref.slice(0, 60)}{ref.length > 60 ? '...' : ''}</span>
							<button onClick={() => removeReference(i)} aria-label={`Remove reference ${i + 1}`} className="shrink-0 text-sm text-neutral-500 hover:text-rose-600 dark:text-neutral-400 dark:hover:text-rose-400">Remove</button>
						</li>
					))}
				</ul>
			)}

			<div className="mt-4">
				<label htmlFor="reference-input" className="sr-only">Paste a document to compare against</label>
				<textarea
					id="reference-input"
					value={draft}
					onChange={e => setDraft(e.target.value)}
					placeholder="Paste another of your documents to compare against."
					className="accent-scroll h-24 w-full resize-y rounded-xl border border-neutral-300 bg-white p-3 text-sm transition-colors placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none dark:border-neutral-700 dark:bg-neutral-950 dark:focus:border-neutral-300"
				/>
				<div className="mt-2 flex justify-between gap-2">
					<button onClick={addReference} disabled={!draft.trim()} className="btn btn-ghost">Add reference</button>
					<button onClick={onCheck} disabled={references.length === 0} className="btn btn-primary">Check reuse</button>
				</div>
			</div>

			{result && (
				<div className="mt-5">
					<p className="text-sm">
						<span className="font-semibold">{percent}%</span> of this text overlaps your references ({result.matchedWords} of {result.totalWords} words).
					</p>
					{result.passages.length === 0 ? (
						<p className="mt-2 text-sm text-emerald-700 dark:text-emerald-400">No reused passages found.</p>
					) : (
						<ul className="mt-3 space-y-2">
							{result.passages.map((p, i) => (
								<li key={i} className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-800 dark:text-amber-200">{p.text}</li>
							))}
						</ul>
					)}
				</div>
			)}
		</ElevationCard>
	);
}
