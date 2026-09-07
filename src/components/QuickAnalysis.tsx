import { useState } from 'react';
import { ArrowRight, RefreshCw, AlertTriangle, CheckCircle, X } from 'lucide-react';
import type { ScenarioData } from '../data/demoScenarios';
import type { Page } from './Sidebar';

// ── Health computation ────────────────────────────────────────────────────────

function computeHealth(s: ScenarioData) {
  const perf      = Math.round((s.efficiency / 96) * 100);
  const thermal   = s.thermalAnomaly === 'LOW' ? 95 : s.thermalAnomaly === 'MEDIUM' ? 76 : 58;
  const soil      = Math.max(0, 100 - s.soilingScore);
  const electrical = s.systemHealth;
  const maint     = s.aiAction === 'MONITOR' ? 95 : s.aiAction === 'WAIT' ? 88 : s.aiAction === 'CLEAN' ? 72 : 58;
  const overall   = Math.round(perf * 0.30 + thermal * 0.25 + soil * 0.20 + electrical * 0.15 + maint * 0.10);
  return { overall, perf, thermal, soil, electrical, maint };
}

// ── Panel IDs ─────────────────────────────────────────────────────────────────

const PANEL_IDS = Array.from({ length: 20 }, (_, i) => {
  const row = ['A', 'B', 'C', 'D'][Math.floor(i / 5)];
  const col = String((i % 5) + 1).padStart(2, '0');
  return `${row}-${col}`;
});

const PRIORITY_ORDER: Record<string, number> = { hotspot: 0, warning: 1, reduced: 2, normal: 3 };

