import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function SignUp() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'supporter',
  })
  const [error, setError] = useState('')

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      await signUp(form)
      navigate(form.role === 'ngo_rep' ? '/register-ngo' : '/')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="auth-bg">
      <div className="auth-card">
        <h1 className="auth-brand">Create account</h1>
        <p className="auth-tagline">Join KAIA in under a minute.</p>

        <div className="auth-hint">
          <strong>Demo only:</strong> this creates a temporary session.
          Only the two demo accounts can log back in later.
        </div>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Full name</label>
            <input
              className="input"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              required
            />
          </div>

          <div className="field">
            <label>Email</label>
            <input
              type="email"
              className="input"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              required
            />
          </div>

          <div className="field">
            <label>Password</label>
            <input
              type="password"
              className="input"
              value={form.password}
              onChange={(e) => update('password', e.target.value)}
              required
              minLength={6}
            />
          </div>

          <div className="field">
            <label>I am a…</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                className={`pill ${form.role === 'supporter' ? 'is-active' : ''}`}
                onClick={() => update('role', 'supporter')}
              >
                Supporter
              </button>
              <button
                type="button"
                className={`pill ${form.role === 'ngo_rep' ? 'is-active' : ''}`}
                onClick={() => update('role', 'ngo_rep')}
              >
                NGO Representative
              </button>
            </div>
          </div>

          {error && (
            <div style={{ color: 'var(--red-600)', fontSize: 13, marginBottom: 12 }}>
              {error}
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-block btn-lg">
            Create account
          </button>
        </form>

        <p className="text-muted text-center" style={{ marginTop: 24, fontSize: 13 }}>
          Have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  )
}