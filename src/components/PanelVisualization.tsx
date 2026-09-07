import { useState } from 'react';
import type { ScenarioData } from '../data/demoScenarios';
import { X } from 'lucide-react';

type PanelStatus = 'normal' | 'reduced' | 'warning' | 'hotspot';

const statusConfig: Record<PanelStatus, { color: string; label: string; bg: string; border: string }> = {
  normal: { color: '#0070C0', label: 'Normal', bg: '#e6f3fc', border: '#b3d4f0' },
  reduced: { color: '#d97706', label: 'Reduced Efficiency', bg: '#fffbeb', border: '#fde68a' },
  warning: { color: '#ea580c', label: 'Warning', bg: '#fff7ed', border: '#fed7aa' },
  hotspot: { color: '#dc2626', label: 'Hotspot / Thermal Anomaly', bg: '#fef2f2', border: '#fecaca' },
};

function panelId(i: number) {
  return `${String.fromCharCode(65 + Math.floor(i / 5))}-0${(i % 5) + 1}`;
}

function panelData(i: number, s: ScenarioData) {
  const status = s.panelStatuses[i] as PanelStatus;
  const eff = { normal: 94, reduced: 78, warning: 68, hotspot: 52 }[status] + Math.sin(i * 1.3) * 2;
  const temp = { normal: s.avgTemp, reduced: s.avgTemp + 4, warning: s.avgTemp + 9, hotspot: s.maxTemp }[status] + Math.cos(i * 0.8) * 1.5;
  const soil = { normal: 8, reduced: 42, warning: 68, hotspot: 74 }[status];
  const power = Math.max(0.01, (s.powerOutput / 20) * (eff / 94) + Math.sin(i * 0.6) * 0.015);
  const anomaly = { normal: 'None', reduced: 'Moderate soiling', warning: 'High dust accumulation', hotspot: 'Abnormal thermal signature' }[status];
  const rec = { normal: 'No action required', reduced: 'Monitor — schedule inspection', warning: 'Inspect and clean panel', hotspot: 'Immediate inspection — possible fault' }[status];
  return { id: panelId(i), status, temperature: parseFloat(temp.toFixed(1)), efficiency: parseFloat(eff.toFixed(1)), soilingScore: soil, powerContribution: parseFloat(power.toFixed(3)), anomaly, recommendation: rec };
}

interface Props { scenario: ScenarioData }

