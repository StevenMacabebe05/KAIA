import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="app-shell">
      <div className="phone">
        <div className="phone-screen">
          <div className="page" style={{ textAlign: 'center', paddingTop: 80 }}>
            <h1 style={{ fontSize: 48, margin: 0 }}>404</h1>
            <p className="muted" style={{ marginTop: 8 }}>Page not found.</p>
            <Link to="/" style={{ textDecoration: 'none' }}>
              <button className="btn btn-primary" style={{ marginTop: 20 }}>
                Go home
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}