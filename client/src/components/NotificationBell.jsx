import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useActivity } from '../store/useActivity'
import { useAuth } from '../context/AuthContext'
import Icon from './Icon'

function timeAgo(iso) {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

const TYPE_META = {
  donation: { icon: 'heart', color: 'var(--orange-500)', bg: 'var(--orange-50)' },
  signup: { icon: 'hand', color: 'var(--blue-700)', bg: 'var(--blue-50)' },
  follow: { icon: 'users', color: 'var(--green-600)', bg: '#dcfce7' },
  system: { icon: 'megaphone', color: 'var(--blue-700)', bg: 'var(--blue-50)' },
}

export default function NotificationBell() {
  const { user } = useAuth()
  const store = useActivity()
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef(null)
  const navigate = useNavigate()

  const notifications = user ? store.getNotifications(user.id) : []
  const unread = user ? store.getUnreadCount(user.id) : 0

  useEffect(() => {
    function onClick(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    function onEsc(e) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onEsc)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onEsc)
    }
  }, [])

  if (!user) return null

  function handleClick(n) {
    if (!n.read) store.markAsRead(n.id)
    if (n.link) navigate(n.link)
    setOpen(false)
  }

  return (
    <div className="notif-wrapper" ref={wrapperRef}>
      <button
        className={`notif-trigger ${unread > 0 ? 'has-unread' : ''}`}
        onClick={() => setOpen((o) => !o)}
        aria-label="Notifications"
      >
        <Icon name="bell" size={18} />
        {unread > 0 && (
          <span className="notif-badge">{unread > 9 ? '9+' : unread}</span>
        )}
      </button>

      {open && (
        <div className="notif-dropdown">
          <div className="notif-header">
            <div>
              <div style={{ fontWeight: 800, fontSize: 14 }}>Activity</div>
              <div className="text-muted" style={{ fontSize: 12 }}>
                {unread > 0 ? `${unread} unread` : 'All caught up'}
              </div>
            </div>
            {unread > 0 && (
              <button
                className="btn btn-neutral btn-sm"
                onClick={() => store.markAllAsRead(user.id)}
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="notif-list">
            {notifications.length === 0 ? (
              <div className="notif-empty">
                <Icon name="bell" size={28} color="var(--ink-300)" />
                <div style={{ marginTop: 8, fontSize: 13 }}>No activity yet</div>
              </div>
            ) : (
              notifications.slice(0, 20).map((n) => {
                const meta = TYPE_META[n.type] || TYPE_META.system
                return (
                  <button
                    key={n.id}
                    className={`notif-item ${!n.read ? 'unread' : ''}`}
                    onClick={() => handleClick(n)}
                  >
                    <span
                      className="notif-icon"
                      style={{ background: meta.bg, color: meta.color }}
                    >
                      <Icon name={meta.icon} size={14} />
                    </span>
                    <div className="notif-body">
                      <div className="notif-title">{n.title}</div>
                      {n.body && <div className="notif-text">{n.body}</div>}
                      <div className="notif-time">{timeAgo(n.createdAt)}</div>
                    </div>
                    {!n.read && <span className="notif-dot" />}
                  </button>
                )
              })
            )}
          </div>

          {notifications.length > 0 && (
            <div className="notif-footer">
              <button
                className="btn btn-neutral btn-sm btn-block"
                onClick={() => store.clearNotifications(user.id)}
              >
                Clear all activity
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}