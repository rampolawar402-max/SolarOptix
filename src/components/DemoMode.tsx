import type { ScenarioKey } from '../data/demoScenarios';
import { scenarios } from '../data/demoScenarios';

interface Props {
  current: ScenarioKey;
  onChange: (key: ScenarioKey) => void;
  sidebarCollapsed: boolean;
}

const descriptions: Record<ScenarioKey, string> = {
  clean: 'Panels at peak performance. No soiling or anomalies detected.',
  dust: 'Moderate dust accumulation reducing efficiency. Cleaning recommended.',
  heavy_dust: 'Critical soiling. Severe efficiency loss. Immediate action required.',
  shading: 'Partial shading from nearby obstruction. Power loss without soiling.',
  hotspot: 'Thermal hotspots — possible bypass diode or cell failure.',
  rain: 'Active rainfall. Natural cleaning in progress. Defer maintenance.',
  cloudy: 'Overcast conditions reducing solar irradiance and output.',
  fault: 'Critical panel fault. Multiple thermal anomalies detected.',
};

export default function DemoMode({ current, onChange, sidebarCollapsed }: Props) {
  const keys = Object.keys(scenarios) as ScenarioKey[];

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: sidebarCollapsed ? 56 : 216,
        right: 0,
        zIndex: 30,
        background: '#ffffff',
        borderTop: '1px solid #e5e7eb',
        padding: '10px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        transition: 'left 0.22s ease',
        boxShadow: '0 -2px 8px rgba(0,0,0,0.04)',
      }}
    >
      <div style={{ flexShrink: 0 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#0070C0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Simulation
        </div>
        <div style={{ fontSize: 11, color: '#9ca3af' }}>Select scenario:</div>
      </div>

      {/* Scenario buttons */}
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', flex: 1 }}>
        {keys.map((key) => {
          const s = scenarios[key];
          const isActive = key === current;
          return (
            <button
              key={key}
              onClick={() => onChange(key)}
              style={{
                flexShrink: 0,
                padding: '5px 13px',
                borderRadius: 6,
                border: `1px solid ${isActive ? '#0070C0' : '#e5e7eb'}`,
                background: isActive ? '#e6f3fc' : '#ffffff',
                color: isActive ? '#005a99' : '#6b7280',
                fontSize: 12,
                cursor: 'pointer',
                fontFamily: 'Inter',
                fontWeight: isActive ? 600 : 400,
                transition: 'all 0.12s',
              }}
            >
              {s.label}
            </button>
          );
        })}
      </div>

      {/* Description */}
      <div style={{ flexShrink: 0, maxWidth: 240, fontSize: 11, color: '#9ca3af', lineHeight: 1.4, borderLeft: '1px solid #f3f4f6', paddingLeft: 14 }}>
        {descriptions[current]}
      </div>
    </div>
  );
}
