import { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowRight, Zap, TrendingDown, Droplets, CheckCircle, ChevronRight } from 'lucide-react';
import { SolarOptixLogoFull } from './SolarOptixMark';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// ─── Types ────────────────────────────────────────────────────────────────────
type PanelStatus = 'normal' | 'warning' | 'hotspot' | 'reduced';

interface Panel {
  id: string;
  row: number;
  col: number;
  status: PanelStatus;
  efficiency: number;
  temp: number;
  soiling: number;
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const PANELS: Panel[] = [
  { id: 'A-01', row: 0, col: 0, status: 'normal', efficiency: 95, temp: 38, soiling: 5 },
  { id: 'A-02', row: 0, col: 1, status: 'normal', efficiency: 94, temp: 39, soiling: 8 },
  { id: 'A-03', row: 0, col: 2, status: 'normal', efficiency: 96, temp: 37, soiling: 4 },
  { id: 'A-04', row: 0, col: 3, status: 'warning', efficiency: 82, temp: 47, soiling: 64 },
  { id: 'A-05', row: 0, col: 4, status: 'normal', efficiency: 93, temp: 40, soiling: 11 },
  { id: 'B-01', row: 1, col: 0, status: 'normal', efficiency: 94, temp: 38, soiling: 7 },
  { id: 'B-02', row: 1, col: 1, status: 'reduced', efficiency: 87, temp: 43, soiling: 38 },
  { id: 'B-03', row: 1, col: 2, status: 'normal', efficiency: 95, temp: 39, soiling: 6 },
  { id: 'B-04', row: 1, col: 3, status: 'normal', efficiency: 93, temp: 41, soiling: 14 },
  { id: 'B-05', row: 1, col: 4, status: 'hotspot', efficiency: 71, temp: 58, soiling: 22 },
  { id: 'C-01', row: 2, col: 0, status: 'normal', efficiency: 96, temp: 37, soiling: 5 },
  { id: 'C-02', row: 2, col: 1, status: 'normal', efficiency: 95, temp: 38, soiling: 8 },
  { id: 'C-03', row: 2, col: 2, status: 'warning', efficiency: 84, temp: 46, soiling: 58 },
  { id: 'C-04', row: 2, col: 3, status: 'normal', efficiency: 94, temp: 39, soiling: 10 },
  { id: 'C-05', row: 2, col: 4, status: 'normal', efficiency: 93, temp: 40, soiling: 13 },
  { id: 'D-01', row: 3, col: 0, status: 'reduced', efficiency: 88, temp: 44, soiling: 35 },
  { id: 'D-02', row: 3, col: 1, status: 'normal', efficiency: 95, temp: 38, soiling: 6 },
  { id: 'D-03', row: 3, col: 2, status: 'normal', efficiency: 94, temp: 39, soiling: 9 },
  { id: 'D-04', row: 3, col: 3, status: 'normal', efficiency: 96, temp: 37, soiling: 4 },
  { id: 'D-05', row: 3, col: 4, status: 'normal', efficiency: 93, temp: 41, soiling: 12 },
];

const STATUS_COLOR: Record<PanelStatus, string> = {
  normal: 'rgba(0, 180, 100, 0)',
  reduced: 'rgba(234, 179, 8, 0.28)',
  warning: 'rgba(249, 115, 22, 0.38)',
  hotspot: 'rgba(239, 68, 68, 0.45)',
};
const STATUS_BORDER: Record<PanelStatus, string> = {
  normal: 'rgba(180, 200, 220, 0.4)',
  reduced: 'rgba(234,179,8,0.6)',
  warning: 'rgba(249,115,22,0.7)',
  hotspot: 'rgba(239,68,68,0.85)',
};
const STATUS_LABEL: Record<PanelStatus, string> = {
  normal: 'Normal',
  reduced: 'Reduced',
  warning: 'Warning',
  hotspot: 'Hotspot',
};
const STATUS_ACTION: Record<PanelStatus, string> = {
  normal: 'Operating normally',
  reduced: 'Monitor — schedule cleaning',
  warning: 'Cleaning recommended',
  hotspot: 'Inspect immediately',
};

// ─── Chart data ───────────────────────────────────────────────────────────────
const chartData = Array.from({ length: 24 }, (_, h) => {
  const curve = Math.max(0, Math.sin((h - 6) * (Math.PI / 12)));
  return {
    h: `${String(h).padStart(2, '0')}:00`,
    Expected: parseFloat((5.3 * curve).toFixed(2)),
    Actual: parseFloat((4.32 * curve * (0.9 + Math.sin(h * 0.7) * 0.05)).toFixed(2)),
  };
});

// ─── Solar Panel Cell ─────────────────────────────────────────────────────────
function SolarCells({ status, hovered }: { status: PanelStatus; hovered: boolean }) {
  const COLS = 6, ROWS = 4;
  return (
    <div style={{
      position: 'absolute', inset: 3,
      display: 'grid',
      gridTemplateColumns: `repeat(${COLS}, 1fr)`,
      gridTemplateRows: `repeat(${ROWS}, 1fr)`,
      gap: 1.5,
      background: '#0a1628',
      overflow: 'hidden',
    }}>
      {Array.from({ length: COLS * ROWS }, (_, i) => (
        <div key={i} style={{
          background: hovered
            ? 'linear-gradient(135deg, #1a3060 0%, #0d1f44 60%, #162848 100%)'
            : 'linear-gradient(135deg, #152854 0%, #0a1a38 60%, #111f40 100%)',
          position: 'relative',
          transition: 'background 0.2s',
        }}>
          {/* Cell reflection streak */}
          <div style={{
            position: 'absolute', top: 0, left: '20%', width: '20%', height: '100%',
            background: 'linear-gradient(to bottom, rgba(255,255,255,0.04) 0%, transparent 100%)',
          }} />
        </div>
      ))}
      {/* Overlay for status */}
      <div style={{
        position: 'absolute', inset: 0,
        background: STATUS_COLOR[status],
        transition: 'background 0.3s',
      }} />
    </div>
  );
}

// ─── Single Panel ─────────────────────────────────────────────────────────────
function SolarPanel({
  panel, hovered, selected, onHover, onClick,
}: {
  panel: Panel;
  hovered: boolean;
  selected: boolean;
  onHover: (id: string | null) => void;
  onClick: (panel: Panel) => void;
}) {
  return (
    <div
      onMouseEnter={() => onHover(panel.id)}
      onMouseLeave={() => onHover(null)}
      onClick={() => onClick(panel)}
      style={{
        position: 'relative',
        width: 108, height: 70,
        borderRadius: 2,
        border: `1.5px solid ${selected ? '#0070C0' : hovered ? STATUS_BORDER[panel.status] : 'rgba(160,185,210,0.35)'}`,
        background: selected ? 'rgba(0,112,192,0.08)' : 'transparent',
        cursor: 'pointer',
        boxShadow: hovered
          ? `0 8px 24px rgba(0,0,0,0.28), inset 0 0 0 1px ${STATUS_BORDER[panel.status]}`
          : '0 4px 12px rgba(0,0,0,0.18)',
        transform: hovered ? 'translateZ(6px) scale(1.04)' : 'translateZ(0)',
        transition: 'all 0.2s ease',
        overflow: 'hidden',
      }}
    >
      {/* Metallic frame top highlight */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 3,
        background: 'linear-gradient(to right, rgba(200,215,230,0.6), rgba(240,248,255,0.8), rgba(200,215,230,0.6))',
        zIndex: 2,
      }} />
      {/* Solar cells */}
      <SolarCells status={panel.status} hovered={hovered} />
      {/* Panel frame */}
      <div style={{
        position: 'absolute', inset: 0,
        border: '3px solid',
        borderColor: 'rgba(180,200,220,0.5)',
        borderRadius: 2,
        pointerEvents: 'none',
        zIndex: 3,
      }} />
      {/* Mounting bracket */}
      <div style={{
        position: 'absolute', bottom: -4, left: '25%', width: '50%', height: 4,
        background: 'rgba(140,160,180,0.7)',
        zIndex: 4,
      }} />
      {/* Panel ID */}
      {hovered && (
        <div style={{
          position: 'absolute', top: 4, left: 4,
          fontSize: 8, fontFamily: 'JetBrains Mono', fontWeight: 600,
          color: 'rgba(255,255,255,0.9)', zIndex: 5,
          background: 'rgba(0,0,0,0.4)', padding: '1px 4px', borderRadius: 2,
        }}>
          {panel.id}
        </div>
      )}
    </div>
  );
}

