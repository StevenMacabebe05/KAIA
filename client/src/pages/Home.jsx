import { Link } from 'react-router-dom'
import { POSTS } from '../data/posts'
import { NGOS } from '../data/ngos'
import { useActivity } from '../store/useActivity'
import { useAuth } from '../context/AuthContext'
import EmptyState from '../components/EmptyState'
import VerifiedBadge from '../components/VerifiedBadge'
import HeroCarousel from '../components/HeroCarousel'
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

  const followedIds = user ? store.getFollowedNgoIds(user.id) : []

  const allPosts = [...POSTS, ...store.getExtraPosts()]
    .filter((p) => followedIds.includes(p.ngoId))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  const getNgo = (id) => NGOS.find((n) => n.id === id)

  const suggestedNgos = NGOS
    .filter((ngo) => !followedIds.includes(ngo.id))
    .slice(0, 3)

  const isFollowingAnyone = followedIds.length > 0

  return (
    <div className="container">
      {/* ---------- HERO ---------- */}
      <section className="hero hero-photo">
        <HeroCarousel slides={HERO_SLIDES} interval={5500} />

        <div className="hero-content">
          <div className="hero-eyebrow">
            <span className="pulse-dot" />
            Live now · {NGOS.length} NGOs · {allPosts.length} updates
          </div>

          <h1>
            Everyone has something
            <br />
            they can{' '}
            <span className="gradient-text-orange">contribute</span>.
          </h1>

          <p>
            KAIA connects you with verified Filipino NGOs — donate,
            volunteer, follow, or simply spread awareness. Support
            happens in many forms.
          </p>

          <div className="hero-actions">
            <Link
              to="/discover"
              className="btn btn-white btn-lg btn-shimmer"
            >
              Discover NGOs
              <Icon name="arrow-right" size={16} />
            </Link>

            <Link
              to="/donate"
              className="btn btn-outline-white btn-lg"
            >
              Browse campaigns
            </Link>
          </div>

          <div className="hero-stats">
            <div className="hero-stat">
              <div className="hero-stat-value">6</div>
              <div className="hero-stat-label">Verified NGOs</div>
            </div>

            <div className="hero-stat">
              <div className="hero-stat-value">₱250k+</div>
              <div className="hero-stat-label">Raised this month</div>
            </div>

            <div className="hero-stat">
              <div className="hero-stat-value">1,200+</div>
              <div className="hero-stat-label">Volunteer hours</div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- FEED HEADER ---------- */}
      <div className="section-heading">
        <div>
          <h2>
            {isFollowingAnyone
              ? 'Your Feed'
              : 'Check out pages you follow'}
          </h2>

          <p
            style={{
              margin: '6px 0 0',
              fontSize: 14,
              color: 'var(--ink-500)',
            }}
          >
            {isFollowingAnyone
              ? 'Updates from the NGOs you follow.'
              : 'You’re not following anyone yet. Here are some pages you might like.'}
          </p>
        </div>

        <div className="section-heading-bar" />

        <Link
          to="/discover"
          className="btn btn-ghost btn-sm"
          style={{
            boxShadow: '0 3px 8px rgba(11, 18, 32, 0.10)',
          }}
        >
          {isFollowingAnyone ? 'Discover More' : 'Discover NGOs'}
        </Link>
      </div>

      {/* ---------- FEED ---------- */}
      {allPosts.length === 0 ? (
        <EmptyState
          icon="inbox"
          title={
            isFollowingAnyone
              ? 'No updates yet'
              : 'Your feed is waiting for you'
          }
          message={
            isFollowingAnyone
              ? 'The NGOs you follow haven’t shared any updates yet. Check back soon or discover more NGOs to follow.'
              : 'Follow NGOs to personalize your feed and stay updated on the causes you care about.'
          }
          action={
            <Link
              to="/discover"
              style={{
                marginTop: 16,
                display: 'inline-block',
              }}
            >
              <button
                className="btn btn-primary"
                style={{
                  boxShadow: '0 4px 10px rgba(11, 18, 32, 0.16)',
                }}
              >
                {isFollowingAnyone
                  ? 'Discover More NGOs'
                  : 'Explore NGOs'}
              </button>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-2">
          {allPosts.map((post) => {
            const ngo = getNgo(post.ngoId)

            if (!ngo) return null

            return (
              <article
                key={post.id}
                className="card card-hover"
              >
                <div
                  className="row"
                  style={{ marginBottom: 14 }}
                >
                  <img
                    src={ngo.logo}
                    alt={ngo.name}
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 10,
                      objectFit: 'cover',
                    }}
                  />

                  <div
                    style={{
                      flex: 1,
                      minWidth: 0,
                    }}
                  >
                    <Link
                      to={`/ngo/${ngo.id}`}
                      style={{
                        fontWeight: 700,
                        color: 'var(--ink-900)',
                        fontSize: 14,
                      }}
                    >
                      {ngo.name}
                    </Link>

                    <div style={{ marginTop: 2 }}>
                      <VerifiedBadge
                        verified={ngo.verified}
                      />
                    </div>
                  </div>
                </div>

                <p
                  style={{
                    margin: '0 0 14px',
                    fontSize: 14,
                    lineHeight: 1.55,
                  }}
                >
                  {post.content}
                </p>

                {post.image && (
                  <img
                    src={post.image}
                    alt=""
                    style={{
                      width: '100%',
                      borderRadius: 10,
                      marginBottom: 14,
                    }}
                  />
                )}

                <div
                  style={{
                    display: 'flex',
                    gap: 8,
                  }}
                >
                  <Link
                    to={`/ngo/${ngo.id}`}
                    style={{ flex: 1 }}
                  >
                    <button
                      className="btn btn-ghost btn-block btn-sm"
                      style={{
                        boxShadow:
                          '0 2px 6px rgba(11, 18, 32, 0.08)',
                      }}
                    >
                      View NGO
                    </button>
                  </Link>

                  <Link
                    to="/donate"
                    style={{ flex: 1 }}
                  >
                    <button
                      className="btn btn-accent btn-block btn-sm"
                      style={{
                        boxShadow:
                          '0 4px 10px rgba(11, 18, 32, 0.14)',
                      }}
                    >
                      <Icon name="heart" size={14} />
                      Donate
                    </button>
                  </Link>
                </div>
              </article>
            )
          })}
        </div>
      )}

      {/* ---------- SUGGESTED FOR YOU ---------- */}
      {suggestedNgos.length > 0 && (
        <section style={{ marginTop: 48 }}>
          <div className="section-heading">
            <div>
              <h2>Suggested for You</h2>

              <p
                style={{
                  margin: '6px 0 0',
                  fontSize: 14,
                  color: 'var(--ink-500)',
                }}
              >
                Discover NGOs and causes you might be interested in.
              </p>
            </div>

            <div className="section-heading-bar" />

            <Link
              to="/discover"
              className="btn btn-ghost btn-sm"
              style={{
                boxShadow:
                  '0 3px 8px rgba(11, 18, 32, 0.10)',
              }}
            >
              See All
            </Link>
          </div>

          <div className="grid grid-3">
            {suggestedNgos.map((ngo) => (
              <article
                key={ngo.id}
                className="card card-hover"
              >
                <div
                  className="row"
                  style={{ marginBottom: 14 }}
                >
                  <img
                    src={ngo.logo}
                    alt={ngo.name}
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: 10,
                      objectFit: 'cover',
                    }}
                  />

                  <div
                    style={{
                      flex: 1,
                      minWidth: 0,
                    }}
                  >
                    <Link
                      to={`/ngo/${ngo.id}`}
                      style={{
                        fontWeight: 700,
                        color: 'var(--ink-900)',
                        fontSize: 14,
                      }}
                    >
                      {ngo.name}
                    </Link>

                    <div style={{ marginTop: 2 }}>
                      <VerifiedBadge
                        verified={ngo.verified}
                      />
                    </div>
                  </div>
                </div>

                {ngo.description && (
                  <p
                    style={{
                      margin: '0 0 14px',
                      fontSize: 13,
                      lineHeight: 1.5,
                    }}
                  >
                    {ngo.description}
                  </p>
                )}

                <Link to={`/ngo/${ngo.id}`}>
                  <button
                    className="btn btn-ghost btn-block btn-sm"
                    style={{
                      boxShadow:
                        '0 2px 6px rgba(11, 18, 32, 0.08)',
                    }}
                  >
                    View NGO
                  </button>
                </Link>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}