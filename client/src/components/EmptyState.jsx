import { Link } from 'react-router-dom'
import Icon from './Icon'

export default function EmptyState({
  icon = 'inbox',
  title,
  message,
  variant = 'info',
  suggestions = [],
  action,
}) {
  const variantStyles = {
    info: { bg: 'var(--blue-50)', fg: 'var(--blue-700)', border: 'var(--blue-100)' },
    warning: { bg: 'var(--orange-50)', fg: 'var(--orange-600)', border: 'var(--orange-100)' },
    success: { bg: '#ecfdf5', fg: '#16a34a', border: '#bbf7d0' },
  }
  const v = variantStyles[variant] || variantStyles.info

  return (
    <div className="empty">
      <div
        className="empty-icon-wrap"
        style={{ background: v.bg, color: v.fg, borderColor: v.border }}
      >
        <Icon name={icon} size={32} strokeWidth={1.5} />
      </div>
      <div className="empty-title">{title}</div>
      <div className="empty-message">{message}</div>

      {suggestions.length > 0 && (
        <div className="empty-suggestions">
          <div className="empty-suggestions-label">Try these:</div>
          <div className="empty-suggestions-list">
            {suggestions.map((s, i) =>
              s.to ? (
                <Link
                  key={i}
                  to={s.to}
                  className="empty-suggestion"
                  onClick={s.onClick}
                >
                  {s.icon && <Icon name={s.icon} size={14} />}
                  <span>{s.label}</span>
                  <Icon name="chevron-right" size={14} />
                </Link>
              ) : (
                <button
                  key={i}
                  type="button"
                  className="empty-suggestion"
                  onClick={s.onClick}
                >
                  {s.icon && <Icon name={s.icon} size={14} />}
                  <span>{s.label}</span>
                  <Icon name="chevron-right" size={14} />
                </button>
              )
            )}
          </div>
        </div>
      )}

      {action && <div className="empty-action">{action}</div>}
    </div>
  )
}