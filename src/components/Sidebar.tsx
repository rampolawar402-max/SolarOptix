import {
  LayoutDashboard,
  Thermometer,
  Grid3X3,
  BarChart3,
  Cloud,
  BrainCircuit,
  TrendingDown,
  ClipboardList,
  Settings,
  CheckCircle,
} from 'lucide-react';
import { SolarOptixSidebarMark } from './SolarOptixMark';

export type Page =
  | 'dashboard'
  | 'thermal'
  | 'panels'
  | 'analytics'
  | 'weather'
  | 'ai'
  | 'energy'
  | 'history'
  | 'settings';

const navItems: { id: Page; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={16} /> },
  { id: 'thermal', label: 'Thermal Analysis', icon: <Thermometer size={16} /> },
  { id: 'panels', label: 'Panel Health', icon: <Grid3X3 size={16} /> },
  { id: 'analytics', label: 'Power Analytics', icon: <BarChart3 size={16} /> },
  { id: 'weather', label: 'Weather Intelligence', icon: <Cloud size={16} /> },
  { id: 'ai', label: 'AI Recommendations', icon: <BrainCircuit size={16} /> },
  { id: 'energy', label: 'Energy Loss', icon: <TrendingDown size={16} /> },
  { id: 'history', label: 'Cleaning History', icon: <ClipboardList size={16} /> },
  { id: 'settings', label: 'Settings', icon: <Settings size={16} /> },
];

interface SidebarProps {
  current: Page;
  onChange: (p: Page) => void;
  collapsed: boolean;
}

export default function Sidebar({ current, onChange, collapsed }: SidebarProps) {
  return (
    <aside
      style={{
        width: collapsed ? 56 : 216,
        transition: 'width 0.22s ease',
        background: '#ffffff',
        borderRight: '1px solid #e5e7eb',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        zIndex: 20,
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: collapsed ? '16px 0' : '16px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          borderBottom: '1px solid #f3f4f6',
          justifyContent: collapsed ? 'center' : 'flex-start',
          minHeight: 60,
        }}
      >
        <SolarOptixSidebarMark collapsed={collapsed} />
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '10px 8px', overflowY: 'auto' }}>
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${current === item.id ? 'active' : ''}`}
            onClick={() => onChange(item.id)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 9,
              padding: collapsed ? '9px 0' : '9px 11px',
              justifyContent: collapsed ? 'center' : 'flex-start',
              marginBottom: 2,
              background: 'none',
              color: current === item.id ? '#005a99' : '#6b7280',
              fontSize: 13,
              fontFamily: 'Inter',
              fontWeight: current === item.id ? 500 : 400,
              cursor: 'pointer',
            }}
          >
            <span style={{ flexShrink: 0, color: current === item.id ? '#0070C0' : '#9ca3af' }}>
              {item.icon}
            </span>
            {!collapsed && <span>{item.label}</span>}
          </button>
        ))}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div style={{ padding: '14px 16px', borderTop: '1px solid #f3f4f6' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <CheckCircle size={12} color="#0070C0" />
            <span style={{ fontSize: 12, color: '#374151', fontWeight: 500 }}>System Online</span>
          </div>
          <div style={{ fontSize: 11, color: '#9ca3af', fontFamily: 'Inter', lineHeight: 1.5 }}>
            Array: Rooftop-A · 5.3 kWp
          </div>
        </div>
      )}
      {collapsed && (
        <div style={{ padding: '12px 0', display: 'flex', justifyContent: 'center', borderTop: '1px solid #f3f4f6' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#0070C0' }} className="pulse-dot" />
        </div>
      )}
    </aside>
  );
}
