import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useActivity } from '../store/useActivity'
import { CAMPAIGNS } from '../data/campaigns'
import { OPPORTUNITIES } from '../data/opportunities'
import { NGOS } from '../data/ngos'
import Icon from '../components/Icon'
import { ActivityAreaChart, CategoryDonut, Sparkline } from '../components/Charts'

/* ---------- sample impact history ---------- */
const IMPACT_HISTORY = [
  { month: 'Aug', donations: 0, volunteers: 0 },
  { month: 'Sep', donations: 500, volunteers: 2 },
  { month: 'Oct', donations: 1200, volunteers: 4 },
  { month: 'Nov', donations: 1800, volunteers: 6 },
  { month: 'Dec', donations: 2600, volunteers: 9 },
  { month: 'Jan', donations: 3500, volunteers: 12 },
]

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
  const totalDonated = donations.reduce((s, d) => s + d.amount, 0)

  /* category breakdown for donut */
  const categoryMap = {}
  donations.forEach((d) => {
    const c = CAMPAIGNS.find((x) => x.id === d.campaignId)
    const cat = c?.category ?? 'Other'
    categoryMap[cat] = (categoryMap[cat] || 0) + d.amount
  })
  const categoryDonutData = Object.entries(categoryMap).map(([name, value]) => ({
    name,
    value,
  }))

  /* sparkline data */
  const donationSpark = IMPACT_HISTORY.map((d) => d.donations)
  const volunteerSpark = IMPACT_HISTORY.map((d) => d.volunteers)

  function handleLogout() {
    logOut()
    navigate('/login')
  }

  return (
    <div className="container">
      {/* ---------- user card ---------- */}
      <div className="card" style={{ padding: 28, marginBottom: 24 }}>
        <div className="row" style={{ gap: 18, flexWrap: 'wrap' }}>
          <div className="avatar avatar-lg">{user.name.charAt(0).toUpperCase()}</div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, letterSpacing: '-0.02em' }}>
              {user.name}
            </h1>
            <div className="text-muted" style={{ fontSize: 14, marginTop: 2 }}>
              {user.email}
            </div>
          </div>
          <button className="btn btn-neutral" onClick={handleLogout}>
            <Icon name="logout" size={16} /> Log out
          </button>
        </div>
      </div>

      {/* ---------- rich stat cards ---------- */}
      <div className="stat-row" style={{ marginBottom: 24 }}>
        <div className="stat-card-rich">
          <div className="stat-rich-top">
            <div>
              <div className="stat-rich-value">₱{totalDonated.toLocaleString()}</div>
              <div className="stat-rich-label">Total donated</div>
            </div>
            <Sparkline data={donationSpark} color="#1e40d8" />
          </div>
          <div className="stat-rich-delta">
            {donations.length > 0 ? `↑ ${donations.length} gifts` : 'Make your first gift'}
          </div>
        </div>

        <div className="stat-card-rich">
          <div className="stat-rich-top">
            <div>
              <div className="stat-rich-value">{hours}</div>
              <div className="stat-rich-label">Hours volunteered</div>
            </div>
            <Sparkline data={volunteerSpark} color="#f97316" />
          </div>
          <div className="stat-rich-delta">
            {signups.length > 0 ? `↑ ${signups.length} signups` : 'Join an opportunity'}
          </div>
        </div>

        <div className="stat-card-rich">
          <div className="stat-rich-top">
            <div>
              <div className="stat-rich-value">{follows.length}</div>
              <div className="stat-rich-label">NGOs followed</div>
            </div>
            <Sparkline data={[1, 2, 2, 3, 4, follows.length]} color="#1e40d8" />
          </div>
          <div className="stat-rich-delta">Growing</div>
        </div>

        <div className="stat-card-rich">
          <div className="stat-rich-top">
            <div>
              <div className="stat-rich-value">{saves.length}</div>
              <div className="stat-rich-label">Saved causes</div>
            </div>
            <Sparkline data={[0, 1, 1, 2, 2, saves.length]} color="#16a34a" />
          </div>
          <div className="stat-rich-delta">Bookmarked</div>
        </div>
      </div>

      {/* ---------- impact over time ---------- */}
      <div className="chart-card" style={{ marginBottom: 20 }}>
        <div className="chart-card-header">
          <div>
            <h3 className="chart-title">Your impact over time</h3>
            <p className="chart-subtitle">
              Donations (₱) and volunteer hours across the last 6 months
            </p>
          </div>
          <span className="chart-badge">↑ Growing</span>
        </div>
        <ActivityAreaChart data={IMPACT_HISTORY} />
      </div>

      {/* ---------- category donut + recent activity ---------- */}
      <div className="chart-grid">
        <div className="chart-card">
          <div className="chart-card-header">
            <div>
              <h3 className="chart-title">Where your money went</h3>
              <p className="chart-subtitle">Donations by cause category</p>
            </div>
          </div>
          <CategoryDonut data={categoryDonutData} />
        </div>

        <div className="chart-card">
          <div className="chart-card-header">
            <div>
              <h3 className="chart-title">Following</h3>
              <p className="chart-subtitle">{follows.length} NGOs</p>
            </div>
          </div>
          {follows.length === 0 ? (
            <p className="text-muted" style={{ fontSize: 13 }}>
              Not following any NGOs yet.
            </p>
          ) : (
            <div className="stack" style={{ gap: 10 }}>
              {follows.map((id) => {
                const n = NGOS.find((x) => x.id === id)
                if (!n) return null
                return (
                  <Link
                    key={id}
                    to={`/ngo/${id}`}
                    className="row"
                    style={{ gap: 10, color: 'inherit', padding: '6px 0' }}
                  >
                    <img
                      src={n.logo}
                      alt=""
                      style={{ width: 34, height: 34, borderRadius: 8, objectFit: 'cover' }}
                    />
                    <span style={{ fontSize: 13, fontWeight: 600, flex: 1 }}>
                      {n.name}
                    </span>
                    <Icon name="chevron-right" size={14} color="var(--ink-500)" />
                  </Link>
                )
              })}
            </div>
          )}
          <Link to="/register-ngo" className="btn btn-accent btn-block" style={{ marginTop: 16 }}>
            Register an NGO
          </Link>
        </div>
      </div>

      {/* ---------- recent activity ---------- */}
      <div className="chart-grid-2" style={{ marginTop: 20 }}>
        <div className="chart-card">
          <div className="chart-card-header">
            <h3 className="chart-title">Recent donations</h3>
            <span className="chart-subtitle">{donations.length} total</span>
          </div>
          {donations.length === 0 ? (
            <p className="text-muted" style={{ fontSize: 13 }}>
              No donations yet.
            </p>
          ) : (
            <div className="stack" style={{ gap: 4 }}>
              {donations.slice(0, 5).map((d, i) => {
                const c = CAMPAIGNS.find((x) => x.id === d.campaignId)
                return (
                  <div
                    key={i}
                    className="row-between"
                    style={{
                      padding: '10px 0',
                      borderBottom:
                        i < Math.min(donations.length, 5) - 1
                          ? '1px solid var(--ink-100)'
                          : 'none',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>
                        {c?.title ?? 'a campaign'}
                      </div>
                      <div className="text-muted" style={{ fontSize: 12 }}>
                        {new Date(d.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <strong style={{ color: 'var(--blue-700)' }}>
                      ₱{d.amount.toLocaleString()}
                    </strong>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="chart-card">
          <div className="chart-card-header">
            <h3 className="chart-title">Volunteer signups</h3>
            <span className="chart-subtitle">{signups.length} total</span>
          </div>
          {signups.length === 0 ? (
            <p className="text-muted" style={{ fontSize: 13 }}>
              No volunteer signups yet.
            </p>
          ) : (
            <div className="stack" style={{ gap: 4 }}>
              {signups.slice(0, 5).map((s, i) => {
                const o = OPPORTUNITIES.find((x) => x.id === s.opportunityId)
                return (
                  <div
                    key={i}
                    className="row-between"
                    style={{
                      padding: '10px 0',
                      borderBottom:
                        i < Math.min(signups.length, 5) - 1
                          ? '1px solid var(--ink-100)'
                          : 'none',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>
                        {o?.title ?? 'Opportunity'}
                      </div>
                      <div
                        className="text-muted"
                        style={{ fontSize: 12, textTransform: 'capitalize' }}
                      >
                        {s.status}
                      </div>
                    </div>
                    <Icon name="check" size={16} color="var(--green-600)" />
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}