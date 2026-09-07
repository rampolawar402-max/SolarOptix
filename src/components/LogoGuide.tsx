import SolarOptixMark, { SolarOptixLogoFull, SolarOptixIcon } from './SolarOptixMark';

const SWATCHES = [
  { name: 'Solar Green',     hex: '#1DC884', on: '#fff' },
  { name: 'Deep Green',      hex: '#0D7A52', on: '#fff' },
  { name: 'Electric Blue',   hex: '#0A38A0', on: '#fff' },
  { name: 'Lens Seafoam',    hex: '#40F0B0', on: '#0A1810' },
  { name: 'Charcoal',        hex: '#0D1117', on: '#fff' },
  { name: 'Platform Gray',   hex: '#9CA3AF', on: '#fff' },
];

const ICON_SIZES = [128, 64, 48, 32, 20];

interface Props {
  onContinue: () => void;
}

export default function LogoGuide({ onContinue }: Props) {
  return (
    <div style={{ height: '100%', overflowY: 'auto', background: '#F4F5F7', fontFamily: 'Inter, sans-serif' }}>
      {/* ── Page header ── */}
      <div style={{
        background: '#ffffff',
        borderBottom: '1px solid #e5e7eb',
        padding: '36px 56px 28px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
      }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', letterSpacing: '0.1em', marginBottom: 8 }}>
            BRAND IDENTITY
          </div>
          <h1 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 30, color: '#111827', margin: 0 }}>
            SolarOptix Logo System
          </h1>
          <p style={{ fontSize: 13, color: '#9CA3AF', margin: '6px 0 0', fontWeight: 400 }}>
            Official mark, wordmark, app icon, and identity assets
          </p>
        </div>
        <button
          onClick={onContinue}
          style={{
            padding: '10px 22px',
            borderRadius: 8,
            background: '#0070C0',
            border: 'none',
            color: '#fff',
            fontSize: 13,
            fontWeight: 600,
            fontFamily: 'Inter',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          View App →
        </button>
      </div>

      <div style={{ maxWidth: 1020, margin: '0 auto', padding: '48px 56px 80px' }}>

        {/* ── Symbol close-up ── */}
        <Section label="THE SYMBOL">
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1.15fr',
            gap: 0,
            background: '#ffffff',
            borderRadius: 16,
            border: '1px solid #e5e7eb',
            overflow: 'hidden',
          }}>
            {/* Symbol on light */}
            <div style={{
              padding: '56px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#ffffff',
              borderRight: '1px solid #f3f4f6',
            }}>
              <SolarOptixMark size={160} />
            </div>
            {/* Symbol on dark */}
            <div style={{
              padding: '56px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: 28,
              background: 'linear-gradient(148deg, #0B2018 0%, #071524 100%)',
            }}>
              <SolarOptixMark size={96} />
              <div>
                <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 15, color: 'rgba(255,255,255,0.9)', marginBottom: 10 }}>
                  The SolarOptix Panel Mark
                </div>
                <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.5)', lineHeight: 1.75, margin: 0 }}>
                  A photovoltaic panel viewed from directly above, rotated 45° to a diamond silhouette. A 3×3 diagonal cell grid maps the PV architecture. The gradient runs from solar green (sunlight input) to electric blue (data output). The central lens — "Optix" — is the AI analytical eye.
                </p>
              </div>
            </div>
          </div>
        </Section>

        {/* ── VERSION 1: Primary logo ── */}
        <Section label="VERSION 1 — PRIMARY LOGO">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10 }}>
            {/* Light */}
            <LogoPlate bg="light" label="On white">
              <SolarOptixLogoFull symbolSize={68} fontSize={34} tagline bg="light" />
            </LogoPlate>
            {/* Dark */}
            <LogoPlate bg="dark" label="On dark">
              <SolarOptixLogoFull symbolSize={68} fontSize={34} tagline bg="dark" />
            </LogoPlate>
            {/* Compact, no tagline */}
            <LogoPlate bg="light" label="Compact (no tagline)">
              <SolarOptixLogoFull symbolSize={44} fontSize={22} />
            </LogoPlate>
          </div>
        </Section>

        {/* ── VERSION 2: App icon ── */}
        <Section label="VERSION 2 — APP ICON">
          <div style={{
            background: '#f3f4f6',
            borderRadius: 16,
            border: '1px solid #e5e7eb',
            padding: '48px 56px',
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 28, marginBottom: 24, flexWrap: 'wrap' }}>
              {ICON_SIZES.map((sz) => (
                <div key={sz} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                  <SolarOptixIcon size={sz} />
                  <span style={{ fontSize: 10, color: '#9CA3AF', fontFamily: 'JetBrains Mono' }}>{sz}px</span>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 12, color: '#9CA3AF', lineHeight: 1.6 }}>
              Remains legible at all sizes — the diamond silhouette reads at 20 px, the lens at 48 px, and the cell grid at 64 px+.
            </div>
          </div>
        </Section>

        {/* ── VERSION 3: Monochrome ── */}
        <Section label="VERSION 3 — MONOCHROME">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <LogoPlate bg="light" label="Single-color on white">
              <SolarOptixLogoFull symbolSize={60} fontSize={30} mono tagline />
            </LogoPlate>
            <LogoPlate bg="#f3f4f6" label="On light gray">
              <SolarOptixLogoFull symbolSize={60} fontSize={30} mono tagline />
            </LogoPlate>
          </div>
          <div style={{ marginTop: 10 }}>
            <LogoPlate bg="#111827" label="Single-color reversed">
              <SolarOptixLogoFull symbolSize={60} fontSize={30} mono tagline bg="dark" />
            </LogoPlate>
          </div>
        </Section>

        {/* ── Symbol anatomy ── */}
        <Section label="SYMBOL ANATOMY">
          <div style={{
            background: '#ffffff',
            borderRadius: 16,
            border: '1px solid #e5e7eb',
            padding: '40px 48px',
            display: 'grid',
            gridTemplateColumns: '200px 1fr',
            gap: 48,
            alignItems: 'center',
          }}>
            {/* Annotated symbol */}
            <div style={{ position: 'relative', width: 200, height: 200 }}>
              <SolarOptixMark size={200} />
              {/* Annotations */}
              <Callout top={2} left={72} label="Sunlight entry" />
              <Callout top={18} left={152} label="Cell grid (3×3)" />
              <Callout top={96} left={154} label="Orbital ring" />
              <Callout top={154} left={120} label="Data output gradient" />
              <Callout top={88} left={-10} label="Lens / Optix" align="right" />
            </div>
            {/* Design rationale */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {[
                { element: 'Diamond silhouette', desc: 'PV panel viewed from directly above, rotated 45° for dynamic tension and a proprietary silhouette.' },
                { element: '3×3 cell grid', desc: 'Four diagonal lines divide the diamond into nine photovoltaic cells. The grid gives technical precision and is unique at any size.' },
                { element: 'Green-to-blue gradient', desc: 'Solar green at the top (sunlight input) flows to electric blue at the bottom (data output), narrating the core value chain.' },
                { element: 'Center lens', desc: '"Optix" — a radial-gradient circle at the analytical focal point. The white inner dot reads as a sensor or data node at any scale.' },
                { element: 'Orbital ring', desc: 'A dashed circle signals continuous monitoring and AI analysis — the invisible intelligence layer.' },
              ].map((row) => (
                <div key={row.element}>
                  <div style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 13, color: '#111827', marginBottom: 3 }}>
                    {row.element}
                  </div>
                  <div style={{ fontSize: 12.5, color: '#6B7280', lineHeight: 1.65 }}>{row.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* ── Brand palette ── */}
        <Section label="BRAND COLORS">
          <div style={{
            background: '#ffffff',
            borderRadius: 16,
            border: '1px solid #e5e7eb',
            padding: '36px 48px',
          }}>
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
              {SWATCHES.map((sw) => (
                <div key={sw.hex} style={{ display: 'flex', flexDirection: 'column', gap: 10, minWidth: 90 }}>
                  <div style={{
                    width: 64, height: 64,
                    borderRadius: 12,
                    background: sw.hex,
                    boxShadow: '0 2px 10px rgba(0,0,0,0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: sw.hex === '#9CA3AF' ? '1px solid #e5e7eb' : 'none',
                  }} />
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>{sw.name}</div>
                  <div style={{ fontFamily: 'JetBrains Mono', fontSize: 10.5, color: '#9CA3AF' }}>{sw.hex}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 28, paddingTop: 24, borderTop: '1px solid #f3f4f6', fontSize: 12.5, color: '#9CA3AF', lineHeight: 1.7 }}>
              <strong style={{ color: '#6B7280' }}>Solar Green</strong> — primary brand color, sunlight, energy, growth.{' '}
              <strong style={{ color: '#6B7280' }}>Electric Blue</strong> — data, intelligence, precision.{' '}
              <strong style={{ color: '#6B7280' }}>Lens Seafoam</strong> — AI focal element, highlight only.{' '}
              <strong style={{ color: '#6B7280' }}>Charcoal</strong> — wordmark, type.
            </div>
          </div>
        </Section>

        {/* ── Typography ── */}
        <Section label="BRAND TYPOGRAPHY">
          <div style={{
            background: '#ffffff',
            borderRadius: 16,
            border: '1px solid #e5e7eb',
            padding: '36px 48px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: 32,
          }}>
            <TypeSample
              face="Outfit"
              weight="700–800"
              use="Wordmark / Display"
              sample="SolarOptix"
              size={28}
              family="Outfit"
            />
            <TypeSample
              face="Inter"
              weight="400–600"
              use="Body / UI"
              sample="AI Efficiency Platform"
              size={18}
              family="Inter"
            />
            <TypeSample
              face="JetBrains Mono"
              weight="500"
              use="Labels / Data"
              sample="94.2% EFFICIENCY"
              size={14}
              family="JetBrains Mono"
            />
          </div>
        </Section>

        {/* ── Minimum size ── */}
        <Section label="MINIMUM SIZE">
          <div style={{
            background: '#ffffff',
            borderRadius: 16,
            border: '1px solid #e5e7eb',
            padding: '36px 48px',
            display: 'flex',
            alignItems: 'center',
            gap: 40,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <SolarOptixIcon size={20} />
              <div style={{ fontSize: 12, color: '#6B7280' }}>20 px — smallest use<br />(favicon, mobile status bar)</div>
            </div>
            <div style={{ width: 1, height: 40, background: '#e5e7eb' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <SolarOptixIcon size={32} />
              <div style={{ fontSize: 12, color: '#6B7280' }}>32 px — desktop icon<br />(dock, system tray)</div>
            </div>
            <div style={{ width: 1, height: 40, background: '#e5e7eb' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <SolarOptixLogoFull symbolSize={28} fontSize={14} />
              <div style={{ fontSize: 12, color: '#6B7280' }}>Compact wordmark<br />(navigation, headers)</div>
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 48 }}>
      <div style={{
        fontSize: 10,
        fontWeight: 700,
        color: '#9CA3AF',
        letterSpacing: '0.1em',
        marginBottom: 16,
      }}>
        {label}
      </div>
      {children}
    </div>
  );
}

function LogoPlate({
  children,
  bg,
  label,
}: {
  children: React.ReactNode;
  bg: string;
  label: string;
}) {
  const isDark = bg === 'dark' || bg === '#111827';
  return (
    <div
      style={{
        background: bg === 'dark' ? 'linear-gradient(140deg, #0B2018 0%, #071524 100%)' : bg,
        borderRadius: 14,
        border: '1px solid #e5e7eb',
        padding: '40px 56px',
        display: 'flex',
        flexDirection: 'column',
        gap: 28,
        alignItems: 'flex-start',
      }}
    >
      <div style={{ fontSize: 10, fontWeight: 600, color: isDark ? 'rgba(255,255,255,0.3)' : '#9CA3AF', letterSpacing: '0.06em' }}>
        {label}
      </div>
      {children}
    </div>
  );
}

function Callout({
  top,
  left,
  label,
  align = 'left',
}: {
  top: number;
  left: number;
  label: string;
  align?: 'left' | 'right';
}) {
  return (
    <div
      style={{
        position: 'absolute',
        top,
        left,
        fontSize: 9,
        color: '#9CA3AF',
        fontFamily: 'JetBrains Mono',
        whiteSpace: 'nowrap',
        textAlign: align,
        pointerEvents: 'none',
        lineHeight: 1,
      }}
    >
      {label}
    </div>
  );
}

function TypeSample({
  face,
  weight,
  use,
  sample,
  size,
  family,
}: {
  face: string;
  weight: string;
  use: string;
  sample: string;
  size: number;
  family: string;
}) {
  return (
    <div>
      <div style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', letterSpacing: '0.08em', marginBottom: 14 }}>{use.toUpperCase()}</div>
      <div style={{ fontFamily: `${family}, sans-serif`, fontSize: size, fontWeight: 700, color: '#111827', marginBottom: 12, lineHeight: 1.2 }}>
        {sample}
      </div>
      <div style={{ fontSize: 11, color: '#9CA3AF' }}>{face} · {weight}</div>
    </div>
  );
}
