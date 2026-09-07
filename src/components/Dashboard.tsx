import { useState } from 'react';
import {
  Zap, TrendingDown, Sun, Thermometer, Wind, Activity, Shield, Droplets,
  ArrowRight, CheckCircle, AlertTriangle, Info,
} from 'lucide-react';
import QuickAnalysis from './QuickAnalysis';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';
import type { ScenarioData } from '../data/demoScenarios';
import type { Page } from './Sidebar';

type Period = 'today' | '7d' | '30d';

function generateChartData(s: ScenarioData, period: Period) {
  const expected = s.powerOutput / (s.efficiency / 100);
  if (period === 'today') {
    return Array.from({ length: 24 }, (_, h) => {
      const curve = Math.max(0, Math.sin((h - 6) * (Math.PI / 12)));
      return {
        label: `${String(h).padStart(2, '0')}:00`,
        Expected: parseFloat((expected * curve).toFixed(2)),
        Actual: parseFloat((s.powerOutput * curve * (0.9 + Math.sin(h * 0.7) * 0.05)).toFixed(2)),
      };
    });
  }
  if (period === '7d') {
    return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d, i) => {
      const w = [1, 0.74, 0.9, 1, 0.68, 0.93, 1][i];
      return {
        label: d,
        Expected: parseFloat((expected * 9.2 * w).toFixed(1)),
        Actual: parseFloat((s.powerOutput * 9.2 * w * (0.88 + Math.sin(i) * 0.04)).toFixed(1)),
      };
    });
  }
  return Array.from({ length: 30 }, (_, i) => {
    const w = 0.85 + Math.sin(i * 0.4) * 0.12;
    return {
      label: `${i + 1}`,
      Expected: parseFloat((expected * 9.2 * w).toFixed(1)),
      Actual: parseFloat((s.powerOutput * 9.2 * w * (0.87 + Math.cos(i * 0.3) * 0.05)).toFixed(1)),
    };
  });
}

