import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { NGOS } from '../data/ngos'
import { CAMPAIGNS } from '../data/campaigns'
import { OPPORTUNITIES } from '../data/opportunities'
import { POSTS } from '../data/posts'
import { useActivity } from '../store/useActivity'
import { useAuth } from '../context/AuthContext'
import VerifiedBadge from '../components/VerifiedBadge'
import StatusTag from '../components/StatusTag'
import ProgressBar from '../components/ProgressBar'
import EmptyState from '../components/EmptyState'
import Icon from '../components/Icon'

export default function NGODetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const store = useActivity()
  const [tab, setTab] = useState('posts')

  const ngo = NGOS.find((n) => n.id === id)
  if (!ngo) return <div className="container"><EmptyState icon="inbox" title="NGO not found" /></div>

  const campaigns = [
    ...CAMPAIGNS.filter((c) => c.ngoId === id),
    ...store.getExtraCampaigns().filter((c) => c.ngoId === id),
  ]
  const opportunities = [
    ...OPPORTUNITIES.filter((o) => o.ngoId === id),
    ...store.getExtraOpportunities().filter((o) => o.ngoId === id),
  ]
  const posts = [
    ...POSTS.filter((p) => p.ngoId === id),
    ...store.getExtraPosts().filter((p) => p.ngoId === id),
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  const following = user ? store.isFollowing(user.id, id) : false

  return (
    <div className="container">
      <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 24 }}>
        <img src={ngo.cover} alt="" style={{ width: '100%', height: 220, objectFit: 'cover' }} />
        <div style={{ padding: 24, position: 'relative' }}>
          <img
            src={ngo.logo}
            alt=""
            style={{
              width: 88, height: 88, borderRadius: 18, objectFit: 'cover',
              border: '4px solid white', marginTop: -68, background: 'white',
            }}
          />
          <div className="row-between" style={{ marginTop: 12, flexWrap: 'wrap' }}>
            <div>
              <div className="row" style={{ gap: 10, marginBottom: 4 }}>
                <h1 style={{ fontSize: 26, margin: 0, fontWeight: 800, letterSpacing: '-0.02em' }}>
                  {ngo.name}
                </h1>
                <VerifiedBadge verified={ngo.verified} />
              </div>
              <p className="text-muted" style={{ margin: 0 }}>{ngo.tagline}</p>
            </div>
            {user && (
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  className={`btn ${following ? 'btn-ghost' : 'btn-primary'}`}
                  onClick={() => store.toggleFollow(user.id, ngo.id)}
                >
                  {following ? 'Following' : 'Follow'}
                </button>
                {ngo.isDeep ? (
                  <Link to="/donate" className="btn btn-accent">
                    <Icon name="heart" size={14} /> Donate
                  </Link>
                ) : (
                  <button
                    className="btn btn-accent"
                    onClick={() =>
                      alert('Demo NGO — campaigns not available in this prototype.\n\nTry Angat Buhay Foundation for a full demo.')
                    }
                  >
                    Donate
                  </button>
                )}
              </div>
            )}
          </div>

          <p style={{ fontSize: 14, lineHeight: 1.6, marginTop: 16, color: 'var(--ink-700)' }}>
            {ngo.description}
          </p>

          <div className="stat-row" style={{ marginTop: 20, marginBottom: 0 }}>
            <div className="stat-card">
              <div className="stat-value">{ngo.supporterCount.toLocaleString()}</div>
              <div className="stat-label">Supporters</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{campaigns.length}</div>
              <div className="stat-label">Campaigns</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{posts.length}</div>
              <div className="stat-label">Posts</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{opportunities.length}</div>
              <div className="stat-label">Volunteer</div>
            </div>
          </div>
        </div>
      </div>

      <div className="tabs">
        {[
          { key: 'posts', label: 'Posts' },
          { key: 'campaigns', label: 'Campaigns' },
          { key: 'volunteer', label: 'Volunteer' },
        ].map((t) => (
          <button
            key={t.key}
            className={`tab ${tab === t.key ? 'active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'posts' && (
        posts.length === 0 ? (
          <EmptyState icon="inbox" title="No posts yet" message="This NGO hasn't posted anything." />
        ) : (
          <div className="grid grid-2">
            {posts.map((p) => (
              <div className="card" key={p.id}>
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6 }}>{p.content}</p>
                {p.image && (
                  <img src={p.image} alt="" style={{ width: '100%', borderRadius: 10, marginTop: 12 }} />
                )}
              </div>
            ))}
          </div>
        )
      )}

      {tab === 'campaigns' && (
        campaigns.length === 0 ? (
          <EmptyState icon="inbox" title="No active campaigns" message="This NGO hasn't launched any campaigns." />
        ) : (
          <div className="grid grid-3">
            {campaigns.map((c) => (
              <Link key={c.id} to={`/campaign/${c.id}`} className="card card-hover" style={{ color: 'inherit' }}>
                <img src={c.image} alt="" style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 10, marginBottom: 12 }} />
                <div className="row-between" style={{ marginBottom: 6, alignItems: 'flex-start' }}>
                  <div style={{ fontWeight: 700, fontSize: 15, flex: 1 }}>{c.title}</div>
                  <StatusTag status={c.status} />
                </div>
                <ProgressBar value={c.raised} goal={c.goal} />
              </Link>
            ))}
          </div>
        )
      )}

      {tab === 'volunteer' && (
        opportunities.length === 0 ? (
          <EmptyState icon="inbox" title="No opportunities posted yet" message="Check back later." />
        ) : (
          <div className="grid grid-2">
            {opportunities.map((o) => (
              <div className="card" key={o.id}>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>{o.title}</div>
                <div className="row text-muted" style={{ fontSize: 13, marginBottom: 10, gap: 14 }}>
                  <span className="row" style={{ gap: 5 }}>
                    <Icon name="map-pin" size={14} /> {o.location}
                  </span>
                  <span className="row" style={{ gap: 5 }}>
                    <Icon name="calendar" size={14} /> {o.date}
                  </span>
                </div>
                <p style={{ fontSize: 13, margin: '0 0 14px', color: 'var(--ink-700)' }}>{o.description}</p>
                <div className="row-between">
                  <span className="text-muted" style={{ fontSize: 13 }}>
                    {o.needed - o.registered} slots left
                  </span>
                  <Link to="/volunteer" className="btn btn-primary btn-sm">Volunteer</Link>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  )
}