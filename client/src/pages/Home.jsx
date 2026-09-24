import { Link } from 'react-router-dom'
import { POSTS } from '../data/posts'
import { NGOS } from '../data/ngos'
import { useActivity } from '../store/useActivity'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/Toast'
import EmptyState from '../components/EmptyState'
import VerifiedBadge from '../components/VerifiedBadge'
import Icon from '../components/Icon'

export default function Home() {
  const { user } = useAuth()
  const toast = useToast()
  const store = useActivity()
  const followedIds = user ? store.getFollowedNgoIds(user.id) : []
  const allPosts = [...POSTS, ...store.getExtraPosts()]
    .filter((p) => followedIds.includes(p.ngoId))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  const getNgo = (id) => NGOS.find((n) => n.id === id)

  return (
    <div className="container">
      <section className="hero">
        <h1>Everyone has something they can contribute.</h1>
        <p>
          KAIA connects you with verified Filipino NGOs — donate, volunteer,
          follow, or simply spread awareness. Support happens in many forms.
        </p>
        <div className="hero-actions">
          <Link to="/discover" className="btn btn-white btn-lg">
            Discover NGOs
            <Icon name="arrow-right" size={16} />
          </Link>
          <Link to="/donate" className="btn btn-outline-white btn-lg">
            Browse campaigns
          </Link>
        </div>
      </section>

      <div className="page-header">
        <h2 className="page-title">From NGOs you follow</h2>
        <p className="page-subtitle">
          Announcements, campaigns, and impact updates in one feed.
        </p>
      </div>

      {allPosts.length === 0 ? (
        <EmptyState
          icon="inbox"
          title="Your feed is empty"
          message="Follow NGOs to see their updates here."
          action={
            <Link to="/discover" style={{ marginTop: 16, display: 'inline-block' }}>
              <button className="btn btn-primary">Discover NGOs</button>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-2">
          {allPosts.map((post) => {
            const ngo = getNgo(post.ngoId)
            if (!ngo) return null
            return (
              <article key={post.id} className="card card-hover">
                <div className="row" style={{ marginBottom: 14 }}>
                  <img
                    src={ngo.logo}
                    alt={ngo.name}
                    style={{ width: 44, height: 44, borderRadius: 10, objectFit: 'cover' }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Link
                      to={`/ngo/${ngo.id}`}
                      style={{ fontWeight: 700, color: 'var(--ink-900)', fontSize: 14 }}
                    >
                      {ngo.name}
                    </Link>
                    <div style={{ marginTop: 2 }}>
                      <VerifiedBadge verified={ngo.verified} />
                    </div>
                  </div>
                </div>

                <p style={{ margin: '0 0 14px', fontSize: 14, lineHeight: 1.55 }}>
                  {post.content}
                </p>

                {post.image && (
                  <img
                    src={post.image}
                    alt=""
                    style={{ width: '100%', borderRadius: 10, marginBottom: 14 }}
                  />
                )}

                <div style={{ display: 'flex', gap: 8 }}>
                  <Link to={`/ngo/${ngo.id}`} style={{ flex: 1 }}>
                    <button className="btn btn-ghost btn-block btn-sm">View NGO</button>
                  </Link>
                  <Link to="/donate" style={{ flex: 1 }}>
                    <button className="btn btn-accent btn-block btn-sm">
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
    </div>
  )
}