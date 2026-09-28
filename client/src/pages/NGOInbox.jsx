import { useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useActivity } from '../store/useActivity'
import { useToast } from '../components/Toast'
import EmptyState from '../components/EmptyState'
import Icon from '../components/Icon'

function timeAgo(iso) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}

export default function NGOInbox() {
  const { user } = useAuth()
  const store = useActivity()
  const toast = useToast()

  const [selectedUserId, setSelectedUserId] = useState(null)
  const [reply, setReply] = useState('')
  const [search, setSearch] = useState('')
  const scrollRef = useRef(null)

  const ngoId = user?.ngoId

  const conversations = useMemo(
    () => (ngoId ? store.getNgoConversations(ngoId) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ngoId, store.getState().messages.length]
  )

  const filtered = useMemo(() => {
    if (!search.trim()) return conversations
    const q = search.toLowerCase()
    return conversations.filter(
      (c) =>
        c.userName.toLowerCase().includes(q) ||
        c.messages.some((m) => m.text.toLowerCase().includes(q))
    )
  }, [conversations, search])

  const active = selectedUserId
    ? conversations.find((c) => c.userId === selectedUserId)
    : null

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [active?.messages.length])

  useEffect(() => {
    if (active && active.unreadCount > 0) {
      store.markConversationRead(active.userId, ngoId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUserId])

  if (!user || !ngoId) return null

  function sendReply() {
    if (!reply.trim() || !active) return
    store.sendMessage(active.userId, ngoId, reply, 'ngo', 'NGO Team')
    setReply('')
    toast.push('Reply sent', 'success', 1500)
  }

  const totalUnread = store.getNgoUnreadTotal(ngoId)

  return (
    <div className="container">
      <div className="page-header">
        <h1 className="page-title">Inbox</h1>
        <p className="page-subtitle">
          {conversations.length}{' '}
          {conversations.length === 1 ? 'conversation' : 'conversations'}
          {totalUnread > 0 && ` · ${totalUnread} unread`}
        </p>
      </div>

      {conversations.length === 0 ? (
        <EmptyState
          icon="message-circle"
          title="No messages yet"
          message="When supporters message your organization, conversations will appear here."
        />
      ) : (
        <div className="inbox-layout">
          {/* LEFT — conversation list */}
          <aside className="inbox-list">
            <div className="inbox-search">
              <span className="search-icon">
                <Icon name="search" size={14} />
              </span>
              <input
                placeholder="Search conversations…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="inbox-list-items">
              {filtered.length === 0 ? (
                <div className="inbox-list-empty">No matches</div>
              ) : (
                filtered.map((c) => (
                  <button
                    key={c.userId}
                    className={`inbox-item ${
                      selectedUserId === c.userId ? 'active' : ''
                    } ${c.unreadCount > 0 ? 'unread' : ''}`}
                    onClick={() => setSelectedUserId(c.userId)}
                    type="button"
                  >
                    <div className="inbox-item-avatar">
                      {c.userName.charAt(0).toUpperCase()}
                    </div>
                    <div className="inbox-item-body">
                      <div className="inbox-item-top">
                        <span className="inbox-item-name">
                          {c.userName}
                        </span>
                        <span className="inbox-item-time">
                          {timeAgo(c.lastMessage.createdAt)}
                        </span>
                      </div>
                      <div className="inbox-item-preview">
                        {c.lastMessage.from === 'ngo' && (
                          <span className="inbox-item-you">You: </span>
                        )}
                        {c.lastMessage.text}
                      </div>
                    </div>
                    {c.unreadCount > 0 && (
                      <span className="inbox-item-badge">
                        {c.unreadCount}
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
          </aside>

          {/* RIGHT — thread */}
          <section className="inbox-thread">
            {!active ? (
              <div className="inbox-thread-empty">
                <Icon
                  name="message-circle"
                  size={40}
                  color="var(--ink-300)"
                  strokeWidth={1.5}
                />
                <div className="inbox-thread-empty-title">
                  Select a conversation
                </div>
                <div className="inbox-thread-empty-text">
                  Choose a supporter on the left to see the full thread.
                </div>
              </div>
            ) : (
              <>
                <div className="inbox-thread-header">
                  <div className="inbox-item-avatar">
                    {active.userName.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="inbox-thread-name">
                      {active.userName}
                    </div>
                    <div className="inbox-thread-meta">
                      {active.totalCount}{' '}
                      {active.totalCount === 1 ? 'message' : 'messages'}
                    </div>
                  </div>
                  <button
                    className="btn btn-neutral btn-sm"
                    onClick={() => setSelectedUserId(null)}
                    type="button"
                  >
                    <Icon name="x" size={14} />
                  </button>
                </div>

                <div className="inbox-thread-body" ref={scrollRef}>
                  {active.messages.map((m) => (
                    <div
                      key={m.id}
                      className={`message-bubble-row ${
                        m.from === 'ngo' ? 'from-user' : 'from-ngo'
                      }`}
                    >
                      {m.from === 'user' && (
                        <div
                          className="message-bubble-avatar"
                          style={{
                            display: 'grid',
                            placeItems: 'center',
                            background: 'var(--blue-700)',
                            color: 'white',
                            fontWeight: 800,
                            fontSize: 11,
                          }}
                        >
                          {active.userName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="message-bubble">
                        <div className="message-bubble-text">{m.text}</div>
                        <div className="message-bubble-time">
                          {new Date(m.createdAt).toLocaleTimeString(
                            'en-US',
                            { hour: 'numeric', minute: '2-digit' }
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="message-input-row">
                  <input
                    className="message-input"
                    placeholder={`Reply to ${active.userName.split(' ')[0]}…`}
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') sendReply()
                    }}
                  />
                  <button
                    className="btn btn-primary message-send"
                    onClick={sendReply}
                    disabled={!reply.trim()}
                    type="button"
                  >
                    <Icon name="arrow-right" size={16} />
                  </button>
                </div>
              </>
            )}
          </section>
        </div>
      )}
    </div>
  )
}