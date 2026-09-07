export default function SettingsPage() {
  return (
    <div className="fade-in" style={{ padding: '20px 24px' }}>
      <div style={{ marginBottom: 18 }}>
        <h2 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 20, color: '#111827', margin: 0 }}>Settings</h2>
        <p style={{ color: '#9ca3af', fontSize: 13, margin: '3px 0 0' }}>System configuration & alert thresholds</p>
      </div>

      {[
        {
          section: 'Installation Details',
          fields: [
            { label: 'Installation Name', value: 'Rooftop Array — Site A' },
            { label: 'Panel Rating', value: '5.30 kWp' },
            { label: 'Panel Count', value: '20' },
            { label: 'Location', value: 'Bengaluru, Karnataka, India' },
          ],
        },
        {
          section: 'Alert Thresholds',
          fields: [
            { label: 'Efficiency Warning Threshold', value: '85%' },
            { label: 'Efficiency Critical Threshold', value: '75%' },
            { label: 'Soiling Score Alert Level', value: '60%' },
            { label: 'Temperature Warning (°C)', value: '55' },
          ],
        },
        {
          section: 'Financial Settings',
          fields: [
            { label: 'Electricity Rate (₹/kWh)', value: '8.00' },
            { label: 'Currency', value: 'INR (₹)' },
          ],
        },
      ].map((group) => (
        <div key={group.section} className="card" style={{ padding: '18px 22px', marginBottom: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>
            {group.section}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {group.fields.map((field) => (
              <div key={field.label}>
                <label style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 5 }}>{field.label}</label>
                <input
                  defaultValue={field.value}
                  style={{ width: '100%', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 7, padding: '9px 12px', color: '#374151', fontSize: 13, fontFamily: 'Inter', transition: 'border-color 0.15s, box-shadow 0.15s' }}
                />
              </div>
            ))}
          </div>
        </div>
      ))}

      <div style={{ display: 'flex', gap: 10 }}>
        <button style={{ padding: '9px 22px', borderRadius: 7, background: '#0070C0', border: 'none', color: '#ffffff', fontSize: 13, fontFamily: 'Inter', fontWeight: 500, cursor: 'pointer' }}>
          Save Changes
        </button>
        <button style={{ padding: '9px 22px', borderRadius: 7, background: '#ffffff', border: '1px solid #e5e7eb', color: '#6b7280', fontSize: 13, fontFamily: 'Inter', cursor: 'pointer' }}>
          Reset to Defaults
        </button>
      </div>
    </div>
  );
}
