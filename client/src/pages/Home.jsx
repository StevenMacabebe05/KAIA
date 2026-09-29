import { useState } from 'react'
import { Link } from 'react-router-dom'
import { POSTS } from '../data/posts'
import { NGOS } from '../data/ngos'
import { CAMPAIGNS } from '../data/campaigns'
import { OPPORTUNITIES } from '../data/opportunities'
import { useActivity } from '../store/useActivity'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/Toast'
import EmptyState from '../components/EmptyState'
import HeroCarousel from '../components/HeroCarousel'
import FeedPost from '../components/FeedPost'
import Icon from '../components/Icon'

const HERO_SLIDES = [
  { image: '/images/hero/hero-1.jpg' },
  { image: '/images/hero/hero-2.jpg' },
  { image: '/images/hero/hero-3.jpg' },
  { image: '/images/hero/hero-4.jpg' },
  { image: '/images/hero/hero-5.jpg' },
]

export default function Home() {
  const { user } = useAuth()
  const store = useActivity()
  const toast = useToast()

  const [feedTab, setFeedTab] = useState('all')

  const likedPosts = (() => {
    try {
      return JSON.parse(localStorage.getItem('kaia_likes') || '{}')
    } catch {
      return {}
    }
  })()

  const followedIds = user ? store.getFollowedNgoIds(user.id) : []

  const allPosts = [...POSTS, ...store.getExtraPosts()]

  const feedPosts = (() => {
    if (feedTab === 'following') {
      return allPosts
        .filter((p) => followedIds.includes(p.ngoId))
        .sort((a, b) => {
          if (a.pinned && !b.pinned) return -1
          if (!a.pinned && b.pinned) return 1
          return new Date(b.createdAt) - new Date(a.createdAt)
        })
    }

    if (feedTab === 'trending') {
      return [...allPosts]
        .map((p) => {
          const likes = likedPosts[p.id] ? 1 : 0
          const comments = store.getCommentCount(p.id)
          const shares = store.getShareCount(p.id)
          const score = comments * 2 + shares * 3 + likes
          return { post: p, score }
        })
        .sort((a, b) => b.score - a.score)
        .map((x) => x.post)
    }

    return [...allPosts].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1
      if (!a.pinned && b.pinned) return 1
      return new Date(b.createdAt) - new Date(a.createdAt)
    })
  })()

  const suggestions = NGOS.filter(
    (n) => !followedIds.includes(n.id)
  ).slice(0, 4)

  const trendingVolunteers = [...OPPORTUNITIES]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 4)

  const trendingCampaigns = [...CAMPAIGNS]
    .sort((a, b) => b.donorCount - a.donorCount)
    .slice(0, 3)

  /* ---------- personal stats ---------- */
  const myStats = (() => {
    if (!user) return null
    const donations = store.getDonations(user.id)
    const signups = store.getSignups(user.id)
    const follows = store.getFollowedNgoIds(user.id)
    const totalDonated = donations.reduce((s, d) => s + d.amount, 0)
    const hours = signups
      .filter(
        (s) => s.status === 'completed' || s.status === 'attended'
      )
      .reduce((sum, s) => sum + (s.hours || 4), 0)
    return {
      totalDonated,
      hours,
      followsCount: follows.length,
    }
  })()

  /* ---------- user's registered volunteer events ---------- */
  const myRegisteredEvents = (() => {
    if (!user) return []
    const signups = store.getSignups(user.id)
    const all = [...OPPORTUNITIES, ...store.getExtraOpportunities()]
    return signups
      .filter((s) => s.status !== 'cancelled')
      .map((s) => {
        const opp = all.find((o) => o.id === s.opportunityId)
        return opp ? { ...s, opportunity: opp } : null
      })
      .filter(Boolean)
      .sort(
        (a, b) =>
          new Date(a.opportunity.date) - new Date(b.opportunity.date)
      )
      .slice(0, 3)
  })()

  const getNgo = (id) => NGOS.find((n) => n.id === id)

  const NAV_ITEMS = [
    { to: '/', label: 'Home', icon: 'home' },
    { to: '/discover', label: 'Discover NGOs', icon: 'globe' },
    { to: '/donate', label: 'Donate', icon: 'heart' },
    { to: '/volunteer', label: 'Volunteer', icon: 'hand' },
    {
      to: user?.role === 'ngo_rep' ? '/dashboard' : '/my-kaia',
      label: user?.role === 'ngo_rep' ? 'Dashboard' : 'My KAIA',
      icon: 'user',
    },
    { to: '/notifications', label: 'Notifications', icon: 'bell' },
  ]

  return (
    <div className="container-wide">
      {/* ---------- HERO ---------- */}
      <section className="hero-slim">
        <HeroCarousel slides={HERO_SLIDES} interval={5500} />
        <div className="hero-slim-overlay" />
        <div className="hero-slim-content">
          <h1 className="hero-slim-title">
            Everyone has something they{' '}
            <span className="gradient-text-orange">can</span> contribute.
          </h1>
          <p className="hero-slim-subtitle">
            KAIA connects you with verified Filipino NGOs — donate, volunteer,
            follow, or simply spread awareness. Support happens in many forms.
          </p>
        </div>
      </section>

      {/* ---------- THREE-COLUMN LAYOUT ---------- */}
      <div className="home-layout-3col">
        {/* ================= LEFT — PROFILE + NAV + EVENTS ================= */}
        <aside className="home-left">
          {/* 1. About you */}
          <div className="home-left-card">
            {user ? (
              <>
                <Link to="/my-kaia" className="home-left-profile">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="home-left-avatar home-left-avatar-img"
                    />
                  ) : (
                    <div className="home-left-avatar">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="home-left-profile-info">
                    <div className="home-left-name">{user.name}</div>
                    <div className="home-left-role">
                      {user.role === 'ngo_rep'
                        ? 'NGO Representative'
                        : 'Supporter'}
                    </div>
                  </div>
                </Link>

                {myStats && (
                  <div className="home-left-stats">
                    <Link to="/my-kaia" className="home-left-stat">
                      <div className="home-left-stat-value">
                        ₱{myStats.totalDonated.toLocaleString()}
                      </div>
                      <div className="home-left-stat-label">Donated</div>
                    </Link>
                    <Link to="/my-kaia" className="home-left-stat">
                      <div className="home-left-stat-value">
                        {myStats.hours}
                      </div>
                      <div className="home-left-stat-label">Hours</div>
                    </Link>
                    <Link to="/my-kaia" className="home-left-stat">
                      <div className="home-left-stat-value">
                        {myStats.followsCount}
                      </div>
                      <div className="home-left-stat-label">NGOs</div>
                    </Link>
                  </div>
                )}
              </>
            ) : (
              <div className="home-left-guest">
                <div className="home-left-guest-title">
                  Join KAIA today
                </div>
                <p className="home-left-guest-text">
                  Support causes that matter — donate, volunteer, and follow
                  verified Filipino NGOs.
                </p>
                <Link
                  to="/login"
                  className="btn btn-primary btn-sm btn-block"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="btn btn-ghost btn-sm btn-block"
                  style={{ marginTop: 6 }}
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>

          {/* 2. Navigation */}
          <nav className="home-left-card home-left-nav">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className="home-left-nav-item"
              >
                <span className="home-left-nav-icon">
                  <Icon name={item.icon} size={16} />
                </span>
                <span className="home-left-nav-label">{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* 3. Registered events */}
          <div className="home-left-card">
            <div className="home-left-section-header">
              <span>Your registered events</span>
              {myRegisteredEvents.length > 0 && (
                <Link to="/my-kaia" className="home-left-see-all">
                  See all
                </Link>
              )}
            </div>

            {myRegisteredEvents.length === 0 ? (
              <div className="home-left-empty">
                <Icon name="calendar" size={20} color="var(--ink-300)" />
                <div className="home-left-empty-title">
                  {user ? 'No events yet' : 'Sign in to track events'}
                </div>
                <div className="home-left-empty-text">
                  {user
                    ? 'Browse volunteer opportunities and sign up to see them here.'
                    : 'Log in to see your registered volunteer events.'}
                </div>
              </div>
            ) : (
              <div className="home-left-events">
                {myRegisteredEvents.map((s) => (
                  <Link
                    key={s.createdAt}
                    to="/volunteer"
                    className="home-left-event"
                  >
                    <div className="home-left-event-date">
                      <span className="home-left-event-day">
                        {new Date(s.opportunity.date).getDate()}
                      </span>
                      <span className="home-left-event-month">
                        {new Date(s.opportunity.date).toLocaleDateString(
                          'en-US',
                          { month: 'short' }
                        )}
                      </span>
                    </div>
                    <div className="home-left-event-body">
                      <div className="home-left-event-title">
                        {s.opportunity.title}
                      </div>
                      <div className="home-left-event-meta">
                        <Icon name="map-pin" size={10} />
                        <span>{s.opportunity.location}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* ================= MIDDLE — FEED ================= */}
        <div className="home-feed">
          <div className="home-section-header">
            <div>
              <h2 className="home-section-title">Your Feed</h2>
              <p className="home-section-subtitle">
                Updates from the NGOs you follow
              </p>
            </div>
            <Link to="/discover" className="btn btn-ghost btn-sm">
              Discover more
            </Link>
          </div>

          <div className="feed-tabs">
            {[
              { key: 'all', label: 'All', icon: 'globe' },
              { key: 'following', label: 'Following', icon: 'users' },
              { key: 'trending', label: 'Trending', icon: 'trending' },
            ].map((t) => (
              <button
                key={t.key}
                className={`feed-tab ${
                  feedTab === t.key ? 'active' : ''
                }`}
                onClick={() => setFeedTab(t.key)}
                type="button"
              >
                <Icon name={t.icon} size={14} />
                {t.label}
              </button>
            ))}
          </div>

          {feedPosts.length === 0 ? (
            <EmptyState
              icon="inbox"
              title={
                feedTab === 'following'
                  ? 'Your feed is empty'
                  : 'No posts yet'
              }
              message={
                feedTab === 'following'
                  ? 'Follow NGOs to see their updates here.'
                  : 'Check back soon for new updates.'
              }
              suggestions={
                feedTab === 'following'
                  ? [
                      {
                        label: 'Discover NGOs',
                        to: '/discover',
                        icon: 'globe',
                      },
                      {
                        label: 'Browse campaigns',
                        to: '/donate',
                        icon: 'heart',
                      },
                      {
                        label: 'Find volunteer work',
                        to: '/volunteer',
                        icon: 'hand',
                      },
                    ]
                  : undefined
              }
            />
          ) : (
            <div className="home-feed-list">
              {feedPosts.map((post) => {
                const ngo = getNgo(post.ngoId)
                if (!ngo) return null
                return (
                  <FeedPost
                    key={post.id}
                    post={post}
                    ngo={ngo}
                    showNgoHeader={true}
                  />
                )
              })}
            </div>
          )}
        </div>

        {/* ================= RIGHT — TRENDING + VOLUNTEER + SUGGESTIONS ================= */}
        <aside className="home-sidebar">
          {/* Trending campaigns */}
          <div className="sidebar-card">
            <div className="sidebar-card-header sidebar-card-header-blue">
              <h3 className="sidebar-card-title">Trending campaigns</h3>
              <Link
                to="/donate"
                className="sidebar-card-link sidebar-card-link-white"
              >
                See all
              </Link>
            </div>
            <div className="sidebar-list">
              {trendingCampaigns.map((c) => {
                const ngo = getNgo(c.ngoId)
                return (
                  <Link
                    key={c.id}
                    to={`/campaign/${c.id}`}
                    className="trending-item"
                  >
                    <div className="trending-tag orange">
                      <Icon name="trending" size={11} />
                      {c.donorCount} supporters
                    </div>
                    <div className="trending-title">{c.title}</div>
                    <div className="trending-meta">{ngo?.name}</div>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Volunteer now */}
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
            <div className="sidebar-list">
              {trendingVolunteers.map((o) => {
                const ngo = getNgo(o.ngoId)
                return (
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
                    <div className="trending-meta">
                      {ngo?.name} · {o.location}
                    </div>
                    <div className="trending-slots">
                      {o.needed - o.registered} slots left
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* You might like */}
          <div className="sidebar-card">
            <div className="sidebar-card-header">
              <h3 className="sidebar-card-title">You might like</h3>
            </div>
            <div className="sidebar-list">
              {suggestions.length === 0 ? (
                <div className="sidebar-empty">
                  You're following all our NGOs!
                </div>
              ) : (
                suggestions.map((ngo) => (
                  <div key={ngo.id} className="suggestion-item">
                    <Link to={`/ngo/${ngo.id}`} className="suggestion-left">
                      <img
                        src={ngo.logo}
                        alt=""
                        className="suggestion-avatar"
                      />
                      <div className="suggestion-info">
                        <div className="suggestion-name">
                          {ngo.name}
                          {ngo.verified && (
                            <span className="suggestion-verified">
                              <Icon name="check" size={10} />
                            </span>
                          )}
                        </div>
                        <div className="suggestion-cats">
                          {ngo.categories[0]}
                        </div>
                      </div>
                    </Link>
                    <button
                      className="btn btn-neutral btn-sm suggestion-follow"
                      onClick={() => {
                        if (!user) {
                          toast.push('Log in to follow NGOs', 'info')
                          return
                        }
                        store.toggleFollow(user.id, ngo.id)
                        store.addNotification(user.id, {
                          type: 'follow',
                          title: `You followed ${ngo.name}`,
                          body: 'Their posts will now appear in your feed.',
                          link: `/ngo/${ngo.id}`,
                        })
                        toast.push(`Following ${ngo.name}`, 'success')
                      }}
                      type="button"
                    >
                      Follow
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}