import type { ScenarioData } from '../data/demoScenarios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const trendData = (s: ScenarioData) =>
  Array.from({ length: 30 }, (_, i) => {
    const drift = (i / 30) * (100 - s.efficiency);
    const eff = Math.min(96, 96 - drift + Math.sin(i * 0.6) * 2);
    return { day: `${30 - i}`, Efficiency: parseFloat(eff.toFixed(1)), Loss: parseFloat(((96 - eff) / 96 * s.powerOutput * 9.2).toFixed(1)) };
  }).reverse();

const ChartTooltip = ({ active, payload, label }: { active?: boolean; payload?: { color: string; name: string; value: number }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
      <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 4 }}>Day {label}</div>
      {payload.map((p) => (
        <div key={p.name} style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 2 }}>
          <div style={{ width: 7, height: 7, background: p.color, borderRadius: 1 }} />
          <span style={{ fontSize: 12, color: '#6b7280' }}>{p.name}:</span>
          <span style={{ fontWeight: 600, color: '#111827', fontSize: 12 }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
};

interface Props { scenario: ScenarioData }

export default function EnergyLoss({ scenario: s }: Props) {
  const expected = 1420;
  const actual = Math.round(expected * (s.efficiency / 96));
  const loss = expected - actual;
  const recoverable = Math.round(loss * 0.73);
  const trend = trendData(s);

  return (
    <div className="fade-in" style={{ padding: '20px 24px' }}>
      <div style={{ marginBottom: 18 }}>
        <h2 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 20, color: '#111827', margin: 0 }}>Energy Loss Analytics</h2>
        <p style={{ color: '#9ca3af', fontSize: 13, margin: '3px 0 0' }}>Monthly generation, revenue impact & recovery potential</p>
      </div>

      {/* Primary stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 14 }}>
        {[
          { label: 'Expected Generation', value: `${expected.toLocaleString()} kWh`, sub: 'Monthly at 96% baseline', color: '#2563eb' },
          { label: 'Actual Generation', value: `${actual.toLocaleString()} kWh`, sub: `At current ${s.efficiency}% efficiency`, color: '#0070C0' },
          { label: 'Energy Lost', value: `${loss.toLocaleString()} kWh`, sub: 'Below expected baseline', color: '#dc2626' },
        ].map((c) => (
          <div key={c.label} className="card" style={{ padding: '16px 20px' }}>
            <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 8 }}>{c.label}</div>
            <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 26, color: c.color }}>{c.value}</div>
            <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>{c.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 14 }}>
        {[
          { label: 'Estimated Revenue Loss', value: `₹${(loss * 8).toLocaleString()}`, sub: 'This month', color: '#d97706' },
          { label: 'Recoverable Energy', value: `~${recoverable} kWh`, sub: 'Via cleaning (estimated)', color: '#0070C0' },
          { label: 'Revenue Recovery Potential', value: `₹${(recoverable * 8).toLocaleString()}`, sub: 'If cleaning performed', color: '#0070C0' },
        ].map((c) => (
          <div key={c.label} className="card" style={{ padding: '16px 20px' }}>
            <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 8 }}>{c.label}</div>
            <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 26, color: c.color }}>{c.value}</div>
            <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>{c.sub}</div>
          </div>
        ))}
      </div>

      {/* Generation breakdown bar */}
      <div className="card" style={{ padding: '18px 22px', marginBottom: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 12 }}>Monthly Generation Breakdown — September</div>
        <div style={{ position: 'relative', height: 32, borderRadius: 7, overflow: 'hidden', background: '#f3f4f6' }}>
          <div className="progress-fill" style={{ width: `${(actual / expected) * 100}%`, height: '100%', background: '#0070C0', display: 'flex', alignItems: 'center', paddingLeft: 12 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#ffffff', whiteSpace: 'nowrap' }}>{actual.toLocaleString()} kWh</span>
          </div>
          <div style={{ position: 'absolute', right: 8, top: 0, bottom: 0, display: 'flex', alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: '#dc2626', fontWeight: 500 }}>{loss} kWh lost</span>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 11, color: '#9ca3af' }}>
          <span>0 kWh</span><span style={{ color: '#0070C0', fontWeight: 500 }}>{actual.toLocaleString()} actual</span>
          <span style={{ color: '#2563eb', fontWeight: 500 }}>{expected.toLocaleString()} expected</span>
        </div>
      </div>

      {/* Efficiency trend */}
      <div className="card" style={{ padding: '18px 20px' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 14 }}>30-Day Efficiency Trend</div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={trend} margin={{ top: 4, right: 4, left: -8, bottom: 0 }}>
            <CartesianGrid stroke="#f3f4f6" />
            <XAxis dataKey="day" tick={{ fill: '#9ca3af', fontSize: 9 }} axisLine={false} tickLine={false} interval={4} />
            <YAxis tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={false} tickLine={false} width={34} domain={[60, 100]} />
            <Tooltip content={<ChartTooltip />} />
            <Line type="monotone" dataKey="Efficiency" stroke="#0070C0" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="Loss" stroke="#dc2626" strokeWidth={1.5} dot={false} strokeDasharray="4 3" />
          </LineChart>
        </ResponsiveContainer>
        <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
          {[{ color: '#0070C0', label: 'Efficiency (%)' }, { color: '#dc2626', label: 'Daily Loss (kWh)' }].map((l) => (
            <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 12, height: 2, borderRadius: 1, background: l.color }} />
              <span style={{ fontSize: 11, color: '#6b7280' }}>{l.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
