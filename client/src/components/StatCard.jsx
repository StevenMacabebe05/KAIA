export default function StatCard({ value, label, accent }) {
  return (
    <div className="stat-card">
      <div className="stat-value" style={{ color: accent ?? 'var(--blue-700)' }}>
        {value}
      </div>
      <div className="stat-label">{label}</div>
    </div>
  )
}