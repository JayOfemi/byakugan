import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';

export default defineConfig({
	plugins: [react(), tailwindcss()],
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src')
		}
	},
	// harper.js and transformers.js ship WASM and their own workers; keep Vite's
	// dep optimizer from pre-bundling them so the workers and WASM resolve.
	optimizeDeps: {
		exclude: ['harper.js', '@huggingface/transformers']
	},
	server: {
		port: 5173
	}
});
