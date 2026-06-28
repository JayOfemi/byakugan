import { useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'theme';
const SYSTEM_DARK_QUERY = '(prefers-color-scheme: dark)';

// Mirrors the pre-paint bootstrap in index.html: saved choice wins, else the
// OS preference. Keep the two in sync so there is no theme flash on load.
function GetInitialTheme(): Theme {
	if (typeof window === 'undefined') return 'light';
	const saved = window.localStorage.getItem(STORAGE_KEY);
	if (saved === 'light' || saved === 'dark') return saved;
	if (window.matchMedia(SYSTEM_DARK_QUERY).matches) return 'dark';
	return 'light';
}

export function useTheme() {
	const [theme, setTheme] = useState<Theme>(GetInitialTheme);

	// Apply the .dark class to <html> on every theme change.
	useEffect(() => {
		document.documentElement.classList.toggle('dark', theme === 'dark');
	}, [theme]);

	// Follow OS theme changes only until the user explicitly toggles; after
	// that their stored pick wins for the session.
	useEffect(() => {
		const mq = window.matchMedia(SYSTEM_DARK_QUERY);
		const OnChange = (e: MediaQueryListEvent) => {
			if (!window.localStorage.getItem(STORAGE_KEY)) {
				setTheme(e.matches ? 'dark' : 'light');
			}
		};
		mq.addEventListener('change', OnChange);
		return () => mq.removeEventListener('change', OnChange);
	}, []);

	const ToggleTheme = () => {
		setTheme(t => {
			const next = t === 'light' ? 'dark' : 'light';
			window.localStorage.setItem(STORAGE_KEY, next);
			return next;
		});
	};

	return { theme, ToggleTheme };
}
