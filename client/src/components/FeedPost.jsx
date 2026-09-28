import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useActivity } from '../store/useActivity'
import { useAuth } from '../context/AuthContext'
import { useToast } from './Toast'
import VerifiedBadge from './VerifiedBadge'
import Icon from './Icon'

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

export default function FeedPost({
  post,
  ngo,
  showNgoHeader = true,
  compact = false,
}) {
  const { user } = useAuth()
  const store = useActivity()
  const toast = useToast()

  const [liked, setLiked] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('kaia_likes') || '{}')
      return !!stored[post.id]
    } catch {
      return false
    }
  })
  const [commenting, setCommenting] = useState(false)
  const [text, setText] = useState('')

  if (!ngo) return null

  const comments = store.getComments(post.id)
  const commentCount = comments.length
  const shareCount = store.getShareCount(post.id)
  const typeLabel = POST_TYPE_LABELS[post.type] || 'Update'
  const previewComments = comments.slice(-2)

  function toggleLike() {
    setLiked((prev) => {
      const next = !prev
      try {
        const stored = JSON.parse(localStorage.getItem('kaia_likes') || '{}')
        stored[post.id] = next
        localStorage.setItem('kaia_likes', JSON.stringify(stored))
      } catch {
        /* ignore */
      }
      return next
    })
  }

  function handleShare() {
    if (user) store.sharePost(user.id, post.id)
    const url = `${window.location.origin}/ngo/${ngo.id}`
    if (navigator.share) {
      navigator
        .share({ title: 'Check this out on KAIA', url })
        .catch(() => {})
    } else {
      navigator.clipboard.writeText(url)
      toast.push('Link copied to clipboard', 'success', 1800)
    }
  }

  function submitComment() {
    if (!text.trim() || !user) return
    store.addComment(post.id, user.id, user.name, text)
    setText('')
    setCommenting(false)
    toast.push('Comment posted', 'success', 1500)
  }

  function renderImages() {
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
    <article
      className={`feed-post ${compact ? 'feed-post-compact' : ''}`}
    >
      {/* header */}
      {showNgoHeader && (
        <header className="feed-post-header">
          <Link to={`/ngo/${ngo.id}`}>
            <img
              src={ngo.logo}
              alt=""
              className="feed-post-avatar"
            />
          </Link>
          <div className="feed-post-meta">
            <Link to={`/ngo/${ngo.id}`} className="feed-post-ngo">
              {ngo.name}
            </Link>
            <div className="feed-post-subtitle">
              <span className="feed-post-type">{typeLabel}</span>
              <span className="feed-post-dot">·</span>
              <span>{timeAgo(post.createdAt)}</span>
            </div>
          </div>
          <VerifiedBadge verified={ngo.verified} />
        </header>
      )}

      {/* caption */}
      <p className="feed-post-text">{post.content}</p>

      {/* images */}
      {renderImages()}

      {/* action row */}
      <footer className="feed-post-actions">
        <button
          type="button"
          className={`feed-action ${liked ? 'is-liked' : ''}`}
          onClick={toggleLike}
        >
          <Icon
            name="heart"
            size={16}
            color={liked ? 'var(--red-600)' : 'currentColor'}
          />
          <span>{liked ? 'Liked' : 'Like'}</span>
        </button>

        <button
          type="button"
          className="feed-action"
          onClick={() => {
            if (!user) {
              toast.push('Log in to comment', 'info')
              return
            }
            setCommenting((c) => !c)
          }}
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
          onClick={handleShare}
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
                <div className="feed-comment-name">{c.userName}</div>
                <div className="feed-comment-text">{c.text}</div>
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
      {commenting && (
        <div className="feed-comment-input-wrap">
          <div className="feed-comment-avatar">
            {user?.name?.charAt(0).toUpperCase() || 'A'}
          </div>
          <input
            className="feed-comment-input"
            placeholder="Write a comment…"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') submitComment()
              if (e.key === 'Escape') {
                setCommenting(false)
                setText('')
              }
            }}
            autoFocus
          />
          <button
            className="btn btn-primary btn-sm"
            disabled={!text.trim()}
            onClick={submitComment}
            type="button"
          >
            Post
          </button>
        </div>
      )}
    </article>
  )
}