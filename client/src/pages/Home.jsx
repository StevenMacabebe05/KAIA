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
import VerifiedBadge from '../components/VerifiedBadge'
import HeroCarousel from '../components/HeroCarousel'
import Testimonials from '../components/Testimonials'
import Icon from '../components/Icon'

const HERO_SLIDES = [
  { image: '/images/hero/hero-1.jpg' },
  { image: '/images/hero/hero-2.jpg' },
  { image: '/images/hero/hero-3.jpg' },
  { image: '/images/hero/hero-4.jpg' },
  { image: '/images/hero/hero-5.jpg' },
]

const POST_TYPE_LABELS = {
  update: 'Update',
  announcement: 'Announcement',
  campaign: 'Campaign',
}

function timeAgo(iso) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  if (s < 604800) return `${Math.floor(s / 86400)}d ago`
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

export default function Home() {
  const { user } = useAuth()
  const store = useActivity()
  const toast = useToast()

  const [feedTab, setFeedTab] = useState('all')
  const [activeCommentPost, setActiveCommentPost] = useState(null)
  const [commentText, setCommentText] = useState('')

  const [likedPosts, setLikedPosts] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('kaia_likes') || '{}')
    } catch {
      return {}
    }
  })

  const followedIds = user ? store.getFollowedNgoIds(user.id) : []

  const allPosts = [...POSTS, ...store.getExtraPosts()]

  /* feed tab filtering */
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

    /* all — show everything */
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

  function toggleLike(postId) {
    setLikedPosts((prev) => {
      const next = { ...prev, [postId]: !prev[postId] }
      try {
        localStorage.setItem('kaia_likes', JSON.stringify(next))
      } catch {
        /* ignore */
      }
      return next
    })
  }

  function handleShare(post) {
    if (user) store.sharePost(user.id, post.id)
    const ngo = getNgo(post.ngoId)
    const url = `${window.location.origin}/ngo/${ngo?.id || ''}`
    if (navigator.share) {
      navigator
        .share({ title: 'Check this out on KAIA', url })
        .catch(() => {})
    } else {
      navigator.clipboard.writeText(url)
      toast.push('Link copied to clipboard', 'success', 1800)
    }
  }

  function openCommentBox(postId) {
    if (!user) {
      toast.push('Log in to comment', 'info')
      return
    }
    setActiveCommentPost(postId)
    setCommentText('')
  }

  function submitComment(postId) {
    if (!commentText.trim()) return
    store.addComment(postId, user.id, user.name, commentText)
    setCommentText('')
    setActiveCommentPost(null)
    toast.push('Comment posted', 'success', 1500)
  }

  function renderImages(post) {
    const images =
      post.images && post.images.length > 0
        ? post.images
        : post.image
        ? [post.image]
        : []

    if (images.length === 0) return null

    if (images.length === 1) {
      return (
        <div className="feed-post-photo single">
          <img
            src={images[0]}
            alt=""
            onError={(e) => {
              e.target.parentElement.style.display = 'none'
            }}
          />
        </div>
      )
    }

    return (
      <div
        className={`feed-post-photo gallery count-${Math.min(
          images.length,
          4
        )}`}
      >
        {images.slice(0, 4).map((src, i) => (
          <div key={i} className="feed-photo-cell">
            <img
              src={src}
              alt=""
              onError={(e) => {
                e.target.parentElement.style.display = 'none'
              }}
            />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="container">
      {/* ---------- HERO ---------- */}
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

          {/* feed tabs */}
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
              action={
                feedTab === 'following' ? (
                  <Link
                    to="/discover"
                    style={{ marginTop: 16, display: 'inline-block' }}
                  >
                    <button className="btn btn-primary">
                      Discover NGOs
                    </button>
                  </Link>
                ) : null
              }
            />
          ) : (
            <div className="home-feed-list">
              {feedPosts.map((post) => {
                const ngo = getNgo(post.ngoId)
                if (!ngo) return null

                const liked = !!likedPosts[post.id]
                const comments = store.getComments(post.id)
                const commentCount = comments.length
                const shareCount = store.getShareCount(post.id)
                const typeLabel =
                  POST_TYPE_LABELS[post.type] || 'Update'
                const previewComments = comments.slice(-2)
                const isCommenting = activeCommentPost === post.id

                return (
                  <article key={post.id} className="feed-post">
                    {/* header */}
                    <header className="feed-post-header">
                      <img
                        src={ngo.logo}
                        alt=""
                        className="feed-post-avatar"
                      />
                      <div className="feed-post-meta">
                        <Link
                          to={`/ngo/${ngo.id}`}
                          className="feed-post-ngo"
                        >
                          {ngo.name}
                        </Link>
                        <div className="feed-post-subtitle">
                          <span className="feed-post-type">
                            {typeLabel}
                          </span>
                          <span className="feed-post-dot">·</span>
                          <span>{timeAgo(post.createdAt)}</span>
                        </div>
                      </div>
                      <VerifiedBadge verified={ngo.verified} />
                    </header>

                    {/* caption */}
                    <p className="feed-post-text">{post.content}</p>

                    {/* images */}
                    {renderImages(post)}

                    {/* action row */}
                    <footer className="feed-post-actions">
                      <button
                        type="button"
                        className={`feed-action ${
                          liked ? 'is-liked' : ''
                        }`}
                        onClick={() => toggleLike(post.id)}
                      >
                        <Icon
                          name="heart"
                          size={16}
                          color={
                            liked ? 'var(--red-600)' : 'currentColor'
                          }
                        />
                        <span>{liked ? 'Liked' : 'Like'}</span>
                      </button>

                      <button
                        type="button"
                        className="feed-action"
                        onClick={() => openCommentBox(post.id)}
                      >
                        <Icon name="message-circle" size={16} />
                        <span>
                          Comment
                          {commentCount > 0 && ` · ${commentCount}`}
                        </span>
                      </button>

                      <button
                        type="button"
                        className="feed-action"
                        onClick={() => handleShare(post)}
                      >
                        <Icon name="share" size={16} />
                        <span>
                          Share
                          {shareCount > 0 && ` · ${shareCount}`}
                        </span>
                      </button>

                      <Link
                        to="/donate"
                        className="feed-action feed-action-donate"
                      >
                        <Icon name="heart" size={16} />
                        <span>Donate</span>
                      </Link>
                    </footer>

                    {/* comment previews */}
                    {previewComments.length > 0 && (
                      <div className="feed-comment-preview">
                        {previewComments.map((c) => (
                          <div key={c.id} className="feed-comment">
                            <div className="feed-comment-avatar">
                              {c.userName.charAt(0).toUpperCase()}
                            </div>
                            <div className="feed-comment-bubble">
                              <div className="feed-comment-name">
                                {c.userName}
                              </div>
                              <div className="feed-comment-text">
                                {c.text}
                              </div>
                            </div>
                          </div>
                        ))}
                        {commentCount > 2 && (
                          <Link
                            to={`/ngo/${ngo.id}`}
                            className="feed-view-comments"
                          >
                            View all {commentCount} comments
                          </Link>
                        )}
                      </div>
                    )}

                    {/* inline comment input */}
                    {isCommenting && (
                      <div className="feed-comment-input-wrap">
                        <div className="feed-comment-avatar">
                          {user?.name?.charAt(0).toUpperCase() || 'A'}
                        </div>
                        <input
                          className="feed-comment-input"
                          placeholder="Write a comment…"
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') submitComment(post.id)
                            if (e.key === 'Escape') {
                              setActiveCommentPost(null)
                              setCommentText('')
                            }
                          }}
                          autoFocus
                        />
                        <button
                          className="btn btn-primary btn-sm"
                          disabled={!commentText.trim()}
                          onClick={() => submitComment(post.id)}
                        >
                          Post
                        </button>
                      </div>
                    )}
                  </article>
                )
              })}
            </div>
          )}
        </div>

        {/* RIGHT — SIDEBAR */}
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

      {/* ---------- TESTIMONIALS ---------- */}
      <Testimonials />
    </div>
  )
}