// ─── Annotation Label ─────────────────────────────────────────────────────────
function AnnotationLabel({ label, value, x, y, color = '#0070C0' }: { label: string; value: string; x: number | string; y: number | string; color?: string }) {
  return (
    <div style={{
      position: 'absolute', left: x, top: y,
      padding: '5px 10px',
      background: 'rgba(255,255,255,0.95)',
      border: `1px solid ${color}30`,
      borderRadius: 6,
      boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
      fontSize: 10, fontFamily: 'JetBrains Mono',
      whiteSpace: 'nowrap',
      zIndex: 20,
      pointerEvents: 'none',
    }}>
      <div style={{ color: '#9ca3af', fontSize: 9, letterSpacing: '0.05em' }}>{label}</div>
      <div style={{ fontWeight: 700, color, fontSize: 12 }}>{value}</div>
      {/* Connector dot */}
      <div style={{
        position: 'absolute', bottom: -4, left: '50%', transform: 'translateX(-50%)',
        width: 6, height: 6, borderRadius: '50%',
        background: color, border: '2px solid #fff',
      }} />
    </div>
  );
}

// ─── Floating Analytics Card ──────────────────────────────────────────────────
function FloatingCard({ title, value, sub, icon, x, y, accent = '#0070C0' }: {
  title: string; value: string; sub?: string; icon: React.ReactNode;
  x: number | string; y: number | string; accent?: string;
}) {
  return (
    <div style={{
      position: 'absolute', left: x, top: y,
      background: 'rgba(255,255,255,0.96)',
      border: '1px solid #e5e7eb',
      borderRadius: 12,
      padding: '12px 16px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.1), 0 2px 8px rgba(0,0,0,0.06)',
      minWidth: 140,
      zIndex: 15,
      backdropFilter: 'blur(4px)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
        <div style={{ color: accent }}>{icon}</div>
        <span style={{ fontSize: 10, color: '#9ca3af', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</span>
      </div>
      <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 22, color: '#111827' }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: accent, fontWeight: 500, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

// ─── Panel Detail Card ────────────────────────────────────────────────────────
function PanelDetailCard({ panel, onClose }: { panel: Panel; onClose: () => void }) {
  const actionColor = panel.status === 'hotspot' ? '#dc2626' : panel.status === 'warning' ? '#d97706' : '#0070C0';
  return (
    <div style={{
      position: 'absolute', right: 16, top: 16,
      background: '#ffffff',
      border: '1px solid #e5e7eb',
      borderRadius: 12,
      padding: '16px',
      boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
      width: 200,
      zIndex: 40,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <div style={{ fontFamily: 'JetBrains Mono', fontWeight: 700, fontSize: 13, color: '#111827' }}>Panel {panel.id}</div>
          <span style={{
            fontSize: 10, fontWeight: 600,
            color: actionColor, background: `${actionColor}12`,
            padding: '2px 7px', borderRadius: 4, display: 'inline-block', marginTop: 3,
          }}>
            {STATUS_LABEL[panel.status].toUpperCase()}
          </span>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: 16, lineHeight: 1, padding: 0 }}>×</button>
      </div>
      {[
        { label: 'Efficiency', value: `${panel.efficiency}%` },
        { label: 'Temperature', value: `${panel.temp}°C` },
        { label: 'Soiling Score', value: `${panel.soiling}%` },
      ].map((r) => (
        <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 7, borderBottom: '1px solid #f3f4f6', marginBottom: 7 }}>
          <span style={{ fontSize: 11, color: '#9ca3af' }}>{r.label}</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#374151', fontFamily: 'JetBrains Mono' }}>{r.value}</span>
        </div>
      ))}
      <div style={{ fontSize: 11, color: actionColor, fontWeight: 600, marginTop: 4 }}>
        → {STATUS_ACTION[panel.status]}
      </div>
    </div>
  );
}

// ─── 3D Solar Array ───────────────────────────────────────────────────────────
function SolarArray3D() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedPanel, setSelectedPanel] = useState<Panel | null>(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setMouse({ x: x * 4, y: y * 3 });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setMouse({ x: 0, y: 0 });
  }, []);

  const rows = [0, 1, 2, 3];
  const ROWS = 4, COLS = 5;
  const GAP_X = 116, GAP_Y = 80;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ position: 'relative', width: '100%', height: '100%' }}
    >
      {/* 3D perspective container */}
      <div style={{
        position: 'absolute',
        top: '50%', left: '50%',
        transform: `translate(-50%, -48%) perspective(700px) rotateX(28deg) rotateY(${-10 + mouse.x}deg) rotateX(${mouse.y * -0.4}deg)`,
        transformStyle: 'preserve-3d',
        transition: 'transform 0.15s ease-out',
      }}>
        {/* Rooftop surface */}
        <div style={{
          position: 'absolute',
          width: COLS * GAP_X + 40,
          height: ROWS * GAP_Y + 60,
          left: -20, top: -20,
          background: 'linear-gradient(145deg, #c8cdd4 0%, #d8dde4 40%, #bfc5cc 100%)',
          borderRadius: 4,
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          transform: 'translateZ(-6px)',
        }}>
          {/* Roof tiles */}
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} style={{
              position: 'absolute', top: i * 50, left: 0, right: 0, height: 50,
              borderBottom: '1px solid rgba(0,0,0,0.06)',
              background: i % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.015)',
            }} />
          ))}
        </div>

        {/* Mounting rail horizontal */}
        {rows.map((r) => (
          <div key={`rail-h-${r}`} style={{
            position: 'absolute',
            left: 2, width: COLS * GAP_X - 8,
            top: r * GAP_Y + 32,
            height: 4,
            background: 'linear-gradient(to bottom, #b0b8c4, #8a9299)',
            borderRadius: 2,
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            transform: 'translateZ(2px)',
          }} />
        ))}

        {/* Panels */}
        {PANELS.map((panel) => (
          <div
            key={panel.id}
            style={{
              position: 'absolute',
              left: panel.col * GAP_X,
              top: panel.row * GAP_Y,
              transformStyle: 'preserve-3d',
              transform: 'translateZ(8px)',
            }}
          >
            <SolarPanel
              panel={panel}
              hovered={hoveredId === panel.id}
              selected={selectedPanel?.id === panel.id}
              onHover={setHoveredId}
              onClick={(p) => setSelectedPanel(prev => prev?.id === p.id ? null : p)}
            />
          </div>
        ))}

        {/* Shadow cast by array */}
        <div style={{
          position: 'absolute',
          left: 10, top: ROWS * GAP_Y + 10,
          width: COLS * GAP_X - 20,
          height: 30,
          background: 'radial-gradient(ellipse, rgba(0,0,0,0.18) 0%, transparent 70%)',
          transform: 'translateZ(-4px)',
          filter: 'blur(8px)',
        }} />
      </div>

      {/* Annotation labels */}
      <AnnotationLabel label="PANEL A-04" value="Efficiency 82%" x="54%" y="14%" color="#d97706" />
      <AnnotationLabel label="PANEL B-05" value="Temp 58.0°C" x="76%" y="40%" color="#dc2626" />
      <AnnotationLabel label="ARRAY OUTPUT" value="4.32 kW" x="8%" y="36%" color="#0070C0" />
      <AnnotationLabel label="SOILING SCORE" value="64%" x="12%" y="60%" color="#d97706" />

      {/* Floating analytics cards */}
      <FloatingCard title="Solar Efficiency" value="94.2%" sub="↑ 8.4% after cleaning" icon={<Activity size={13} />} x="2%" y="4%" />
      <FloatingCard title="Power Output" value="5.14 kW" icon={<Zap size={13} />} x="2%" y="52%" />
      <FloatingCard title="Energy Recovered" value="+4.2 kWh" sub="per day potential" icon={<TrendingDown size={13} />} x="72%" y="4%" accent="#0070C0" />
      <FloatingCard title="Rain Probability" value="18%" sub="Cleaning window open" icon={<Droplets size={13} />} x="68%" y="70%" accent="#0070C0" />

      {/* Selected panel detail */}
      {selectedPanel && (
        <PanelDetailCard panel={selectedPanel} onClose={() => setSelectedPanel(null)} />
      )}

      {/* Click hint */}
      {!selectedPanel && (
        <div style={{
          position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)',
          fontSize: 11, color: '#9ca3af', background: 'rgba(255,255,255,0.85)',
          padding: '4px 12px', borderRadius: 20, border: '1px solid #e5e7eb',
          whiteSpace: 'nowrap', pointerEvents: 'none',
        }}>
          Click any panel to inspect
        </div>
      )}
    </div>
  );
}

