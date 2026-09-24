import { useState } from 'react'
import { CAMPAIGNS } from '../data/campaigns'
import { OPPORTUNITIES } from '../data/opportunities'
import { POSTS } from '../data/posts'
import { useActivity } from '../store/useActivity'
import { useAuth } from '../context/AuthContext'
import Icon from '../components/Icon'

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
          Manage campaigns, volunteers, and updates without depending on an administrator.
        </p>
      </div>

      <div className="stat-row">
        <div className="stat-card">
          <div className="stat-value">₱{totalRaised.toLocaleString()}</div>
          <div className="stat-label">Total raised</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{activeCampaigns}</div>
          <div className="stat-label">Active campaigns</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">2,300</div>
          <div className="stat-label">Supporters</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{opportunities.length}</div>
          <div className="stat-label">Volunteer ops</div>
        </div>
      </div>

      <div className="grid grid-4">
        {TILES.map((t) => (
          <button
            key={t.key}
            onClick={() => setModal(t.key)}
            className="card card-hover"
            style={{
              textAlign: 'left', cursor: 'pointer',
              border: '1px solid var(--ink-100)',
              background: 'white', fontFamily: 'inherit',
            }}
          >
            <div
              style={{
                width: 40, height: 40, borderRadius: 10,
                background: 'var(--blue-50)', color: 'var(--blue-700)',
                display: 'grid', placeItems: 'center', marginBottom: 14,
              }}
            >
              <Icon name={t.icon} size={20} />
            </div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>{t.label}</div>
          </button>
        ))}
      </div>

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