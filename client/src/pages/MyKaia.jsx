import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useActivity } from '../store/useActivity'
import { CAMPAIGNS } from '../data/campaigns'
import { OPPORTUNITIES } from '../data/opportunities'
import { NGOS } from '../data/ngos'
import Icon from '../components/Icon'

export default function MyKaia() {
  const { user, logOut } = useAuth()
  const store = useActivity()
  const navigate = useNavigate()
  if (!user) return null

  const donations = store.getDonations(user.id)
  const signups = store.getSignups(user.id)
  const follows = store.getFollowedNgoIds(user.id)
  const saves = store.getSaved(user.id)
  const hours = signups
    .filter((s) => s.status === 'completed')
    .reduce((sum, s) => sum + (s.hours || 0), 0)

  function handleLogout() {
    logOut()
    navigate('/login')
  }

  return (
    <div className="container">
      <div className="card" style={{ padding: 28, marginBottom: 24 }}>
        <div className="row" style={{ gap: 18 }}>
          <div className="avatar avatar-lg">{user.name.charAt(0).toUpperCase()}</div>
          <div style={{ flex: 1 }}>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, letterSpacing: '-0.02em' }}>
              {user.name}
            </h1>
            <div className="text-muted" style={{ fontSize: 14, marginTop: 2 }}>{user.email}</div>
          </div>
          <button className="btn btn-neutral" onClick={handleLogout}>
            <Icon name="logout" size={16} /> Log out
          </button>
        </div>
      </div>

      <div className="stat-row">
        <div className="stat-card">
          <div className="stat-value">{donations.length}</div>
          <div className="stat-label">Donations</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{hours}</div>
          <div className="stat-label">Hours volunteered</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{follows.length}</div>
          <div className="stat-label">NGOs followed</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{signups.length}</div>
          <div className="stat-label">Programs joined</div>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: '2fr 1fr', gap: 24 }}>
        <div className="stack">
          <div className="card">
            <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 800 }}>Recent donations</h3>
            {donations.length === 0 ? (
              <p className="text-muted" style={{ margin: 0 }}>No donations yet.</p>
            ) : (
              <div className="stack" style={{ gap: 10 }}>
                {donations.slice(0, 5).map((d, i) => {
                  const c = CAMPAIGNS.find((x) => x.id === d.campaignId)
                  return (
                    <div key={i} className="row-between" style={{ padding: '10px 0', borderBottom: i < donations.length - 1 ? '1px solid var(--ink-100)' : 'none' }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{c?.title ?? 'a campaign'}</div>
                        <div className="text-muted" style={{ fontSize: 12 }}>
                          {new Date(d.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <strong style={{ color: 'var(--blue-700)' }}>₱{d.amount.toLocaleString()}</strong>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className="card">
            <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 800 }}>Volunteer signups</h3>
            {signups.length === 0 ? (
              <p className="text-muted" style={{ margin: 0 }}>No volunteer signups yet.</p>
            ) : (
              <div className="stack" style={{ gap: 10 }}>
                {signups.slice(0, 5).map((s, i) => {
                  const o = OPPORTUNITIES.find((x) => x.id === s.opportunityId)
                  return (
                    <div key={i} className="row-between" style={{ padding: '10px 0', borderBottom: i < signups.length - 1 ? '1px solid var(--ink-100)' : 'none' }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{o?.title ?? 'Opportunity'}</div>
                        <div className="text-muted" style={{ fontSize: 12, textTransform: 'capitalize' }}>{s.status}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        <aside className="stack">
          <div className="card">
            <h3 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 800 }}>NGOs you follow</h3>
            {follows.length === 0 ? (
              <p className="text-muted" style={{ margin: 0, fontSize: 13 }}>Not following any NGOs yet.</p>
            ) : (
              <div className="stack" style={{ gap: 8 }}>
                {follows.map((id) => {
                  const n = NGOS.find((x) => x.id === id)
                  if (!n) return null
                  return (
                    <Link key={id} to={`/ngo/${id}`} className="row" style={{ gap: 10, color: 'inherit', padding: '6px 0' }}>
                      <img src={n.logo} alt="" style={{ width: 32, height: 32, borderRadius: 8, objectFit: 'cover' }} />
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{n.name}</span>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>

          <Link to="/register-ngo" className="btn btn-accent btn-block btn-lg">
            Register an NGO
          </Link>
        </aside>
      </div>
    </div>
  )
}