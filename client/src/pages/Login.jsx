import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/Toast'
import { DEMO_HINTS } from '../data/users'
import Icon from '../components/Icon'

const QUOTES = [
  { text: 'KAIA natin \u2018to lahat.', sub: 'This is ours, together.' },
  { text: 'Kaya mo. Kaya natin.', sub: 'You can. We can.' },
  { text: 'Bayanihan, one tap away.', sub: 'The Filipino spirit, digitized.' },
  { text: 'Every peso counts.', sub: 'Small acts, big impact.' },
  { text: 'Support comes in many forms.', sub: 'Time. Money. Voice. Effort.' },
  { text: 'Everyone has something to give.', sub: 'Find yours on KAIA.' },
]

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.5 6.1 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.5 6.1 29.5 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.5-5.2l-6.2-5.2C29.3 35.3 26.8 36 24 36c-5.2 0-9.7-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.1 5.6l6.2 5.2c-.4.4 6.6-4.8 6.6-14.8 0-1.3-.1-2.3-.4-3.5z"/>
    </svg>
  )
}

function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#1877F2" d="M24 12a12 12 0 1 0-13.9 11.9v-8.4h-3v-3.5h3V9.4c0-3 1.8-4.7 4.5-4.7 1.3 0 2.7.2 2.7.2v3h-1.5c-1.5 0-2 .9-2 1.9v2.2h3.4l-.5 3.5h-2.9v8.4A12 12 0 0 0 24 12z"/>
    </svg>
  )
}

function GithubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.5-1.4-1.3-1.8-1.3-1.8-1-.7.1-.7.1-.7 1.2 0 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.7-1.6-2.7-.3-5.5-1.3-5.5-6 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.6 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.7-2.8 5.7-5.5 6 .4.4.8 1 .8 2.1v3.1c0 .3.2.7.8.6A12 12 0 0 0 12 .3z"/>
    </svg>
  )
}

export default function Login() {
  const { logIn } = useAuth()
  const { push: toast } = useToast()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [quoteIndex, setQuoteIndex] = useState(0)
  const [connecting, setConnecting] = useState(null)

  useEffect(() => {
    const t = setInterval(() => {
      setQuoteIndex((i) => (i + 1) % QUOTES.length)
    }, 4200)
    return () => clearInterval(t)
  }, [])

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

  function handleSocial(provider) {
    setConnecting(provider)
    toast.push(`Connecting to ${provider}…`, 'info', 1500)

    setTimeout(async () => {
      try {
        const user = await logIn(DEMO_HINTS[0])
        setConnecting(null)
        toast.push(`Signed in with ${provider} (demo account)`, 'success')
        go(user)
      } catch (err) {
        setConnecting(null)
        setError(err.message)
      }
    }, 1200)
  }

  const currentQuote = QUOTES[quoteIndex]

  return (
    <div className="auth-page">
      <div className="auth-card-floating">
        {/* LEFT — animated gradient hero */}
        <aside className="auth-hero">
          <div className="auth-hero-blob auth-hero-blob-1" />
          <div className="auth-hero-blob auth-hero-blob-2" />
          <div className="auth-hero-blob auth-hero-blob-3" />

          <div className="auth-hero-content">
            <div className="auth-hero-mark">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.4"
                strokeLinecap="round"
              >
                <path d="M12 2v20M4.9 4.9l14.2 14.2M19.1 4.9L4.9 19.1" />
              </svg>
            </div>

            <div className="auth-hero-quote-wrap">
              <div key={quoteIndex} className="auth-hero-quote">
                <div className="auth-hero-quote-text">
                  {currentQuote.text}
                </div>
                <div className="auth-hero-quote-sub">
                  {currentQuote.sub}
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* RIGHT — login form */}
        <main className="auth-panel">
          <div className="auth-panel-inner">
            <img
              src="/images/kaia-logo.png"
              alt="KAIA"
              className="auth-panel-logo"
            />

            <h1 className="auth-panel-title">Welcome back</h1>
            <p className="auth-panel-tagline">
              Sign in to access your personal impact hub.
            </p>

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="field">
                <label>Your email</label>
                <input
                  type="email"
                  className="input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </div>

              <div className="field">
                <label>Password</label>
                <div className="auth-password-wrap">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    className="auth-password-toggle"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={
                      showPassword ? 'Hide password' : 'Show password'
                    }
                  >
                    <Icon name={showPassword ? 'shield' : 'bell'} size={16} />
                  </button>
                </div>
              </div>

              {error && <div className="auth-error">{error}</div>}

              <button
                type="submit"
                className="btn btn-primary btn-block btn-lg auth-submit"
                disabled={!email || !password}
              >
                Get started
              </button>
            </form>

            <div className="auth-divider">
              <span className="auth-divider-line" />
              <span className="auth-divider-text">or continue with</span>
              <span className="auth-divider-line" />
            </div>

            <div className="auth-socials">
              <button
                type="button"
                className="auth-social"
                onClick={() => handleSocial('Google')}
                disabled={!!connecting}
                title="Continue with Google"
              >
                {connecting === 'Google' ? (
                  <span className="auth-social-spinner" />
                ) : (
                  <GoogleIcon />
                )}
                <span className="auth-social-label">Google</span>
              </button>

              <button
                type="button"
                className="auth-social"
                onClick={() => handleSocial('Facebook')}
                disabled={!!connecting}
                title="Continue with Facebook"
              >
                {connecting === 'Facebook' ? (
                  <span className="auth-social-spinner" />
                ) : (
                  <FacebookIcon />
                )}
                <span className="auth-social-label">Facebook</span>
              </button>

              <button
                type="button"
                className="auth-social"
                onClick={() => handleSocial('GitHub')}
                disabled={!!connecting}
                title="Continue with GitHub"
              >
                {connecting === 'GitHub' ? (
                  <span className="auth-social-spinner" />
                ) : (
                  <GithubIcon />
                )}
                <span className="auth-social-label">GitHub</span>
              </button>
            </div>

            <p className="auth-switch">
              Don't have an account?{' '}
              <Link to="/signup" className="auth-switch-link">
                Sign up
              </Link>
            </p>

            <div className="auth-demo-block">
              <div className="auth-demo-label">Try the demo</div>
              <div className="auth-demo-row">
                <button
                  type="button"
                  className="auth-demo-btn"
                  onClick={() => quickFill(DEMO_HINTS[0])}
                >
                  Supporter
                </button>
                <button
                  type="button"
                  className="auth-demo-btn"
                  onClick={() => quickFill(DEMO_HINTS[1])}
                >
                  NGO Rep
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}