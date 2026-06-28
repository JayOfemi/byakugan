import { Constants } from '../lib/Constants';

// The standing "where your text is" indicator. The browser checker is fully
// local, so this is always green here. The MCP surface will add an amber
// "cloud" state when a user opts into something that leaves the device.
export default function PrivacyChip() {
	return (
		<div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-sm font-medium text-emerald-700 dark:text-emerald-300">
			<span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
			Local. {Constants.Product.Privacy}
		</div>
	);
}
