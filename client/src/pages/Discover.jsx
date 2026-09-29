import { useState } from 'react'
import { Link } from 'react-router-dom'
import { NGOS } from '../data/ngos'
import { CATEGORIES } from '../data/categories'
import { CAMPAIGNS } from '../data/campaigns'
import { POSTS } from '../data/posts'
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
      query === '' || n.name.toLowerCase().includes(query.toLowerCase())
    return matchesCategory && matchesQuery
  })

    return (
    <div className="container-wide">
      <div className="page-header">
        <h1 className="page-title">Discover NGOs</h1>
        <p className="page-subtitle">
          Find organizations and causes to follow, support, and stay
          connected with.
        </p>
      </div>

      <div className="filters">
        <div className="search">
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

      <div className="filters">
        <button
          className={`pill ${category === 'All' ? 'is-active' : ''}`}
          onClick={() => setCategory('All')}
          type="button"
        >
          All
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c}
            className={`pill ${category === c ? 'is-active' : ''}`}
            onClick={() => setCategory(c)}
            type="button"
          >
            {c}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon="search"
          title="No NGOs found"
          message="Try a different search or explore another cause category."
          suggestions={[
            {
              label: 'Clear search & filters',
              onClick: () => {
                setQuery('')
                setCategory('All')
              },
              icon: 'x',
            },
            { label: 'Browse campaigns', to: '/donate', icon: 'heart' },
            { label: 'Find volunteer work', to: '/volunteer', icon: 'hand' },
          ]}
        />
      ) : (
        <>
          <div className="donate-results">
            <span>
              {query || category !== 'All'
                ? `${filtered.length} ${
                    filtered.length === 1 ? 'NGO' : 'NGOs'
                  } found`
                : 'Explore organizations you may want to follow'}
            </span>
            {(query || category !== 'All') && (
              <button
                className="donate-clear"
                onClick={() => {
                  setQuery('')
                  setCategory('All')
                }}
                type="button"
              >
                Clear filters
              </button>
            )}
          </div>

          <div className="grid grid-3">
            {filtered.map((ngo) => {
              const following = user
                ? store.isFollowing(user.id, ngo.id)
                : false

              return (
                <article key={ngo.id} className="ngo-card">
                  <Link to={`/ngo/${ngo.id}`} className="ngo-card-cover">
                    <img
                      src={ngo.cover}
                      alt=""
                      className="ngo-card-cover-img"
                      onError={(e) => {
                        e.target.onerror = null
                        e.target.src = `https://placehold.co/800x400/eff4ff/1e40d8?text=${encodeURIComponent(
                          ngo.name
                        )}`
                      }}
                    />
                    <div className="ngo-card-cover-overlay" />
                    {ngo.isDeep && (
                      <span className="ngo-card-featured">
                        <Icon name="trending" size={11} /> Featured
                      </span>
                    )}
                  </Link>

                  <div className="ngo-card-body">
                    <div className="ngo-card-logo-row">
                      <Link to={`/ngo/${ngo.id}`}>
                        <img
                          src={ngo.logo}
                          alt=""
                          className="ngo-card-logo"
                        />
                      </Link>
                      <VerifiedBadge verified={ngo.verified} />
                    </div>

                    <Link to={`/ngo/${ngo.id}`} className="ngo-card-name">
                      {ngo.name}
                    </Link>

                    <div className="ngo-card-cats">
                      {ngo.categories.map((c) => (
                        <span key={c} className="ngo-card-cat">
                          {c}
                        </span>
                      ))}
                    </div>

                    <p className="ngo-card-tagline">{ngo.tagline}</p>

                    <div className="ngo-card-stats">
                      <div className="ngo-card-stat">
                        <div className="ngo-card-stat-value">
                          {ngo.supporterCount > 999
                            ? `${(ngo.supporterCount / 1000).toFixed(1)}k`
                            : ngo.supporterCount}
                        </div>
                        <div className="ngo-card-stat-label">Supporters</div>
                      </div>
                      <div className="ngo-card-stat">
                        <div className="ngo-card-stat-value">
                          {CAMPAIGNS.filter((c) => c.ngoId === ngo.id).length}
                        </div>
                        <div className="ngo-card-stat-label">Campaigns</div>
                      </div>
                      <div className="ngo-card-stat">
                        <div className="ngo-card-stat-value">
                          {POSTS.filter((p) => p.ngoId === ngo.id).length}
                        </div>
                        <div className="ngo-card-stat-label">Posts</div>
                      </div>
                    </div>

                    <div className="ngo-card-cta-row">
                      {user && (
                        <button
                          type="button"
                          className={`btn ${
                            following ? 'btn-ghost' : 'btn-primary'
                          } ngo-card-cta`}
                          onClick={() =>
                            store.toggleFollow(user.id, ngo.id)
                          }
                        >
                          {following ? 'Following' : 'Follow'}
                        </button>
                      )}
                      <Link
                        to={`/ngo/${ngo.id}`}
                        className="ngo-card-view ngo-card-cta"
                      >
                        View profile <Icon name="arrow-right" size={13} />
                      </Link>
                    </div>
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