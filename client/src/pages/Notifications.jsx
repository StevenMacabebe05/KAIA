import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useActivity } from '../store/useActivity'
import { useToast } from '../components/Toast'
import EmptyState from '../components/EmptyState'
import Icon from '../components/Icon'

const TYPE_META = {
  donation: {
    icon: 'heart',
    color: 'var(--orange-500)',
    bg: 'var(--orange-50)',
    label: 'Donation',
  },
  signup: {
    icon: 'hand',
    color: 'var(--blue-700)',
    bg: 'var(--blue-50)',
    label: 'Volunteer',
  },
  follow: {
    icon: 'users',
    color: 'var(--green-600)',
    bg: '#dcfce7',
    label: 'Follow',
  },
  system: {
    icon: 'megaphone',
    color: 'var(--blue-700)',
    bg: 'var(--blue-50)',
    label: 'System',
  },
}

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'donation', label: 'Donations' },
  { key: 'signup', label: 'Volunteers' },
  { key: 'follow', label: 'Follows' },
  { key: 'system', label: 'System' },
]

function timeAgo(iso) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}

function groupByDate(items) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const weekAgo = new Date(today)
  weekAgo.setDate(weekAgo.getDate() - 7)

  const groups = {
    Today: [],
    Yesterday: [],
    'This week': [],
    Older: [],
  }

  items.forEach((n) => {
    const d = new Date(n.createdAt)
    d.setHours(0, 0, 0, 0)
    if (d >= today) groups.Today.push(n)
    else if (d >= yesterday) groups.Yesterday.push(n)
    else if (d >= weekAgo) groups['This week'].push(n)
    else groups.Older.push(n)
  })

  return groups
}

export default function Notifications() {
  const { user } = useAuth()
  const store = useActivity()
  const toast = useToast()
  const navigate = useNavigate()

  const [filter, setFilter] = useState('all')

  if (!user) return null

  const all = store.getNotifications(user.id)
  const filtered = filter === 'all' ? all : all.filter((n) => n.type === filter)

  const grouped = groupByDate(filtered)
  const unreadCount = all.filter((n) => !n.read).length

  function handleClick(n) {
    if (!n.read) store.markAsRead(n.id)
    if (n.link) navigate(n.link)
  }

  function handleMarkAll() {
    store.markAllAsRead(user.id)
    toast.push('All notifications marked as read', 'success', 1500)
  }

  function handleClearAll() {
    if (!window.confirm('Delete all notifications? This cannot be undone.'))
      return
    store.clearNotifications(user.id)
    toast.push('All notifications cleared', 'info', 1500)
  }

  return (
    <div className="container notifications-page">
      <div className="page-header">
        <h1 className="page-title">Notifications</h1>
        <p className="page-subtitle">
          {all.length} total · {unreadCount} unread
        </p>
      </div>

      <div className="notif-page-actions">
        <div className="feed-tabs">
          {FILTERS.map((f) => {
            const count =
              f.key === 'all'
                ? all.length
                : all.filter((n) => n.type === f.key).length
            return (
              <button
                key={f.key}
                className={`feed-tab ${filter === f.key ? 'active' : ''}`}
                onClick={() => setFilter(f.key)}
                type="button"
              >
                {f.label}
                {count > 0 && (
                  <span className="feed-tab-count">{count}</span>
                )}
              </button>
            )
          })}
        </div>

        <div className="notif-page-buttons">
          {unreadCount > 0 && (
            <button
              className="btn btn-ghost btn-sm"
              onClick={handleMarkAll}
              type="button"
            >
              <Icon name="check" size={14} />
              Mark all read
            </button>
          )}
          {all.length > 0 && (
            <button
              className="btn btn-neutral btn-sm"
              onClick={handleClearAll}
              type="button"
            >
              <Icon name="x" size={14} />
              Clear all
            </button>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon="bell"
          title="No notifications"
          message={
            filter === 'all'
              ? "When you donate, volunteer, or follow NGOs, you'll see activity here."
              : `You don't have any ${filter} notifications yet.`
          }
          suggestions={[
            { label: 'Discover NGOs', to: '/discover', icon: 'globe' },
            { label: 'Browse campaigns', to: '/donate', icon: 'heart' },
            { label: 'Find volunteer work', to: '/volunteer', icon: 'hand' },
          ]}
        />
      ) : (
        <div className="notifications-list">
          {Object.entries(grouped).map(([groupName, items]) => {
            if (items.length === 0) return null
            return (
              <div key={groupName} className="notif-group">
                <div className="notif-group-header">
                  <span className="notif-group-title">{groupName}</span>
                  <span className="notif-group-count">{items.length}</span>
                </div>
                <div className="notif-group-list">
                  {items.map((n) => {
                    const meta = TYPE_META[n.type] || TYPE_META.system
                    return (
                      <button
                        key={n.id}
                        type="button"
                        className={`notif-row ${!n.read ? 'unread' : ''}`}
                        onClick={() => handleClick(n)}
                      >
                        <span
                          className="notif-row-icon"
                          style={{ background: meta.bg, color: meta.color }}
                        >
                          <Icon name={meta.icon} size={16} />
                        </span>
                        <div className="notif-row-body">
                          <div className="notif-row-top">
                            <span className="notif-row-title">
                              {n.title}
                            </span>
                            {!n.read && <span className="notif-row-dot" />}
                          </div>
                          {n.body && (
                            <div className="notif-row-text">{n.body}</div>
                          )}
                          <div className="notif-row-meta">
                            <span
                              className="notif-row-type"
                              style={{ color: meta.color }}
                            >
                              {meta.label}
                            </span>
                            <span className="notif-row-dot-sep">·</span>
                            <span>{timeAgo(n.createdAt)}</span>
                          </div>
                        </div>
                        {n.link && (
                          <Icon
                            name="chevron-right"
                            size={14}
                            color="var(--ink-500)"
                          />
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}