import type { ScenarioData } from '../data/demoScenarios';
import { Wifi, Thermometer, Zap, CloudRain, BrainCircuit, Database, CheckCircle, AlertCircle } from 'lucide-react';

interface Props { scenario: ScenarioData }

export default function SystemHealth({ scenario: s }: Props) {
  const components = [
    { name: 'Thermal Camera', icon: <Thermometer size={16} />, status: 'Online', latency: '12ms', uptime: '99.8%' },
    { name: 'Power Meter', icon: <Zap size={16} />, status: 'Online', latency: '8ms', uptime: '99.9%' },
    { name: 'Weather API', icon: <CloudRain size={16} />, status: 'Online', latency: '142ms', uptime: '98.2%' },
    { name: 'AI Analysis Engine', icon: <BrainCircuit size={16} />, status: 'Online', latency: '44ms', uptime: '99.5%' },
    { name: 'Data Collection', icon: <Database size={16} />, status: 'Online', latency: '6ms', uptime: '99.9%' },
    { name: 'Network Gateway', icon: <Wifi size={16} />, status: s.systemHealth < 65 ? 'Degraded' : 'Online', latency: '28ms', uptime: s.systemHealth < 65 ? '91.2%' : '99.6%' },
  ];

  const healthColor = s.systemHealth >= 90 ? '#0070C0' : s.systemHealth >= 75 ? '#d97706' : '#dc2626';
  const healthLabel = s.systemHealth >= 90 ? 'Good' : s.systemHealth >= 75 ? 'Fair' : 'Degraded';

  return (
    <div className="fade-in" style={{ padding: '20px 24px' }}>
      <div style={{ marginBottom: 18 }}>
        <h2 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 20, color: '#111827', margin: 0 }}>System Health</h2>
        <p style={{ color: '#9ca3af', fontSize: 13, margin: '3px 0 0' }}>Component status, connectivity & data pipeline health</p>
      </div>

      {/* Overall */}
      <div className="card" style={{ padding: '22px 24px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 28, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', width: 110, height: 110 }}>
          <svg width="110" height="110" viewBox="0 0 110 110">
            <circle cx="55" cy="55" r="48" fill="none" stroke="#f3f4f6" strokeWidth="7" />
            <circle cx="55" cy="55" r="48" fill="none" stroke={healthColor} strokeWidth="7"
              strokeDasharray={`${(s.systemHealth / 100) * 302} 302`} strokeLinecap="round" transform="rotate(-90 55 55)"
              style={{ transition: 'stroke-dasharray 0.7s ease' }} />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 24, color: healthColor }}>{s.systemHealth}%</div>
            <div style={{ fontSize: 10, color: '#9ca3af' }}>overall</div>
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 18, color: '#111827', marginBottom: 4 }}>
            Overall Health: <span style={{ color: healthColor }}>{healthLabel}</span>
          </div>
          <p style={{ color: '#6b7280', fontSize: 13, margin: '0 0 14px' }}>
            {s.systemHealth >= 90 ? 'All systems operational. Data pipeline healthy.' : s.systemHealth >= 75 ? 'Minor degradation detected. Some components reporting elevated latency.' : 'Significant degradation detected. Immediate attention required.'}
          </p>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            {[{ label: 'Uptime', value: '99.4%' }, { label: 'Data Points Today', value: '14,823' }, { label: 'Last Sync', value: 'Just now' }, { label: 'Active Alerts', value: s.hotspots > 2 ? String(s.hotspots) : '0' }].map((m) => (
              <div key={m.label}>
                <div style={{ fontSize: 11, color: '#9ca3af' }}>{m.label}</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#374151', fontFamily: 'JetBrains Mono', marginTop: 2 }}>{m.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Components */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {components.map((comp) => {
          const isOnline = comp.status === 'Online';
          return (
            <div key={comp.name} className="card card-hover" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: isOnline ? '#e6f3fc' : '#fffbeb', border: `1px solid ${isOnline ? '#b3d4f0' : '#fde68a'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: isOnline ? '#0070C0' : '#d97706', flexShrink: 0 }}>
                {comp.icon}
              </div>
              <div style={{ flex: 1, fontSize: 14, color: '#374151', fontWeight: 500 }}>{comp.name}</div>
              <div style={{ textAlign: 'right', minWidth: 70 }}>
                <div style={{ fontSize: 10, color: '#9ca3af' }}>Latency</div>
                <div style={{ fontSize: 12, fontFamily: 'JetBrains Mono', color: '#374151', fontWeight: 500 }}>{comp.latency}</div>
              </div>
              <div style={{ textAlign: 'right', minWidth: 60 }}>
                <div style={{ fontSize: 10, color: '#9ca3af' }}>Uptime</div>
                <div style={{ fontSize: 12, fontFamily: 'JetBrains Mono', color: '#374151', fontWeight: 500 }}>{comp.uptime}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 5, background: isOnline ? '#e6f3fc' : '#fffbeb', border: `1px solid ${isOnline ? '#b3d4f0' : '#fde68a'}`, flexShrink: 0 }}>
                {isOnline
                  ? <CheckCircle size={12} color="#0070C0" />
                  : <AlertCircle size={12} color="#d97706" />}
                <span style={{ fontSize: 12, fontWeight: 500, color: isOnline ? '#005a99' : '#d97706' }}>{comp.status}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
