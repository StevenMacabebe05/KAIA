import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CAMPAIGNS } from '../data/campaigns'
import { OPPORTUNITIES } from '../data/opportunities'
import { POSTS } from '../data/posts'
import { useActivity } from '../store/useActivity'
import { useAuth } from '../context/AuthContext'
import Icon from '../components/Icon'
import AnimatedCounter from '../components/AnimatedCounter'
import {
  DonationLineChart,
  CampaignBarChart,
  StatusDonut,
  Sparkline,
} from '../components/Charts'

const DONATION_TREND = [
  { month: 'Aug', amount: 4200 },
  { month: 'Sep', amount: 6800 },
  { month: 'Oct', amount: 5400 },
  { month: 'Nov', amount: 9200 },
  { month: 'Dec', amount: 11500 },
  { month: 'Jan', amount: 12800 },
]

export default function NGODashboard() {
  const { user } = useAuth()
  const store = useActivity()
  const [modal, setModal] = useState(null)

  if (!user || !user.ngoId) return null

  const campaigns = [
    ...CAMPAIGNS.filter((c) => c.ngoId === user.ngoId),
    ...store.getExtraCampaigns().filter((c) => c.ngoId === user.ngoId),
  ]
  const posts = [
    ...POSTS.filter((p) => p.ngoId === user.ngoId),
    ...store.getExtraPosts().filter((p) => p.ngoId === user.ngoId),
  ]
  const opportunities = [
    ...OPPORTUNITIES.filter((o) => o.ngoId === user.ngoId),
    ...store.getExtraOpportunities().filter((o) => o.ngoId === user.ngoId),
  ]

  const totalRaised = campaigns.reduce((s, c) => s + c.raised, 0)
  const activeCampaigns = campaigns.filter(
    (c) => c.status !== 'completed'
  ).length

  const campaignChartData = campaigns.slice(0, 4).map((c) => ({
    name: c.title.length > 18 ? c.title.slice(0, 18) + '…' : c.title,
    raised: c.raised,
    goal: c.goal,
  }))

  const statusCounts = campaigns.reduce((acc, c) => {
    acc[c.status] = (acc[c.status] || 0) + 1
    return acc
  }, {})

  const statusDonutData = [
    { key: 'urgent', name: 'Urgent', value: statusCounts.urgent || 0 },
    { key: 'active', name: 'Active', value: statusCounts.active || 0 },
    {
      key: 'almost_complete',
      name: 'Almost Complete',
      value: statusCounts.almost_complete || 0,
    },
    {
      key: 'completed',
      name: 'Completed',
      value: statusCounts.completed || 0,
    },
  ].filter((d) => d.value > 0)

  const donationSpark = DONATION_TREND.map((d) => d.amount)

  const opportunityIds = opportunities.map((o) => o.id)
  const checkins = store.getCheckInsForNgo(opportunityIds)
  const applications = store.getApplicationsForNgo(opportunityIds)

  const TILES = [
    { key: 'inbox', label: 'Inbox', icon: 'message-circle', link: '/inbox' },
    { key: 'scan', label: 'Scan check-in', icon: 'search', link: '/scan' },
    { key: 'post', label: 'Create Post', icon: 'megaphone' },
    { key: 'campaign', label: 'Create Campaign', icon: 'heart' },
    { key: 'volunteer', label: 'Create Volunteer', icon: 'hand' },
    { key: 'event', label: 'Create Event', icon: 'calendar' },
    { key: 'applications', label: 'View Applications', icon: 'inbox' },
    { key: 'manage-campaigns', label: 'Manage Campaigns', icon: 'chart' },
    { key: 'manage-volunteers', label: 'Manage Volunteers', icon: 'users' },
    { key: 'attendance', label: 'View Attendance', icon: 'check-circle' },
    { key: 'updates', label: 'View Updates', icon: 'inbox' },
    { key: 'engagement', label: 'View Engagement', icon: 'trending' },
  ]

  return (
    <div className="container">
      <div className="page-header">
        <h1 className="page-title">NGO Dashboard</h1>
        <p className="page-subtitle">
          Manage campaigns, volunteers, and updates. Track performance in real
          time.
        </p>
      </div>

      {/* ---------- stat cards ---------- */}
      <div className="stat-row" style={{ marginBottom: 24 }}>
        <div className="stat-card-rich">
          <div className="stat-rich-top">
            <div>
              <div className="stat-rich-value">
                ₱<AnimatedCounter value={totalRaised} />
              </div>
              <div className="stat-rich-label">Total raised</div>
            </div>
            <Sparkline data={donationSpark} color="#1e40d8" />
          </div>
          <div className="stat-rich-delta">↑ 12.4% vs last month</div>
        </div>

        <div className="stat-card-rich">
          <div className="stat-rich-top">
            <div>
              <div className="stat-rich-value">
                <AnimatedCounter value={activeCampaigns} />
              </div>
              <div className="stat-rich-label">Active campaigns</div>
            </div>
            <Sparkline data={[1, 2, 2, 3, 3, 3]} color="#f97316" />
          </div>
          <div className="stat-rich-delta">↑ 1 new this month</div>
        </div>

        <div className="stat-card-rich">
          <div className="stat-rich-top">
            <div>
              <div className="stat-rich-value">
                <AnimatedCounter value={2300} />
              </div>
              <div className="stat-rich-label">Supporters</div>
            </div>
            <Sparkline
              data={[1800, 1950, 2050, 2100, 2200, 2300]}
              color="#1e40d8"
            />
          </div>
          <div className="stat-rich-delta">↑ 4.3% this week</div>
        </div>

        <div className="stat-card-rich">
          <div className="stat-rich-top">
            <div>
              <div className="stat-rich-value">
                <AnimatedCounter value={checkins.length} />
              </div>
              <div className="stat-rich-label">Event check-ins</div>
            </div>
            <Sparkline
              data={[0, 0, 1, 2, 2, checkins.length]}
              color="#16a34a"
            />
          </div>
          <div className="stat-rich-delta">
            {checkins.length > 0 ? '↑ new this month' : 'No check-ins yet'}
          </div>
        </div>
      </div>

      {/* ---------- charts ---------- */}
      <div className="chart-grid">
        <div className="chart-card">
          <div className="chart-card-header">
            <div>
              <h3 className="chart-title">Donations over time</h3>
              <p className="chart-subtitle">
                Last 6 months of contributions
              </p>
            </div>
            <span className="chart-badge">↑ 12.4%</span>
          </div>
          <DonationLineChart data={DONATION_TREND} />
        </div>

        <div className="chart-card">
          <div className="chart-card-header">
            <div>
              <h3 className="chart-title">Campaign status</h3>
              <p className="chart-subtitle">Live breakdown</p>
            </div>
          </div>
          <StatusDonut data={statusDonutData} />
        </div>
      </div>

      <div className="chart-card" style={{ marginBottom: 24 }}>
        <div className="chart-card-header">
          <div>
            <h3 className="chart-title">Campaign performance</h3>
            <p className="chart-subtitle">
              Raised vs goal for each active campaign
            </p>
          </div>
          <span className="chart-badge orange">
            {campaigns.length} campaigns
          </span>
        </div>
        <CampaignBarChart data={campaignChartData} />
      </div>

      {/* ---------- quick actions ---------- */}
      <div className="page-header" style={{ marginTop: 32 }}>
        <h2 className="page-title" style={{ fontSize: 22 }}>
          Quick actions
        </h2>
        <p className="page-subtitle">
          Everything you need to run your organization on KAIA.
        </p>
      </div>

      <div className="grid grid-4">
        {TILES.map((t) => {
          const content = (
            <>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: 'var(--blue-50)',
                  color: 'var(--blue-700)',
                  display: 'grid',
                  placeItems: 'center',
                  marginBottom: 14,
                  position: 'relative',
                }}
              >
                <Icon name={t.icon} size={20} />
{t.key === 'applications' && applications.length > 0 && (
  <span
    style={{
      position: 'absolute',
      top: -4,
      right: -4,
      minWidth: 16,
      height: 16,
      borderRadius: 999,
      background: 'var(--orange-500)',
      color: 'white',
      fontSize: 9,
      fontWeight: 800,
      display: 'grid',
      placeItems: 'center',
      padding: '0 4px',
      border: '2px solid white',
    }}
  >
    {applications.length}
  </span>
)}
{t.key === 'inbox' && store.getNgoUnreadTotal(user.ngoId) > 0 && (
  <span
    style={{
      position: 'absolute',
      top: -4,
      right: -4,
      minWidth: 16,
      height: 16,
      borderRadius: 999,
      background: 'var(--red-600)',
      color: 'white',
      fontSize: 9,
      fontWeight: 800,
      display: 'grid',
      placeItems: 'center',
      padding: '0 4px',
      border: '2px solid white',
    }}
  >
    {store.getNgoUnreadTotal(user.ngoId)}
  </span>
)}
              </div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{t.label}</div>
            </>
          )

          if (t.link) {
            return (
              <Link
                key={t.key}
                to={t.link}
                className="card card-hover"
                style={{
                  textAlign: 'left',
                  border: '1px solid var(--ink-100)',
                  background: 'white',
                  color: 'inherit',
                  display: 'block',
                }}
              >
                {content}
              </Link>
            )
          }

          return (
            <button
              key={t.key}
              onClick={() => setModal(t.key)}
              className="card card-hover"
              style={{
                textAlign: 'left',
                cursor: 'pointer',
                border: '1px solid var(--ink-100)',
                background: 'white',
                fontFamily: 'inherit',
              }}
            >
              {content}
            </button>
          )
        })}
      </div>

      {/* ---------- modals ---------- */}
      {modal === 'post' && (
        <PostModal
          onClose={() => setModal(null)}
          onSave={(content) => {
            store.createPost({
              ngoId: user.ngoId,
              type: 'update',
              content,
              image: '',
            })
            setModal(null)
          }}
        />
      )}

      {modal === 'campaign' && (
        <CampaignModal
          onClose={() => setModal(null)}
          onSave={(data) => {
            store.createCampaign({ ngoId: user.ngoId, ...data })
            setModal(null)
          }}
        />
      )}

      {(modal === 'volunteer' || modal === 'event') && (
        <VolunteerModal
          onClose={() => setModal(null)}
          onSave={(data) => {
            store.createOpportunity({ ngoId: user.ngoId, ...data })
            setModal(null)
          }}
        />
      )}

      {modal === 'applications' && (
        <ApplicationsModal
          applications={applications}
          opportunities={opportunities}
          onClose={() => setModal(null)}
        />
      )}

      {modal === 'manage-campaigns' && (
        <ListModal
          title="Campaigns"
          onClose={() => setModal(null)}
          items={campaigns.map(
            (c) =>
              `${c.title} — ₱${c.raised.toLocaleString()} / ₱${c.goal.toLocaleString()}`
          )}
        />
      )}

      {modal === 'manage-volunteers' && (
        <ListModal
          title="Volunteer Opportunities"
          onClose={() => setModal(null)}
          items={opportunities.map(
            (o) => `${o.title} — ${o.registered}/${o.needed} registered`
          )}
        />
      )}

      {modal === 'attendance' && (
        <AttendanceModal
          opportunities={opportunities}
          checkins={checkins}
          onClose={() => setModal(null)}
        />
      )}

      {modal === 'updates' && (
        <ListModal
          title="Your Posts"
          onClose={() => setModal(null)}
          items={posts.map((p) => p.content)}
        />
      )}

      {modal === 'engagement' && (
        <ListModal
          title="Engagement"
          onClose={() => setModal(null)}
          items={[
            `Total donated: ₱${totalRaised.toLocaleString()}`,
            `Campaigns: ${campaigns.length}`,
            `Posts: ${posts.length}`,
            `Volunteer opportunities: ${opportunities.length}`,
            `Event check-ins: ${checkins.length}`,
          ]}
        />
      )}
    </div>
  )
}

