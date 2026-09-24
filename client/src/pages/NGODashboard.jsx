import { useState } from 'react'
import { CAMPAIGNS } from '../data/campaigns'
import { OPPORTUNITIES } from '../data/opportunities'
import { POSTS } from '../data/posts'
import { useActivity } from '../store/useActivity'
import { useAuth } from '../context/AuthContext'
import Icon from '../components/Icon'
import {
  DonationLineChart,
  CampaignBarChart,
  StatusDonut,
  Sparkline,
} from '../components/Charts'

/* ---------- sample historical data ---------- */
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
  const activeCampaigns = campaigns.filter((c) => c.status !== 'completed').length

  /* chart data */
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
    { key: 'almost_complete', name: 'Almost Complete', value: statusCounts.almost_complete || 0 },
    { key: 'completed', name: 'Completed', value: statusCounts.completed || 0 },
  ].filter((d) => d.value > 0)

  /* sparkline data (last 6 months of the donation trend) */
  const donationSpark = DONATION_TREND.map((d) => d.amount)

  const TILES = [
    { key: 'post', label: 'Create Post', icon: 'megaphone' },
    { key: 'campaign', label: 'Create Campaign', icon: 'heart' },
    { key: 'volunteer', label: 'Create Volunteer', icon: 'hand' },
    { key: 'event', label: 'Create Event', icon: 'calendar' },
    { key: 'manage-campaigns', label: 'Manage Campaigns', icon: 'chart' },
    { key: 'manage-volunteers', label: 'Manage Volunteers', icon: 'users' },
    { key: 'updates', label: 'View Updates', icon: 'inbox' },
    { key: 'engagement', label: 'View Engagement', icon: 'trending' },
  ]

  return (
    <div className="container">
      <div className="page-header">
        <h1 className="page-title">NGO Dashboard</h1>
        <p className="page-subtitle">
          Manage campaigns, volunteers, and updates. Track performance in real time.
        </p>
      </div>

      {/* ---------- stat cards with sparklines ---------- */}
      <div className="stat-row" style={{ marginBottom: 24 }}>
        <div className="stat-card-rich">
          <div className="stat-rich-top">
            <div>
              <div className="stat-rich-value">₱{totalRaised.toLocaleString()}</div>
              <div className="stat-rich-label">Total raised</div>
            </div>
            <Sparkline data={donationSpark} color="#1e40d8" />
          </div>
          <div className="stat-rich-delta">↑ 12.4% vs last month</div>
        </div>

        <div className="stat-card-rich">
          <div className="stat-rich-top">
            <div>
              <div className="stat-rich-value">{activeCampaigns}</div>
              <div className="stat-rich-label">Active campaigns</div>
            </div>
            <Sparkline data={[1, 2, 2, 3, 3, 3]} color="#f97316" />
          </div>
          <div className="stat-rich-delta">↑ 1 new this month</div>
        </div>

        <div className="stat-card-rich">
          <div className="stat-rich-top">
            <div>
              <div className="stat-rich-value">2,300</div>
              <div className="stat-rich-label">Supporters</div>
            </div>
            <Sparkline data={[1800, 1950, 2050, 2100, 2200, 2300]} color="#1e40d8" />
          </div>
          <div className="stat-rich-delta">↑ 4.3% this week</div>
        </div>

        <div className="stat-card-rich">
          <div className="stat-rich-top">
            <div>
              <div className="stat-rich-value">{opportunities.length}</div>
              <div className="stat-rich-label">Volunteer ops</div>
            </div>
            <Sparkline data={[1, 1, 2, 2, 2, 2]} color="#16a34a" />
          </div>
          <div className="stat-rich-delta">Steady</div>
        </div>
      </div>

      {/* ---------- main charts row ---------- */}
      <div className="chart-grid">
        <div className="chart-card">
          <div className="chart-card-header">
            <div>
              <h3 className="chart-title">Donations over time</h3>
              <p className="chart-subtitle">Last 6 months of contributions</p>
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

      {/* ---------- campaign performance ---------- */}
      <div className="chart-card" style={{ marginBottom: 24 }}>
        <div className="chart-card-header">
          <div>
            <h3 className="chart-title">Campaign performance</h3>
            <p className="chart-subtitle">Raised vs goal for each active campaign</p>
          </div>
          <span className="chart-badge orange">
            {campaigns.length} campaigns
          </span>
        </div>
        <CampaignBarChart data={campaignChartData} />
      </div>

      {/* ---------- action tiles ---------- */}
      <div className="page-header" style={{ marginTop: 32 }}>
        <h2 className="page-title" style={{ fontSize: 22 }}>
          Quick actions
        </h2>
      </div>

      <div className="grid grid-4">
        {TILES.map((t) => (
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
              }}
            >
              <Icon name={t.icon} size={20} />
            </div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>{t.label}</div>
          </button>
        ))}
      </div>

      {/* ---------- modals ---------- */}
      {modal === 'post' && (
        <PostModal
          onClose={() => setModal(null)}
          onSave={(content) => {
            store.createPost({ ngoId: user.ngoId, type: 'update', content, image: '' })
            setModal(null)
          }}
        />
      )}
      {modal === 'campaign' && (
        <CampaignModal
          onClose={() => setModal(null)}
          onSave={(data) => { store.createCampaign({ ngoId: user.ngoId, ...data }); setModal(null) }}
        />
      )}
      {(modal === 'volunteer' || modal === 'event') && (
        <VolunteerModal
          onClose={() => setModal(null)}
          onSave={(data) => { store.createOpportunity({ ngoId: user.ngoId, ...data }); setModal(null) }}
        />
      )}
      {modal === 'manage-campaigns' && (
        <ListModal title="Campaigns" onClose={() => setModal(null)}
          items={campaigns.map((c) => `${c.title} — ₱${c.raised.toLocaleString()} / ₱${c.goal.toLocaleString()}`)} />
      )}
      {modal === 'manage-volunteers' && (
        <ListModal title="Volunteer Opportunities" onClose={() => setModal(null)}
          items={opportunities.map((o) => `${o.title} — ${o.registered}/${o.needed} registered`)} />
      )}
      {modal === 'updates' && (
        <ListModal title="Your Posts" onClose={() => setModal(null)}
          items={posts.map((p) => p.content)} />
      )}
      {modal === 'engagement' && (
        <ListModal title="Engagement" onClose={() => setModal(null)}
          items={[
            `Total donated: ₱${totalRaised.toLocaleString()}`,
            `Campaigns: ${campaigns.length}`,
            `Posts: ${posts.length}`,
            `Volunteer opportunities: ${opportunities.length}`,
          ]} />
      )}
    </div>
  )
}

