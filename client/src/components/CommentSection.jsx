import { useState } from 'react'
import { useActivity } from '../store/useActivity'
import { useAuth } from '../context/AuthContext'
import Icon from './Icon'

function timeAgo(iso) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}

export default function CommentSection({ postId }) {
  const { user } = useAuth()
  const store = useActivity()
  const [text, setText] = useState('')

  const comments = store.getComments(postId)

  function handleSubmit(e) {
    e.preventDefault()
    if (!user || !text.trim()) return
    store.addComment(postId, user.id, user.name, text)
    setText('')
  }

  return (
    <div className="comment-section">
      <div className="comment-header">
        <Icon name="inbox" size={14} color="var(--ink-500)" />
        <span>{comments.length} {comments.length === 1 ? 'comment' : 'comments'}</span>
      </div>

      {comments.length > 0 && (
        <div className="comment-list">
          {comments.map((c) => (
            <div key={c.id} className="comment">
              <div className="comment-avatar">
                {c.userName.charAt(0).toUpperCase()}
              </div>
              <div className="comment-body">
                <div className="comment-meta">
                  <span className="comment-name">{c.userName}</span>
                  <span className="comment-time">{timeAgo(c.createdAt)}</span>
                </div>
                <div className="comment-text">{c.text}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {user ? (
        <form className="comment-form" onSubmit={handleSubmit}>
          <div className="comment-avatar">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <input
            className="comment-input"
            placeholder="Write a comment…"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button
            type="submit"
            className="btn btn-primary btn-sm"
            disabled={!text.trim()}
          >
            Post
          </button>
        </form>
      ) : (
        <div className="comment-login-hint">
          Log in to leave a comment.
        </div>
      )}
    </div>
  )
}