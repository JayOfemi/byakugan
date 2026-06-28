import { useRef, useState } from 'react';
import { detect, combineWithModel } from './lib/detect/detector';
import { wordsIn } from './lib/detect/features';
import { ModelDetector } from './lib/detect/model';
import type { DetectionResult, Direction } from './lib/detect/types';
import { GrammarChecker } from './lib/grammar/grammar';
import type { GrammarIssue } from './lib/grammar/types';
import { Constants } from './lib/Constants';
import { Logger } from './lib/Logger';
import PrivacyChip from './components/PrivacyChip';
import LikelihoodMeter from './components/LikelihoodMeter';
import SignalList from './components/SignalList';
import GrammarPanel from './components/GrammarPanel';
import ReusePanel from './components/ReusePanel';
import ByakuganScan from './components/ByakuganScan';
import ThemeToggle from './components/ThemeToggle';
import { AiExamples, randomExample } from './lib/samples';
import { ElevationCard, GrainOverlay, Reveal, useReveal } from './ui';

// A real read of an AI-leaning sample, shown in the hero so the page is built
// around the work (the read) rather than around an empty input box.
const EXAMPLE_READ = detect(AiExamples[0]);
const EXAMPLE_SIGNALS = [...EXAMPLE_READ.signals].sort((a, b) => b.strength - a.strength).slice(0, 2);

function chipClass(d: Direction): string {
	if (d === 'ai') return 'bg-rose-500/10 text-rose-700 dark:text-rose-400';
	if (d === 'human') return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400';
	return 'bg-neutral-500/10 text-neutral-600 dark:text-neutral-400';
}

function chipLabel(d: Direction): string {
	if (d === 'ai') return 'leans AI';
	if (d === 'human') return 'leans human';
	return 'no clear signal';
}

