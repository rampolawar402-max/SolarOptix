import type { ScenarioData } from '../data/demoScenarios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const forecastData = (s: ScenarioData) =>
  [6, 12, 18, 24, 30, 36, 42, 48].map((h, i) => ({
    time: `+${h}h`,
    Cloud: Math.max(0, Math.min(100, s.cloudCoverage + Math.sin(i * 0.8) * 18)),
    Rain: Math.max(0, Math.min(100, s.rainProbability + Math.sin(i * 1.2) * 22 + (i > 4 ? i * 3 : 0))),
    Irradiance: Math.max(0, Math.min(100, 100 - s.cloudCoverage + Math.cos(i * 0.5) * 14)),
  }));

const weatherIcon: Record<string, string> = { Sunny: '☀️', 'Partly Cloudy': '⛅', Overcast: '☁️', Rainy: '🌧️', Stormy: '⛈️' };

interface Props { scenario: ScenarioData }

export default function WeatherIntelligence({ scenario: s }: Props) {
  const forecast = forecastData(s);
  const rainHigh = s.rainProbability > 60;
  const recText = rainHigh
    ? 'Rain expected within 24 hours. Natural panel cleaning likely — defer manual cleaning.'
    : s.soilingScore > 50
      ? 'Low rainfall probability. Cleaning can proceed if other conditions are met.'
      : 'Weather conditions are suitable for normal operations.';

  const ChartTooltip = ({ active, payload, label }: { active?: boolean; payload?: { color: string; name: string; value: number }[]; label?: string }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 12px', fontSize: 11, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <div style={{ color: '#9ca3af', marginBottom: 4 }}>{label}</div>
        {payload.map((p) => (
          <div key={p.name} style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 2 }}>
            <div style={{ width: 7, height: 7, background: p.color, borderRadius: 1 }} />
            <span style={{ color: '#6b7280' }}>{p.name}:</span>
            <span style={{ fontWeight: 600, color: '#111827' }}>{typeof p.value === 'number' ? p.value.toFixed(0) : p.value}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="fade-in" style={{ padding: '20px 24px' }}>
      <div style={{ marginBottom: 18 }}>
        <h2 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 20, color: '#111827', margin: 0 }}>Weather Intelligence</h2>
        <p style={{ color: '#9ca3af', fontSize: 13, margin: '3px 0 0' }}>Real-time conditions · 48-hour forecast · Maintenance window analysis</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
        {/* Current conditions */}
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 14 }}>Current Conditions</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 26, color: '#111827' }}>{s.weatherCondition}</div>
              <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}</div>
            </div>
            <div style={{ fontSize: 44, lineHeight: 1 }}>{weatherIcon[s.weatherCondition] ?? '☀️'}</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { label: 'Temperature', value: `${s.avgTemp.toFixed(0)}°C` },
              { label: 'Humidity', value: `${s.humidity}%` },
              { label: 'Cloud Cover', value: `${s.cloudCoverage}%` },
              { label: 'Wind Speed', value: `${s.windSpeed} km/h` },
            ].map((m) => (
              <div key={m.label} style={{ padding: '10px 12px', background: '#f9fafb', borderRadius: 8, border: '1px solid #e5e7eb' }}>
                <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 2 }}>{m.label}</div>
                <div style={{ fontFamily: 'JetBrains Mono', fontSize: 15, fontWeight: 600, color: '#374151' }}>{m.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Rain probability */}
        <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 14 }}>Rain Probability (24h)</div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
            <div style={{ position: 'relative', width: 120, height: 120 }}>
              <svg width="120" height="120" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="54" fill="none" stroke="#f3f4f6" strokeWidth="8" />
                <circle cx="60" cy="60" r="54" fill="none" stroke={rainHigh ? '#2563eb' : '#0070C0'} strokeWidth="8"
                  strokeDasharray={`${(s.rainProbability / 100) * 339} 339`} strokeLinecap="round" transform="rotate(-90 60 60)"
                  style={{ transition: 'stroke-dasharray 0.7s ease' }} />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontFamily: 'Outfit', fontSize: 26, fontWeight: 800, color: rainHigh ? '#2563eb' : '#0070C0' }}>{s.rainProbability}%</div>
                <div style={{ fontSize: 10, color: '#9ca3af' }}>rain chance</div>
              </div>
            </div>
            <div style={{ padding: '10px 16px', borderRadius: 8, background: rainHigh ? '#eff6ff' : '#e6f3fc', border: `1px solid ${rainHigh ? '#bfdbfe' : '#b3d4f0'}`, width: '100%', textAlign: 'center' }}>
              <div style={{ fontSize: 13, color: rainHigh ? '#1d4ed8' : '#005a99', fontWeight: 500, lineHeight: 1.5 }}>
                {rainHigh ? 'High — defer cleaning' : s.rainProbability > 35 ? 'Moderate — monitor before deciding' : 'Low — cleaning window open'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 48h forecast */}
      <div className="card" style={{ padding: '18px 20px', marginBottom: 14 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#111827', fontFamily: 'Outfit', marginBottom: 14 }}>48-Hour Forecast</div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={forecast} margin={{ top: 0, right: 4, left: -8, bottom: 0 }}>
            <CartesianGrid stroke="#f3f4f6" />
            <XAxis dataKey="time" tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={false} tickLine={false} width={28} />
            <Tooltip content={<ChartTooltip />} />
            <Bar dataKey="Irradiance" fill="#f59e0b" opacity={0.7} radius={[3, 3, 0, 0]} />
            <Bar dataKey="Cloud" fill="#9ca3af" opacity={0.5} radius={[3, 3, 0, 0]} />
            <Bar dataKey="Rain" fill="#2563eb" opacity={0.65} radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
          {[{ color: '#f59e0b', label: 'Irradiance' }, { color: '#9ca3af', label: 'Cloud Cover' }, { color: '#2563eb', label: 'Rain Probability' }].map((l) => (
            <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: l.color }} />
              <span style={{ fontSize: 11, color: '#6b7280' }}>{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* AI weather recommendation */}
      <div className="card" style={{ padding: '16px 20px', background: rainHigh ? '#eff6ff' : '#e6f3fc', border: `1px solid ${rainHigh ? '#bfdbfe' : '#b3d4f0'}` }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: rainHigh ? '#1d4ed8' : '#005a99', marginBottom: 6 }}>
          Weather Maintenance Recommendation
        </div>
        <p style={{ fontSize: 13, color: '#374151', margin: 0, lineHeight: 1.6 }}>{recText}</p>
      </div>
    </div>
  );
}
