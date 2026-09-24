import { createContext, useContext, useEffect, useState } from 'react'

const ToastContext = createContext(null)

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

  useEffect(() => {
    const timer = setTimeout(() => setLeaving(true), 2600)
    return () => clearTimeout(timer)
  }, [])

  const colors = {
    success: { bg: '#dcfce7', fg: '#15803d', icon: '✓' },
    error: { bg: '#fee2e2', fg: '#dc2626', icon: '✕' },
    info: { bg: '#dbe6ff', fg: '#1e40d8', icon: 'i' },
  }
  const c = colors[type] || colors.success

  return (
    <div
      className="toast"
      style={{
        transform: leaving ? 'translateX(120%)' : 'translateX(0)',
        opacity: leaving ? 0 : 1,
      }}
    >
      <span className="toast-icon" style={{ background: c.bg, color: c.fg }}>
        {c.icon}
      </span>
      <span className="toast-message">{message}</span>
      <button className="toast-close" onClick={onClose}>×</button>
    </div>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside ToastProvider')
  return ctx
}