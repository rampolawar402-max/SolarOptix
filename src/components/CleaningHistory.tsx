const history = [
  { date: '02 Sep 2026', array: 'Array A', soiling: 72, before: 81, after: 95, recovered: '+4.8 kWh/day', action: 'Cleaned', status: 'ok' },
  { date: '18 Aug 2026', array: 'Array B', soiling: 68, before: 78, after: 93, recovered: '+3.9 kWh/day', action: 'Cleaned', status: 'ok' },
  { date: '05 Aug 2026', array: 'Array A', soiling: 41, before: 86, after: 90, recovered: '+1.4 kWh/day', action: 'Cleaned', status: 'ok' },
  { date: '22 Jul 2026', array: 'Array A + B', soiling: 88, before: 71, after: 94, recovered: '+7.6 kWh/day', action: 'Full Clean', status: 'ok' },
  { date: '10 Jul 2026', array: 'Array B', soiling: 24, before: 89, after: null, recovered: '—', action: 'No Action', status: 'skip' },
  { date: '28 Jun 2026', array: 'Array A', soiling: 64, before: 80, after: 94, recovered: '+4.2 kWh/day', action: 'Cleaned', status: 'ok' },
  { date: '14 Jun 2026', array: 'Panel A-04', soiling: null, before: 68, after: null, recovered: '—', action: 'Inspect', status: 'inspect' },
  { date: '01 Jun 2026', array: 'Array A + B', soiling: 76, before: 74, after: 93, recovered: '+6.1 kWh/day', action: 'Full Clean', status: 'ok' },
];

const actionStyle: Record<string, { bg: string; color: string; border: string }> = {
  ok: { bg: '#e6f3fc', color: '#005a99', border: '#b3d4f0' },
  inspect: { bg: '#fffbeb', color: '#d97706', border: '#fde68a' },
  skip: { bg: '#f9fafb', color: '#9ca3af', border: '#e5e7eb' },
};

export default function CleaningHistory() {
  return (
    <div className="fade-in" style={{ padding: '20px 24px' }}>
      <div style={{ marginBottom: 18 }}>
        <h2 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 20, color: '#111827', margin: 0 }}>Cleaning History</h2>
        <p style={{ color: '#9ca3af', fontSize: 13, margin: '3px 0 0' }}>Historical maintenance log with before/after efficiency data</p>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 18 }}>
        {[
          { label: 'Total Cleanings', value: '6', color: '#0070C0' },
          { label: 'Avg Efficiency Gain', value: '+15.2%', color: '#2563eb' },
          { label: 'Energy Recovered', value: '28.0 kWh/day', color: '#d97706' },
          { label: 'Inspections', value: '1', color: '#9ca3af' },
        ].map((s) => (
          <div key={s.label} className="card" style={{ padding: '14px 18px' }}>
            <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 22, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #f3f4f6', background: '#f9fafb' }}>
              {['Date', 'Panel / Array', 'Soiling Level', 'Efficiency Before', 'Efficiency After', 'Energy Recovered', 'Action'].map((h) => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#9ca3af', whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {history.map((row, i) => (
              <tr key={i} className="row-hover" style={{ borderBottom: '1px solid #f3f4f6', cursor: 'default' }}>
                <td style={{ padding: '13px 16px', fontSize: 12, color: '#6b7280', whiteSpace: 'nowrap' }}>{row.date}</td>
                <td style={{ padding: '13px 16px', fontSize: 13, color: '#374151', fontWeight: 500 }}>{row.array}</td>
                <td style={{ padding: '13px 16px' }}>
                  {row.soiling != null ? (
                    <span style={{ fontSize: 12, fontWeight: 600, color: row.soiling > 70 ? '#dc2626' : row.soiling > 40 ? '#d97706' : '#0070C0' }}>
                      {row.soiling}%
                    </span>
                  ) : <span style={{ fontSize: 12, color: '#d1d5db' }}>—</span>}
                </td>
                <td style={{ padding: '13px 16px', fontSize: 12, color: '#6b7280' }}>{row.before}%</td>
                <td style={{ padding: '13px 16px', fontSize: 12, fontWeight: 600, color: row.after != null ? '#0070C0' : '#d1d5db' }}>
                  {row.after != null ? `${row.after}%` : '—'}
                </td>
                <td style={{ padding: '13px 16px', fontSize: 12, fontWeight: 600, color: row.recovered.startsWith('+') ? '#0070C0' : '#9ca3af' }}>
                  {row.recovered}
                </td>
                <td style={{ padding: '13px 16px' }}>
                  <span style={{ padding: '3px 10px', borderRadius: 5, fontSize: 11, fontWeight: 500, background: actionStyle[row.status].bg, color: actionStyle[row.status].color, border: `1px solid ${actionStyle[row.status].border}` }}>
                    {row.action}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
