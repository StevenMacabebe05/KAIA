import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { NGOS } from '../data/ngos'
import { CAMPAIGNS } from '../data/campaigns'
import { OPPORTUNITIES } from '../data/opportunities'
import Icon from './Icon'

export default function GlobalSearch() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const inputRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    function onKey(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(true)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50)
    } else {
      setQuery('')
    }
  }, [open])

  const q = query.trim().toLowerCase()

  const results = useMemo(() => {
    if (q.length < 1) return { ngos: [], campaigns: [], opportunities: [] }
    return {
      ngos: NGOS.filter(
        (n) =>
          n.name.toLowerCase().includes(q) ||
          n.tagline.toLowerCase().includes(q) ||
          n.categories.some((c) => c.toLowerCase().includes(q))
      ).slice(0, 4),
      campaigns: CAMPAIGNS.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q)
      ).slice(0, 4),
      opportunities: OPPORTUNITIES.filter(
        (o) =>
          o.title.toLowerCase().includes(q) ||
          o.location.toLowerCase().includes(q)
      ).slice(0, 3),
    }
  }, [q])

  const totalResults =
    results.ngos.length +
    results.campaigns.length +
    results.opportunities.length

  function go(path) {
    navigate(path)
    setOpen(false)
  }

  return (
    <>
      <button
        className="search-trigger"
        onClick={() => setOpen(true)}
        aria-label="Search"
        title="Search (Ctrl+K)"
      >
        <Icon name="search" size={18} />
      </button>

      {open && (
        <div className="search-backdrop" onClick={() => setOpen(false)}>
          <div className="search-modal" onClick={(e) => e.stopPropagation()}>
            <div className="search-input-wrapper">
              <Icon name="search" size={18} color="var(--ink-500)" />
              <input
                ref={inputRef}
                className="search-input"
                placeholder="Search NGOs, campaigns, or volunteer opportunities…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <kbd className="search-kbd">ESC</kbd>
            </div>

            <div className="search-results">
              {q.length === 0 ? (
                <div className="search-hint">
                  <div className="search-hint-title">Quick search</div>
                  <div className="search-hint-text">
                    Start typing to search across NGOs, campaigns, and
                    opportunities.
                  </div>
                  <div className="search-shortcuts">
                    <span>
                      <kbd>Ctrl</kbd>+<kbd>K</kbd> to open
                    </span>
                    <span>
                      <kbd>Esc</kbd> to close
                    </span>
                  </div>
                </div>
              ) : totalResults === 0 ? (
                <div className="search-empty">
                  <Icon name="search" size={28} color="var(--ink-300)" />
                  <div>No results for "{query}"</div>
                </div>
              ) : (
                <>
                  {results.ngos.length > 0 && (
                    <div className="search-group">
                      <div className="search-group-title">NGOs</div>
                      {results.ngos.map((n) => (
                        <button
                          key={n.id}
                          className="search-result"
                          onClick={() => go(`/ngo/${n.id}`)}
                        >
                          <img
                            src={n.logo}
                            alt=""
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: 8,
                              objectFit: 'cover',
                            }}
                          />
                          <div style={{ flex: 1, textAlign: 'left' }}>
                            <div className="search-result-title">{n.name}</div>
                            <div className="search-result-sub">
                              {n.categories.join(' · ')}
                            </div>
                          </div>
                          <Icon
                            name="chevron-right"
                            size={14}
                            color="var(--ink-500)"
                          />
                        </button>
                      ))}
                    </div>
                  )}

                  {results.campaigns.length > 0 && (
                    <div className="search-group">
                      <div className="search-group-title">Campaigns</div>
                      {results.campaigns.map((c) => (
                        <button
                          key={c.id}
                          className="search-result"
                          onClick={() => go(`/campaign/${c.id}`)}
                        >
                          <span
                            className="search-result-icon"
                            style={{
                              background: 'var(--orange-50)',
                              color: 'var(--orange-500)',
                            }}
                          >
                            <Icon name="heart" size={14} />
                          </span>
                          <div style={{ flex: 1, textAlign: 'left' }}>
                            <div className="search-result-title">
                              {c.title}
                            </div>
                            <div className="search-result-sub">
                              ₱{c.raised.toLocaleString()} raised ·{' '}
                              {c.category}
                            </div>
                          </div>
                          <Icon
                            name="chevron-right"
                            size={14}
                            color="var(--ink-500)"
                          />
                        </button>
                      ))}
                    </div>
                  )}

                  {results.opportunities.length > 0 && (
                    <div className="search-group">
                      <div className="search-group-title">Volunteer</div>
                      {results.opportunities.map((o) => (
                        <button
                          key={o.id}
                          className="search-result"
                          onClick={() => go('/volunteer')}
                        >
                          <span
                            className="search-result-icon"
                            style={{
                              background: 'var(--blue-50)',
                              color: 'var(--blue-700)',
                            }}
                          >
                            <Icon name="hand" size={14} />
                          </span>
                          <div style={{ flex: 1, textAlign: 'left' }}>
                            <div className="search-result-title">{o.title}</div>
                            <div className="search-result-sub">
                              {o.location} · {o.date}
                            </div>
                          </div>
                          <Icon
                            name="chevron-right"
                            size={14}
                            color="var(--ink-500)"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}