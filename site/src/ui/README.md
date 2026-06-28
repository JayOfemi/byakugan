# UI kit

Parameterized building blocks for a distinctive site. Copy this folder into
another app to reuse it.

Important: these are parameterized on purpose. Set the props per app so two sites
built on them do not look identical (composition, motion cadence, type pairing,
and texture).

## Setup

Import the kit CSS once, in `main.tsx`:

```ts
import './ui/ui.css';
```

For type, copy from `typescale.preset.css` into the app's `index.css` and fill in
a real, concept-sourced pairing (do not ship the scaffold pairing).

## What is here

- **AsymmetricHero** - first-viewport scaffold with `asymmetric` (default),
  `split`, `type-first`, and `problem-solution` variants. The asymmetric column
  spans are props (`textClass`, `visualClass`); set them per app so the fold is
  not one house silhouette. Replaces the centered logo-subhead-button stack.
- **ElevationCard** - the default surface. Depth from layered, surface-tinted
  shadows (`level` 1 to 3) on one light source, not glass. `radius` varies by
  role. Pass `glass` only for a genuine over-content layer (a modal). Reveals on
  appear by default (scroll-direction aware); pass `reveal={false}` to opt out,
  or `from` / `revealDelay` to tune.
- **GrainOverlay** - fixed, pointer-events-none film grain (`feTurbulence`). The
  texture substitute for a decorative gradient wash. Keep `opacity` at or below
  0.15; tune `frequency` and `blend` per app. Keep page content above z-index 0.
- **SnapCarousel** - horizontal scroll-snap row with peek padding, for a second
  scroll axis. Children carry `snap-start` and a width (e.g. `w-72 shrink-0`).
- **useCursorGlow()** - returns a ref; sets `--glow-x/--glow-y/--glow-opacity`
  on it. Pair with a `.cursor-glow` child (in `ui.css`) on a `position:relative`
  parent. The sanctioned glow, anchored to a real effect.
- **Reveal** - drop-in wrapper that fades and slides its content in on appear,
  from the scroll direction by default (`from` to force bottom/top/left/right,
  plus `delay`, `distance`, `once`). Renders a div, so put layout classes on it.
- **useReveal(opts)** - the hook behind Reveal and ElevationCard. Returns a
  callback `{ ref, style }` to spread on any element (a list item, a landmark).
  Scroll-direction aware, one-shot, reduced-motion safe.
- **useScrollReveal(threshold?)** - legacy reveal hook (`{ ref, shown }` with the
  `.reveal` / `.is-in` classes). Prefer useReveal / Reveal.
- **withViewTransition(update)** - wraps a state update in a native same-document
  View Transition crossfade when supported and motion is allowed.

## Usage sketch

```tsx
import { AsymmetricHero, ElevationCard, useScrollReveal } from './ui';

function Section() {
	const { ref, shown } = useScrollReveal();
	return (
		<div ref={ref} className={`reveal ${shown ? 'is-in' : ''}`}>
			<ElevationCard level={2} className="p-6">...</ElevationCard>
		</div>
	);
}
```

All motion is reduced-motion gated.
