import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { ScenarioData } from '../data/demoScenarios';

type Period = 'today' | '7d' | '30d' | '6m';

function generateData(s: ScenarioData, period: Period) {
  const expected = s.powerOutput / (s.efficiency / 100);
  if (period === 'today') {
    return Array.from({ length: 24 }, (_, h) => {
      const curve = Math.max(0, Math.sin((h - 6) * (Math.PI / 12)));
      const exp = parseFloat((expected * curve * 1.04).toFixed(2));
      const actual = parseFloat((s.powerOutput * curve * (0.92 + Math.sin(h * 0.8) * 0.04)).toFixed(2));
      return { label: `${String(h).padStart(2, '0')}:00`, Expected: exp, Actual: actual, Loss: parseFloat(Math.max(0, exp - actual).toFixed(2)) };
    });
  }
  if (period === '7d') {
    return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d, i) => {
      const w = [1, 0.72, 0.88, 1, 0.65, 0.91, 1][i];
      const exp = parseFloat((expected * 9.2 * w).toFixed(1));
      const actual = parseFloat((s.powerOutput * 9.2 * w * (0.88 + Math.sin(i) * 0.05)).toFixed(1));
      return { label: d, Expected: exp, Actual: actual, Loss: parseFloat(Math.max(0, exp - actual).toFixed(1)) };
    });
  }
  if (period === '30d') {
    return Array.from({ length: 30 }, (_, i) => {
      const w = 0.85 + Math.sin(i * 0.4) * 0.12;
      const exp = parseFloat((expected * 9.2 * w).toFixed(1));
      const actual = parseFloat((s.powerOutput * 9.2 * w * (0.86 + Math.cos(i * 0.3) * 0.06)).toFixed(1));
      return { label: `${i + 1}`, Expected: exp, Actual: actual, Loss: parseFloat(Math.max(0, exp - actual).toFixed(1)) };
    });
  }
  return ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'].map((m, i) => {
    const seasonal = [0.9, 1, 1.1, 1.05, 0.95, 0.88][i];
    const exp = parseFloat((expected * 9.2 * 30 * seasonal).toFixed(0));
    const actual = parseFloat((s.powerOutput * 9.2 * 30 * seasonal * (0.87 + Math.sin(i) * 0.04)).toFixed(0));
    return { label: m, Expected: exp, Actual: actual, Loss: parseFloat(Math.max(0, exp - actual).toFixed(0)) };
  });
}