export default function PanelVisualization({ scenario }: Props) {
  const [selected, setSelected] = useState<number | null>(null);
  const panels = Array.from({ length: 20 }, (_, i) => panelData(i, scenario));
  const sel = selected !== null ? panels[selected] : null;

  return (
    <div className="fade-in" style={{ padding: '20px 24px' }}>
      <div style={{ marginBottom: 18 }}>
        <h2 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 20, color: '#111827', margin: 0 }}>Panel Health Grid</h2>
        <p style={{ color: '#9ca3af', fontSize: 13, margin: '3px 0 0' }}>Click any panel for details · 4×5 array · 20 panels</p>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 18, flexWrap: 'wrap' }}>
        {(Object.entries(statusConfig) as [PanelStatus, typeof statusConfig.normal][]).map(([key, cfg]) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: cfg.color }} />
            <span style={{ fontSize: 12, color: '#6b7280' }}>{cfg.label}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, alignItems: 'flex-start' }}>
        {/* Grid */}
        <div className="card" style={{ padding: '18px 20px' }}>
          {['A', 'B', 'C', 'D'].map((row, ri) => (
            <div key={row} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{ width: 20, textAlign: 'center', fontSize: 11, color: '#9ca3af', flexShrink: 0 }}>{row}</span>
              <div style={{ display: 'flex', gap: 8, flex: 1 }}>
                {Array.from({ length: 5 }, (_, ci) => {
                  const idx = ri * 5 + ci;
                  const p = panels[idx];
                  const cfg = statusConfig[p.status];
                  const isSelected = selected === idx;
                  return (
                    <button key={ci} className="panel-cell"
                      onClick={() => setSelected(idx === selected ? null : idx)}
                      style={{ flex: 1, aspectRatio: '1.6', borderRadius: 7, background: cfg.bg, border: `1.5px solid ${isSelected ? cfg.color : cfg.border}`, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, boxShadow: isSelected ? `0 0 0 2px ${cfg.color}30` : 'none', position: 'relative' }}>
                      {/* Cell lines */}
                      <svg width="100%" height="100%" style={{ position: 'absolute', opacity: 0.12 }}>
                        {[33, 66].map((pct) => <line key={pct} x1={`${pct}%`} y1="0" x2={`${pct}%`} y2="100%" stroke={cfg.color} strokeWidth="1" />)}
                        <line x1="0" y1="50%" x2="100%" y2="50%" stroke={cfg.color} strokeWidth="1" />
                      </svg>
                      <span style={{ fontSize: 10, fontFamily: 'JetBrains Mono', color: cfg.color, fontWeight: 600, position: 'relative' }}>{p.id}</span>
                      <span style={{ fontSize: 9, color: cfg.color, opacity: 0.8, position: 'relative' }}>{p.efficiency.toFixed(0)}%</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          <div style={{ display: 'flex', gap: 8, marginLeft: 28, marginTop: 4 }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <div key={n} style={{ flex: 1, textAlign: 'center', fontSize: 11, color: '#9ca3af' }}>{n}</div>
            ))}
          </div>
        </div>

        {/* Detail */}
        {sel && (
          <div className="card" style={{ width: 230, padding: '16px', position: 'relative' }}>
            <button onClick={() => setSelected(null)} style={{ position: 'absolute', top: 10, right: 10, background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: 2 }}>
              <X size={14} />
            </button>
            <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 18, color: '#111827', marginBottom: 4 }}>Panel {sel.id}</div>
            <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 4, background: statusConfig[sel.status].bg, border: `1px solid ${statusConfig[sel.status].border}`, fontSize: 11, color: statusConfig[sel.status].color, fontWeight: 500, marginBottom: 14 }}>
              {statusConfig[sel.status].label}
            </span>
            {[
              { label: 'Temperature', value: `${sel.temperature}°C` },
              { label: 'Power', value: `${sel.powerContribution} kW` },
              { label: 'Efficiency', value: `${sel.efficiency.toFixed(0)}%` },
              { label: 'Soiling Score', value: `${sel.soilingScore}%` },
            ].map((r) => (
              <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, paddingBottom: 8, borderBottom: '1px solid #f3f4f6' }}>
                <span style={{ fontSize: 12, color: '#9ca3af' }}>{r.label}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#374151', fontFamily: 'JetBrains Mono' }}>{r.value}</span>
              </div>
            ))}
            <div style={{ marginTop: 8, padding: '10px', borderRadius: 7, background: '#f9fafb', border: '1px solid #e5e7eb' }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: '#9ca3af', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Possible Cause</div>
              <div style={{ fontSize: 12, color: '#374151' }}>{sel.anomaly}</div>
            </div>
            <div style={{ marginTop: 8, padding: '10px', borderRadius: 7, background: '#e6f3fc', border: '1px solid #b3d4f0' }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: '#005a99', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Recommendation</div>
              <div style={{ fontSize: 12, color: '#374151' }}>{sel.recommendation}</div>
            </div>
          </div>
        )}
      </div>

      {/* Summary */}
      <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
        {(Object.entries(statusConfig) as [PanelStatus, typeof statusConfig.normal][]).map(([key, cfg]) => {
          const count = panels.filter((p) => p.status === key).length;
          return (
            <div key={key} style={{ flex: 1, padding: '12px 16px', borderRadius: 8, background: cfg.bg, border: `1px solid ${cfg.border}`, textAlign: 'center' }}>
              <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 22, color: cfg.color }}>{count}</div>
              <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>{cfg.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
