import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useActivity } from '../store/useActivity'
import { CAMPAIGNS } from '../data/campaigns'
import { OPPORTUNITIES } from '../data/opportunities'
import { NGOS } from '../data/ngos'
import { ACHIEVEMENTS } from '../data/achievements'
import Icon from '../components/Icon'
import ProgressBar from '../components/ProgressBar'
import {
  ActivityAreaChart,
  CategoryDonut,
  Sparkline,
} from '../components/Charts'

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

  const donations = [...store.getDonations(user.id)].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  )
  const signups = [...store.getSignups(user.id)].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  )
  const follows = store.getFollowedNgoIds(user.id)
  const saves = store.getSaved(user.id)
  const checkIns = store.getCheckIns(user.id)

  const hours = signups
    .filter((s) => s.status === 'completed' || s.status === 'attended')
    .reduce((sum, s) => sum + (s.hours || 4), 0)

  const totalDonated = donations.reduce((s, d) => s + d.amount, 0)

  function findReceipt(donation) {
    const all = store.getState().receipts || []
    return all.find((r) => r.ref === donation.ref)
  }

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

  const donationSpark = IMPACT_HISTORY.map((d) => d.donations)
  const volunteerSpark = IMPACT_HISTORY.map((d) => d.volunteers)

  const unlockedCount = ACHIEVEMENTS.filter((a) =>
    a.check({ donations, signups, follows, saves })
  ).length

  function handleLogout() {
    logOut()
    navigate('/login')
  }

  return (
    <div className="container">
      {/* ---------- user card ---------- */}
      <div className="card" style={{ padding: 28, marginBottom: 24 }}>
        <div className="row" style={{ gap: 18, flexWrap: 'wrap' }}>
          <div className="avatar avatar-lg">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <h1
              style={{
                margin: 0,
                fontSize: 24,
                fontWeight: 800,
                letterSpacing: '-0.02em',
              }}
            >
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

      {/* ---------- stat cards ---------- */}
      <div className="stat-row" style={{ marginBottom: 24 }}>
        <div className="stat-card-rich">
          <div className="stat-rich-top">
            <div>
              <div className="stat-rich-value">
                ₱{totalDonated.toLocaleString()}
              </div>
              <div className="stat-rich-label">Total donated</div>
            </div>
            <Sparkline data={donationSpark} color="#1e40d8" />
          </div>
          <div className="stat-rich-delta">
            {donations.length > 0
              ? `↑ ${donations.length} gifts`
              : 'Make your first gift'}
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
            {signups.length > 0
              ? `↑ ${signups.length} signups`
              : 'Join an opportunity'}
          </div>
        </div>

        <div className="stat-card-rich">
          <div className="stat-rich-top">
            <div>
              <div className="stat-rich-value">{follows.length}</div>
              <div className="stat-rich-label">NGOs followed</div>
            </div>
            <Sparkline
              data={[1, 2, 2, 3, 4, follows.length]}
              color="#1e40d8"
            />
          </div>
          <div className="stat-rich-delta">Growing</div>
        </div>

        <div className="stat-card-rich">
          <div className="stat-rich-top">
            <div>
              <div className="stat-rich-value">{saves.length}</div>
              <div className="stat-rich-label">Saved causes</div>
            </div>
            <Sparkline
              data={[0, 1, 1, 2, 2, saves.length]}
              color="#16a34a"
            />
          </div>
          <div className="stat-rich-delta">Bookmarked</div>
        </div>
      </div>

      {/* ---------- saved campaigns ---------- */}
      <div className="chart-card" style={{ marginBottom: 20 }}>
        <div className="chart-card-header">
          <div>
            <h3 className="chart-title">Saved campaigns</h3>
            <p className="chart-subtitle">
              {saves.length} {saves.length === 1 ? 'campaign' : 'campaigns'}{' '}
              bookmarked
            </p>
          </div>
        </div>
        {saves.length === 0 ? (
          <p className="text-muted" style={{ fontSize: 13 }}>
            No saved campaigns yet. Bookmark campaigns from the Donate page.
          </p>
        ) : (
          <div className="grid grid-2">
            {saves.map((s) => {
              const c = CAMPAIGNS.find((x) => x.id === s.campaignId)
              if (!c) return null
              return (
                <Link
                  key={s.campaignId}
                  to={`/campaign/${c.id}`}
                  className="card card-hover"
                  style={{ color: 'inherit', padding: 14 }}
                >
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 14,
                      marginBottom: 4,
                    }}
                  >
                    {c.title}
                  </div>
                  <div
                    className="text-muted"
                    style={{ fontSize: 12, marginBottom: 8 }}
                  >
                    {c.category}
                  </div>
                  <ProgressBar value={c.raised} goal={c.goal} />
                </Link>
              )
            })}
          </div>
        )}
      </div>

      {/* ---------- achievements ---------- */}
      <div className="chart-card" style={{ marginBottom: 20 }}>
        <div className="chart-card-header">
          <div>
            <h3 className="chart-title">Achievements</h3>
            <p className="chart-subtitle">
              {unlockedCount} of {ACHIEVEMENTS.length} unlocked
            </p>
          </div>
          <span className="chart-badge orange">
            {Math.round((unlockedCount / ACHIEVEMENTS.length) * 100)}% complete
          </span>
        </div>

        <div className="badge-grid">
          {ACHIEVEMENTS.map((a) => {
            const unlocked = a.check({ donations, signups, follows, saves })
            return (
              <div
                key={a.id}
                className={`achievement ${unlocked ? 'unlocked' : 'locked'}`}
              >
                <div className="achievement-icon">
                  <Icon name={a.icon} size={20} />
                </div>
                <div className="achievement-title">{a.title}</div>
                <div className="achievement-desc">{a.description}</div>
              </div>
            )
          })}
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

      {/* ---------- category donut + following ---------- */}
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
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 8,
                        objectFit: 'cover',
                      }}
                    />
                    <span
                      style={{ fontSize: 13, fontWeight: 600, flex: 1 }}
                    >
                      {n.name}
                    </span>
                    <Icon
                      name="chevron-right"
                      size={14}
                      color="var(--ink-500)"
                    />
                  </Link>
                )
              })}
            </div>
          )}
          <Link
            to="/register-ngo"
            className="btn btn-accent btn-block"
            style={{ marginTop: 16 }}
          >
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
              {donations.slice(0, 5).map((d) => {
                const c = CAMPAIGNS.find((x) => x.id === d.campaignId)
                const receipt = findReceipt(d)
                const row = (
                  <div
                    className="row-between"
                    style={{ padding: '10px 0' }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>
                        {c?.title ?? 'a campaign'}
                      </div>
                      <div className="text-muted" style={{ fontSize: 12 }}>
                        {new Date(d.createdAt).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                    <div className="row" style={{ gap: 8 }}>
                      <strong style={{ color: 'var(--blue-700)' }}>
                        ₱{d.amount.toLocaleString()}
                      </strong>
                      {receipt && (
                        <Icon
                          name="chevron-right"
                          size={14}
                          color="var(--ink-500)"
                        />
                      )}
                    </div>
                  </div>
                )
                return receipt ? (
                  <Link
                    key={d.ref || d.createdAt}
                    to={`/receipt/${receipt.id}`}
                    style={{ color: 'inherit', display: 'block' }}
                  >
                    {row}
                  </Link>
                ) : (
                  <div key={d.ref || d.createdAt}>{row}</div>
                )
              })}
            </div>
          )}
        </div>

        <div className="chart-card">
          <div className="chart-card-header">
            <h3 className="chart-title">Volunteer history</h3>
            <span className="chart-subtitle">{signups.length} total</span>
          </div>
          {signups.length === 0 ? (
            <p className="text-muted" style={{ fontSize: 13 }}>
              No volunteer signups yet.
            </p>
          ) : (
            <div className="stack" style={{ gap: 4 }}>
              {signups.slice(0, 5).map((s) => {
                const o = OPPORTUNITIES.find(
                  (x) => x.id === s.opportunityId
                )
                const isCancelled = s.status === 'cancelled'
                const attended = s.status === 'attended'
                return (
                  <div
                    key={s.createdAt}
                    className="row-between"
                    style={{ padding: '10px 0' }}
                  >
                    <div>
                      <div
                        style={{
                          fontWeight: 600,
                          fontSize: 14,
                          textDecoration: isCancelled
                            ? 'line-through'
                            : 'none',
                          opacity: isCancelled ? 0.6 : 1,
                        }}
                      >
                        {o?.title ?? 'Opportunity'}
                      </div>
                      <div
                        className="text-muted"
                        style={{
                          fontSize: 12,
                          textTransform: 'capitalize',
                        }}
                      >
                        {s.status} ·{' '}
                        {new Date(s.createdAt).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </div>
                    </div>
                    {isCancelled ? (
                      <span
                        className="badge"
                        style={{
                          background: '#fee2e2',
                          color: 'var(--red-600)',
                        }}
                      >
                        Cancelled
                      </span>
                    ) : attended ? (
                      <span
                        className="badge"
                        style={{
                          background: '#dcfce7',
                          color: '#15803d',
                        }}
                      >
                        ✓
                      </span>
                    ) : (
                      <Icon
                        name="check"
                        size={16}
                        color="var(--green-600)"
                      />
                    )}
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