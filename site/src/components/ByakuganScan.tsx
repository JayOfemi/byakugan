// Faint Byakugan watermark that surfaces for a beat behind the page when a check
// runs (it sits in the background, not over the content). The eye opens first,
// then chakra veins squiggle out from the corners, a soft pulse rings, and a
// scan line drifts down. Ink is white on the dark theme and a faint near-black
// on light, theme-adaptive via currentColor set in index.css. Decorative only
// (aria-hidden, no pointer events); the caller skips it for reduced motion.

const CX = 500;
const CY = 500;

// Deterministic 0..1 hash so each vein varies but stays stable across renders.
function hash(n: number): number {
	const x = Math.sin(n * 12.9898) * 43758.5453;
	return x - Math.floor(x);
}

// Chakra veins. Angles cluster to the two sides of the eye, where the Byakugan's
// veins actually sit, each with a random spread so they scatter unevenly instead
// of spacing themselves perfectly around it. Each vein is sampled along its
// direction and pushed sideways by a sine wave for an organic squiggle.
const veins = Array.from({ length: 7 }, (_, i) => {
	const side = hash(i * 3 + 1) < 0.5 ? 0 : Math.PI;
	const angle = side + (hash(i * 3 + 2) - 0.5) * 1.7;
	const startR = 210;
	const endR = 640 + hash(i + 1) * 300;
	const amp = 26 + hash(i + 5) * 40;
	const waves = 2 + Math.floor(hash(i + 8) * 3);
	const phase = hash(i + 11) * Math.PI * 2;
	const dir = hash(i + 13) < 0.5 ? 1 : -1;
	const perp = angle + Math.PI / 2;
	const steps = 26;
	const pts: Array<[number, number]> = [];
	for (let s = 0; s <= steps; s++) {
		const t = s / steps;
		const r = startR + (endR - startR) * t;
		const grow = Math.min(t * 3, 1) * (1 - t * 0.2);
		const off = Math.sin(t * waves * Math.PI + phase) * amp * grow * dir;
		const px = CX + Math.cos(angle) * r + Math.cos(perp) * off;
		const py = CY + Math.sin(angle) * r + Math.sin(perp) * off;
		pts.push([px, py]);
	}
	let d = `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
	for (let k = 1; k < pts.length - 1; k++) {
		const mx = (pts[k][0] + pts[k + 1][0]) / 2;
		const my = (pts[k][1] + pts[k + 1][1]) / 2;
		d += ` Q ${pts[k][0].toFixed(1)} ${pts[k][1].toFixed(1)} ${mx.toFixed(1)} ${my.toFixed(1)}`;
	}
	const last = pts[pts.length - 1];
	d += ` L ${last[0].toFixed(1)} ${last[1].toFixed(1)}`;
	return d;
});

export default function ByakuganScan({ active }: { active: boolean }) {
	if (!active) return null;
	return (
		<div className="byakugan-scan" aria-hidden="true">
			<svg className="byakugan-scan-svg" viewBox="130 130 740 740" preserveAspectRatio="xMidYMid slice">
				<g className="byakugan-veins" fill="none" stroke="currentColor" strokeWidth={3.5} strokeLinecap="round">
					{veins.map((d, i) => (
						<path key={i} d={d} className="byakugan-vein" pathLength={1} style={{ animationDelay: `${950 + (i % 5) * 60}ms` }} />
					))}
				</g>
				<circle className="byakugan-pulse" cx={CX} cy={CY} r={200} fill="none" stroke="currentColor" strokeWidth={3.5} />
				<g className="byakugan-eye" fill="none" stroke="currentColor">
					{/* Almond eye with a solid iris that mirrors the logo, a filled
					    disc with the dashed ring and no pupil. */}
					<ellipse cx={CX} cy={CY} rx={230} ry={120} strokeWidth={6} />
					<circle cx={CX} cy={CY} r={112} fill="currentColor" fillOpacity={0.6} strokeWidth={5} />
					<circle cx={CX} cy={CY} r={73} strokeWidth={4} strokeDasharray="21 30" strokeOpacity={0.85} />
				</g>
			</svg>
			<div className="byakugan-scanline" />
		</div>
	);
}
