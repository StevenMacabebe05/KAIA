import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { DEMO_HINTS } from '../data/users'

export default function Login() {
  const { logIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function go(user) {
    navigate(user.role === 'ngo_rep' ? '/dashboard' : '/')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      const user = await logIn({ email, password })
      go(user)
    } catch (err) {
      setError(err.message)
    }
  }

  async function quickFill(account) {
    setEmail(account.email)
    setPassword(account.password)
    setError('')
    try {
      const user = await logIn(account)
      go(user)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="auth-bg">
      <div className="auth-card">
        <h1 className="auth-brand">KAIA</h1>
        <p className="auth-tagline">For Causes That Matter</p>

        <div className="auth-hint">
          <strong>Demo accounts:</strong>
          <br />Supporter — <code>demo@kaia.ph</code> / <code>demo123</code>
          <br />NGO Rep — <code>ngo@kaia.ph</code> / <code>demo123</code>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Email</label>
            <input
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="field">
            <label>Password</label>
            <input
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div style={{ color: 'var(--red-600)', fontSize: 13, marginBottom: 12 }}>
              {error}
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-block btn-lg">
            Log in
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
          <div style={{ flex: 1, height: 1, background: 'var(--ink-100)' }} />
          <span className="text-muted" style={{ fontSize: 12 }}>or</span>
          <div style={{ flex: 1, height: 1, background: 'var(--ink-100)' }} />
        </div>

        {DEMO_HINTS.map((hint) => (
          <button
            key={hint.label}
            type="button"
            onClick={() => quickFill(hint)}
            className="btn btn-ghost btn-block"
            style={{ marginBottom: 10 }}
          >
            Continue as demo {hint.label.toLowerCase()}
          </button>
        ))}

        <p className="text-muted text-center" style={{ marginTop: 24, fontSize: 13 }}>
          No account? <Link to="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  )
}