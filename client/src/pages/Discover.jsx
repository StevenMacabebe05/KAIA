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
    const matchesCategory =
      category === 'All' || n.categories.includes(category)

    const matchesQuery =
      query === '' ||
      n.name.toLowerCase().includes(query.toLowerCase())

    return matchesCategory && matchesQuery
  })

  return (
    <div className="container">
      {/* ---------- PAGE HEADER ---------- */}
      <div className="page-header">
        <h1 className="page-title">Discover NGOs</h1>

        <p className="page-subtitle">
          Find organizations and causes to follow, support, and stay connected with.
        </p>
      </div>

      {/* ---------- SEARCH ---------- */}
      <div className="filters">
        <div
          className="search"
          style={{
            boxShadow:
              '0 3px 10px rgba(11, 18, 32, 0.08)',
          }}
        >
          <span className="search-icon">
            <Icon name="search" size={16} />
          </span>

          <input
            placeholder="Search NGOs by name…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {/* ---------- CATEGORY FILTERS ---------- */}
      <div className="filters">
        <button
          className={`pill ${
            category === 'All' ? 'is-active' : ''
          }`}
          onClick={() => setCategory('All')}
          style={{
            boxShadow:
              category === 'All'
                ? '0 3px 8px rgba(11, 18, 32, 0.14)'
                : '0 2px 5px rgba(11, 18, 32, 0.06)',
          }}
        >
          All
        </button>

        {CATEGORIES.map((c) => (
          <button
            key={c}
            className={`pill ${
              category === c ? 'is-active' : ''
            }`}
            onClick={() => setCategory(c)}
            style={{
              boxShadow:
                category === c
                  ? '0 3px 8px rgba(11, 18, 32, 0.14)'
                  : '0 2px 5px rgba(11, 18, 32, 0.06)',
            }}
          >
            {c}
          </button>
        ))}
      </div>

      {/* ---------- RESULTS ---------- */}
      {filtered.length === 0 ? (
        <EmptyState
          icon="search"
          title="No NGOs found"
          message="Try a different search or explore another cause category."
        />
      ) : (
        <>
          <div
            style={{
              marginBottom: 16,
              fontSize: 13,
              color: 'var(--ink-500)',
            }}
          >
            {query || category !== 'All'
              ? `${filtered.length} ${
                  filtered.length === 1
                    ? 'NGO'
                    : 'NGOs'
                } found`
              : 'Explore organizations you may want to follow'}
          </div>

          <div className="grid grid-3">
            {filtered.map((ngo) => {
              const following = user
                ? store.isFollowing(user.id, ngo.id)
                : false

              return (
                <article
                  key={ngo.id}
                  className="card card-hover"
                >
                  <Link
                    to={`/ngo/${ngo.id}`}
                    style={{
                      color: 'inherit',
                      display: 'block',
                    }}
                  >
                    {/* ---------- COVER ---------- */}
                    <img
                      src={ngo.cover}
                      alt=""
                      style={{
                        width: '100%',
                        height: 100,
                        borderRadius: 10,
                        objectFit: 'cover',
                        marginBottom: -22,
                      }}
                    />

                    {/* ---------- LOGO ---------- */}
                    <img
                      src={ngo.logo}
                      alt={ngo.name}
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: 14,
                        objectFit: 'cover',
                        border: '3px solid white',
                        background: 'white',
                        boxShadow:
                          '0 4px 10px rgba(11,18,32,0.12)',
                        position: 'relative',
                        marginBottom: 10,
                      }}
                    />

                    {/* ---------- NAME ---------- */}
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: 15,
                        marginBottom: 4,
                        lineHeight: 1.3,
                      }}
                    >
                      {ngo.name}
                    </div>

                    {/* ---------- CATEGORIES ---------- */}
                    <div
                      className="text-muted"
                      style={{
                        fontSize: 12,
                        marginBottom: 8,
                      }}
                    >
                      {ngo.categories.join(' · ')}
                    </div>

                    {/* ---------- TAGLINE ---------- */}
                    <p
                      style={{
                        fontSize: 13,
                        color: 'var(--ink-500)',
                        margin: '0 0 12px',
                        lineHeight: 1.5,
                      }}
                    >
                      {ngo.tagline}
                    </p>
                  </Link>

                  {/* ---------- CARD ACTIONS ---------- */}
                  <div className="row-between">
                    <VerifiedBadge
                      verified={ngo.verified}
                    />

                    {user && (
                      <button
                        className={`btn btn-sm ${
                          following
                            ? 'btn-ghost'
                            : 'btn-primary'
                        }`}
                        style={{
                          boxShadow: following
                            ? '0 2px 6px rgba(11,18,32,0.08)'
                            : '0 4px 10px rgba(11,18,32,0.16)',
                        }}
                        onClick={() =>
                          store.toggleFollow(
                            user.id,
                            ngo.id
                          )
                        }
                      >
                        {following
                          ? 'Following'
                          : 'Follow'}
                      </button>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}