const PRIORITY_META = {
  CRITICAL: { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' },
  HIGH:     { bg: '#fffbeb', color: '#d97706', border: '#fde68a' },
  MEDIUM:   { bg: '#fefce8', color: '#ca8a04', border: '#fef08a' },
  LOW:      { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
} as const;

// ── Priority panel builder ────────────────────────────────────────────────────

function buildPriorityPanels(s: ScenarioData) {
  return s.panelStatuses
    .map((status, i) => ({
      id: PANEL_IDS[i],
      status,
      health: status === 'hotspot' ? 55 + (i % 5) * 2 : status === 'warning' ? 68 + (i % 6) * 2 : status === 'reduced' ? 78 + (i % 5) * 2 : 95,
      soiling: Math.min(100, Math.max(0,
        status === 'hotspot' ? s.soilingScore + 14 :
        status === 'warning'  ? s.soilingScore + 7  :
        status === 'reduced'  ? s.soilingScore - 8  :
        s.soilingScore - 20
      )),
      loss: status === 'hotspot' ? Math.round(s.energyLoss * 8 * 0.15) :
            status === 'warning'  ? Math.round(s.energyLoss * 8 * 0.10) :
            status === 'reduced'  ? Math.round(s.energyLoss * 8 * 0.06) : 0,
      thermal: status === 'hotspot' ? 'High' : status === 'warning' && s.thermalAnomaly !== 'LOW' ? 'Moderate' : 'Low',
      priority: (status === 'hotspot' ? 'CRITICAL' : status === 'warning' ? 'HIGH' : status === 'reduced' ? 'MEDIUM' : 'LOW') as keyof typeof PRIORITY_META,
      action: status === 'hotspot' ? 'Inspect + Clean' : status === 'warning' ? 'Clean' : status === 'reduced' ? 'Monitor' : 'None',
    }))
    .filter(p => p.status !== 'normal')
    .sort((a, b) => PRIORITY_ORDER[a.status] - PRIORITY_ORDER[b.status])
    .slice(0, 3);
}

// ── Prediction builder ────────────────────────────────────────────────────────

interface Prediction { window: string; panel: string; issue: string; probability: number; impact: string }

function buildPredictions(s: ScenarioData): Prediction[] {
  const preds: Prediction[] = [];
  if (s.thermalAnomaly !== 'LOW') {
    preds.push({
      window: 'NEXT 7 DAYS',
      panel: s.hotspots > 0 ? 'Panel A-04' : 'Array Output',
      issue: s.thermalAnomaly === 'HIGH' ? 'Potential efficiency degradation' : 'Thermal performance decline',
      probability: s.thermalAnomaly === 'HIGH' ? 82 : 68,
      impact: s.thermalAnomaly === 'HIGH' ? 'High' : 'Medium',
    });
  }
  if (s.soilingScore > 30) {
    preds.push({
      window: 'NEXT 14 DAYS',
      panel: 'Panel A-07',
      issue: 'Soiling-related performance decline',
      probability: Math.min(88, 45 + Math.round(s.soilingScore / 3)),
      impact: 'Medium',
    });
  } else if (s.cloudCoverage > 50) {
    preds.push({
      window: 'NEXT 14 DAYS',
      panel: 'Array Output',
      issue: 'Continued irradiance reduction forecast',
      probability: 62,
      impact: 'Medium',
    });
  }
  preds.push({
    window: 'NEXT 30 DAYS',
    panel: 'Array Inverter',
    issue: 'Performance degradation pattern detected',
    probability: s.systemHealth < 75 ? 61 : 44,
    impact: 'Medium',
  });
  return preds.slice(0, 3);
}

// ── Maintenance history records ───────────────────────────────────────────────

interface PanelHistoryRecord { date: string; event: string; detail: string }
interface PanelHistory {
  health: number; installed: string; lastCleaned: string; lastInspected: string;
  issue: string; records: PanelHistoryRecord[];
}

const PANEL_HISTORIES: Record<string, PanelHistory> = {
  'A-04': {
    health: 61, installed: '12 Jan 2025', lastCleaned: '28 Aug 2026', lastInspected: '02 Sep 2026',
    issue: 'High thermal anomaly',
    records: [
      { date: '28 Aug 2026', event: 'Panel cleaned', detail: 'Efficiency improved by 9%' },
      { date: '12 Jul 2026', event: 'Thermal inspection', detail: 'Elevated temperature noted — monitor advised' },
      { date: '18 May 2026', event: 'Routine maintenance', detail: 'All checks passed' },
      { date: '02 Feb 2026', event: 'Panel cleaned', detail: 'Efficiency improved by 12%' },
    ],
  },
  'A-07': {
    health: 72, installed: '12 Jan 2025', lastCleaned: '02 Sep 2026', lastInspected: '02 Sep 2026',
    issue: 'Moderate soiling',
    records: [
      { date: '02 Sep 2026', event: 'Panel cleaned', detail: 'Efficiency improved by 8%' },
      { date: '28 Jun 2026', event: 'Routine maintenance', detail: 'All checks passed' },
      { date: '15 Mar 2026', event: 'Panel cleaned', detail: 'Efficiency improved by 11%' },
    ],
  },
  'B-03': {
    health: 81, installed: '12 Jan 2025', lastCleaned: '02 Sep 2026', lastInspected: '18 Aug 2026',
    issue: 'Minor soiling — monitor',
    records: [
      { date: '02 Sep 2026', event: 'Panel cleaned', detail: 'Efficiency improved by 5%' },
      { date: '18 Aug 2026', event: 'Thermal inspection', detail: 'Normal range' },
      { date: '22 Jun 2026', event: 'Routine maintenance', detail: 'All checks passed' },
    ],
  },
  'C-01': {
    health: 88, installed: '12 Jan 2025', lastCleaned: '18 Aug 2026', lastInspected: '02 Sep 2026',
    issue: 'None',
    records: [
      { date: '18 Aug 2026', event: 'Panel cleaned', detail: 'Efficiency improved by 4%' },
      { date: '02 Sep 2026', event: 'Routine inspection', detail: 'All checks passed' },
      { date: '10 Apr 2026', event: 'Panel cleaned', detail: 'Efficiency improved by 7%' },
    ],
  },
};

// ── Health gauge (SVG arc) ────────────────────────────────────────────────────

function HealthGauge({ score }: { score: number }) {
  const r = 50, cx = 68, cy = 70;
  const circumf = 2 * Math.PI * r;
  const arcSpan = 0.75 * circumf;
  const fillLen = (score / 100) * arcSpan;
  const color = score >= 80 ? '#16a34a' : score >= 60 ? '#d97706' : '#dc2626';
  const label = score >= 80 ? 'GOOD' : score >= 60 ? 'FAIR' : 'POOR';
  return (
    <svg viewBox="0 0 136 128" width={136} height={128} style={{ display: 'block' }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f3f4f6" strokeWidth="11"
        strokeDasharray={`${arcSpan.toFixed(1)} ${(circumf - arcSpan).toFixed(1)}`}
        strokeLinecap="round" transform={`rotate(135 ${cx} ${cy})`}/>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="11"
        strokeDasharray={`${fillLen.toFixed(1)} ${(circumf - fillLen).toFixed(1)}`}
        strokeLinecap="round" transform={`rotate(135 ${cx} ${cy})`}/>
      <text x={cx} y={cy - 4} textAnchor="middle" fontFamily="Outfit,sans-serif" fontWeight="800" fontSize="30" fill="#111827">{score}</text>
      <text x={cx} y={cy + 14} textAnchor="middle" fontFamily="Inter,sans-serif" fontSize="11" fill="#9ca3af">/ 100</text>
      <text x={cx} y={cy + 36} textAnchor="middle" fontFamily="Inter,sans-serif" fontWeight="700" fontSize="11" fill={color} letterSpacing="0.07em">{label}</text>
    </svg>
  );
}

// ── Score bar row ─────────────────────────────────────────────────────────────

function ScoreBar({ label, value }: { label: string; value: number }) {
  const color = value >= 80 ? '#16a34a' : value >= 60 ? '#d97706' : '#dc2626';
  return (
    <div style={{ marginBottom: 9 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
        <span style={{ fontSize: 12, color: '#6b7280' }}>{label}</span>
        <span style={{ fontSize: 11, fontWeight: 700, color, fontFamily: 'JetBrains Mono' }}>{value}%</span>
      </div>
      <div style={{ height: 5, borderRadius: 3, background: '#f3f4f6', overflow: 'hidden' }}>
        <div className="progress-fill" style={{ height: '100%', width: `${value}%`, background: color, borderRadius: 3 }}/>
      </div>
    </div>
  );
}

// ── Priority badge ────────────────────────────────────────────────────────────

function PriorityBadge({ level }: { level: keyof typeof PRIORITY_META }) {
  const m = PRIORITY_META[level];
  return (
    <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700, background: m.bg, color: m.color, border: `1px solid ${m.border}`, letterSpacing: '0.04em' }}>
      {level}
    </span>
  );
}

// ── QR Code (deterministic visual) ───────────────────────────────────────────

function QRCodeSVG({ seed, size = 84 }: { seed: string; size?: number }) {
  const n = 21;
  const cell = size / n;
  // seeded PRNG
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  const rand = () => { h = (h * 1664525 + 1013904223) | 0; return (h >>> 0) / 4294967296; };
  // build matrix
  const m: boolean[][] = Array.from({ length: n }, () => Array(n).fill(false));
  // finder pattern helper
  const finder = (r0: number, c0: number) => {
    for (let r = 0; r < 7; r++) for (let c = 0; c < 7; c++)
      m[r0+r][c0+c] = r===0||r===6||c===0||c===6||(r>=2&&r<=4&&c>=2&&c<=4);
  };
  finder(0, 0); finder(0, 14); finder(14, 0);
  // timing
  for (let i = 8; i < 13; i++) { m[6][i] = i%2===0; m[i][6] = i%2===0; }
  // dark module
  m[8][8] = true;
  // reserved zones
  const reserved = new Set<string>();
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++)
    if ((r<9&&c<9)||(r<9&&c>12)||(r>12&&c<9)||r===6||c===6) reserved.add(`${r},${c}`);
  // data modules
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++)
    if (!reserved.has(`${r},${c}`)) m[r][c] = rand() > 0.42;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block' }}>
      <rect width={size} height={size} fill="#ffffff"/>
      {m.flatMap((row, r) => row.map((dark, c) =>
        dark ? <rect key={`${r},${c}`} x={c*cell} y={r*cell} width={cell-0.4} height={cell-0.4} fill="#111827" rx="0.5"/> : null
      ))}
    </svg>
  );
}

