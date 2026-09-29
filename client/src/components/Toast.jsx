import { createContext, useContext, useEffect, useState } from 'react'
import Icon from './Icon'

const ToastContext = createContext(null)

const VARIANTS = {
  success: { icon: 'check-circle', bg: '#dcfce7', fg: '#15803d', bar: '#16a34a' },
  error: { icon: 'x', bg: '#fee2e2', fg: '#dc2626', bar: '#dc2626' },
  warning: { icon: 'bell', bg: '#fff4e8', fg: '#ea6a0a', bar: '#f97316' },
  info: { icon: 'megaphone', bg: '#dbe6ff', fg: '#1e40d8', bar: '#1e40d8' },
  default: { icon: 'bell', bg: '#eef2f7', fg: '#334155', bar: '#64748b' },
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  function push(message, type = 'success', duration = 3000) {
    const id = Date.now() + Math.random()
    setToasts((t) => [...t, { id, message, type }])
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id))
    }, duration)
  }

  function dismiss(id) {
    setToasts((t) => t.filter((x) => x.id !== id))
  }

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="toast-stack">
        {toasts.map((t) => (
          <ToastItem key={t.id} {...t} onClose={() => dismiss(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

function ToastItem({ message, type, onClose }) {
  const [leaving, setLeaving] = useState(false)
  const variant = VARIANTS[type] || VARIANTS.default

  useEffect(() => {
    const timer = setTimeout(() => setLeaving(true), 2600)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div
      className={`toast toast-${type}`}
      style={{
        transform: leaving ? 'translateX(120%)' : 'translateX(0)',
        opacity: leaving ? 0 : 1,
        borderLeftColor: variant.bar,
      }}
    >
      <span
        className="toast-icon"
        style={{ background: variant.bg, color: variant.fg }}
      >
        <Icon name={variant.icon} size={12} color={variant.fg} />
      </span>
      <span className="toast-message">{message}</span>
      <button className="toast-close" onClick={onClose} type="button">
        ×
      </button>
    </div>
  )
}

/* eslint-disable react-refresh/only-export-components */
export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside ToastProvider')
  return ctx
}