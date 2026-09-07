import { useRef } from 'react';

// ── Unique ID per instance (avoids SVG defs conflicts) ────────────────────────
let _uid = 0;
const nextUid = () => `so${++_uid}`;

// ── Design tokens ─────────────────────────────────────────────────────────────
const COLOR = {
  // Cell gradient: bright solar green → deep electric blue
  top:    '#1DC884',
  ul:     '#14B07A',
  ur:     '#0FA070',
  left:   '#0D8A66',
  right:  '#0B6E82',
  ll:     '#0A5890',
  lr:     '#0A4898',
  bottom: '#0A38A0',
  // Lens
  lensHi:  '#40F0B0',
  lensMid: '#14C880',
  // Symbol chrome
  depth:       '#030E07',
  border:      'rgba(255,255,255,0.09)',
  grid:        'rgba(255,255,255,0.19)',
  ctrFill:     'rgba(255,255,255,0.05)',
  ctrStroke:   'rgba(255,255,255,0.22)',
  orbital:     'rgba(255,255,255,0.10)',
  dot:         'rgba(255,255,255,0.95)',
  rayLine:     'rgba(255,220,75,0.32)',
  rayDot:      'rgba(255,220,75,0.72)',
  // Wordmark
  word1:  '#0D1117',
  word2:  '#0D7A52',
  tag:    '#9CA3AF',
};

const MONO = {
  top: '#4B5563', ul: '#3E4756', ur: '#3E4756',
  left: '#374151', right: '#2D3748',
  ll: '#22303D', lr: '#1B2633', bottom: '#111827',
  lensHi: '#9CA3AF', lensMid: '#6B7280',
  depth: '#070A0E',
  border: 'rgba(255,255,255,0.06)',
  grid: 'rgba(255,255,255,0.12)',
  ctrFill: 'rgba(255,255,255,0.03)',
  ctrStroke: 'rgba(255,255,255,0.14)',
  orbital: 'rgba(255,255,255,0.07)',
  dot: 'rgba(255,255,255,0.88)',
  rayLine: 'transparent', rayDot: 'transparent',
  word1: '#1F2937', word2: '#374151', tag: '#9CA3AF',
};

// ── Core Symbol SVG ───────────────────────────────────────────────────────────
// Concept: a solar PV panel viewed from directly above, rotated 45° into a
// diamond silhouette. A 3×3 internal cell grid (formed by 4 diagonal lines)
// maps the photovoltaic architecture. The color gradient runs from solar green
// at top to electric blue at bottom — sunlight input → data output. A central
// circular lens ("Optix") represents the AI analytical eye.
//
// Diamond vertices:  T(50,5)  R(95,50)  B(50,95)  L(5,50)
// Inner intersections: (50,35) (65,50) (50,65) (35,50)
// Grid lines: (35,20)-(80,65)  (20,35)-(65,80)  (65,20)-(20,65)  (80,35)-(35,80)
interface SymbolProps {
  size: number;
  c: typeof COLOR;
  ray?: boolean;
}

function Symbol({ size, c, ray = true }: SymbolProps) {
  const uid = useRef(nextUid()).current;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block', flexShrink: 0 }}
    >
      <defs>
        <radialGradient id={`${uid}-lg`} cx="38%" cy="32%" r="70%">
          <stop offset="0%" stopColor={c.lensHi} />
          <stop offset="100%" stopColor={c.lensMid} />
        </radialGradient>
        <filter id={`${uid}-sh`} x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="2.5" stdDeviation="4" floodColor="#000" floodOpacity="0.24" />
        </filter>
      </defs>

      {/* ── Depth layer (diamond shifted 2px down-right) ── */}
      <polygon points="52,7 97,52 52,97 7,52" fill={c.depth} opacity="0.70" />

      {/* ── 9 panel cells ── */}
      {/* Top corner triangle */}
      <polygon points="50,5 65,20 50,35 35,20"  fill={c.top} />
      {/* Upper-left diamond */}
      <polygon points="35,20 50,35 35,50 20,35"  fill={c.ul} />
      {/* Upper-right diamond */}
      <polygon points="65,20 80,35 65,50 50,35"  fill={c.ur} />
      {/* Left corner triangle */}
      <polygon points="5,50 20,35 35,50 20,65"   fill={c.left} />
      {/* Right corner triangle */}
      <polygon points="95,50 80,35 65,50 80,65"  fill={c.right} />
      {/* Lower-left diamond */}
      <polygon points="20,65 35,50 50,65 35,80"  fill={c.ll} />
      {/* Lower-right diamond */}
      <polygon points="65,50 80,65 65,80 50,65"  fill={c.lr} />
      {/* Bottom corner triangle */}
      <polygon points="50,95 35,80 50,65 65,80"  fill={c.bottom} />
      {/* Center cell (underlies lens) */}
      <polygon
        points="50,35 65,50 50,65 35,50"
        fill={c.ctrFill}
        stroke={c.ctrStroke}
        strokeWidth="0.5"
      />

      {/* ── Grid lines (4 diagonals forming 3×3 grid) ── */}
      <line x1="35" y1="20" x2="80" y2="65" stroke={c.grid} strokeWidth="0.8" />
      <line x1="20" y1="35" x2="65" y2="80" stroke={c.grid} strokeWidth="0.8" />
      <line x1="65" y1="20" x2="20" y2="65" stroke={c.grid} strokeWidth="0.8" />
      <line x1="80" y1="35" x2="35" y2="80" stroke={c.grid} strokeWidth="0.8" />

      {/* ── Outer diamond edge (subtle, carries shadow) ── */}
      <polygon
        points="50,5 95,50 50,95 5,50"
        fill="none"
        stroke={c.border}
        strokeWidth="1.2"
        filter={`url(#${uid}-sh)`}
      />

      {/* ── Analytical orbital ring ── */}
      <circle
        cx="50" cy="50" r="18"
        fill="none"
        stroke={c.orbital}
        strokeWidth="0.85"
        strokeDasharray="2.8 5"
      />

      {/* ── Light ray from top (sunlight entering panel) ── */}
      {ray && (
        <>
          <line x1="50" y1="5" x2="50" y2="36" stroke={c.rayLine} strokeWidth="1.6" strokeLinecap="round" />
          <circle cx="50" cy="5" r="2.8" fill={c.rayDot} />
        </>
      )}

      {/* ── Center lens ("Optix") ── */}
      <circle cx="50" cy="50" r="10.5" fill={`url(#${uid}-lg)`} />
      <circle cx="50" cy="50" r="10.5" fill="none" stroke="rgba(255,255,255,0.30)" strokeWidth="0.9" />
      <circle cx="50" cy="50" r="6.5"  fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="0.65" />
      <circle cx="50" cy="50" r="3.5"  fill={c.dot} />
    </svg>
  );
}

