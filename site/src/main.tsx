import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { Logger } from './lib/Logger';
import { Constants } from './lib/Constants';
import './index.css';
import './ui/ui.css';

Logger.Info(`${Constants.Product.Name} v${Constants.Product.Version} - runs locally, your text never leaves this page`);

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<App />
	</StrictMode>
);
