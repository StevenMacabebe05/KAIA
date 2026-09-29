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
import Testimonials from '../components/Testimonials'
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
  ).slice(0, 5)

  const trendingVolunteers = [...OPPORTUNITIES]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 4)

  const trendingCampaigns = [...CAMPAIGNS]
    .sort((a, b) => b.donorCount - a.donorCount)
    .slice(0, 3)

  const getNgo = (id) => NGOS.find((n) => n.id === id)

  return (
    <div className="container">
      <section className="hero-slim">
        <HeroCarousel slides={HERO_SLIDES} interval={5500} />
        <div className="hero-slim-overlay" />
        <div className="hero-slim-content">
          <h1 className="hero-slim-title">
            Everyone has something they can{' '}
            <span className="gradient-text-orange">contribute</span>.
          </h1>
          <p className="hero-slim-subtitle">
            KAIA connects you with verified Filipino NGOs — donate, volunteer,
            follow, or simply spread awareness. Support happens in many forms.
          </p>
        </div>
      </section>

      <div className="home-layout">
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

        <aside className="home-sidebar">
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

      <Testimonials />
    </div>
  )
}