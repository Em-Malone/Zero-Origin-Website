// Moody abstract placeholder — evokes stage lights, haze, geometric scenery.
// Pure SVG, deterministic from a seed so each project feels distinct but the
// visual language stays coherent. No hand-drawn illustration — just bands of
// light, haze gradients, and simple geometric interruption.

function seeded(seed) {
  let s = seed * 9301 + 49297;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export function MoodyPlaceholder({ seed = 1, label = '', aspect = '4/3', palette = 'cool', style = {} }) {
  const rand = seeded(seed);
  // Three palettes — cool (blue/teal), warm (amber/magenta), mono (neutral gray).
  const palettes = {
    cool: {
      bg: '#08090c',
      mid: '#10141c',
      beams: ['#3a7ab8', '#5aa9d9', '#1f5a8c'],
      haze: 'rgba(90,169,217,0.18)',
    },
    warm: {
      bg: '#0a0805',
      mid: '#18110a',
      beams: ['#c9712a', '#e4a15b', '#8a3a2f'],
      haze: 'rgba(228,161,91,0.16)',
    },
    magenta: {
      bg: '#09060a',
      mid: '#140e18',
      beams: ['#a23b8a', '#d96fb0', '#5a1f55'],
      haze: 'rgba(217,111,176,0.14)',
    },
    mono: {
      bg: '#0a0a0b',
      mid: '#141416',
      beams: ['#5a5a5e', '#8a8a8e', '#3a3a3e'],
      haze: 'rgba(180,180,185,0.10)',
    },
  };
  const p = palettes[palette] || palettes.cool;

  // Three light beams at slightly different angles.
  const beams = Array.from({ length: 3 }).map((_, i) => ({
    x: 100 + rand() * 400,
    angle: -25 + rand() * 50,
    width: 40 + rand() * 60,
    color: p.beams[i % p.beams.length],
    opacity: 0.35 + rand() * 0.25,
  }));

  // A horizon / stage line.
  const horizon = 60 + rand() * 25; // percentage from top

  // Geometric interruption — a single rectangle (stage, truss, screen).
  const rect = {
    x: 15 + rand() * 30,
    y: horizon - 8 - rand() * 12,
    w: 30 + rand() * 35,
    h: 3 + rand() * 10,
  };

  const gid = `mp-${seed}-${palette}`;
  return (
    <div style={{ position: 'relative', width: '100%', aspectRatio: aspect, overflow: 'hidden', background: p.bg, ...style }}>
      <svg viewBox="0 0 600 450" preserveAspectRatio="xMidYMid slice"
           style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }}>
        <defs>
          <linearGradient id={`${gid}-sky`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={p.bg} />
            <stop offset="60%" stopColor={p.mid} />
            <stop offset="100%" stopColor={p.bg} />
          </linearGradient>
          <radialGradient id={`${gid}-haze`} cx="50%" cy={`${horizon}%`} r="60%">
            <stop offset="0%" stopColor={p.haze} />
            <stop offset="100%" stopColor="rgba(0,0,0,0)" />
          </radialGradient>
          {beams.map((b, i) => (
            <linearGradient key={i} id={`${gid}-beam-${i}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={b.color} stopOpacity={b.opacity} />
              <stop offset="100%" stopColor={b.color} stopOpacity="0" />
            </linearGradient>
          ))}
          <filter id={`${gid}-blur`}>
            <feGaussianBlur stdDeviation="12" />
          </filter>
        </defs>

        {/* Sky / base */}
        <rect x="0" y="0" width="600" height="450" fill={`url(#${gid}-sky)`} />

        {/* Light beams — fanned out from a point above the horizon */}
        <g filter={`url(#${gid}-blur)`} opacity="0.9">
          {beams.map((b, i) => {
            const originX = b.x;
            const originY = -20;
            const topLeft = `${originX - 10},${originY}`;
            const topRight = `${originX + 10},${originY}`;
            const bottomY = 300 + rand() * 100;
            const spread = b.width;
            const angleRad = (b.angle * Math.PI) / 180;
            const dx = Math.sin(angleRad) * (bottomY - originY);
            const bottomLeft = `${originX + dx - spread},${bottomY}`;
            const bottomRight = `${originX + dx + spread},${bottomY}`;
            return (
              <polygon
                key={i}
                points={`${topLeft} ${topRight} ${bottomRight} ${bottomLeft}`}
                fill={`url(#${gid}-beam-${i})`}
              />
            );
          })}
        </g>

        {/* Haze */}
        <rect x="0" y="0" width="600" height="450" fill={`url(#${gid}-haze)`} />

        {/* Horizon line — very subtle */}
        <line
          x1="0" y1={(horizon / 100) * 450}
          x2="600" y2={(horizon / 100) * 450}
          stroke="rgba(255,255,255,0.08)" strokeWidth="1"
        />

        {/* Geometric interruption */}
        <rect
          x={(rect.x / 100) * 600}
          y={(rect.y / 100) * 450}
          width={(rect.w / 100) * 600}
          height={(rect.h / 100) * 450}
          fill="rgba(0,0,0,0.65)"
        />

        {/* Film grain overlay — tiny dots */}
        <g opacity="0.12">
          {Array.from({ length: 80 }).map((_, i) => (
            <circle
              key={i}
              cx={rand() * 600}
              cy={rand() * 450}
              r={rand() * 0.8}
              fill="white"
            />
          ))}
        </g>
      </svg>
      {label && (
        <div style={{
          position: 'absolute', left: 12, bottom: 10,
          fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.12em',
          color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase',
          pointerEvents: 'none',
        }}>
          {label}
        </div>
      )}
    </div>
  );
}
