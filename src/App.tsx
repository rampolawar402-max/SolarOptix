import { useState } from 'react';
import { Menu, X, RefreshCw } from 'lucide-react';
import Sidebar, { type Page } from './components/Sidebar';
import Dashboard from './components/Dashboard';
import LandingPage from './components/LandingPage';
import LogoGuide from './components/LogoGuide';
import PanelVisualization from './components/PanelVisualization';
import ThermalAnalysis from './components/ThermalAnalysis';
import PowerAnalytics from './components/PowerAnalytics';
import WeatherIntelligence from './components/WeatherIntelligence';
import AIRecommendations from './components/AIRecommendations';
import EnergyLoss from './components/EnergyLoss';
import CleaningHistory from './components/CleaningHistory';
import SystemHealth from './components/SystemHealth';
import SettingsPage from './components/SettingsPage';
import DemoMode from './components/DemoMode';
import { scenarios, defaultScenario, type ScenarioKey } from './data/demoScenarios';

const pageTitles: Record<Page, { title: string; sub: string }> = {
  dashboard: { title: 'Solar Performance', sub: 'Rooftop-A · Real-time monitoring' },
  thermal: { title: 'Thermal Analysis', sub: 'Rooftop-A · Infrared imaging' },
  panels: { title: 'Panel Health', sub: 'Rooftop-A · 20 panels' },
  analytics: { title: 'Power Analytics', sub: 'Actual vs expected generation' },
  weather: { title: 'Weather Intelligence', sub: 'Conditions & maintenance window' },
  ai: { title: 'AI Recommendations', sub: 'Decision engine · Efficiency advisor' },
  energy: { title: 'Energy Loss', sub: 'Generation shortfall & revenue impact' },
  history: { title: 'Cleaning History', sub: 'Maintenance log & efficiency gains' },
  settings: { title: 'Settings', sub: 'Configuration & thresholds' },
};

type AppView = 'logo' | 'landing' | 'dashboard';

export default function App() {
  const [view, setView] = useState<AppView>('logo');
  const [page, setPage] = useState<Page>('dashboard');
  const [scenario, setScenario] = useState<ScenarioKey>(defaultScenario);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const s = scenarios[scenario];

  if (view === 'logo') {
    return (
      <div style={{ height: '100%' }}>
        <LogoGuide onContinue={() => setView('landing')} />
      </div>
    );
  }

  if (view === 'landing') {
    return (
      <div style={{ height: '100%' }}>
        <LandingPage
          onViewDashboard={() => setView('dashboard')}
          onRunDemo={() => { setScenario('dust'); setView('dashboard'); }}
        />
      </div>
    );
  }

  const pageComponent: Record<Page, React.ReactNode> = {
    dashboard: <Dashboard scenario={s} onNavigate={setPage} />,
    thermal: <ThermalAnalysis scenario={s} />,
    panels: <PanelVisualization scenario={s} />,
    analytics: <PowerAnalytics scenario={s} />,
    weather: <WeatherIntelligence scenario={s} />,
    ai: <AIRecommendations scenario={s} />,
    energy: <EnergyLoss scenario={s} />,
    history: <CleaningHistory />,
    settings: <SettingsPage />,
  };

  const info = pageTitles[page];

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden', background: '#f4f5f7' }}>
      <Sidebar current={page} onChange={setPage} collapsed={sidebarCollapsed} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <header
          style={{
            height: 56,
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            padding: '0 24px',
            gap: 14,
            background: '#ffffff',
            flexShrink: 0,
            zIndex: 10,
          }}
        >
          <button
            onClick={() => setSidebarCollapsed((c) => !c)}
            style={{
              background: 'none',
              border: 'none',
              color: '#9ca3af',
              cursor: 'pointer',
              padding: 4,
              display: 'flex',
              alignItems: 'center',
              borderRadius: 5,
            }}
          >
            {sidebarCollapsed ? <Menu size={18} /> : <X size={18} />}
          </button>

          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 16, color: '#111827', lineHeight: 1.2 }}>
              {info.title}
            </div>
            <div style={{ fontSize: 12, color: '#9ca3af' }}>{info.sub}</div>
          </div>

          {/* Right side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#9ca3af' }}>
              <RefreshCw size={12} />
              Last updated: just now
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '5px 12px',
                borderRadius: 6,
                background: '#e6f3fc',
                border: '1px solid #b3d4f0',
              }}
            >
              <div
                style={{ width: 6, height: 6, borderRadius: '50%', background: '#0070C0' }}
                className="pulse-dot"
              />
              <span style={{ fontSize: 12, color: '#005a99', fontWeight: 500 }}>System Online</span>
            </div>
            <button
              onClick={() => setView('logo')}
              style={{
                padding: '5px 12px',
                borderRadius: 6,
                background: '#f9fafb',
                border: '1px solid #e5e7eb',
                color: '#6b7280',
                fontSize: 12,
                fontFamily: 'Inter',
                cursor: 'pointer',
              }}
            >
              ← Home
            </button>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, overflowY: 'auto', paddingBottom: 68 }}>
          {pageComponent[page]}
        </main>
      </div>

      {/* Demo mode bar */}
      <DemoMode current={scenario} onChange={setScenario} sidebarCollapsed={sidebarCollapsed} />
    </div>
  );
}