/* ---------- modals (unchanged) ---------- */
function PostModal({ onClose, onSave }) {
  const [content, setContent] = useState('')
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3 style={{ marginTop: 0 }}>Create Post</h3>
        <textarea className="input" rows={4} value={content} onChange={(e) => setContent(e.target.value)} placeholder="What's new?" />
        <button className="btn btn-primary btn-block" style={{ marginTop: 12 }} onClick={() => onSave(content)} disabled={!content}>
          Publish
        </button>
      </div>
    </div>
  )
}

function CampaignModal({ onClose, onSave }) {
  const [title, setTitle] = useState('')
  const [goal, setGoal] = useState('')
  const [description, setDescription] = useState('')
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3 style={{ marginTop: 0 }}>Create Campaign</h3>
        <input className="input" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <input className="input" placeholder="Goal (₱)" type="number" value={goal} onChange={(e) => setGoal(e.target.value)} style={{ marginTop: 8 }} />
        <textarea className="input" rows={3} placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} style={{ marginTop: 8 }} />
        <button className="btn btn-primary btn-block" style={{ marginTop: 12 }} disabled={!title || !goal}
          onClick={() => onSave({
            title, goal: Number(goal), description, category: 'Education',
            deadline: '2026-12-31',
            image: 'https://placehold.co/800x400/eff4ff/1e40d8?text=Campaign',
          })}>
          Create
        </button>
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
        <input className="input" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <input className="input" placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} style={{ marginTop: 8 }} />
        <input className="input" type="number" placeholder="Slots needed" value={needed} onChange={(e) => setNeeded(e.target.value)} style={{ marginTop: 8 }} />
        <button className="btn btn-primary btn-block" style={{ marginTop: 12 }} disabled={!title}
          onClick={() => onSave({
            title, location, needed: Number(needed),
            description: 'New opportunity from the NGO dashboard.',
            date: '2026-06-01', skills: [],
            image: 'https://placehold.co/800x400/eff4ff/1e40d8?text=Volunteer',
          })}>
          Create
        </button>
      </div>
    </div>
  )
}

function ListModal({ title, items, onClose }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
        <h3 style={{ marginTop: 0 }}>{title}</h3>
        {items.length === 0 ? (
          <p className="text-muted">Nothing here yet.</p>
        ) : (
          <div className="stack" style={{ gap: 8, maxHeight: 320, overflowY: 'auto' }}>
            {items.map((item, i) => (
              <div key={i} className="card" style={{ fontSize: 13, padding: 12 }}>{item}</div>
            ))}
          </div>
        )}
        <button className="btn btn-neutral btn-block" style={{ marginTop: 16 }} onClick={onClose}>Close</button>
      </div>
    </div>
  )
}