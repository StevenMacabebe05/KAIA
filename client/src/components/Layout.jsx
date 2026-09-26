import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Icon from './Icon'
import NotificationBell from './NotificationBell'
import GlobalSearch from './GlobalSearch'

export default function Layout() {
  return (
    <div className="site">
      <Header />
      <main className="site-main">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

function Header() {
  const { user, logOut } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logOut()
    navigate('/login')
  }

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link to="/" className="brand">
          <img
            src="/images/kaia-logo.png"
            alt="KAIA"
            style={{ height: 36, width: 'auto', display: 'block' }}
          />
        </Link>

        <nav className="main-nav">
          <NavLink
            to="/"
            end
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            Home
          </NavLink>
          <NavLink
            to="/discover"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            Discover
          </NavLink>
          <NavLink
            to="/donate"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            Donate
          </NavLink>
          <NavLink
            to="/volunteer"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            Volunteer
          </NavLink>
          {user?.role === 'ngo_rep' && (
            <NavLink
              to="/scan"
              className={({ isActive }) =>
                `nav-link ${isActive ? 'active' : ''}`
              }
            >
              Scan
            </NavLink>
          )}
        </nav>

        <div className="header-actions">
          <GlobalSearch />
          {user ? (
            <>
              <NotificationBell />
              <Link
                to={user.role === 'ngo_rep' ? '/dashboard' : '/my-kaia'}
                className="user-chip"
              >
                <span className="avatar">
                  {user.name.charAt(0).toUpperCase()}
                </span>
                <span>{user.name.split(' ')[0]}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="btn btn-neutral btn-sm"
                title="Log out"
              >
                <Icon name="logout" size={16} />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">
                Log in
              </Link>
              <Link to="/signup" className="btn btn-primary btn-sm">
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div className="row" style={{ gap: 10 }}>
          <img
            src="/images/kaia-logo.png"
            alt="KAIA"
            style={{ height: 26, width: 'auto' }}
          />
          <span className="text-muted">— For Causes That Matter</span>
        </div>
        <div>Usability prototype · Mapúa University Makati · BSIT</div>
      </div>
    </footer>
  )
}