const ChartTooltip = ({ active, payload, label }: { active?: boolean; payload?: { color: string; name: string; value: number }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '10px 14px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
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

interface Props { scenario: ScenarioData }

export default function PowerAnalytics({ scenario: s }: Props) {
  const [period, setPeriod] = useState<Period>('today');
  const data = generateData(s, period);
  const totExp = data.reduce((sum, d) => sum + d.Expected, 0);
  const totAct = data.reduce((sum, d) => sum + d.Actual, 0);
  const totLoss = data.reduce((sum, d) => sum + d.Loss, 0);
  const isLarge = period === '6m';

  const periods: { id: Period; label: string }[] = [
    { id: 'today', label: 'Today' }, { id: '7d', label: '7 Days' },
    { id: '30d', label: '30 Days' }, { id: '6m', label: '6 Months' },
  ];

  return (
    <div className="fade-in" style={{ padding: '20px 24px' }}>
      <div style={{ marginBottom: 18 }}>
        <h2 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 20, color: '#111827', margin: 0 }}>Power & Efficiency Analytics</h2>
        <p style={{ color: '#9ca3af', fontSize: 13, margin: '3px 0 0' }}>Actual vs expected generation · Energy loss quantification</p>
      </div>

      {/* Period selector */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 18 }}>
        {periods.map((p) => (
          <button key={p.id} onClick={() => setPeriod(p.id)}
            style={{ padding: '7px 16px', borderRadius: 7, border: `1px solid ${period === p.id ? '#0070C0' : '#e5e7eb'}`, background: period === p.id ? '#e6f3fc' : '#ffffff', color: period === p.id ? '#005a99' : '#6b7280', fontSize: 13, cursor: 'pointer', fontFamily: 'Inter', fontWeight: period === p.id ? 600 : 400 }}>
            {p.label}
          </button>
        ))}
      </div>

      {/* Summary stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
        {[
          { label: 'Expected', value: `${totExp.toFixed(isLarge ? 0 : 1)} kWh`, color: '#2563eb' },
          { label: 'Actual', value: `${totAct.toFixed(isLarge ? 0 : 1)} kWh`, color: '#0070C0' },
          { label: 'Energy Loss', value: `${totLoss.toFixed(isLarge ? 0 : 1)} kWh`, color: '#dc2626' },
          { label: 'Revenue Loss', value: `₹${(totLoss * 8).toFixed(0)}`, color: '#d97706' },
        ].map((c) => (
          <div key={c.label} className="card" style={{ padding: '14px 16px' }}>
            <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 6 }}>{c.label}</div>
            <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 22, color: c.color }}>{c.value}</div>
          </div>
        ))}
      </div>

      {/* Main chart */}
      <div className="card" style={{ padding: '18px 20px', marginBottom: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#111827', fontFamily: 'Outfit', marginBottom: 16 }}>Expected vs Actual Generation</div>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={data} margin={{ top: 4, right: 4, left: -8, bottom: 0 }}>
            <defs>
              <linearGradient id="gradE" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1} /><stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradA" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0070C0" stopOpacity={0.1} /><stop offset="95%" stopColor="#0070C0" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradL" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#dc2626" stopOpacity={0.08} /><stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#f3f4f6" />
            <XAxis dataKey="label" tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={false} tickLine={false} interval={period === '30d' ? 4 : period === 'today' ? 3 : 0} />
            <YAxis tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={false} tickLine={false} width={36} />
            <Tooltip content={<ChartTooltip />} />
            <Legend wrapperStyle={{ fontSize: 12, color: '#6b7280', paddingTop: 8 }} />
            <Area type="monotone" dataKey="Expected" stroke="#2563eb" strokeWidth={1.5} fill="url(#gradE)" dot={false} />
            <Area type="monotone" dataKey="Actual" stroke="#0070C0" strokeWidth={2} fill="url(#gradA)" dot={false} />
            <Area type="monotone" dataKey="Loss" stroke="#dc2626" strokeWidth={1} fill="url(#gradL)" dot={false} strokeDasharray="3 3" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Clean baseline */}
      <div className="card" style={{ padding: '18px 20px' }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#111827', fontFamily: 'Outfit', marginBottom: 16 }}>Clean Panel Baseline Comparison</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 16 }}>
          {[
            { label: 'Clean Baseline Efficiency', value: '96%', color: '#0070C0' },
            { label: 'Current Efficiency', value: `${s.efficiency}%`, color: s.efficiency < 80 ? '#dc2626' : '#d97706' },
            { label: 'Efficiency Reduction', value: `${96 - s.efficiency}%`, color: '#dc2626' },
          ].map((m) => (
            <div key={m.label} style={{ textAlign: 'center', padding: '14px', background: '#f9fafb', borderRadius: 8, border: '1px solid #e5e7eb' }}>
              <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 26, color: m.color }}>{m.value}</div>
              <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>{m.label}</div>
            </div>
          ))}
        </div>
        <div style={{ height: 6, borderRadius: 4, background: '#f3f4f6', overflow: 'hidden' }}>
          <div className="progress-fill" style={{ width: `${s.efficiency}%`, height: '100%', background: 'linear-gradient(to right, #dc2626, #d97706, #0070C0)', borderRadius: 4 }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5, fontSize: 11, color: '#9ca3af' }}>
          <span>0%</span>
          <span style={{ color: '#d97706', fontWeight: 500 }}>{s.efficiency}% current</span>
          <span style={{ color: '#0070C0', fontWeight: 500 }}>96% baseline</span>
          <span>100%</span>
        </div>
      </div>
    </div>
  );
}
