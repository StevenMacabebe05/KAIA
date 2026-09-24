import Icon from './Icon'

export default function EmptyState({ icon = 'inbox', title, message, action }) {
  return (
    <div className="empty">
      <div className="empty-icon">
        <Icon name={icon} size={40} strokeWidth={1.5} />
      </div>
      <div className="empty-title">{title}</div>
      <div>{message}</div>
      {action}
    </div>
  )
}