// We need Activity icon
function Activity({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
}

// ─── Process Step ─────────────────────────────────────────────────────────────
function ProcessStep({ n, title, desc, icon }: { n: number; title: string; desc: string; icon: string }) {
  return (
    <div style={{ textAlign: 'center', flex: 1, minWidth: 0 }}>
      <div style={{
        width: 48, height: 48, borderRadius: 12,
        background: '#e6f3fc', border: '1px solid #b3d4f0',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 22, margin: '0 auto 12px',
      }}>{icon}</div>
      <div style={{ fontSize: 10, fontWeight: 700, color: '#0070C0', fontFamily: 'JetBrains Mono', letterSpacing: '0.07em', marginBottom: 4 }}>
        0{n}
      </div>
      <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 14, color: '#111827', marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.5 }}>{desc}</div>
    </div>
  );
}

// ─── Thermal Panel Visual ─────────────────────────────────────────────────────
function ThermalPanelVisual() {
  const COLS = 10, ROWS = 6;
  const hotspots = new Set([14, 15, 24, 25, 44]);
  const warm = new Set([5, 6, 16, 34, 35, 53, 54]);

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${COLS}, 1fr)`,
      gap: 2,
      padding: 12,
      background: '#0a1628',
      borderRadius: 10,
      border: '2px solid rgba(160,185,210,0.4)',
      boxShadow: '0 12px 40px rgba(0,0,0,0.2)',
      transform: 'perspective(500px) rotateY(-8deg) rotateX(4deg)',
    }}>
      {Array.from({ length: COLS * ROWS }, (_, i) => {
        const isHot = hotspots.has(i);
        const isWarm = warm.has(i);
        const bg = isHot
          ? `rgba(239,68,68,${0.7 + Math.sin(i) * 0.2})`
          : isWarm
            ? `rgba(249,115,22,${0.5 + Math.sin(i * 0.8) * 0.15})`
            : `rgb(${20 + Math.sin(i * 0.4) * 8},${60 + Math.sin(i * 0.6) * 12},${120 + Math.sin(i * 0.3) * 20})`;
        return (
          <div key={i} style={{ height: 32, borderRadius: 2, background: bg, position: 'relative' }}>
            {isHot && (
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 7, fontFamily: 'JetBrains Mono', color: 'rgba(255,255,255,0.9)', fontWeight: 700,
              }}>
                {(52 + Math.sin(i) * 3).toFixed(0)}°
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Dashboard Preview ────────────────────────────────────────────────────────
function DashboardPreview() {
  return (
    <div style={{
      background: '#ffffff',
      borderRadius: 14,
      overflow: 'hidden',
      boxShadow: '0 20px 60px rgba(0,0,0,0.14), 0 4px 16px rgba(0,0,0,0.08)',
      border: '1px solid #e5e7eb',
      transform: 'perspective(800px) rotateY(-4deg) rotateX(2deg)',
    }}>
      {/* Browser chrome */}
      <div style={{
        height: 36, background: '#f3f4f6',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex', alignItems: 'center',
        padding: '0 16px', gap: 6,
      }}>
        {['#ef4444', '#f59e0b', '#22c55e'].map((c) => (
          <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />
        ))}
        <div style={{
          flex: 1, height: 22, background: '#ffffff',
          borderRadius: 4, border: '1px solid #e5e7eb',
          display: 'flex', alignItems: 'center',
          paddingLeft: 10, fontSize: 10, color: '#9ca3af',
          fontFamily: 'Inter',
        }}>
          app.solaroptix.com/dashboard
        </div>
      </div>

      {/* Dashboard content */}
      <div style={{ padding: '14px', background: '#f4f5f7' }}>
        {/* Mini KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, marginBottom: 12 }}>
          {[
            { label: 'Output', value: '4.32 kW', color: '#0070C0' },
            { label: 'Efficiency', value: '82%', color: '#d97706' },
            { label: 'Energy Loss', value: '3.6 kWh', color: '#dc2626' },
            { label: 'Soiling', value: '64%', color: '#d97706' },
            { label: 'Temp', value: '44.8°C', color: '#374151' },
          ].map((k) => (
            <div key={k.label} style={{
              background: '#ffffff', borderRadius: 8, padding: '10px 10px',
              border: '1px solid #e5e7eb',
            }}>
              <div style={{ fontSize: 9, color: '#9ca3af', marginBottom: 3 }}>{k.label}</div>
              <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 14, color: k.color }}>{k.value}</div>
            </div>
          ))}
        </div>

        {/* Mini chart */}
        <div style={{ background: '#ffffff', borderRadius: 8, padding: '10px', border: '1px solid #e5e7eb' }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Expected vs Actual Output</div>
          <ResponsiveContainer width="100%" height={90}>
            <AreaChart data={chartData.slice(5, 20)} margin={{ top: 2, right: 2, left: -28, bottom: -4 }}>
              <defs>
                <linearGradient id="gE2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0070C0" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#0070C0" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gA2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="h" tick={{ fontSize: 7, fill: '#9ca3af' }} axisLine={false} tickLine={false} interval={2} />
              <YAxis tick={{ fontSize: 7, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={22} />
              <Area type="monotone" dataKey="Expected" stroke="#0070C0" strokeWidth={1.5} fill="url(#gE2)" dot={false} />
              <Area type="monotone" dataKey="Actual" stroke="#2563eb" strokeWidth={1.5} fill="url(#gA2)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// ─── Before / After Panel ─────────────────────────────────────────────────────
function BeforeAfterPanel({ clean }: { clean: boolean }) {
  const COLS = 6, ROWS = 4;
  return (
    <div style={{
      background: '#0a1628',
      borderRadius: 10,
      padding: 10,
      border: clean
        ? '1.5px solid rgba(0,112,192,0.4)'
        : '1.5px solid rgba(180,150,80,0.4)',
      boxShadow: clean
        ? '0 8px 32px rgba(0,112,192,0.1)'
        : '0 8px 32px rgba(180,140,0,0.1)',
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${COLS}, 1fr)`,
        gridTemplateRows: `repeat(${ROWS}, 1fr)`,
        gap: 2, height: 100,
      }}>
        {Array.from({ length: COLS * ROWS }, (_, i) => (
          <div key={i} style={{
            borderRadius: 2,
            background: clean
              ? `linear-gradient(135deg, #1a3a6e ${i % 3 === 0 ? '0%' : '20%'}, #0d2048 100%)`
              : `linear-gradient(135deg, #2a2815 0%, #1e1e0a 60%, #181500 100%)`,
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* Dust overlay for dirty panel */}
            {!clean && (
              <div style={{
                position: 'absolute', inset: 0,
                background: `rgba(${160 + Math.sin(i * 1.3) * 20}, ${140 + Math.cos(i * 0.9) * 15}, ${80 + Math.sin(i * 2.1) * 20}, ${0.25 + Math.abs(Math.sin(i * 0.7)) * 0.2})`,
              }} />
            )}
            {/* Clean reflection */}
            {clean && (
              <div style={{
                position: 'absolute', top: 0, left: '15%', width: '15%', height: '100%',
                background: 'linear-gradient(to bottom, rgba(255,255,255,0.06) 0%, transparent 100%)',
              }} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Landing Page ─────────────────────────────────────────────────────────────
interface Props {
  onViewDashboard: () => void;
  onRunDemo: () => void;
}

export default function LandingPage({ onViewDashboard, onRunDemo }: Props) {
  const [scrollY, setScrollY] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = () => setScrollY(el.scrollTop);
    el.addEventListener('scroll', handler, { passive: true });
    return () => el.removeEventListener('scroll', handler);
  }, []);

  const heroOpacity = Math.max(0, 1 - scrollY / 400);

  return (
    <div
      ref={containerRef}
      style={{
        height: '100%', overflowY: 'auto', overflowX: 'hidden',
        background: '#ffffff', fontFamily: 'Inter, sans-serif',
      }}
    >
      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section style={{
        minHeight: '100vh', position: 'relative',
        background: 'linear-gradient(160deg, #f8faff 0%, #ffffff 55%, #f4f8ff 100%)',
        display: 'flex', alignItems: 'center',
        overflow: 'hidden',
      }}>
        {/* Subtle grid */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.025 }}>
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#0070C0" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '80px 48px', display: 'grid', gridTemplateColumns: '1fr 1.15fr', gap: 48, alignItems: 'center', width: '100%' }}>
          {/* Left */}
          <div style={{ opacity: heroOpacity, transform: `translateY(${scrollY * 0.1}px)` }}>
            {/* Badge */}
            <div style={{ display: 'inline-flex', alignItems: 'center', marginBottom: 28 }}>
              <SolarOptixLogoFull symbolSize={30} fontSize={14} tagline />
            </div>

            {/* Heading */}
            <h1 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 'clamp(36px, 4.5vw, 58px)', color: '#111827', margin: '0 0 20px', lineHeight: 1.08, letterSpacing: '-0.02em' }}>
              Turn Solar Data
              <br />
              Into{' '}
              <span style={{ color: '#0070C0', position: 'relative' }}>
                More Energy.
                <svg style={{ position: 'absolute', bottom: -4, left: 0, width: '100%' }} height="4" viewBox="0 0 200 4">
                  <path d="M 0 3 Q 50 0 100 3 Q 150 6 200 3" fill="none" stroke="#0070C0" strokeWidth="2.5" opacity="0.4" />
                </svg>
              </span>
            </h1>

            <p style={{ fontSize: 17, color: '#6b7280', lineHeight: 1.7, margin: '0 0 36px', maxWidth: 440 }}>
              AI-powered solar PV efficiency optimization using thermal analysis, power analytics, and weather intelligence.
            </p>

            {/* CTAs */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 40, flexWrap: 'wrap' }}>
              <button
                onClick={onViewDashboard}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '13px 28px', borderRadius: 9,
                  background: '#0070C0', border: 'none', color: '#fff',
                  fontSize: 15, fontWeight: 600, fontFamily: 'Inter',
                  cursor: 'pointer',
                  boxShadow: '0 4px 18px rgba(0,112,192,0.28)',
                }}
              >
                View Live Dashboard <ArrowRight size={16} />
              </button>
              <button
                onClick={onRunDemo}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '13px 28px', borderRadius: 9,
                  background: '#fff', border: '1.5px solid #d1d5db', color: '#374151',
                  fontSize: 15, fontFamily: 'Inter', cursor: 'pointer',
                }}
              >
                Explore AI Demo <ChevronRight size={16} />
              </button>
            </div>

            {/* Micro features */}
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              {['24/7 Monitoring', 'AI Analysis', 'Weather Intelligence'].map((f) => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CheckCircle size={14} color="#0070C0" />
                  <span style={{ fontSize: 13, color: '#6b7280', fontWeight: 500 }}>{f}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right — 3D solar array */}
          <div style={{ position: 'relative', height: 520, transform: `translateY(${scrollY * 0.05}px)` }}>
            <SolarArray3D />
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{
          position: 'absolute', bottom: 28, left: '50%', transform: 'translateX(-50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
          opacity: heroOpacity * 0.7,
        }}>
          <span style={{ fontSize: 11, color: '#9ca3af' }}>Scroll to explore</span>
          <div style={{ width: 1, height: 32, background: 'linear-gradient(to bottom, #9ca3af, transparent)' }} />
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section style={{ padding: '80px 48px', background: '#ffffff', borderTop: '1px solid #f3f4f6' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#0070C0', letterSpacing: '0.08em', marginBottom: 12 }}>THE PLATFORM</div>
            <h2 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 'clamp(28px, 3.5vw, 40px)', color: '#111827', margin: 0 }}>
              From Panel Detection
              <br />to Energy Optimization.
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 0 }}>
            {[
              { n: 1, icon: '🔬', title: 'Thermal Camera', desc: 'Infrared imaging captures panel surface temperature patterns' },
              { n: 2, icon: '🔍', title: 'Detect', desc: 'AI identifies performance anomalies vs clean-panel baseline' },
              { n: 3, icon: '🧠', title: 'Analyze', desc: 'Multi-signal fusion determines root cause — soiling, fault, or shading' },
              { n: 4, icon: '🌦', title: 'Weather Check', desc: 'Rain probability and cleaning window analysis' },
              { n: 5, icon: '⚡', title: 'Optimize', desc: 'Targeted recommendation delivered to the operator dashboard' },
            ].map((step, i, arr) => (
              <div key={step.n} style={{ display: 'flex', alignItems: 'flex-start', flex: 1 }}>
                <ProcessStep {...step} />
                {i < arr.length - 1 && (
                  <div style={{ paddingTop: 24, flexShrink: 0, color: '#d1d5db', fontSize: 18, padding: '22px 4px 0' }}>→</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── THERMAL ANALYSIS ─────────────────────────────────────────────── */}
      <section style={{ padding: '80px 48px', background: '#f8faff', borderTop: '1px solid #f3f4f6' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
          {/* Thermal visual */}
          <div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#0070C0', letterSpacing: '0.08em', marginBottom: 10 }}>THERMAL ANALYSIS</div>
              <h2 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 32, color: '#111827', margin: '0 0 8px', lineHeight: 1.2 }}>
                See Exactly Where Performance Is Lost.
              </h2>
              <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.6, margin: 0 }}>
                Infrared imaging combined with power output data reveals hotspots and soiling zones invisible to the naked eye.
              </p>
            </div>
            <ThermalPanelVisual />
            {/* Temp scale */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
              <span style={{ fontSize: 10, color: '#9ca3af' }}>Cool</span>
              <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'linear-gradient(to right, #1a3a8a, #2596be, #f59e0b, #ef4444)' }} />
              <span style={{ fontSize: 10, color: '#9ca3af' }}>Hot</span>
            </div>
          </div>

          {/* Metrics */}
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              {[
                { label: 'Avg Temperature', value: '44.8°C', color: '#374151' },
                { label: 'Max Temperature', value: '58.0°C', color: '#dc2626' },
                { label: 'Hotspots', value: '4 detected', color: '#d97706' },
                { label: 'Thermal Anomaly', value: 'Moderate', color: '#d97706' },
                { label: 'Soiling Score', value: '64%', color: '#d97706' },
                { label: 'Possible Cause', value: 'Surface Soiling', color: '#0070C0' },
              ].map((m) => (
                <div key={m.label} style={{ background: '#ffffff', borderRadius: 10, padding: '14px 16px', border: '1px solid #e5e7eb' }}>
                  <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 4 }}>{m.label}</div>
                  <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 18, color: m.color }}>{m.value}</div>
                </div>
              ))}
            </div>
            <div style={{ padding: '16px 20px', background: '#e6f3fc', borderRadius: 10, border: '1px solid #b3d4f0' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#0070C0', marginBottom: 6 }}>AI ANALYSIS</div>
              <p style={{ fontSize: 13, color: '#374151', margin: 0, lineHeight: 1.6 }}>
                "Power output is 18% below the clean-panel baseline. Thermal patterns and power decline indicate possible surface soiling — not a cell fault."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── DASHBOARD PREVIEW ────────────────────────────────────────────── */}
      <section style={{ padding: '80px 48px', background: '#ffffff', borderTop: '1px solid #f3f4f6' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: 64, alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#0070C0', letterSpacing: '0.08em', marginBottom: 12 }}>LIVE DASHBOARD</div>
            <h2 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 32, color: '#111827', margin: '0 0 16px', lineHeight: 1.2 }}>
              Every metric. One screen. Real time.
            </h2>
            <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.7, margin: '0 0 28px' }}>
              SolarOptix consolidates thermal data, power analytics, weather intelligence, and AI recommendations into a single professional operations dashboard.
            </p>
            <button
              onClick={onViewDashboard}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '11px 24px', borderRadius: 8,
                background: '#0070C0', border: 'none', color: '#fff',
                fontSize: 14, fontWeight: 600, fontFamily: 'Inter', cursor: 'pointer',
              }}
            >
              Open Dashboard <ArrowRight size={15} />
            </button>
          </div>
          <DashboardPreview />
        </div>
      </section>

      {/* ── SMART CLEANING ───────────────────────────────────────────────── */}
      <section style={{ padding: '80px 48px', background: '#f8faff', borderTop: '1px solid #f3f4f6' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#0070C0', letterSpacing: '0.08em', marginBottom: 12 }}>SMART MAINTENANCE</div>
          <h2 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 32, color: '#111827', margin: '0 0 48px', lineHeight: 1.2 }}>
            Clean at the Right Time. Recover More Energy.
          </h2>

          {/* Decision flow */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 0, flexWrap: 'wrap', marginBottom: 48 }}>
            {[
              { label: 'Dust Detected', color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
              { label: 'Power Loss Confirmed', color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
              { label: 'Weather Check', color: '#0070C0', bg: '#e6f3fc', border: '#b3d4f0' },
              { label: 'Rain: 18%', color: '#0070C0', bg: '#e6f3fc', border: '#b3d4f0' },
              { label: 'Clean Now ✓', color: '#ffffff', bg: '#0070C0', border: '#005a99' },
            ].map((step, i, arr) => (
              <div key={step.label} style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{
                  padding: '10px 18px', borderRadius: 8,
                  background: step.bg, border: `1px solid ${step.border}`,
                  fontSize: 13, fontWeight: 600, color: step.color,
                  whiteSpace: 'nowrap',
                }}>
                  {step.label}
                </div>
                {i < arr.length - 1 && (
                  <div style={{ padding: '0 8px', color: '#d1d5db', fontSize: 18 }}>→</div>
                )}
              </div>
            ))}
          </div>

          {/* Recovery cards */}
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
            {[
              { label: 'Power Recovery', value: '+0.82 kW', icon: <Zap size={20} /> },
              { label: 'Daily Energy Recovery', value: '+4.2 kWh/day', icon: <TrendingDown size={20} /> },
              { label: 'Efficiency Gain', value: '+15%', icon: <Activity size={20} /> },
              { label: 'Revenue Recovery', value: '₹33/day', icon: <CheckCircle size={20} /> },
            ].map((card) => (
              <div key={card.label} style={{
                flex: 1, padding: '20px 16px', background: '#ffffff',
                borderRadius: 12, border: '1px solid #e5e7eb',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                textAlign: 'center',
              }}>
                <div style={{ color: '#0070C0', marginBottom: 10 }}>{card.icon}</div>
                <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 24, color: '#0070C0', marginBottom: 4 }}>{card.value}</div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>{card.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BEFORE / AFTER ───────────────────────────────────────────────── */}
      <section style={{ padding: '80px 48px', background: '#ffffff', borderTop: '1px solid #f3f4f6' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center', marginBottom: 48 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#0070C0', letterSpacing: '0.08em', marginBottom: 12 }}>CLEANING IMPACT</div>
          <h2 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 32, color: '#111827', margin: 0 }}>The Difference a Clean Panel Makes.</h2>
        </div>

        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 24, alignItems: 'center' }}>
          {/* Before */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#9ca3af', marginBottom: 14, letterSpacing: '0.06em' }}>BEFORE CLEANING</div>
            <BeforeAfterPanel clean={false} />
            <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[{ label: 'Efficiency', value: '82%' }, { label: 'Output', value: '4.32 kW' }].map((m) => (
                <div key={m.label} style={{ padding: '10px', background: '#f9fafb', borderRadius: 8, border: '1px solid #e5e7eb' }}>
                  <div style={{ fontSize: 10, color: '#9ca3af', marginBottom: 2 }}>{m.label}</div>
                  <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 18, color: '#9ca3af' }}>{m.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Arrow & gain */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 32, color: '#0070C0' }}>+15%</div>
            <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 12 }}>efficiency</div>
            <div style={{ fontSize: 24, color: '#0070C0' }}>→</div>
          </div>

          {/* After */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#0070C0', marginBottom: 14, letterSpacing: '0.06em' }}>AFTER CLEANING</div>
            <BeforeAfterPanel clean={true} />
            <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[{ label: 'Efficiency', value: '97%' }, { label: 'Output', value: '5.14 kW' }].map((m) => (
                <div key={m.label} style={{ padding: '10px', background: '#e6f3fc', borderRadius: 8, border: '1px solid #b3d4f0' }}>
                  <div style={{ fontSize: 10, color: '#0070C0', marginBottom: 2 }}>{m.label}</div>
                  <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 18, color: '#0070C0' }}>{m.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER CTA ───────────────────────────────────────────────────── */}
      <section style={{ padding: '80px 48px', background: '#0070C0', textAlign: 'center' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'center' }}>
            <SolarOptixLogoFull symbolSize={32} fontSize={16} bg="dark" />
          </div>
          <h2 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 'clamp(28px, 3.5vw, 40px)', color: '#ffffff', margin: '0 0 16px', lineHeight: 1.15 }}>
            See the Loss.<br />Optimize the Sun.
          </h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.75)', margin: '0 0 36px', lineHeight: 1.6 }}>
            Detect performance loss · Analyze the cause · Check weather · Optimize maintenance · Recover energy.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={onViewDashboard}
              style={{
                padding: '13px 30px', borderRadius: 9,
                background: '#ffffff', border: 'none',
                color: '#0070C0', fontSize: 15, fontWeight: 700,
                fontFamily: 'Inter', cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
              }}
            >
              View Solar Performance
            </button>
            <button
              onClick={onRunDemo}
              style={{
                padding: '13px 30px', borderRadius: 9,
                background: 'transparent', border: '1.5px solid rgba(255,255,255,0.4)',
                color: '#ffffff', fontSize: 15, fontFamily: 'Inter', cursor: 'pointer',
              }}
            >
              Run AI Demo
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