const ChartTooltip = ({ active, payload, label }: { active?: boolean; payload?: { color: string; name: string; value: number }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8,
      padding: '10px 14px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    }}>
      <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 6 }}>{label}</div>
      {payload.map((p) => (
        <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
          <div style={{ width: 8, height: 8, borderRadius: 2, background: p.color }} />
          <span style={{ fontSize: 12, color: '#6b7280' }}>{p.name}:</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#111827' }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
};

const actionMeta: Record<string, { label: string; color: string; bg: string; border: string; icon: React.ReactNode }> = {
  CLEAN: { label: 'Cleaning Recommended', color: '#dc2626', bg: '#fef2f2', border: '#fecaca', icon: <AlertTriangle size={16} /> },
  INSPECT: { label: 'Inspection Required', color: '#d97706', bg: '#fffbeb', border: '#fde68a', icon: <AlertTriangle size={16} /> },
  WAIT: { label: 'Wait for Rain', color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', icon: <Info size={16} /> },
  MONITOR: { label: 'Monitoring', color: '#0070C0', bg: '#e6f3fc', border: '#b3d4f0', icon: <CheckCircle size={16} /> },
};

interface Props {
  scenario: ScenarioData;
  onNavigate: (p: Page) => void;
}

export default function Dashboard({ scenario: s, onNavigate }: Props) {
  const [period, setPeriod] = useState<Period>('today');
  const chartData = generateChartData(s, period);
  const meta = actionMeta[s.aiAction];

  const kpiCards = [
    { label: 'Current Output', value: `${s.powerOutput.toFixed(2)} kW`, sub: `of ${(s.powerOutput / (s.efficiency / 96)).toFixed(2)} kW rated`, icon: <Zap size={15} />, valueColor: '#111827' },
    { label: 'System Efficiency', value: `${s.efficiency}%`, sub: `Baseline: 96%`, icon: <Activity size={15} />, valueColor: s.efficiency >= 90 ? '#0070C0' : s.efficiency >= 75 ? '#d97706' : '#dc2626' },
    { label: 'Energy Loss', value: `${s.energyLoss.toFixed(1)} kWh`, sub: `≈ ₹${(s.energyLoss * 8).toFixed(0)}/day`, icon: <TrendingDown size={15} />, valueColor: s.energyLoss > 3 ? '#dc2626' : '#d97706' },
    { label: 'Soiling Score', value: `${s.soilingScore}%`, sub: s.soilingScore > 60 ? 'High — action advised' : s.soilingScore > 30 ? 'Moderate' : 'Low', icon: <Droplets size={15} />, valueColor: s.soilingScore > 60 ? '#dc2626' : s.soilingScore > 30 ? '#d97706' : '#0070C0' },
    { label: 'Panel Temperature', value: `${s.avgTemp.toFixed(1)}°C`, sub: `Max: ${s.maxTemp.toFixed(1)}°C`, icon: <Thermometer size={15} />, valueColor: s.avgTemp > 50 ? '#dc2626' : s.avgTemp > 42 ? '#d97706' : '#111827' },
    { label: 'Weather', value: s.weatherCondition, sub: `${s.rainProbability}% rain probability`, icon: <Sun size={15} />, valueColor: '#2563eb' },
    { label: 'Wind / Humidity', value: `${s.windSpeed} km/h`, sub: `Humidity: ${s.humidity}%`, icon: <Wind size={15} />, valueColor: '#111827' },
    { label: 'System Health', value: `${s.systemHealth}%`, sub: s.systemHealth >= 90 ? 'Good' : s.systemHealth >= 75 ? 'Fair' : 'Degraded', icon: <Shield size={15} />, valueColor: s.systemHealth >= 90 ? '#0070C0' : s.systemHealth >= 75 ? '#d97706' : '#dc2626' },
  ];

  const periods: { id: Period; label: string }[] = [
    { id: 'today', label: 'Today' },
    { id: '7d', label: '7 Days' },
    { id: '30d', label: '30 Days' },
  ];

  const afterEff = Math.min(s.efficiency + 15, 97);
  const afterPower = parseFloat((s.powerOutput * (afterEff / s.efficiency)).toFixed(2));

  return (
    <div className="fade-in" style={{ padding: '20px 24px' }}>

      {/* 1. KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(188px, 1fr))',
        gap: 12,
        marginBottom: 20,
      }}>
        {kpiCards.map((card) => (
          <div key={card.label} className="card card-hover" style={{ padding: '14px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: 12, color: '#6b7280' }}>{card.label}</span>
              <span style={{ color: '#d1d5db' }}>{card.icon}</span>
            </div>
            <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 20, color: card.valueColor, lineHeight: 1.1 }}>
              {card.value}
            </div>
            <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 3 }}>{card.sub}</div>
          </div>
        ))}
      </div>

      {/* 2. Performance chart + AI recommendation (side by side) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 14, marginBottom: 14 }}>
        {/* Chart */}
        <div className="card" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
              <div style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 15, color: '#111827' }}>Solar Performance</div>
              <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>Actual output vs expected output</div>
            </div>
            {/* Period selector */}
            <div style={{ display: 'flex', background: '#f3f4f6', borderRadius: 7, padding: 3, gap: 1 }}>
              {periods.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPeriod(p.id)}
                  className={`seg-btn ${period === p.id ? 'active' : ''}`}
                  style={{
                    padding: '5px 12px',
                    borderRadius: 5,
                    border: 'none',
                    background: 'none',
                    fontSize: 12,
                    color: period === p.id ? '#ffffff' : '#6b7280',
                    cursor: 'pointer',
                    fontFamily: 'Inter',
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -8, bottom: 0 }}>
              <defs>
                <linearGradient id="gradExp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradAct" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0070C0" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#0070C0" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#f3f4f6" strokeDasharray="4 0" />
              <XAxis dataKey="label" tick={{ fill: '#9ca3af', fontSize: 10, fontFamily: 'Inter' }} axisLine={false} tickLine={false} interval={period === '30d' ? 4 : period === 'today' ? 3 : 0} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 10, fontFamily: 'Inter' }} axisLine={false} tickLine={false} width={34} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="Expected" stroke="#2563eb" strokeWidth={1.5} fill="url(#gradExp)" dot={false} />
              <Area type="monotone" dataKey="Actual" stroke="#0070C0" strokeWidth={2} fill="url(#gradAct)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
            {[{ color: '#2563eb', label: 'Expected Output' }, { color: '#0070C0', label: 'Actual Output' }].map((l) => (
              <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 12, height: 2, borderRadius: 1, background: l.color }} />
                <span style={{ fontSize: 11, color: '#6b7280' }}>{l.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* AI Recommendation card */}
        <div className="card" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 15, color: '#111827', marginBottom: 14 }}>
            Efficiency Recommendation
          </div>

          {/* Status badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '9px 12px',
              borderRadius: 8,
              background: meta.bg,
              border: `1px solid ${meta.border}`,
              marginBottom: 14,
              color: meta.color,
            }}
          >
            {meta.icon}
            <span style={{ fontWeight: 600, fontSize: 13 }}>{meta.label}</span>
          </div>

          <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.6, margin: '0 0 14px' }}>
            Solar output is currently {96 - s.efficiency}% below the clean-panel baseline. {
              s.possibleCause !== 'None detected'
                ? `Possible cause: ${s.possibleCause}.`
                : 'System operating normally.'
            }
          </p>

          {/* Signal pills */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
            {[
              { label: 'Soiling', val: s.soilingScore > 60 ? 'HIGH' : s.soilingScore > 30 ? 'MED' : 'LOW', color: s.soilingScore > 60 ? '#dc2626' : s.soilingScore > 30 ? '#d97706' : '#0070C0' },
              { label: 'Power Loss', val: (96 - s.efficiency) > 15 ? 'HIGH' : (96 - s.efficiency) > 8 ? 'MED' : 'LOW', color: (96 - s.efficiency) > 15 ? '#dc2626' : '#d97706' },
              { label: 'Rain', val: s.rainProbability > 60 ? 'HIGH' : s.rainProbability > 35 ? 'MED' : 'LOW', color: s.rainProbability > 60 ? '#2563eb' : '#0070C0' },
            ].map((sig) => (
              <div key={sig.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '6px 10px', borderRadius: 6, border: '1px solid #e5e7eb', background: '#f9fafb', flex: 1 }}>
                <span style={{ fontSize: 10, color: '#9ca3af', marginBottom: 2 }}>{sig.label}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: sig.color }}>{sig.val}</span>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: 14, marginTop: 'auto' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Recommended Action
            </div>
            <p style={{ fontSize: 13, color: '#111827', margin: '0 0 10px', fontWeight: 500 }}>
              {s.aiAction === 'CLEAN'
                ? 'Clean affected panels within 24 hours.'
                : s.aiAction === 'INSPECT'
                  ? 'Inspect panels for thermal anomaly or fault.'
                  : s.aiAction === 'WAIT'
                    ? 'Defer cleaning — rain expected to self-clean panels.'
                    : 'No action required. Continue monitoring.'}
            </p>
            {s.aiAction === 'CLEAN' && (
              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ textAlign: 'center', flex: 1, padding: '8px', background: '#e6f3fc', borderRadius: 6, border: '1px solid #b3d4f0' }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#0070C0', fontFamily: 'Outfit' }}>
                    +{(afterPower - s.powerOutput).toFixed(2)} kW
                  </div>
                  <div style={{ fontSize: 10, color: '#6b7280', marginTop: 2 }}>Power recovery</div>
                </div>
                <div style={{ textAlign: 'center', flex: 1, padding: '8px', background: '#e6f3fc', borderRadius: 6, border: '1px solid #b3d4f0' }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#0070C0', fontFamily: 'Outfit' }}>
                    +{s.energyLoss.toFixed(1)} kWh
                  </div>
                  <div style={{ fontSize: 10, color: '#6b7280', marginTop: 2 }}>Daily recovery</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Analysis */}
      <div style={{ marginBottom: 14 }}>
        <QuickAnalysis scenario={s} onNavigate={onNavigate} />
      </div>

      {/* 3. Thermal preview + Weather + Cleaning impact */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 14 }}>
        {/* Thermal preview */}
        <div className="card" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 15, color: '#111827' }}>Thermal Analysis</div>
            <span style={{ fontSize: 11, color: s.thermalAnomaly === 'HIGH' ? '#dc2626' : s.thermalAnomaly === 'MEDIUM' ? '#d97706' : '#0070C0', fontWeight: 600, padding: '2px 8px', borderRadius: 4, background: s.thermalAnomaly === 'HIGH' ? '#fef2f2' : s.thermalAnomaly === 'MEDIUM' ? '#fffbeb' : '#e6f3fc', border: `1px solid ${s.thermalAnomaly === 'HIGH' ? '#fecaca' : s.thermalAnomaly === 'MEDIUM' ? '#fde68a' : '#b3d4f0'}` }}>
              {s.thermalAnomaly}
            </span>
          </div>
          {/* Mini thermal grid */}
          <div style={{ height: 72, borderRadius: 6, overflow: 'hidden', marginBottom: 14, display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 1, background: '#f3f4f6' }}>
            {Array.from({ length: 40 }, (_, i) => {
              const status = s.panelStatuses[Math.floor(i / 2) % 20];
              const base = status === 'hotspot' ? 0.85 : status === 'warning' ? 0.65 : status === 'reduced' ? 0.42 : 0.28;
              const t = Math.min(1, base + Math.sin(i * 1.1) * 0.1);
              const r = Math.round(20 + t * 230);
              const g = Math.round(180 - t * 150);
              const b = Math.round(160 - t * 155);
              return <div key={i} style={{ background: `rgb(${r},${g},${b})` }} />;
            })}
          </div>
          {[
            { label: 'Avg Temperature', value: `${s.avgTemp.toFixed(1)}°C` },
            { label: 'Max Temperature', value: `${s.maxTemp.toFixed(1)}°C`, color: s.maxTemp > 60 ? '#dc2626' : '#374151' },
            { label: 'Hotspots', value: `${s.hotspots}`, color: s.hotspots > 3 ? '#dc2626' : s.hotspots > 0 ? '#d97706' : '#0070C0' },
            { label: 'Possible Cause', value: s.possibleCause !== 'None detected' ? 'Surface Soiling' : 'None' },
          ].map((row) => (
            <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 6, borderBottom: '1px solid #f3f4f6', marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: '#9ca3af' }}>{row.label}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: row.color ?? '#374151' }}>{row.value}</span>
            </div>
          ))}
          <button
            onClick={() => onNavigate('thermal')}
            style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#0070C0', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginTop: 4, fontWeight: 500 }}
          >
            View Thermal Analysis <ArrowRight size={13} />
          </button>
        </div>

        {/* Weather */}
        <div className="card" style={{ padding: '18px 20px' }}>
          <div style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 15, color: '#111827', marginBottom: 14 }}>
            Weather Intelligence
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div>
              <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 22, color: '#111827' }}>{s.weatherCondition}</div>
              <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>{s.avgTemp.toFixed(0)}°C · {s.humidity}% humidity</div>
            </div>
            <div style={{ fontSize: 38, lineHeight: 1 }}>
              {s.weatherCondition === 'Sunny' ? '☀️' : s.weatherCondition === 'Partly Cloudy' ? '⛅' : s.weatherCondition === 'Overcast' ? '☁️' : s.weatherCondition === 'Rainy' ? '🌧️' : '☀️'}
            </div>
          </div>
          {[
            { label: 'Rain Probability', value: `${s.rainProbability}%`, color: s.rainProbability > 60 ? '#2563eb' : '#0070C0' },
            { label: 'Cloud Coverage', value: `${s.cloudCoverage}%` },
            { label: 'Wind Speed', value: `${s.windSpeed} km/h` },
          ].map((row) => (
            <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid #f3f4f6', marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: '#9ca3af' }}>{row.label}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: row.color ?? '#374151' }}>{row.value}</span>
            </div>
          ))}
          <div style={{ marginTop: 8, padding: '10px 12px', borderRadius: 7, background: s.rainProbability > 60 ? '#eff6ff' : '#e6f3fc', border: `1px solid ${s.rainProbability > 60 ? '#bfdbfe' : '#b3d4f0'}` }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: s.rainProbability > 60 ? '#1d4ed8' : '#005a99', marginBottom: 3 }}>
              {s.rainProbability > 60 ? 'Next 24 Hours' : 'Maintenance Window'}
            </div>
            <div style={{ fontSize: 12, color: '#374151', lineHeight: 1.5 }}>
              {s.rainProbability > 60
                ? 'Rain expected. Natural panel cleaning likely.'
                : 'Low rainfall probability. Cleaning can proceed.'}
            </div>
          </div>
        </div>

        {/* Cleaning Impact */}
        <div className="card" style={{ padding: '18px 20px' }}>
          <div style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 15, color: '#111827', marginBottom: 14 }}>
            Cleaning Impact Estimate
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
            {[
              { label: 'Before Cleaning', eff: s.efficiency, power: s.powerOutput, muted: true },
              { label: 'After Cleaning', eff: afterEff, power: afterPower, muted: false },
            ].map((col) => (
              <div key={col.label} style={{ padding: '12px', borderRadius: 8, background: col.muted ? '#f9fafb' : '#e6f3fc', border: `1px solid ${col.muted ? '#e5e7eb' : '#b3d4f0'}` }}>
                <div style={{ fontSize: 11, color: col.muted ? '#9ca3af' : '#005a99', marginBottom: 8, fontWeight: 500 }}>{col.label}</div>
                <div style={{ fontSize: 11, color: '#9ca3af' }}>Efficiency</div>
                <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 22, color: col.muted ? '#374151' : '#005a99' }}>
                  {col.eff.toFixed(0)}%
                </div>
                <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 6 }}>Output</div>
                <div style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 16, color: col.muted ? '#374151' : '#005a99' }}>
                  {col.power.toFixed(2)} kW
                </div>
              </div>
            ))}
          </div>
          {s.efficiency < 92 && (
            <div style={{ padding: '10px 14px', borderRadius: 7, background: '#e6f3fc', border: '1px solid #b3d4f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 13, color: '#005a99', fontWeight: 600 }}>+{afterEff - s.efficiency}% efficiency</span>
              <span style={{ fontSize: 13, color: '#005a99', fontWeight: 600 }}>+{(afterPower - s.powerOutput).toFixed(2)} kW</span>
            </div>
          )}
          {/* Progress bars */}
          {[
            { label: 'Before', val: s.efficiency, color: '#d97706' },
            { label: 'After', val: afterEff, color: '#0070C0' },
          ].map((bar) => (
            <div key={bar.label} style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 11, color: '#9ca3af' }}>
                <span>{bar.label}</span><span style={{ color: bar.color, fontWeight: 600 }}>{bar.val}%</span>
              </div>
              <div style={{ height: 5, borderRadius: 3, background: '#f3f4f6' }}>
                <div className="progress-fill" style={{ width: `${bar.val}%`, height: '100%', borderRadius: 3, background: bar.color }} />
              </div>
            </div>
          ))}
          <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 10, lineHeight: 1.5 }}>
            Estimated improvement based on historical cleaning data and current efficiency loss.
          </p>
        </div>
      </div>

      {/* 4. Alerts row */}
      <AlertsRow scenario={s} />
    </div>
  );
}

