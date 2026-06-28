// Sets the dark class before first paint so there is no flash of the wrong
// theme. Kept as a same-origin file (not inline) so the Content-Security-Policy
// script-src can stay free of 'unsafe-inline'. Load it blocking in <head>.
(function () {
	try {
		var saved = localStorage.getItem('theme');
		var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
		if (saved === 'dark' || (saved !== 'light' && prefersDark)) {
			document.documentElement.classList.add('dark');
		}
	} catch (e) {}
})();
