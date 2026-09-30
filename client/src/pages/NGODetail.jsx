import { useEffect, useRef, useState } from 'react'
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
import CommentSection from '../components/CommentSection'
import MessageModal from '../components/MessageModal'
import FeedPost from '../components/FeedPost'
import ImpactTab from '../components/ImpactTab'
import FinancialReport from '../components/FinancialReport'
import Icon from '../components/Icon'

const TABS = [
  { key: 'posts', label: 'Posts' },
  { key: 'campaigns', label: 'Campaigns' },
  { key: 'volunteer', label: 'Volunteer' },
  { key: 'impact', label: 'Impact' },
  { key: 'financials', label: 'Financials' },
]

export default function NGODetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const store = useActivity()
  const [tab, setTab] = useState('posts')
  const [messageOpen, setMessageOpen] = useState(false)
  const tabsRef = useRef(null)

  useEffect(() => {
    if (tabsRef.current) {
      const top =
        tabsRef.current.getBoundingClientRect().top + window.scrollY - 80
      window.scrollTo({ top, behavior: 'smooth' })
    }
  }, [tab])

  const ngo = NGOS.find((n) => n.id === id)
  if (!ngo) {
    return (
      <div className="container-wide">
        <EmptyState icon="inbox" title="NGO not found" />
      </div>
    )
  }

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
    <div className="container-wide">
      <Link
        to="/discover"
        className="row"
        style={{
          gap: 6,
          marginBottom: 16,
          fontSize: 13,
          fontWeight: 600,
          color: 'var(--ink-500)',
        }}
      >
        <span style={{ transform: 'rotate(180deg)', display: 'inline-block' }}>
          <Icon name="chevron-right" size={14} />
        </span>
        Back to NGOs
      </Link>

      {/* ---------- HERO CARD ---------- */}
      <div
        className="card"
        style={{ padding: 0, overflow: 'hidden', marginBottom: 24 }}
      >
        <img
          src={ngo.cover}
          alt=""
          style={{ width: '100%', height: 240, objectFit: 'cover' }}
        />
        <div style={{ padding: 28, position: 'relative' }}>
          <img
            src={ngo.logo}
            alt=""
            style={{
              width: 96,
              height: 96,
              borderRadius: 20,
              objectFit: 'cover',
              border: '4px solid white',
              marginTop: -74,
              background: 'white',
              boxShadow: '0 4px 12px rgba(11, 18, 32, 0.1)',
            }}
          />
          <div
            className="row-between"
            style={{ marginTop: 14, flexWrap: 'wrap', gap: 16 }}
          >
            <div>
              <div className="row" style={{ gap: 10, marginBottom: 4 }}>
                <h1
                  style={{
                    fontSize: 28,
                    margin: 0,
                    fontWeight: 800,
                    letterSpacing: '-0.02em',
                  }}
                >
                  {ngo.name}
                </h1>
                <VerifiedBadge verified={ngo.verified} />
              </div>
              <p className="text-muted" style={{ margin: 0 }}>
                {ngo.tagline}
              </p>
            </div>
            {user && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button
                  className={`btn ${following ? 'btn-ghost' : 'btn-primary'}`}
                  onClick={() => store.toggleFollow(user.id, ngo.id)}
                >
                  {following ? 'Following' : 'Follow'}
                </button>
                <button
                  className="btn btn-neutral"
                  onClick={() => setMessageOpen(true)}
                >
                  <Icon name="message-circle" size={14} /> Message
                </button>
                {ngo.isDeep ? (
                  <Link to="/donate" className="btn btn-accent">
                    <Icon name="heart" size={14} /> Donate
                  </Link>
                ) : (
                  <button
                    className="btn btn-accent"
                    onClick={() =>
                      alert(
                        'Demo NGO — campaigns not available in this prototype.\n\nTry Angat Buhay Foundation for a full demo.'
                      )
                    }
                  >
                    Donate
                  </button>
                )}
              </div>
            )}
          </div>

          <p
            style={{
              fontSize: 14.5,
              lineHeight: 1.65,
              marginTop: 18,
              color: 'var(--ink-700)',
            }}
          >
            {ngo.description}
          </p>

          <div
            className="stat-row"
            style={{ marginTop: 22, marginBottom: 0 }}
          >
            <div className="stat-card">
              <div className="stat-value">
                {ngo.supporterCount.toLocaleString()}
              </div>
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

      {/* ---------- TWO-COLUMN LAYOUT: MAIN + SIDEBAR ---------- */}
      <div className="ngo-detail-layout">
        {/* ================= MAIN CONTENT ================= */}
        <div className="ngo-detail-main">
          <div className="tabs tabs-sticky" ref={tabsRef}>
            {TABS.map((t) => (
              <button
                key={t.key}
                className={`tab ${tab === t.key ? 'active' : ''}`}
                onClick={() => setTab(t.key)}
                type="button"
              >
                {t.label}
              </button>
            ))}
          </div>

          {tab === 'posts' &&
            (posts.length === 0 ? (
              <EmptyState
                icon="inbox"
                title="No posts yet"
                message="This NGO hasn't posted anything."
              />
            ) : (
              <div className="home-feed-list">
                {posts.map((p) => (
                  <FeedPost
                    key={p.id}
                    post={p}
                    ngo={ngo}
                    showNgoHeader={true}
                  />
                ))}
              </div>
            ))}

          {tab === 'campaigns' &&
            (campaigns.length === 0 ? (
              <EmptyState
                icon="inbox"
                title="No active campaigns"
                message="This NGO hasn't launched any campaigns."
              />
            ) : (
              <div className="grid grid-2">
                {campaigns.map((c) => (
                  <Link
                    key={c.id}
                    to={`/campaign/${c.id}`}
                    className="card card-hover"
                    style={{ color: 'inherit', padding: 0, overflow: 'hidden' }}
                  >
                    <img
                      src={c.image}
                      alt=""
                      style={{
                        width: '100%',
                        height: 160,
                        objectFit: 'cover',
                      }}
                    />
                    <div style={{ padding: 18 }}>
                      <div
                        className="row-between"
                        style={{
                          marginBottom: 8,
                          alignItems: 'flex-start',
                          gap: 10,
                        }}
                      >
                        <div
                          style={{
                            fontWeight: 700,
                            fontSize: 15,
                            flex: 1,
                            lineHeight: 1.35,
                          }}
                        >
                          {c.title}
                        </div>
                        <StatusTag status={c.status} />
                      </div>
                      <ProgressBar value={c.raised} goal={c.goal} />
                      <div
                        className="row-between"
                        style={{
                          marginTop: 12,
                          fontSize: 12,
                          color: 'var(--ink-500)',
                        }}
                      >
                        <span className="row" style={{ gap: 5 }}>
                          <Icon name="users" size={13} />
                          {c.donorCount} supporters
                        </span>
                        <span className="row" style={{ gap: 5 }}>
                          <Icon name="calendar" size={13} />
                          {c.daysLeft} days left
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ))}

          {tab === 'volunteer' &&
            (opportunities.length === 0 ? (
              <EmptyState
                icon="inbox"
                title="No opportunities posted yet"
                message="Check back later."
              />
            ) : (
              <div className="grid grid-2">
                {opportunities.map((o) => (
                  <div className="card" key={o.id}>
                    <img
                      src={o.image}
                      alt=""
                      style={{
                        width: '100%',
                        height: 140,
                        objectFit: 'cover',
                        borderRadius: 10,
                        marginBottom: 14,
                      }}
                    />
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: 15,
                        marginBottom: 8,
                      }}
                    >
                      {o.title}
                    </div>
                    <div
                      className="row text-muted"
                      style={{ fontSize: 13, marginBottom: 10, gap: 14 }}
                    >
                      <span className="row" style={{ gap: 5 }}>
                        <Icon name="map-pin" size={14} /> {o.location}
                      </span>
                      <span className="row" style={{ gap: 5 }}>
                        <Icon name="calendar" size={14} /> {o.date}
                      </span>
                    </div>
                    <p
                      style={{
                        fontSize: 13.5,
                        margin: '0 0 14px',
                        color: 'var(--ink-700)',
                        lineHeight: 1.55,
                      }}
                    >
                      {o.description}
                    </p>
                    <div className="row-between">
                      <span className="text-muted" style={{ fontSize: 13 }}>
                        {o.needed - o.registered} slots left
                      </span>
                      <Link
                        to="/volunteer"
                        className="btn btn-primary btn-sm"
                      >
                        Volunteer
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ))}

          {tab === 'impact' && (
            <ImpactTab ngoId={ngo.id} ngoName={ngo.name} />
          )}

          {tab === 'financials' && <FinancialReport ngoId={ngo.id} />}
        </div>

        {/* ================= SIDEBAR ================= */}
        <aside className="ngo-detail-sidebar">
          {/* Campaigns widget */}
          <div className="sidebar-card">
            <div className="sidebar-card-header sidebar-card-header-blue">
              <h3 className="sidebar-card-title">Active campaigns</h3>
              <Link
                to="/donate"
                className="sidebar-card-link sidebar-card-link-white"
              >
                See all
              </Link>
            </div>
            {campaigns.length === 0 ? (
              <div className="sidebar-empty">
                No active campaigns right now.
              </div>
            ) : (
              <div className="sidebar-list">
                {campaigns.slice(0, 4).map((c) => (
                  <Link
                    key={c.id}
                    to={`/campaign/${c.id}`}
                    className="trending-item"
                  >
                    <div className="trending-tag orange">
                      <Icon name="users" size={11} />
                      {c.donorCount} supporters
                    </div>
                    <div className="trending-title">{c.title}</div>
                    <div className="trending-meta">
                      ₱{c.raised.toLocaleString()} of ₱
                      {c.goal.toLocaleString()}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Volunteer widget */}
          <div className="sidebar-card">
            <div className="sidebar-card-header sidebar-card-header-orange">
              <h3 className="sidebar-card-title">Volunteer now</h3>
              <Link
                to="/volunteer"
                className="sidebar-card-link sidebar-card-link-white"
              >
                See all
              </Link>
            </div>
            {opportunities.length === 0 ? (
              <div className="sidebar-empty">
                No volunteer opportunities posted yet.
              </div>
            ) : (
              <div className="sidebar-list">
                {opportunities.slice(0, 4).map((o) => (
                  <Link
                    key={o.id}
                    to="/volunteer"
                    className="trending-item"
                  >
                    <div className="trending-tag">
                      <Icon name="calendar" size={11} />
                      {new Date(o.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </div>
                    <div className="trending-title">{o.title}</div>
                    <div className="trending-meta">{o.location}</div>
                    <div className="trending-slots">
                      {o.needed - o.registered} slots left
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Quick stats */}
          <div className="sidebar-card">
            <div className="sidebar-card-header">
              <h3 className="sidebar-card-title">At a glance</h3>
            </div>
            <div className="sidebar-list">
              <div className="ngo-glance-row">
                <span className="ngo-glance-label">Total raised</span>
                <strong className="ngo-glance-value">
                  ₱
                  {campaigns
                    .reduce((s, c) => s + c.raised, 0)
                    .toLocaleString()}
                </strong>
              </div>
              <div className="ngo-glance-row">
                <span className="ngo-glance-label">Active campaigns</span>
                <strong className="ngo-glance-value">
                  {campaigns.length}
                </strong>
              </div>
              <div className="ngo-glance-row">
                <span className="ngo-glance-label">Open volunteer slots</span>
                <strong className="ngo-glance-value">
                  {opportunities.reduce(
                    (s, o) => s + (o.needed - o.registered),
                    0
                  )}
                </strong>
              </div>
              <div className="ngo-glance-row">
                <span className="ngo-glance-label">Joined KAIA</span>
                <strong className="ngo-glance-value">2024</strong>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {messageOpen && (
        <MessageModal ngo={ngo} onClose={() => setMessageOpen(false)} />
      )}
    </div>
  )
}