function AlertsRow({ scenario: s }: { scenario: ScenarioData }) {
  const alerts: { type: 'critical' | 'warning' | 'info' | 'success'; msg: string }[] = [];
  if (s.hotspots > 3) alerts.push({ type: 'critical', msg: `${s.hotspots} panels with abnormal thermal activity detected.` });
  if (s.efficiency < 75) alerts.push({ type: 'warning', msg: `Efficiency ${96 - s.efficiency}% below expected baseline.` });
  if (s.soilingScore > 50 && s.rainProbability > 60) alerts.push({ type: 'info', msg: `High soiling detected, but rain expected — natural cleaning likely.` });
  if (s.aiAction === 'CLEAN' && s.rainProbability < 30) alerts.push({ type: 'warning', msg: `Cleaning recommended. No significant rainfall expected in 48 hours.` });
  if (s.efficiency >= 90) alerts.push({ type: 'success', msg: `System at ${s.efficiency}% efficiency — operating near peak.` });
  if (alerts.length === 0) return null;

  const cfg = {
    critical: { bg: '#fef2f2', border: '#fecaca', text: '#dc2626', label: 'Critical', icon: '●' },
    warning: { bg: '#fffbeb', border: '#fde68a', text: '#d97706', label: 'Warning', icon: '▲' },
    info: { bg: '#eff6ff', border: '#bfdbfe', text: '#2563eb', label: 'Advisory', icon: 'ℹ' },
    success: { bg: '#e6f3fc', border: '#b3d4f0', text: '#0070C0', label: 'Recovery', icon: '✓' },
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {alerts.map((a, i) => {
        const c = cfg[a.type];
        return (
          <div key={i} style={{ padding: '10px 14px', borderRadius: 8, background: c.bg, border: `1px solid ${c.border}`, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: c.text, flexShrink: 0 }}>{c.icon} {c.label.toUpperCase()}</span>
            <span style={{ fontSize: 13, color: '#374151' }}>{a.msg}</span>
          </div>
        );
      })}
    </div>
  );
}
