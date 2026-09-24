import { useState } from 'react'
import { Link } from 'react-router-dom'
import { NGOS } from '../data/ngos'
import { CATEGORIES } from '../data/categories'
import { useActivity } from '../store/useActivity'
import { useAuth } from '../context/AuthContext'
import VerifiedBadge from '../components/VerifiedBadge'
import EmptyState from '../components/EmptyState'
import Icon from '../components/Icon'

export default function Discover() {
  const { user } = useAuth()
  const store = useActivity()
  const [category, setCategory] = useState('All')
  const [query, setQuery] = useState('')

  const filtered = NGOS.filter((n) => {
    const matchesCategory = category === 'All' || n.categories.includes(category)
    const matchesQuery = query === '' || n.name.toLowerCase().includes(query.toLowerCase())
    return matchesCategory && matchesQuery
  })

  return (
    <div className="container">
      <div className="page-header">
        <h1 className="page-title">Discover NGOs</h1>
        <p className="page-subtitle">
          Browse verified organizations across nine cause categories.
        </p>
      </div>

      <div className="filters">
        <div className="search">
          <span className="search-icon"><Icon name="search" size={16} /></span>
          <input
            placeholder="Search by name…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="filters">
        <button
          className={`pill ${category === 'All' ? 'is-active' : ''}`}
          onClick={() => setCategory('All')}
        >
          All
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c}
            className={`pill ${category === c ? 'is-active' : ''}`}
            onClick={() => setCategory(c)}
          >
            {c}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon="search"
          title="No NGOs found"
          message="Try a different category or search term."
        />
      ) : (
        <div className="grid grid-3">
          {filtered.map((ngo) => {
            const following = user ? store.isFollowing(user.id, ngo.id) : false
            return (
              <article key={ngo.id} className="card card-hover">
                <Link
                  to={`/ngo/${ngo.id}`}
                  style={{ color: 'inherit', display: 'block' }}
                >
                  <img
                    src={ngo.cover}
                    alt=""
                    style={{ width: '100%', height: 120, borderRadius: 10, objectFit: 'cover', marginBottom: 14 }}
                  />
                  <div className="row" style={{ marginBottom: 10 }}>
                    <img
                      src={ngo.logo}
                      alt={ngo.name}
                      style={{ width: 44, height: 44, borderRadius: 10, objectFit: 'cover' }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{ngo.name}</div>
                      <div className="text-muted" style={{ fontSize: 12, marginTop: 2 }}>
                        {ngo.categories.join(' · ')}
                      </div>
                    </div>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--ink-500)', margin: '0 0 12px', lineHeight: 1.5 }}>
                    {ngo.tagline}
                  </p>
                </Link>

                <div className="row-between">
                  <VerifiedBadge verified={ngo.verified} />
                  {user && (
                    <button
                      className={`btn btn-sm ${following ? 'btn-ghost' : 'btn-primary'}`}
                      onClick={() => store.toggleFollow(user.id, ngo.id)}
                    >
                      {following ? 'Following' : 'Follow'}
                    </button>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}