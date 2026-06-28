interface Props {
	// Layer opacity. Keep at or below 0.15 so it reads as texture, not a flat wash.
	opacity?: number;
	// feTurbulence base frequency. Higher is finer grain.
	frequency?: number;
	blend?: 'overlay' | 'soft-light';
	className?: string;
}

// Fixed, pointer-events-none film grain via SVG feTurbulence. The texture
// substitute for a decorative gradient or ambient wash. It adds surface life
// without a gradient that answers to nothing.
// Tune frequency, opacity, and blend per app so siblings do not share one noise
// signature. Sits at z-index 0; keep page content above it.
export default function GrainOverlay({ opacity = 0.1, frequency = 0.65, blend = 'overlay', className = '' }: Props) {
	return (
		<svg
			aria-hidden="true"
			className={className}
			style={{
				position: 'fixed',
				inset: 0,
				width: '100%',
				height: '100%',
				pointerEvents: 'none',
				zIndex: 0,
				opacity,
				mixBlendMode: blend,
			}}
		>
			<filter id="grain-overlay-noise">
				<feTurbulence type="fractalNoise" baseFrequency={frequency} numOctaves={3} stitchTiles="stitch" />
			</filter>
			<rect width="100%" height="100%" filter="url(#grain-overlay-noise)" />
		</svg>
	);
}