export default function App() {
	const [text, setText] = useState('');
	const [result, setResult] = useState<DetectionResult | null>(null);

	const [grammarRan, setGrammarRan] = useState(false);
	const [grammarLoading, setGrammarLoading] = useState(false);
	const [grammarError, setGrammarError] = useState<string | null>(null);
	const [grammarIssues, setGrammarIssues] = useState<GrammarIssue[]>([]);
	const [fixedText, setFixedText] = useState<string | null>(null);

	const [modelRan, setModelRan] = useState(false);
	const [modelLoading, setModelLoading] = useState(false);
	const [modelError, setModelError] = useState<string | null>(null);

	const [scanning, setScanning] = useState(false);
	const resultRef = useRef<HTMLDivElement>(null);
	const footerReveal = useReveal();

	const words = wordsIn(text).length;
	const minWords = Constants.Detect.MinWords;
	const canCheck = text.trim().length > 0;

	function resetGrammar() {
		setGrammarRan(false);
		setGrammarLoading(false);
		setGrammarError(null);
		setGrammarIssues([]);
		setFixedText(null);
	}

	function resetModel() {
		setModelRan(false);
		setModelLoading(false);
		setModelError(null);
	}

	function onTextChange(value: string) {
		setText(value);
		// The shown result no longer matches the edited text, so clear it.
		if (result) setResult(null);
		resetGrammar();
		resetModel();
	}

	// Bring the read into view once it lands; the rise-in plays as it arrives.
	function revealResult() {
		const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		requestAnimationFrame(() => {
			resultRef.current?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
		});
	}

	function onCheck() {
		resetModel();
		const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (reduce) {
			setResult(detect(text));
			revealResult();
			return;
		}
		const snapshot = text;
		setResult(null);
		setScanning(true);
		window.setTimeout(() => {
			setResult(detect(snapshot));
			setScanning(false);
			revealResult();
		}, Constants.Ui.ScanMs);
	}

	function onTryExample() {
		onTextChange(randomExample(text));
	}

	function onClear() {
		setText('');
		setResult(null);
		resetGrammar();
		resetModel();
	}

	async function onRunModel() {
		setModelLoading(true);
		setModelError(null);
		try {
			const probability = await ModelDetector.aiProbability(text);
			setResult(combineWithModel(detect(text), probability));
			setModelRan(true);
		} catch (e) {
			Logger.Error('model check failed', e);
			setModelError('The deeper check could not load. Check your connection and try again.');
		} finally {
			setModelLoading(false);
		}
	}

	async function runGrammar(target: string) {
		setGrammarLoading(true);
		setGrammarError(null);
		try {
			const issues = await GrammarChecker.check(target);
			setGrammarIssues(issues);
			setGrammarRan(true);
		} catch (e) {
			Logger.Error('grammar check failed', e);
			setGrammarError('The grammar checker could not load. Check your connection and try again.');
		} finally {
			setGrammarLoading(false);
		}
	}

	// Write-actions never overwrite the input. Fixing shows the corrected text in
	// its own panel, so the original is preserved and nothing is lost.
	function onFixAll() {
		setFixedText(GrammarChecker.applyAll(text, grammarIssues));
	}

	function onReplaceWithFixed() {
		if (fixedText !== null) onTextChange(fixedText);
	}

	return (
		<>
			<a
				href="#console"
				className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-neutral-900 dark:focus:bg-neutral-900 dark:focus:text-neutral-100"
			>
				Skip to content
			</a>
			<ThemeToggle />
			<ByakuganScan active={scanning} />
			<GrainOverlay opacity={0.05} frequency={0.8} />

			<div className="mx-auto max-w-5xl px-5 py-16 sm:px-8 sm:py-24">
				{/* Hero: asymmetric, built around the read rather than the input. */}
				<section className="grid grid-cols-12 gap-y-10 sm:gap-x-8">
					<Reveal className="col-span-12 lg:col-span-7">
						<div className="inline-flex items-center gap-2.5">
							<EyeMark className="h-7 w-7 shrink-0" />
							<span className="font-display text-lg font-medium tracking-tight">{Constants.Product.Name}</span>
						</div>
						<h1 className="mt-7 font-display text-[clamp(2.5rem,7vw,4.75rem)] font-medium leading-[1.05] tracking-tight text-balance">
							Does your writing read as AI?
						</h1>
						<p className="mt-5 max-w-md text-lg text-pretty text-neutral-600 dark:text-neutral-400">
							{Constants.Product.Tagline} {Constants.Product.Privacy}
						</p>
						<div className="mt-6">
							<PrivacyChip />
						</div>
					</Reveal>

					<div className="col-span-12 sm:col-span-8 lg:col-span-5 lg:col-start-8 lg:mt-16">
						<ElevationCard level={2} radius="lg" revealDelay={120} className="p-5 sm:p-6">
							<p className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-500">Example read</p>
							<div className="mt-4">
								<LikelihoodMeter likelihood={EXAMPLE_READ.likelihood} band={EXAMPLE_READ.band} />
							</div>
							<ul className="mt-5 space-y-2.5">
								{EXAMPLE_SIGNALS.map(s => (
									<li key={s.key} className="flex items-center justify-between gap-3 text-sm">
										<span className="text-neutral-600 dark:text-neutral-400">{s.label}</span>
										<span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${chipClass(s.direction)}`}>{chipLabel(s.direction)}</span>
									</li>
								))}
							</ul>
							<p className="mt-4 text-xs text-neutral-500">A sample of AI-leaning text, read by the checker.</p>
						</ElevationCard>
					</div>
				</section>

				{/* Console: where the work happens. */}
				<section id="console" className="mt-16 scroll-mt-8">
					<ElevationCard level={2} radius="lg" className="p-5 sm:p-6">
						<label htmlFor="text-input" className="sr-only">Paste your text</label>
						<textarea
							id="text-input"
							value={text}
							onChange={e => onTextChange(e.target.value)}
							disabled={scanning}
							placeholder="Paste your writing here."
							className="field accent-scroll h-56 resize-y disabled:opacity-60"
						/>
						<div className="mt-4 flex flex-wrap items-center justify-between gap-3">
							<div className="flex flex-wrap items-center gap-x-4 gap-y-1">
								<span className="text-sm text-neutral-500">
									{words === 0
										? `Paste at least ${minWords} words`
										: words < minWords
											? `${words} ${words === 1 ? 'word' : 'words'}, ${minWords - words} more to check`
											: `${words} words`}
								</span>
								<button onClick={onTryExample} className="link text-sm font-medium">
									Try an AI example
								</button>
							</div>
							<div className="flex gap-2">
								{(result || text) && (
									<button onClick={onClear} className="btn text-neutral-600 hover:bg-neutral-500/10 dark:text-neutral-400">
										Clear
									</button>
								)}
								<button onClick={onCheck} disabled={!canCheck || scanning} className="btn btn-primary px-5">
									{scanning ? 'Checking...' : 'Check text'}
								</button>
							</div>
						</div>
					</ElevationCard>
				</section>

				{/* The read. */}
				{result && (
					<section ref={resultRef} className="mt-12 scroll-mt-8" aria-live="polite">
						{result.tooShort ? (
							<Reveal>
								<div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-800 dark:text-amber-200">
									{result.caveats[0]}
								</div>
							</Reveal>
						) : (
							<div className="grid grid-cols-12 gap-6 lg:gap-8">
								<div className="col-span-12 space-y-6 lg:col-span-5">
									<ElevationCard level={2} radius="lg" className="p-5 sm:p-6">
										<LikelihoodMeter likelihood={result.likelihood} band={result.band} />
										<p className="mt-3 text-sm capitalize text-neutral-500">Confidence: {result.confidence}</p>

										{!modelRan && !modelLoading && !modelError && (
											<div className="mt-5 border-t border-neutral-200/70 pt-4 dark:border-neutral-800/70">
												<button onClick={onRunModel} className="btn btn-ghost">
													Run the deeper check
												</button>
												<p className="mt-2 text-sm text-neutral-500">A stronger check that runs on your computer. Downloads about 120 MB the first time. {Constants.Product.Privacy}</p>
											</div>
										)}
										{modelLoading && <p className="mt-5 border-t border-neutral-200/70 pt-4 text-sm text-neutral-500 dark:border-neutral-800/70">Loading the deeper check...</p>}
										{modelError && (
											<div className="mt-5 border-t border-neutral-200/70 pt-4 dark:border-neutral-800/70">
												<p className="text-sm text-rose-700 dark:text-rose-400">{modelError}</p>
												<button onClick={onRunModel} className="btn btn-ghost mt-2">
													Try again
												</button>
											</div>
										)}
									</ElevationCard>

									<ElevationCard level={1} radius="lg" className="p-5">
										<h2 className="mb-2 text-sm font-semibold text-neutral-700 dark:text-neutral-300">Keep in mind</h2>
										<ul className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
											{result.caveats.map((c, i) => (
												<li key={i} className="flex gap-2">
													<span aria-hidden="true" className="text-neutral-400">-</span>
													<span>{c}</span>
												</li>
											))}
										</ul>
									</ElevationCard>
								</div>

								<div className="col-span-12 lg:col-span-7">
									<Reveal>
										<h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-500">Why this read</h2>
									</Reveal>
									<SignalList signals={result.signals} />
								</div>
							</div>
						)}

						<div className="mt-6">
							<GrammarPanel
								ran={grammarRan}
								loading={grammarLoading}
								error={grammarError}
								issues={grammarIssues}
								fixedText={fixedText}
								onCheck={() => runGrammar(text)}
								onFixAll={onFixAll}
								onReplace={onReplaceWithFixed}
								onDismissFix={() => setFixedText(null)}
							/>
						</div>
					</section>
				)}

				{text.trim().length > 0 && (
					<section className="mt-12">
						<ReusePanel text={text} />
					</section>
				)}

				{/* The local companion (the MCP). The title and pitch stay plain; the
				    detail list can get technical, since only power users read it. */}
				<section className="mt-24">
					<div className="grid grid-cols-12 gap-y-8 sm:gap-x-8">
						<Reveal className="col-span-12 lg:col-span-5">
							<h2 className="font-display text-[clamp(1.75rem,4vw,2.5rem)] font-medium leading-tight tracking-tight">
								Get the local version
							</h2>
							<p className="mt-4 max-w-md text-pretty text-neutral-600 dark:text-neutral-400">
								Install this locally to run the same checks inside the AI assistant you already use. It marks what reads as AI, so your own model can rewrite those parts. A stronger model gives better results than the small one the site runs in your browser.
							</p>
							<a href={Constants.Links.GitHub} target="_blank" rel="noreferrer" className="link mt-5 inline-block font-medium">
								Install from GitHub
							</a>
						</Reveal>
						<div className="col-span-12 lg:col-span-7 lg:col-start-6">
							<ElevationCard level={1} radius="lg" className="p-5 sm:p-6">
								<p className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-500">What you get</p>
								<ul className="mt-4 space-y-3 text-sm text-neutral-700 dark:text-neutral-300">
									<li className="flex gap-3"><span aria-hidden="true" className="text-neutral-400">-</span><span>An MCP server for the AI client you already use (Claude Desktop, IDEs, any MCP host).</span></li>
									<li className="flex gap-3"><span aria-hidden="true" className="text-neutral-400">-</span><span>Marks the exact spans that read as AI, so your AI rewrites only those.</span></li>
									<li className="flex gap-3"><span aria-hidden="true" className="text-neutral-400">-</span><span>A detection read and an overlap check against your own documents.</span></li>
									<li className="flex gap-3"><span aria-hidden="true" className="text-neutral-400">-</span><span>Free and open source. Also on npm as @jayofemi/ai-checker.</span></li>
								</ul>
							</ElevationCard>
						</div>
					</div>
				</section>

				<footer ref={footerReveal.ref} style={footerReveal.style} className="mt-24 border-t border-neutral-200/70 pt-6 text-sm text-neutral-500 dark:border-neutral-800/70">
					<p>Open source and runs entirely in your browser. Free to use.</p>
					<a
						href={Constants.Links.GitHub}
						className="link mt-1 inline-block font-medium"
						target="_blank"
						rel="noreferrer"
					>
						See the code on GitHub
					</a>
				</footer>
			</div>
		</>
	);
}

// The Byakugan iris as a subtle mark: a plain circle with a faint dashed ring,
// no pupil and no eye outline, so it reads as a quiet circle that those who know
// recognize as the Byakugan. The full eye is reserved for the easter egg.
function EyeMark({ className }: { className?: string }) {
	return (
		<svg viewBox="0 0 32 32" className={className} fill="none" stroke="#8b8e96" strokeLinecap="round" aria-hidden="true">
			<circle cx="16" cy="16" r="13" strokeWidth={1.7} />
			<circle cx="16" cy="16" r="8.5" strokeWidth={1.5} strokeDasharray="2.5 3.5" opacity={0.85} />
		</svg>
	);
}