// ── QR Detail Modal ───────────────────────────────────────────────────────────

function QRDetailModal({ panelId, onClose }: { panelId: string; onClose: () => void }) {
  const info = PANEL_HISTORIES[panelId] ?? PANEL_HISTORIES['A-04'];
  const hColor = info.health >= 80 ? '#16a34a' : info.health >= 60 ? '#d97706' : '#dc2626';
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.32)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <div style={{ background: '#fff', borderRadius: 16, width: 500, maxHeight: '88vh', overflowY: 'auto', border: '1px solid #e5e7eb', boxShadow: '0 24px 64px rgba(0,0,0,0.18)' }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <span style={{ fontFamily: 'JetBrains Mono', fontWeight: 700, fontSize: 18, color: '#111827' }}>Panel {panelId}</span>
              <span style={{ fontSize: 10, fontWeight: 700, color: hColor, background: hColor === '#16a34a' ? '#f0fdf4' : hColor === '#d97706' ? '#fffbeb' : '#fef2f2', border: `1px solid ${hColor === '#16a34a' ? '#bbf7d0' : hColor === '#d97706' ? '#fde68a' : '#fecaca'}`, padding: '2px 8px', borderRadius: 4 }}>{info.health >= 80 ? 'HEALTHY' : info.health >= 60 ? 'DEGRADED' : 'CRITICAL'}</span>
            </div>
            <div style={{ fontSize: 12, color: '#9ca3af' }}>Maintenance & Inspection Record</div>
          </div>
          <button onClick={onClose} style={{ background: '#f3f4f6', border: 'none', width: 28, height: 28, borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}><X size={14}/></button>
        </div>
        {/* Stats */}
        <div style={{ padding: '16px 24px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, borderBottom: '1px solid #f3f4f6' }}>
          {[
            { label: 'Health Score', value: `${info.health} / 100`, color: hColor },
            { label: 'Installed', value: info.installed, color: '#374151' },
            { label: 'Last Cleaned', value: info.lastCleaned, color: '#374151' },
          ].map(st => (
            <div key={st.label} style={{ padding: '12px', background: '#f9fafb', borderRadius: 8, border: '1px solid #f3f4f6' }}>
              <div style={{ fontSize: 10, color: '#9ca3af', marginBottom: 4 }}>{st.label}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: st.color }}>{st.value}</div>
            </div>
          ))}
        </div>
        {/* Current issue */}
        {info.issue !== 'None' && (
          <div style={{ padding: '10px 24px', background: '#fef2f2', borderBottom: '1px solid #fecaca' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#dc2626' }}>CURRENT ISSUE — </span>
            <span style={{ fontSize: 12, color: '#dc2626' }}>{info.issue}</span>
          </div>
        )}
        {/* History */}
        <div style={{ padding: '18px 24px 24px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#374151', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 14 }}>Maintenance History</div>
          {info.records.map((rec, i) => (
            <div key={i} style={{ display: 'flex', gap: 14, marginBottom: i < info.records.length-1 ? 2 : 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#0070C0', flexShrink: 0, marginTop: 4 }}/>
                {i < info.records.length-1 && <div style={{ width: 1, flex: 1, minHeight: 24, background: '#e5e7eb' }}/>}
              </div>
              <div style={{ flex: 1, paddingBottom: 14 }}>
                <div style={{ fontSize: 10, color: '#9ca3af', fontFamily: 'JetBrains Mono' }}>{rec.date}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', margin: '2px 0 1px' }}>{rec.event}</div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>{rec.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

interface Props {
  scenario: ScenarioData;
  onNavigate: (p: Page) => void;
}

export default function QuickAnalysis({ scenario: s, onNavigate }: Props) {
  const [rate, setRate] = useState(8);
  const [expectedGen, setExpectedGen] = useState(26);
  const [selectedPanel, setSelectedPanel] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [runCount, setRunCount] = useState(0);

  // Loss calculator
  const actualGen  = parseFloat((expectedGen * (s.efficiency / 96)).toFixed(1));
  const energyLoss = parseFloat(Math.max(0, expectedGen - actualGen).toFixed(1));
  const dailyLoss  = Math.round(energyLoss * rate);

  // Health
  const { overall: healthScore, perf, thermal, soil, electrical, maint } = computeHealth(s);
  const healthColor = healthScore >= 80 ? '#16a34a' : healthScore >= 60 ? '#d97706' : '#dc2626';

  // Scorecard derived
  const issueCount    = s.panelStatuses.filter(st => st !== 'normal').length;
  const predictedRisk = s.thermalAnomaly === 'HIGH' || s.systemHealth < 70 ? 'High' : s.thermalAnomaly === 'MEDIUM' || s.soilingScore > 60 ? 'Medium' : 'Low';
  const riskColor     = predictedRisk === 'High' ? '#dc2626' : predictedRisk === 'Medium' ? '#d97706' : '#16a34a';

  const priorityPanels = buildPriorityPanels(s);
  const predictions    = buildPredictions(s);

  const recoverableKWh = parseFloat((energyLoss * 0.8).toFixed(1));
  const recoverableRev = Math.round(recoverableKWh * rate);

  const QR_PANELS = ['A-04', 'A-07', 'B-03', 'C-01'];

  function runAnalysis() {
    setIsAnalyzing(true);
    setTimeout(() => { setIsAnalyzing(false); setRunCount(c => c+1); }, 1600);
  }

  return (
    <div key={runCount} className="fade-in" style={{ marginBottom: 4 }}>

      {/* ── Divider / Section header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 14 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
            <div style={{ width: 3, height: 20, background: '#0070C0', borderRadius: 2 }}/>
            <h2 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 18, color: '#111827', margin: 0 }}>Quick Analysis</h2>
          </div>
          <div style={{ fontSize: 12, color: '#9ca3af', paddingLeft: 11 }}>AI-powered overview of your solar installation</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 11, color: '#9ca3af' }}>Last analysis: Just now</span>
          <button
            onClick={runAnalysis}
            disabled={isAnalyzing}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 15px', borderRadius: 7, background: isAnalyzing ? '#6b7280' : '#0070C0', border: 'none', color: '#fff', fontSize: 12, fontWeight: 600, fontFamily: 'Inter', cursor: isAnalyzing ? 'wait' : 'pointer' }}
          >
            <RefreshCw size={12} style={{ animation: isAnalyzing ? 'spin 0.8s linear infinite' : 'none' }}/>
            {isAnalyzing ? 'Analyzing…' : 'Run New Analysis'}
          </button>
        </div>
      </div>

      {/* ── Scorecard row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, marginBottom: 14 }}>
        {[
          { label: 'HEALTH', value: `${healthScore}/100`, color: healthColor, sub: healthScore >= 80 ? 'Good' : 'Degraded' },
          { label: 'EFFICIENCY', value: `${s.efficiency}%`, color: s.efficiency >= 85 ? '#0070C0' : s.efficiency >= 70 ? '#d97706' : '#dc2626', sub: `Baseline: 96%` },
          { label: '₹ LOSS', value: `₹${dailyLoss}/day`, color: '#dc2626', sub: `₹${(dailyLoss*30).toLocaleString()}/month` },
          { label: 'MAINTENANCE', value: `${issueCount} panel${issueCount !== 1 ? 's' : ''}`, color: issueCount === 0 ? '#16a34a' : issueCount > 3 ? '#dc2626' : '#d97706', sub: issueCount === 0 ? 'All clear' : 'Need attention' },
          { label: 'PREDICTED RISK', value: predictedRisk, color: riskColor, sub: 'AI forecast' },
        ].map((c) => (
          <div key={c.label} className="card" style={{ padding: '12px 14px' }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.08em', marginBottom: 6 }}>{c.label}</div>
            <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 17, color: c.color, lineHeight: 1.1 }}>{c.value}</div>
            <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 2 }}>{c.sub}</div>
          </div>
        ))}
      </div>

      {/* ── AI Summary ── */}
      <div style={{ background: '#e6f3fc', border: '1px solid #b3d4f0', borderRadius: 10, padding: '14px 18px', marginBottom: 14 }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: '#0070C0', letterSpacing: '0.08em', marginBottom: 7 }}>AI SYSTEM SUMMARY</div>
        <p style={{ fontSize: 13, color: '#0c4a6e', lineHeight: 1.75, margin: 0 }}>
          Your solar installation is operating at{' '}
          <strong>{s.efficiency}% efficiency</strong>,{' '}
          <strong>{(96 - s.efficiency)}% below the clean-panel baseline</strong>.
          {s.possibleCause !== 'None detected' && ` Possible cause: ${s.possibleCause}.`}
          {priorityPanels.length > 0 && ` Panel ${priorityPanels[0].id} has the highest maintenance priority (${priorityPanels[0].priority}).`}
          {' '}{s.aiAction === 'CLEAN' ? 'Cleaning is recommended within 24 hours.' : s.aiAction === 'INSPECT' ? 'Immediate technical inspection is required.' : s.aiAction === 'WAIT' ? 'Rain expected — defer cleaning for natural wash.' : 'Continue monitoring. No immediate action required.'}
          {' '}Estimated recoverable generation: <strong>+{recoverableKWh} kWh/day</strong>.{' '}
          Estimated recoverable revenue: <strong>+₹{recoverableRev}/day</strong>.
        </p>
      </div>

      {/* ── Row: Health Score + Loss Calculator ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>

        {/* Health Score */}
        <div className="card" style={{ padding: '18px 20px' }}>
          <div style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 15, color: '#111827', marginBottom: 14 }}>Solar Panel Health Score</div>
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            <div style={{ flexShrink: 0 }}>
              <HealthGauge score={healthScore}/>
              <div style={{ fontSize: 11, color: '#9ca3af', textAlign: 'center', maxWidth: 136, marginTop: 4, lineHeight: 1.5 }}>
                {healthScore >= 80 ? 'Healthy with minor efficiency degradation.' : healthScore >= 60 ? 'Moderate degradation — maintenance advised.' : 'Critical condition — immediate action required.'}
              </div>
            </div>
            <div style={{ flex: 1, paddingTop: 6 }}>
              <ScoreBar label="Performance" value={perf}/>
              <ScoreBar label="Thermal Health" value={thermal}/>
              <ScoreBar label="Soiling" value={soil}/>
              <ScoreBar label="Electrical Health" value={electrical}/>
              <ScoreBar label="Maintenance" value={maint}/>
              <div style={{ marginTop: 10, fontSize: 11, color: '#9ca3af', lineHeight: 1.5 }}>
                Overall system condition: <span style={{ color: healthColor, fontWeight: 600 }}>{healthScore >= 80 ? 'Healthy' : healthScore >= 60 ? 'Fair' : 'Poor'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Loss Calculator */}
        <div className="card" style={{ padding: '18px 20px' }}>
          <div style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 15, color: '#111827', marginBottom: 2 }}>Energy & Revenue Loss</div>
          <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 14 }}>Adjust inputs to recalculate your loss</div>

          {/* Interactive inputs */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 12 }}>
            {([
              { label: 'Rate (₹/kWh)', val: rate, setter: setRate, min: 1, max: 20, step: 0.5 },
              { label: 'Expected Gen', val: expectedGen, setter: setExpectedGen, min: 5, max: 100, step: 1 },
              { label: 'Actual Gen', val: actualGen, setter: null, min: 0, max: 100, step: 1 },
            ] as const).map((inp) => (
              <div key={inp.label}>
                <div style={{ fontSize: 10, color: '#9ca3af', marginBottom: 4 }}>{inp.label}</div>
                {inp.setter ? (
                  <input type="number" value={inp.val} min={inp.min} max={inp.max} step={inp.step}
                    onChange={e => (inp.setter as (v: number) => void)(parseFloat(e.target.value) || 0)}
                    style={{ width: '100%', padding: '6px 8px', borderRadius: 6, border: '1px solid #e5e7eb', fontSize: 13, fontWeight: 600, fontFamily: 'JetBrains Mono', color: '#111827', background: '#f9fafb' }}/>
                ) : (
                  <div style={{ padding: '6px 8px', borderRadius: 6, border: '1px solid #e5e7eb', background: '#f3f4f6', fontSize: 13, fontWeight: 600, fontFamily: 'JetBrains Mono', color: '#9ca3af' }}>{actualGen}</div>
                )}
              </div>
            ))}
          </div>

          {/* Energy loss row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#f9fafb', borderRadius: 7, border: '1px solid #e5e7eb', marginBottom: 12 }}>
            <span style={{ fontSize: 12, color: '#6b7280' }}>Energy Loss</span>
            <span style={{ fontFamily: 'JetBrains Mono', fontWeight: 700, fontSize: 14, color: '#d97706' }}>{energyLoss} kWh/day</span>
          </div>

          {/* Loss breakdown */}
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '12px 14px', marginBottom: 12 }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: '#dc2626', letterSpacing: '0.08em', marginBottom: 10 }}>ESTIMATED REVENUE LOSS</div>
            {[
              { label: 'Daily',   value: `₹${dailyLoss.toLocaleString()}`,        size: 16 },
              { label: 'Monthly', value: `₹${(dailyLoss*30).toLocaleString()}`,   size: 18 },
              { label: 'Annual',  value: `₹${(dailyLoss*365).toLocaleString()}`,  size: 22 },
            ].map(row => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: '#9ca3af' }}>{row.label}</span>
                <span style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: row.size, color: '#dc2626' }}>{row.value}</span>
              </div>
            ))}
            <div style={{ fontSize: 10, color: '#9ca3af', borderTop: '1px solid #fecaca', paddingTop: 7, marginTop: 4 }}>
              Estimated loss based on the difference between expected and actual generation.
            </div>
          </div>

          <button onClick={() => onNavigate('energy')} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#0070C0', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontWeight: 500 }}>
            View Loss Analysis <ArrowRight size={13}/>
          </button>
        </div>
      </div>

      {/* ── AI Maintenance Priority ── */}
      <div className="card" style={{ padding: '18px 20px', marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
          <div>
            <div style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 15, color: '#111827' }}>AI Maintenance Priority</div>
            <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>Which panel needs attention first?</div>
          </div>
          <button onClick={() => onNavigate('panels')} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#0070C0', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontWeight: 500 }}>
            View All Panels <ArrowRight size={13}/>
          </button>
        </div>

        {priorityPanels.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', background: '#f0fdf4', borderRadius: 10, border: '1px solid #bbf7d0' }}>
            <CheckCircle size={20} color="#16a34a" style={{ marginBottom: 8 }}/>
            <div style={{ fontSize: 13, color: '#16a34a', fontWeight: 600 }}>All panels operating normally. No maintenance required.</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
            {priorityPanels.map((panel, idx) => {
              const pm = PRIORITY_META[panel.priority];
              return (
                <div key={panel.id} style={{ border: `1px solid ${pm.border}`, borderRadius: 10, padding: '14px 16px', background: '#ffffff' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: pm.bg, border: `1px solid ${pm.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: pm.color, flexShrink: 0 }}>{idx+1}</div>
                    <span style={{ fontFamily: 'JetBrains Mono', fontWeight: 700, fontSize: 14, color: '#111827' }}>Panel {panel.id}</span>
                    <PriorityBadge level={panel.priority}/>
                  </div>
                  {([
                    { label: 'Health',           value: `${panel.health}%` },
                    { label: 'Thermal Anomaly',  value: panel.thermal },
                    { label: 'Soiling',          value: `${panel.soiling}%` },
                    { label: 'Est. Loss',        value: `₹${panel.loss}/day` },
                    { label: 'Recommended',      value: panel.action },
                  ] as const).map(r => (
                    <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 5, borderBottom: '1px solid #f3f4f6', marginBottom: 5, fontSize: 12 }}>
                      <span style={{ color: '#9ca3af' }}>{r.label}</span>
                      <span style={{ fontWeight: 600, color: '#374151' }}>{r.value}</span>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}

        <div style={{ marginTop: 12, fontSize: 11, color: '#9ca3af', fontStyle: 'italic' }}>
          Priority is calculated from health score, power loss, thermal anomaly, soiling level, and estimated revenue impact.
        </div>
      </div>

      {/* ── Row: Predictive Maintenance + QR History ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>

        {/* Predictive Maintenance */}
        <div className="card" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
            <div>
              <div style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 15, color: '#111827' }}>Predictive Maintenance</div>
              <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>Potential issues before they become failures</div>
            </div>
            <span style={{ fontSize: 9, fontWeight: 700, color: '#0070C0', background: '#e6f3fc', border: '1px solid #b3d4f0', padding: '3px 8px', borderRadius: 4, letterSpacing: '0.05em' }}>AI PREDICTION</span>
          </div>

          {predictions.map((pred, i) => {
            const iColor = pred.impact === 'High' ? '#dc2626' : pred.impact === 'Medium' ? '#d97706' : '#0070C0';
            return (
              <div key={i} style={{ marginBottom: i < predictions.length-1 ? 14 : 0, paddingBottom: i < predictions.length-1 ? 14 : 0, borderBottom: i < predictions.length-1 ? '1px solid #f3f4f6' : 'none' }}>
                <div style={{ display: 'inline-block', fontSize: 9, fontWeight: 700, color: '#6b7280', background: '#f3f4f6', padding: '2px 7px', borderRadius: 4, letterSpacing: '0.07em', marginBottom: 5 }}>{pred.window}</div>
                <div style={{ fontWeight: 600, fontSize: 13, color: '#111827', marginBottom: 2 }}>{pred.panel}</div>
                <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>{pred.issue}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 10, color: '#9ca3af', marginBottom: 3 }}>AI Prediction probability</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ flex: 1, height: 4, borderRadius: 2, background: '#f3f4f6' }}>
                        <div style={{ height: '100%', width: `${pred.probability}%`, background: iColor, borderRadius: 2 }}/>
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, color: iColor, fontFamily: 'JetBrains Mono', minWidth: 32 }}>{pred.probability}%</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 10, color: '#9ca3af' }}>Expected Impact</div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: iColor }}>{pred.impact}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* QR Panel Maintenance History */}
        <div className="card" style={{ padding: '18px 20px' }}>
          <div style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 15, color: '#111827', marginBottom: 2 }}>Panel Maintenance History</div>
          <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 14 }}>Every panel has a unique QR code for complete traceability</div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
            {QR_PANELS.map(id => (
              <div
                key={id}
                onClick={() => setSelectedPanel(id)}
                style={{ border: '1px solid #e5e7eb', borderRadius: 10, padding: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7, cursor: 'pointer', transition: 'all 0.15s' }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = '#0070C0'; el.style.boxShadow = '0 2px 10px rgba(0,112,192,0.12)'; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = '#e5e7eb'; el.style.boxShadow = 'none'; }}
              >
                <div style={{ border: '1px solid #f3f4f6', borderRadius: 6, padding: 3, background: '#fff' }}>
                  <QRCodeSVG seed={id} size={72}/>
                </div>
                <div style={{ fontFamily: 'JetBrains Mono', fontWeight: 700, fontSize: 11, color: '#374151' }}>Panel {id}</div>
                <div style={{ fontSize: 10, color: '#0070C0', fontWeight: 600 }}>View History →</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button style={{ flex: 1, padding: '9px', borderRadius: 7, background: '#0070C0', border: 'none', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter' }}>
              Generate QR Codes
            </button>
            <button style={{ flex: 1, padding: '9px', borderRadius: 7, background: '#f9fafb', border: '1px solid #e5e7eb', color: '#374151', fontSize: 12, cursor: 'pointer' }}>
              Scan Panel QR
            </button>
          </div>

          <div style={{ marginTop: 12, fontSize: 11, color: '#9ca3af', lineHeight: 1.6 }}>
            Scan includes: specifications, installation date, maintenance history, faults, thermal inspections, efficiency history, and technician records.
          </div>
        </div>
      </div>

      {/* QR Detail Modal */}
      {selectedPanel && <QRDetailModal panelId={selectedPanel} onClose={() => setSelectedPanel(null)}/>}
    </div>
  );
}
