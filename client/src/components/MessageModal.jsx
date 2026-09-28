import { useEffect, useRef, useState } from 'react'
import { useActivity } from '../store/useActivity'
import { useAuth } from '../context/AuthContext'
import Icon from './Icon'

export default function MessageModal({ ngo, onClose }) {
  const { user } = useAuth()
  const store = useActivity()
  const [text, setText] = useState('')
  const [typing, setTyping] = useState(false)
  const scrollRef = useRef(null)

  const messages = user ? store.getMessages(user.id, ngo.id) : []

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages.length, typing])

  function send() {
    if (!text.trim()) return
    const msg = text.trim()
    setText('')
    store.sendMessage(user.id, ngo.id, msg, 'user')

    // simulate NGO auto-reply
    setTyping(true)
    setTimeout(() => {
      setTyping(false)
      store.sendMessage(
        user.id,
        ngo.id,
        `Hi ${user.name.split(' ')[0]}! Thanks for reaching out. One of our team members will get back to you shortly. In the meantime, feel free to explore our campaigns and volunteer opportunities. — ${ngo.name}`,
        'ngo'
      )
    }, 1400)
  }

  if (!user) return null

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal message-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="message-header">
          <img src={ngo.logo} alt="" className="message-avatar" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="message-ngo-name">{ngo.name}</div>
            <div className="message-ngo-status">
              <span className="message-status-dot" />
              Typically replies within a few minutes
            </div>
          </div>
          <button
            className="btn btn-neutral btn-sm"
            onClick={onClose}
            style={{ padding: '6px 10px' }}
            type="button"
          >
            <Icon name="x" size={14} />
          </button>
        </div>

        <div className="message-body" ref={scrollRef}>
          {messages.length === 0 ? (
            <div className="message-empty">
              <Icon name="message-circle" size={28} color="var(--ink-300)" />
              <div className="message-empty-title">
                Start a conversation
              </div>
              <div className="message-empty-text">
                Ask about their work, campaigns, or how you can help.
              </div>
            </div>
          ) : (
            <>
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`message-bubble-row ${
                    m.from === 'user' ? 'from-user' : 'from-ngo'
                  }`}
                >
                  {m.from === 'ngo' && (
                    <img
                      src={ngo.logo}
                      alt=""
                      className="message-bubble-avatar"
                    />
                  )}
                  <div className="message-bubble">
                    <div className="message-bubble-text">{m.text}</div>
                    <div className="message-bubble-time">
                      {new Date(m.createdAt).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                </div>
              ))}
              {typing && (
                <div className="message-bubble-row from-ngo">
                  <img
                    src={ngo.logo}
                    alt=""
                    className="message-bubble-avatar"
                  />
                  <div className="message-bubble typing-bubble">
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="message-input-row">
          <input
            className="message-input"
            placeholder="Type your message…"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') send()
            }}
          />
          <button
            className="btn btn-primary message-send"
            onClick={send}
            disabled={!text.trim()}
            type="button"
          >
            <Icon name="arrow-right" size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}