// ── App Icon (symbol in rounded-square tile) ──────────────────────────────────
export function SolarOptixIcon({ size = 40 }: { size?: number }) {
  const r = Math.round(size * 0.22);
  const inner = Math.round(size * 0.74);
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: r,
        background: 'linear-gradient(148deg, #0B2018 0%, #071524 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 18px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.07)',
        flexShrink: 0,
        overflow: 'hidden',
      }}
    >
      <Symbol size={inner} c={COLOR} ray={false} />
    </div>
  );
}

// ── Wordmark fragment ─────────────────────────────────────────────────────────
interface WordmarkProps {
  fontSize?: number;
  c?: typeof COLOR;
}

function Wordmark({ fontSize = 22, c = COLOR }: WordmarkProps) {
  return (
    <div
      style={{
        fontFamily: 'Outfit, sans-serif',
        fontWeight: 700,
        fontSize,
        letterSpacing: '-0.025em',
        lineHeight: 1,
        whiteSpace: 'nowrap',
      }}
    >
      <span style={{ color: c.word1 }}>Solar</span>
      <span style={{ color: c.word2 }}>Optix</span>
    </div>
  );
}

// ── Full horizontal logo ──────────────────────────────────────────────────────
interface FullLogoProps {
  symbolSize?: number;
  fontSize?: number;
  mono?: boolean;
  tagline?: boolean;
  /** Pass 'dark' when placing on a dark background — flips wordmark "Solar" to white */
  bg?: 'light' | 'dark';
}

export function SolarOptixLogoFull({
  symbolSize = 44,
  fontSize = 22,
  mono = false,
  tagline = false,
  bg = 'light',
}: FullLogoProps) {
  const c = mono ? MONO : COLOR;
  const word1 = bg === 'dark' && !mono ? '#ffffff' : c.word1;
  const adjusted = { ...c, word1 };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: Math.round(symbolSize * 0.30) }}>
      <Symbol size={symbolSize} c={c} ray={false} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Wordmark fontSize={fontSize} c={adjusted} />
        {tagline && (
          <div
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontWeight: 500,
              fontSize: Math.max(8, Math.round(fontSize * 0.35)),
              color: bg === 'dark' ? 'rgba(255,255,255,0.45)' : c.tag,
              letterSpacing: '0.08em',
              marginTop: 1,
            }}
          >
            AI EFFICIENCY PLATFORM
          </div>
        )}
      </div>
    </div>
  );
}

// ── Sidebar compact logo (icon only, collapsed-aware) ─────────────────────────
export function SolarOptixSidebarMark({ collapsed = false }: { collapsed?: boolean }) {
  return collapsed ? (
    <SolarOptixIcon size={32} />
  ) : (
    <SolarOptixLogoFull symbolSize={32} fontSize={16} mono={false} tagline={false} />
  );
}

// ── Default export: standalone symbol ─────────────────────────────────────────
export default function SolarOptixMark({
  size = 40,
  mono = false,
}: {
  size?: number;
  mono?: boolean;
}) {
  return <Symbol size={size} c={mono ? MONO : COLOR} ray />;
}
