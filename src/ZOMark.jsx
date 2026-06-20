// Zero Origin monogram.
// variant 'a' — original mark: leaf/pod, rounded TL/BR corners, sharp TR/BL, slash.
// variant 'b' — supplied SVG (ZO-Logo-A-White), interlocking Z/Ø path.

import { useId } from 'react';

// Supplied logo path (1920×1080 artboard). Bounds ≈ x 808–1155, y 404–684.
const ZO_B_PATH = "M889.08,544.45c0-51.27,41.56-92.83,92.83-92.83l57.95.3h0l-231.33,231.89,174.17-1.38c76.91,0,139.25-62.15,139.25-138.81v-92l-47.21,47.25v45.58c0,51.27-41.56,92.83-92.83,92.83h-59.8l232.44-233.51-171.85.72v.31c-76.91,0-139.25,62.15-139.25,138.81l-1.97,93.66,47.6-48.36.1-48.79";

export function ZOMark({ size = 64, gap = 7, color = 'currentColor', variant = 'a' }) {
  if (variant === 'b') {
    return (
      <svg width={size} height={size} viewBox="808 403 346 280"
           style={{ color, display: 'block' }}
           aria-label="Zero Origin" role="img">
        <path d={ZO_B_PATH} fill={color} />
      </svg>
    );
  }

  const id = useId().replace(/[:]/g, '');
  const topClip = `zo-top-${id}`;
  const botClip = `zo-bot-${id}`;

  // Outer silhouette path:
  //   sharp TR (186,14) → right edge down to BR arc tangent →
  //   quarter arc (BR rounded, R=78) sweeping left → bottom edge to sharp BL (14,186) →
  //   left edge up to TL arc tangent → quarter arc (TL rounded) sweeping right →
  //   top edge back to TR.
  const R = 78;
  const d = [
    `M 186 14`,
    `L 186 ${186 - R}`,
    `A ${R} ${R} 0 0 1 ${186 - R} 186`,
    `L 14 186`,
    `L 14 ${14 + R}`,
    `A ${R} ${R} 0 0 1 ${14 + R} 14`,
    `L 186 14`,
    `Z`,
  ].join(' ');

  // Slash: diagonal gap through the middle (~-20°).
  const x1 = 20, y1 = 134, x2 = 180, y2 = 76;
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  const nx = -dy / len, ny = dx / len;
  const off = gap / 2;
  const topA = { x: x1 - nx * off, y: y1 - ny * off };
  const topB = { x: x2 - nx * off, y: y2 - ny * off };
  const botA = { x: x1 + nx * off, y: y1 + ny * off };
  const botB = { x: x2 + nx * off, y: y2 + ny * off };

  return (
    <svg width={size} height={size} viewBox="0 0 200 200"
         style={{ color, display: 'block' }}
         aria-label="Zero Origin" role="img">
      <defs>
        <clipPath id={topClip}>
          <polygon points={`-50,-50 250,-50 ${topB.x},${topB.y} ${topA.x},${topA.y}`} />
        </clipPath>
        <clipPath id={botClip}>
          <polygon points={`${botA.x},${botA.y} ${botB.x},${botB.y} 250,250 -50,250`} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${topClip})`}>
        <path d={d} fill={color} />
      </g>
      <g clipPath={`url(#${botClip})`}>
        <path d={d} fill={color} />
      </g>
    </svg>
  );
}
