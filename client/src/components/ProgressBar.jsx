import { percent } from '../utils/format'

export default function ProgressBar({ value, goal, color = 'var(--orange-500)' }) {
  const pct = percent(value, goal)
  return (
    <div>
      <div className="pb-track">
        <div className="pb-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <div className="pb-labels">
        <span className="pb-raised">₱{Number(value).toLocaleString()} raised</span>
        <span className="muted">₱{Number(goal).toLocaleString()} goal</span>
      </div>
    </div>
  )
}