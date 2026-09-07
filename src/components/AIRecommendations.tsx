import type { ScenarioData } from '../data/demoScenarios';
import { CheckCircle, AlertTriangle, Info } from 'lucide-react';

interface Props { scenario: ScenarioData }

export default function AIRecommendations({ scenario: s }: Props) {
  const actionMeta: Record<string, { label: string; color: string; bg: string; border: string; icon: React.ReactNode }> = {
    CLEAN: { label: 'Cleaning Recommended', color: '#dc2626', bg: '#fef2f2', border: '#fecaca', icon: <AlertTriangle size={18} /> },
    INSPECT: { label: 'Inspection Required', color: '#d97706', bg: '#fffbeb', border: '#fde68a', icon: <AlertTriangle size={18} /> },
    WAIT: { label: 'Wait — Rain Expected', color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', icon: <Info size={18} /> },
    MONITOR: { label: 'Monitoring — No Action', color: '#0070C0', bg: '#e6f3fc', border: '#b3d4f0', icon: <CheckCircle size={18} /> },
  };

  const meta = actionMeta[s.aiAction];
  const powerGain = (s.powerOutput * ((Math.min(s.efficiency + 15, 97) / s.efficiency) - 1)).toFixed(2);
  const energyGain = (s.energyLoss * 0.85).toFixed(1);
  const revGain = (parseFloat(energyGain) * 8).toFixed(0);

  const signals = [
    { label: 'Soiling / Dust Score', value: `${s.soilingScore}%`, level: s.soilingScore > 60 ? 'high' : s.soilingScore > 30 ? 'med' : 'low' },
    { label: 'Power Loss vs Baseline', value: `${96 - s.efficiency}%`, level: (96 - s.efficiency) > 15 ? 'high' : (96 - s.efficiency) > 8 ? 'med' : 'low' },
    { label: 'Thermal Anomaly', value: s.thermalAnomaly, level: s.thermalAnomaly === 'HIGH' ? 'high' : s.thermalAnomaly === 'MEDIUM' ? 'med' : 'low' },
    { label: 'Rain Probability', value: `${s.rainProbability}%`, level: s.rainProbability > 60 ? 'low' : s.rainProbability > 35 ? 'med' : 'high' },
    { label: 'System Health', value: `${s.systemHealth}%`, level: s.systemHealth < 70 ? 'high' : s.systemHealth < 85 ? 'med' : 'low' },
  ] as const;

  const levelColor = { high: '#dc2626', med: '#d97706', low: '#0070C0' };
  const levelBg = { high: '#fef2f2', med: '#fffbeb', low: '#e6f3fc' };

  const rules = [
    { condition: 'Soiling HIGH + Power Loss HIGH + Rain < 60%', action: 'Recommend Cleaning', active: s.soilingScore > 60 && (96 - s.efficiency) > 10 && s.rainProbability < 60 },
    { condition: 'Soiling HIGH + Power Loss HIGH + Rain > 60%', action: 'Wait — Rain May Self-Clean', active: s.soilingScore > 60 && (96 - s.efficiency) > 10 && s.rainProbability > 60 },
    { condition: 'Soiling HIGH + Power Output Normal', action: 'Monitor — No Immediate Action', active: s.soilingScore > 50 && s.efficiency > 88 },
    { condition: 'Thermal Anomaly HIGH + Soiling LOW', action: 'Inspect for Panel Fault', active: s.thermalAnomaly === 'HIGH' && s.soilingScore < 30 },
  ];

  return (
    <div className="fade-in" style={{ padding: '20px 24px' }}>
      <div style={{ marginBottom: 18 }}>
        <h2 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 20, color: '#111827', margin: 0 }}>AI Efficiency Advisor</h2>
        <p style={{ color: '#9ca3af', fontSize: 13, margin: '3px 0 0' }}>Multi-signal sensor fusion · Smart decision engine · Actionable recommendations</p>
      </div>

      {/* Main recommendation */}
      <div className="card" style={{ padding: '20px 22px', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: meta.bg, border: `1px solid ${meta.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: meta.color, flexShrink: 0 }}>
            {meta.icon}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
              AI Recommendation
            </div>
            <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 18, color: '#111827', marginBottom: 6 }}>{meta.label}</div>
            <p style={{ fontSize: 13, color: '#6b7280', margin: 0, lineHeight: 1.6 }}>{s.aiReason}</p>
          </div>
          <div style={{ padding: '6px 14px', borderRadius: 6, background: meta.bg, border: `1px solid ${meta.border}`, fontSize: 12, fontWeight: 600, color: meta.color, flexShrink: 0 }}>
            {s.aiAction}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 18 }}>
          {[
            { label: 'Current Efficiency', value: `${s.efficiency}%`, color: s.efficiency > 85 ? '#0070C0' : '#dc2626' },
            { label: 'Estimated Loss', value: `${s.energyLoss.toFixed(1)} kWh/day`, color: '#d97706' },
            { label: 'Possible Recovery', value: `+${energyGain} kWh/day`, color: '#0070C0' },
          ].map((m) => (
            <div key={m.label} style={{ padding: '12px 14px', background: '#f9fafb', borderRadius: 8, border: '1px solid #e5e7eb' }}>
              <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 4 }}>{m.label}</div>
              <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 18, color: m.color }}>{m.value}</div>
            </div>
          ))}
        </div>

        {parseFloat(energyGain) > 0.5 && (
          <div style={{ marginTop: 14, padding: '12px 16px', borderRadius: 8, background: '#e6f3fc', border: '1px solid #b3d4f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#005a99' }}>Potential Revenue Recovery</div>
              <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>If cleaning performed today</div>
            </div>
            <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 22, color: '#0070C0' }}>₹{revGain}/day</div>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
        {/* Signals */}
        <div className="card" style={{ padding: '18px 20px' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 14 }}>Input Signals — Sensor Fusion</div>
          {signals.map((sig) => {
            const barWidth = sig.label.includes('Score') ? s.soilingScore : sig.label.includes('Rain') ? s.rainProbability : sig.label.includes('Loss') ? Math.min((96 - s.efficiency) * 3, 100) : sig.label.includes('Health') ? s.systemHealth : sig.value === 'HIGH' ? 90 : sig.value === 'MEDIUM' ? 55 : 20;
            return (
              <div key={sig.label} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                  <span style={{ fontSize: 12, color: '#6b7280' }}>{sig.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: levelColor[sig.level], padding: '1px 6px', borderRadius: 4, background: levelBg[sig.level] }}>{sig.value}</span>
                </div>
                <div style={{ height: 4, borderRadius: 3, background: '#f3f4f6' }}>
                  <div className="progress-fill" style={{ width: `${barWidth}%`, height: '100%', borderRadius: 3, background: levelColor[sig.level] }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Decision engine */}
        <div className="card" style={{ padding: '18px 20px' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 14 }}>Smart Decision Engine</div>
          {rules.map((rule, i) => (
            <div key={i} style={{ marginBottom: 10, padding: '12px 14px', borderRadius: 8, background: rule.active ? '#e6f3fc' : '#f9fafb', border: `1px solid ${rule.active ? '#b3d4f0' : '#e5e7eb'}`, opacity: rule.active ? 1 : 0.55 }}>
              <div style={{ fontSize: 11, color: rule.active ? '#005a99' : '#9ca3af', marginBottom: 4 }}>
                IF: {rule.condition}
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: rule.active ? '#111827' : '#9ca3af', fontFamily: 'Outfit' }}>
                → {rule.action}
              </div>
              {rule.active && (
                <div style={{ fontSize: 10, fontWeight: 600, color: '#0070C0', marginTop: 4 }}>✓ Active Rule</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Possible cause analysis */}
      <div className="card" style={{ padding: '18px 22px' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 14 }}>Possible Cause Analysis</div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {[
            { cause: 'Dust / Soiling', prob: s.soilingScore > 50 ? 72 : s.soilingScore > 25 ? 35 : 8 },
            { cause: 'Partial Shading', prob: s.cloudCoverage > 50 ? 48 : 15 },
            { cause: 'Hotspot / Cell Fault', prob: s.hotspots > 3 ? 65 : s.hotspots > 0 ? 30 : 5 },
            { cause: 'Cloud Variation', prob: s.cloudCoverage > 60 ? 55 : 18 },
            { cause: 'Temperature Effect', prob: s.avgTemp > 50 ? 40 : 20 },
          ].map((c) => (
            <div key={c.cause} style={{ flex: 1, minWidth: 110, padding: '12px 14px', borderRadius: 8, background: '#f9fafb', border: '1px solid #e5e7eb', textAlign: 'center' }}>
              <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 20, color: c.prob > 60 ? '#dc2626' : c.prob > 35 ? '#d97706' : '#9ca3af', marginBottom: 4 }}>
                {c.prob}%
              </div>
              <div style={{ fontSize: 11, color: '#6b7280' }}>{c.cause}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
