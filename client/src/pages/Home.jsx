import { Link } from 'react-router-dom'
import { POSTS } from '../data/posts'
import { NGOS } from '../data/ngos'
import { CAMPAIGNS } from '../data/campaigns'
import { OPPORTUNITIES } from '../data/opportunities'
import { useActivity } from '../store/useActivity'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/Toast'
import EmptyState from '../components/EmptyState'
import VerifiedBadge from '../components/VerifiedBadge'
import HeroCarousel from '../components/HeroCarousel'
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

  const followedIds = user ? store.getFollowedNgoIds(user.id) : []

  /* Feed: posts from followed NGOs */
  const feedPosts = [...POSTS, ...store.getExtraPosts()]
    .filter((p) => followedIds.includes(p.ngoId))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  /* Suggestions: NGOs NOT followed yet */
  const suggestions = NGOS.filter((n) => !followedIds.includes(n.id)).slice(0, 5)

  /* Trending volunteer opportunities */
  const trendingVolunteers = [...OPPORTUNITIES]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 4)

  /* Trending campaigns */
  const trendingCampaigns = [...CAMPAIGNS]
    .sort((a, b) => b.donorCount - a.donorCount)
    .slice(0, 3)

  const getNgo = (id) => NGOS.find((n) => n.id === id)

  return (
    <div className="container">
      {/* ---------- SLIM HERO ---------- */}
      <section className="hero-slim">
        <HeroCarousel slides={HERO_SLIDES} interval={5500} />
        <div className="hero-slim-overlay" />
        <div className="hero-slim-content">
          <div className="hero-eyebrow">
            <span className="pulse-dot" />
            Live · {NGOS.length} NGOs · {feedPosts.length} updates
          </div>
          <h1 className="hero-slim-title">
            Everyone has something they can{' '}
            <span className="gradient-text-orange">contribute</span>.
          </h1>
        </div>
      </section>

      {/* ---------- TWO-COLUMN LAYOUT ---------- */}
      <div className="home-layout">
        {/* LEFT — FEED */}
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

          {feedPosts.length === 0 ? (
            <EmptyState
              icon="inbox"
              title="Your feed is empty"
              message="Follow NGOs to see their updates here."
              action={
                <Link
                  to="/discover"
                  style={{ marginTop: 16, display: 'inline-block' }}
                >
                  <button className="btn btn-primary">Discover NGOs</button>
                </Link>
              }
            />
          ) : (
            <div className="home-feed-list">
              {feedPosts.map((post) => {
                const ngo = getNgo(post.ngoId)
                if (!ngo) return null
                return (
                  <article key={post.id} className="feed-post">
                    <header className="feed-post-header">
                      <img src={ngo.logo} alt="" className="feed-post-avatar" />
                      <div className="feed-post-meta">
                        <Link to={`/ngo/${ngo.id}`} className="feed-post-ngo">
                          {ngo.name}
                        </Link>
                        <VerifiedBadge verified={ngo.verified} />
                      </div>
                      <Link
                        to={`/ngo/${ngo.id}`}
                        className="feed-post-menu"
                        title="View NGO"
                      >
                        <Icon name="chevron-right" size={14} />
                      </Link>
                    </header>

                    <p className="feed-post-text">{post.content}</p>

                    {post.image && (
                      <img
                        src={post.image}
                        alt=""
                        className="feed-post-image"
                        onError={(e) => {
                          e.target.style.display = 'none'
                        }}
                      />
                    )}

                    <footer className="feed-post-actions">
                      <Link
                        to={`/ngo/${ngo.id}`}
                        className="btn btn-ghost btn-sm"
                        style={{ flex: 1 }}
                      >
                        View NGO
                      </Link>
                      <Link
                        to="/donate"
                        className="btn btn-accent btn-sm"
                        style={{ flex: 1 }}
                      >
                        <Icon name="heart" size={13} />
                        Donate
                      </Link>
                    </footer>
                  </article>
                )
              })}
            </div>
          )}
        </div>

        {/* RIGHT — SIDEBAR */}
        <aside className="home-sidebar">
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
                      <img src={ngo.logo} alt="" className="suggestion-avatar" />
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
                    >
                      Follow
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* What's happening — Volunteer */}
          <div className="sidebar-card">
            <div className="sidebar-card-header">
              <h3 className="sidebar-card-title">Volunteer now</h3>
              <Link to="/volunteer" className="sidebar-card-link">
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

          {/* What's happening — Trending campaigns */}
          <div className="sidebar-card">
            <div className="sidebar-card-header">
              <h3 className="sidebar-card-title">Trending campaigns</h3>
              <Link to="/donate" className="sidebar-card-link">
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
        </aside>
      </div>
    </div>
  )
}