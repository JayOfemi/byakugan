# AI Checker

A private, open-source AI-text checker that runs in your browser. Paste your writing and see whether it reads as AI-written, without the text ever leaving the page.

## What it does

- Reads how AI-like the writing sounds, as a likelihood with a confidence band.
- Explains why in plain language, signal by signal.
- Runs a grammar pass.
- Checks the text against your own documents for reuse.

Everything runs in the page. Nothing you paste leaves it, and there is no analytics.

## Run it

```
npm install
npm run dev
```

Open the printed URL (http://localhost:5173). Node 22 (`.nvmrc`); build with `npm run build`, output lands in `dist/`.

## Honest limits

AI-text detection is a signal, not a verdict, and it is biased against non-native English writers. It is shown as a likelihood with its confidence, never a flat "this is AI" judgement.

## Stack

| Layer | Tech |
|---|---|
| Build / dev | Vite |
| UI | React 19 + TypeScript |
| Styling | Tailwind CSS v4 |
| Hosting | Azure Static Web Apps (Free) |
| Detection | runs in the browser, no server |

## License

MIT. Copyright (c) 2026 Jay Ofemi.
