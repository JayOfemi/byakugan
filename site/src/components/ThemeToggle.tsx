import { useTheme } from '../lib/useTheme';

// Fixed light/dark switch in the top-right corner, the family standard. Glassy
// pill so it sits on any background without a hard edge.
export default function ThemeToggle() {
	const { theme, ToggleTheme } = useTheme();
	const isDark = theme === 'dark';

	return (
		<button
			onClick={ToggleTheme}
			aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
			className="fixed right-4 top-4 z-50 rounded-full border border-neutral-200 bg-white/80 p-2.5 text-neutral-700 backdrop-blur transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900/80 dark:text-neutral-200 dark:hover:bg-neutral-800"
		>
			{isDark ? <SunIcon /> : <MoonIcon />}
		</button>
	);
}

function SunIcon() {
	return (
		<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
			<circle cx="12" cy="12" r="4" />
			<path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
		</svg>
	);
}

function MoonIcon() {
	return (
		<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
			<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
		</svg>
	);
}