/* =========================================================
   MODALS
   ========================================================= */

function ApplicationsModal({ applications, opportunities, onClose }) {
  const [filter, setFilter] = useState('all')

  const filtered =
    filter === 'all'
      ? applications
      : applications.filter((a) => a.status === filter)

  const counts = {
    all: applications.length,
    registered: applications.filter((a) => a.status === 'registered').length,
    attended: applications.filter((a) => a.status === 'attended').length,
    cancelled: applications.filter((a) => a.status === 'cancelled').length,
  }

  function getOpp(id) {
    return opportunities.find((o) => o.id === id)
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 720, maxHeight: '88vh', overflowY: 'auto' }}
      >
        <div className="applications-header">
          <div>
            <h3 style={{ margin: 0 }}>Volunteer applications</h3>
            <p
              className="text-muted"
              style={{ margin: '4px 0 0', fontSize: 13 }}
            >
              {applications.length} total applicants
            </p>
          </div>
          <button
            className="btn btn-neutral btn-sm"
            onClick={onClose}
            style={{ padding: '6px 10px' }}
            type="button"
          >
            <Icon name="x" size={14} />
          </button>
        </div>

        <div className="filters" style={{ padding: '0 0 16px' }}>
          {[
            { key: 'all', label: `All (${counts.all})` },
            { key: 'registered', label: `Active (${counts.registered})` },
            { key: 'attended', label: `Attended (${counts.attended})` },
            { key: 'cancelled', label: `Cancelled (${counts.cancelled})` },
          ].map((f) => (
            <button
              key={f.key}
              className={`pill ${filter === f.key ? 'is-active' : ''}`}
              onClick={() => setFilter(f.key)}
              type="button"
            >
              {f.label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-muted" style={{ fontSize: 13, padding: 20 }}>
            No applications yet.
          </div>
        ) : (
          <div className="stack" style={{ gap: 12 }}>
            {filtered.map((a) => {
              const opp = getOpp(a.opportunityId)
              const statusColor =
                a.status === 'cancelled'
                  ? { bg: '#fee2e2', fg: 'var(--red-600)' }
                  : a.status === 'attended'
                  ? { bg: '#dcfce7', fg: '#15803d' }
                  : { bg: 'var(--blue-100)', fg: 'var(--blue-700)' }

              return (
                <div key={a.id} className="applicant-card">
                  <div className="applicant-header">
                    <div className="applicant-avatar">
                      {a.name.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="applicant-name">{a.name}</div>
                      <div className="applicant-meta">
                        {a.age} years old · {a.email}
                      </div>
                    </div>
                    <span
                      className="badge"
                      style={{
                        background: statusColor.bg,
                        color: statusColor.fg,
                      }}
                    >
                      {a.status}
                    </span>
                  </div>

                  <div className="applicant-event">
                    <Icon name="calendar" size={12} color="var(--ink-500)" />
                    <strong>{opp?.title}</strong>
                    <span className="text-muted">
                      {' '}
                      · {opp?.location} · {opp?.date}
                    </span>
                  </div>

                  <div className="applicant-grid">
                    <div>
                      <div className="applicant-label">Phone</div>
                      <div className="applicant-value">{a.phone}</div>
                    </div>
                    <div>
                      <div className="applicant-label">Address</div>
                      <div className="applicant-value">{a.address}</div>
                    </div>
                    <div>
                      <div className="applicant-label">Emergency contact</div>
                      <div className="applicant-value">
                        {a.emergencyName} · {a.emergencyPhone}
                      </div>
                    </div>
                    {a.skills && (
                      <div>
                        <div className="applicant-label">Skills</div>
                        <div className="applicant-value">{a.skills}</div>
                      </div>
                    )}
                    <div style={{ gridColumn: '1 / -1' }}>
                      <div className="applicant-label">Availability</div>
                      <div className="vd-chips" style={{ marginTop: 4 }}>
                        {a.availability.map((slot) => (
                          <span
                            key={slot}
                            className="pill"
                            style={{ cursor: 'default', fontSize: 11 }}
                          >
                            {slot}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {a.cancellationReason && (
                    <div className="applicant-cancellation">
                      <strong>Cancelled reason:</strong> {a.cancellationReason}
                      <div
                        className="text-muted"
                        style={{ marginTop: 2, fontSize: 11 }}
                      >
                        on {new Date(a.cancelledAt).toLocaleString()}
                      </div>
                    </div>
                  )}

                  <div className="applicant-footer">
                    <span className="text-muted" style={{ fontSize: 11 }}>
                      Applied{' '}
                      {new Date(a.submittedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function PostModal({ onClose, onSave }) {
  const [content, setContent] = useState('')
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3 style={{ marginTop: 0 }}>Create Post</h3>
        <textarea
          className="input"
          rows={4}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's new?"
        />
        <button
          className="btn btn-primary btn-block"
          style={{ marginTop: 12 }}
          onClick={() => onSave(content)}
          disabled={!content}
          type="button"
        >
          Publish
        </button>
      </div>
    </div>
  )
}

function CampaignModal({ onClose, onSave }) {
  const [form, setForm] = useState({
    title: '',
    category: 'Education',
    status: 'active',
    goal: '',
    deadline: '',
    location: '',
    beneficiaries: '',
    description: '',
    image: '',
  })
  const [errors, setErrors] = useState({})

  const CATEGORIES = [
    'Education',
    'Children & Youth',
    'Animal Welfare',
    'Environment',
    'Health',
    'Disaster Relief',
    'Community Development',
    'Poverty Reduction',
    'Humanitarian Aid',
  ]

  const STATUSES = [
    { key: 'active', label: 'Active', color: 'var(--blue-700)' },
    { key: 'urgent', label: 'Urgent', color: 'var(--orange-500)' },
    {
      key: 'almost_complete',
      label: 'Almost Complete',
      color: '#16a34a',
    },
  ]

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }))
  }

  function validate() {
    const e = {}
    if (!form.title.trim()) e.title = 'Title is required'
    if (!form.goal || Number(form.goal) <= 0)
      e.goal = 'Goal must be greater than 0'
    if (!form.description.trim())
      e.description = 'Description is required'
    if (!form.deadline) e.deadline = 'Pick a deadline'
    if (!form.location.trim()) e.location = 'Location is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSubmit() {
    if (!validate()) return
    onSave({
      title: form.title.trim(),
      category: form.category,
      status: form.status,
      goal: Number(form.goal),
      deadline: form.deadline,
      location: form.location.trim(),
      beneficiaries: form.beneficiaries.trim() || 'Communities',
      description: form.description.trim(),
      image:
        form.image.trim() ||
        `https://placehold.co/800x400/eff4ff/1e40d8?text=${encodeURIComponent(
          form.title.slice(0, 20) || 'Campaign'
        )}`,
      howItWillBeUsed: [
        { label: 'Direct program costs', amount: Math.round(Number(form.goal) * 0.75) },
        { label: 'Logistics & distribution', amount: Math.round(Number(form.goal) * 0.15) },
        { label: 'Operations', amount: Math.round(Number(form.goal) * 0.10) },
      ],
      impactExamples: [
        {
          amount: 500,
          description: `Supports a portion of "${form.title.slice(0, 40)}"`,
        },
        {
          amount: 1000,
          description: 'Doubles your contribution to the cause',
        },
        {
          amount: 2500,
          description: 'Funds a meaningful share of the campaign',
        },
      ],
    })
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal campaign-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="campaign-modal-header">
          <div>
            <div className="campaign-modal-eyebrow">
              <Icon name="heart" size={12} /> New campaign
            </div>
            <h2 className="campaign-modal-title">Create a campaign</h2>
            <p className="campaign-modal-subtitle">
              Fill in the details below. Fields marked with * are required.
            </p>
          </div>
          <button
            className="btn btn-neutral btn-sm"
            onClick={onClose}
            style={{ padding: '6px 10px' }}
            type="button"
          >
            <Icon name="x" size={14} />
          </button>
        </div>

        {/* BODY */}
        <div className="campaign-modal-body">
          {/* SECTION 1 — BASICS */}
          <div className="campaign-modal-section">
            <div className="campaign-modal-section-title">
              Campaign basics
            </div>

            <div className="field">
              <div className="field-label-row">
                <label>Title *</label>
                <span className="field-hint">
                  {form.title.length}/80
                </span>
              </div>
              <input
                className="input"
                placeholder="e.g. School Supplies for 500 Kids"
                value={form.title}
                onChange={(e) => update('title', e.target.value)}
                maxLength={80}
              />
              {errors.title && (
                <div className="field-error">{errors.title}</div>
              )}
            </div>

            <div className="field-row">
              <div className="field">
                <label>Category *</label>
                <select
                  className="input"
                  value={form.category}
                  onChange={(e) => update('category', e.target.value)}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label>Status *</label>
                <div className="campaign-status-row">
                  {STATUSES.map((s) => (
                    <button
                      key={s.key}
                      type="button"
                      className={`campaign-status-chip ${
                        form.status === s.key ? 'active' : ''
                      }`}
                      onClick={() => update('status', s.key)}
                      style={{
                        borderColor:
                          form.status === s.key ? s.color : 'var(--ink-100)',
                        color:
                          form.status === s.key ? s.color : 'var(--ink-700)',
                      }}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2 — FUNDING */}
          <div className="campaign-modal-section">
            <div className="campaign-modal-section-title">
              Funding target
            </div>

            <div className="field-row">
              <div className="field">
                <label>Goal (₱) *</label>
                <input
                  className="input"
                  type="number"
                  placeholder="50000"
                  value={form.goal}
                  onChange={(e) => update('goal', e.target.value)}
                  min="1"
                />
                {errors.goal && (
                  <div className="field-error">{errors.goal}</div>
                )}
              </div>

              <div className="field">
                <label>Deadline *</label>
                <input
                  className="input"
                  type="date"
                  value={form.deadline}
                  onChange={(e) => update('deadline', e.target.value)}
                />
                {errors.deadline && (
                  <div className="field-error">{errors.deadline}</div>
                )}
              </div>
            </div>
          </div>

          {/* SECTION 3 — DETAILS */}
          <div className="campaign-modal-section">
            <div className="campaign-modal-section-title">
              Campaign details
            </div>

            <div className="field-row">
              <div className="field">
                <label>Location *</label>
                <input
                  className="input"
                  placeholder="e.g. Quezon City"
                  value={form.location}
                  onChange={(e) => update('location', e.target.value)}
                />
                {errors.location && (
                  <div className="field-error">{errors.location}</div>
                )}
              </div>

              <div className="field">
                <label>Who it helps</label>
                <input
                  className="input"
                  placeholder="e.g. 500 elementary students"
                  value={form.beneficiaries}
                  onChange={(e) => update('beneficiaries', e.target.value)}
                />
              </div>
            </div>

            <div className="field">
              <div className="field-label-row">
                <label>Description *</label>
                <span className="field-hint">
                  {form.description.length}/500
                </span>
              </div>
              <textarea
                className="input"
                rows={4}
                placeholder="Explain the campaign and why it matters…"
                value={form.description}
                onChange={(e) => update('description', e.target.value)}
                maxLength={500}
              />
              {errors.description && (
                <div className="field-error">{errors.description}</div>
              )}
            </div>

            <div className="field">
              <label>Image URL (optional)</label>
              <input
                className="input"
                placeholder="https://… or leave blank to use a placeholder"
                value={form.image}
                onChange={(e) => update('image', e.target.value)}
              />
            </div>

            {/* live preview of the image */}
            {form.image.trim() && (
              <div className="campaign-modal-preview">
                <div className="campaign-modal-preview-label">
                  Image preview
                </div>
                <img
                  src={form.image}
                  alt=""
                  className="campaign-modal-preview-img"
                  onError={(e) => {
                    e.target.parentElement.style.display = 'none'
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* FOOTER */}
        <div className="campaign-modal-footer">
          <button
            className="btn btn-neutral"
            onClick={onClose}
            type="button"
          >
            Cancel
          </button>
          <button
            className="btn btn-primary btn-lg"
            onClick={handleSubmit}
            type="button"
            style={{ flex: 1 }}
          >
            <Icon name="check" size={16} /> Publish campaign
          </button>
        </div>
      </div>
    </div>
  )
}

function VolunteerModal({ onClose, onSave }) {
  const [title, setTitle] = useState('')
  const [location, setLocation] = useState('Quezon City')
  const [needed, setNeeded] = useState('10')
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3 style={{ marginTop: 0 }}>Create Opportunity</h3>
        <input
          className="input"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          className="input"
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          style={{ marginTop: 8 }}
        />
        <input
          className="input"
          type="number"
          placeholder="Slots needed"
          value={needed}
          onChange={(e) => setNeeded(e.target.value)}
          style={{ marginTop: 8 }}
        />
        <button
          className="btn btn-primary btn-block"
          style={{ marginTop: 12 }}
          disabled={!title}
          onClick={() =>
            onSave({
              title,
              location,
              needed: Number(needed),
              description: 'New opportunity from the NGO dashboard.',
              date: '2026-12-01',
              time: '9:00 AM – 12:00 PM',
              commitment: '3-hour shift',
              address: `${location}, Philippines`,
              whatYouWillDo: ['Help with on-site activities'],
              requirements: ['No prior experience needed'],
              skills: [],
              image:
                'https://placehold.co/800x400/eff4ff/1e40d8?text=Volunteer',
            })
          }
          type="button"
        >
          Create
        </button>
      </div>
    </div>
  )
}

function ListModal({ title, items, onClose }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 480 }}
      >
        <h3 style={{ marginTop: 0 }}>{title}</h3>
        {items.length === 0 ? (
          <p className="text-muted">Nothing here yet.</p>
        ) : (
          <div
            className="stack"
            style={{ gap: 8, maxHeight: 320, overflowY: 'auto' }}
          >
            {items.map((item, i) => (
              <div
                key={i}
                className="card"
                style={{ fontSize: 13, padding: 12 }}
              >
                {item}
              </div>
            ))}
          </div>
        )}
        <button
          className="btn btn-neutral btn-block"
          style={{ marginTop: 16 }}
          onClick={onClose}
          type="button"
        >
          Close
        </button>
      </div>
    </div>
  )
}

function AttendanceModal({ opportunities, checkins, onClose }) {
  const byOpportunity = {}
  checkins.forEach((c) => {
    if (!byOpportunity[c.opportunityId]) byOpportunity[c.opportunityId] = []
    byOpportunity[c.opportunityId].push(c)
  })

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 560, maxHeight: '80vh', overflowY: 'auto' }}
      >
        <h3 style={{ marginTop: 0 }}>Event attendance</h3>
        <p className="text-muted" style={{ fontSize: 13, marginBottom: 20 }}>
          {checkins.length} total check-ins across {opportunities.length}{' '}
          {opportunities.length === 1 ? 'event' : 'events'}
        </p>

        {opportunities.length === 0 ? (
          <p className="text-muted">No events posted yet.</p>
        ) : (
          <div className="stack" style={{ gap: 20 }}>
            {opportunities.map((o) => {
              const list = byOpportunity[o.id] || []
              return (
                <div key={o.id}>
                  <div
                    style={{
                      fontWeight: 800,
                      fontSize: 14,
                      marginBottom: 4,
                    }}
                  >
                    {o.title}
                  </div>
                  <div
                    className="text-muted"
                    style={{ fontSize: 12, marginBottom: 10 }}
                  >
                    {o.location} · {o.date} · {list.length}/{o.needed} checked
                    in
                  </div>

                  {list.length === 0 ? (
                    <div
                      className="text-muted"
                      style={{ fontSize: 12, fontStyle: 'italic' }}
                    >
                      No check-ins yet.
                    </div>
                  ) : (
                    <div className="stack" style={{ gap: 4 }}>
                      {list.map((c) => (
                        <div
                          key={c.id}
                          className="row-between"
                          style={{
                            padding: '8px 0',
                            borderBottom: '1px solid var(--ink-100)',
                            fontSize: 13,
                          }}
                        >
                          <span className="receipt-ref">{c.code}</span>
                          <span className="text-muted">
                            {new Date(c.checkedInAt).toLocaleString(
                              'en-US',
                              {
                                month: 'short',
                                day: 'numeric',
                                hour: 'numeric',
                                minute: '2-digit',
                              }
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        <button
          className="btn btn-neutral btn-block"
          style={{ marginTop: 20 }}
          onClick={onClose}
          type="button"
        >
          Close
        </button>
      </div>
    </div>
  )
}