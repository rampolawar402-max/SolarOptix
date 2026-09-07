import type { ScenarioData } from '../data/demoScenarios';

function thermalGrid(s: ScenarioData): number[][] {
  const rows = 8, cols = 10;
  const grid: number[][] = [];
  for (let r = 0; r < rows; r++) {
    const row: number[] = [];
    for (let c = 0; c < cols; c++) {
      const idx = Math.min(Math.floor((r * cols + c) / (rows * cols / 20)), 19);
      const status = s.panelStatuses[idx];
      const base: Record<string, number> = { normal: s.avgTemp, reduced: s.avgTemp + 5, warning: s.avgTemp + 10, hotspot: s.maxTemp };
      const noise = Math.sin(r * 2.3 + c * 1.7) * 2.5 + Math.cos(r * 0.9 + c * 3.1) * 1.5;
      row.push(parseFloat((base[status] + noise).toFixed(1)));
    }
    grid.push(row);
  }
  return grid;
}

function tempToColor(temp: number, minT: number, maxT: number): string {
  const t = Math.max(0, Math.min(1, (temp - minT) / (maxT - minT)));
  if (t < 0.25) { const s = t / 0.25; return `rgb(${Math.round(30 + s * 10)},${Math.round(100 + s * 80)},${Math.round(200 - s * 50)})`; }
  if (t < 0.5) { const s = (t - 0.25) / 0.25; return `rgb(${Math.round(40 + s * 80)},${Math.round(180 + s * 20)},${Math.round(150 - s * 100)})`; }
  if (t < 0.75) { const s = (t - 0.5) / 0.25; return `rgb(${Math.round(120 + s * 110)},${Math.round(200 - s * 70)},${Math.round(50 - s * 30)})`; }
  const s = (t - 0.75) / 0.25;
  return `rgb(${Math.round(230 + s * 20)},${Math.round(130 - s * 120)},${Math.round(20 - s * 16)})`;
}

interface Props { scenario: ScenarioData }

export default function ThermalAnalysis({ scenario: s }: Props) {
  const grid = thermalGrid(s);
  const allTemps = grid.flat();
  const minT = Math.min(...allTemps), maxT = Math.max(...allTemps);
  const variance = parseFloat((Math.sqrt(allTemps.reduce((sum, v) => sum + (v - s.avgTemp) ** 2, 0) / allTemps.length)).toFixed(1));
  const anomalyColor = s.thermalAnomaly === 'HIGH' ? '#dc2626' : s.thermalAnomaly === 'MEDIUM' ? '#d97706' : '#0070C0';
  const anomalyBg = s.thermalAnomaly === 'HIGH' ? '#fef2f2' : s.thermalAnomaly === 'MEDIUM' ? '#fffbeb' : '#e6f3fc';

  return (
    <div className="fade-in" style={{ padding: '20px 24px' }}>
      <div style={{ marginBottom: 18 }}>
        <h2 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 20, color: '#111827', margin: 0 }}>Thermal Analysis</h2>
        <p style={{ color: '#9ca3af', fontSize: 13, margin: '3px 0 0' }}>Simulated infrared imaging — Array: Rooftop-A</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 16 }}>
        {/* Heatmap */}
        <div className="card" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 15, color: '#111827' }}>Thermal Image</div>
            <span style={{ fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 5, background: anomalyBg, color: anomalyColor, border: `1px solid ${anomalyColor}30` }}>
              Anomaly: {s.thermalAnomaly}
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${grid[0].length}, 1fr)`, gap: 2, borderRadius: 8, overflow: 'hidden', border: '1px solid #e5e7eb' }}>
            {grid.map((row, ri) => row.map((temp, ci) => (
              <div key={`${ri}-${ci}`} className="thermal-cell" title={`${temp.toFixed(1)}°C`}
                style={{ height: 48, background: tempToColor(temp, minT, maxT), position: 'relative' }}>
                {temp > maxT - (maxT - minT) * 0.15 && (
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontFamily: 'JetBrains Mono', color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>
                    {temp.toFixed(0)}°
                  </div>
                )}
              </div>
            )))}
          </div>
          <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 11, color: '#9ca3af' }}>{minT.toFixed(0)}°C</span>
            <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'linear-gradient(to right, rgb(30,100,200), rgb(40,180,150), rgb(200,200,30), rgb(230,130,20), rgb(250,10,4))' }} />
            <span style={{ fontSize: 11, color: '#9ca3af' }}>{maxT.toFixed(0)}°C</span>
          </div>
          <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 10, lineHeight: 1.5 }}>
            Thermal data is combined with power output and historical baseline for root-cause analysis. Thermal imaging alone does not confirm dust accumulation.
          </p>
        </div>

        {/* Metrics */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { label: 'Avg Temperature', value: `${s.avgTemp.toFixed(1)}°C`, color: '#374151' },
            { label: 'Max Temperature', value: `${s.maxTemp.toFixed(1)}°C`, color: s.maxTemp > 60 ? '#dc2626' : '#d97706' },
            { label: 'Min Temperature', value: `${s.minTemp.toFixed(1)}°C`, color: '#2563eb' },
            { label: 'Temp Variance', value: `±${variance}°C`, color: '#374151' },
            { label: 'Hotspots Detected', value: `${s.hotspots}`, color: s.hotspots > 3 ? '#dc2626' : s.hotspots > 0 ? '#d97706' : '#0070C0' },
            { label: 'Thermal Anomaly', value: s.thermalAnomaly, color: anomalyColor },
            { label: 'Est. Affected Area', value: `${((s.hotspots / 20) * 100).toFixed(0)}%`, color: '#6b7280' },
          ].map((m) => (
            <div key={m.label} className="card" style={{ padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: '#6b7280' }}>{m.label}</span>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: 13, fontWeight: 600, color: m.color }}>{m.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* AI Sensor Fusion Pipeline */}
      <div className="card" style={{ marginTop: 16, padding: '16px 20px' }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 12 }}>AI Sensor Fusion Pipeline</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, overflowX: 'auto' }}>
          {['Thermal Camera', 'Thermal Analysis', 'Power Monitor', 'Performance Baseline', 'AI Fusion', 'Weather', 'Decision Engine', 'Recommendation'].map((step, i, arr) => (
            <div key={step} style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
              <div style={{ padding: '5px 10px', borderRadius: 5, background: i === 4 ? '#e6f3fc' : '#f9fafb', border: `1px solid ${i === 4 ? '#b3d4f0' : '#e5e7eb'}`, fontSize: 11, color: i === 4 ? '#005a99' : '#6b7280', whiteSpace: 'nowrap', fontWeight: i === 4 ? 600 : 400 }}>
                {step}
              </div>
              {i < arr.length - 1 && <div style={{ padding: '0 5px', color: '#d1d5db', fontSize: 13 }}>→</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
