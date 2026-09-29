import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CAMPAIGNS } from '../data/campaigns'
import { NGOS } from '../data/ngos'
import { useActivity } from '../store/useActivity'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/Toast'
import StatusTag from '../components/StatusTag'
import ProgressBar from '../components/ProgressBar'
import SavedButton from '../components/SavedButton'
import Icon from '../components/Icon'

const CATEGORY_OPTIONS = [
  'All categories',
  'Education',
  'Children & Youth',
  'Environment',
  'Animal Welfare',
  'Health',
  'Disaster Relief',
  'Community Development',
]

const SORT_OPTIONS = [
  { key: 'featured', label: 'Featured' },
  { key: 'urgent', label: 'Most Urgent' },
  { key: 'funded', label: 'Most Funded' },
  { key: 'ending', label: 'Ending Soon' },
  { key: 'newest', label: 'Newest' },
  { key: 'supporters', label: 'Most Supporters' },
]

const STATUS_OPTIONS = [
  { key: 'all', label: 'All' },
  { key: 'urgent', label: 'Urgent' },
  { key: 'active', label: 'Active' },
  { key: 'almost_complete', label: 'Almost Complete' },
]

const STATUS_PRIORITY = {
  urgent: 0,
  almost_complete: 1,
  active: 2,
  completed: 3,
}

/* fake recent donations for the live ticker (demo data) */
const LIVE_DONATIONS = [
  { name: 'Maria S.', amount: 500, campaign: 'School Supplies for 500 Kids' },
  { name: 'Anonymous', amount: 1000, campaign: 'Relief Packs for Typhoon Evacuees' },
  { name: 'Jose R.', amount: 2500, campaign: 'Coastal Cleanup Drive' },
  { name: 'Andrea C.', amount: 500, campaign: 'Emergency Medical Supplies' },
  { name: 'Carlo M.', amount: 100, campaign: 'Mangrove Forest Restoration' },
  { name: 'Liza T.', amount: 1000, campaign: 'Rescue Van Fuel Fund' },
  { name: 'Anonymous', amount: 250, campaign: 'School Supplies for 500 Kids' },
]

/* fake top supporters this week */
const TOP_SUPPORTERS = [
  { name: 'Miguel Reyes', amount: 15500, count: 8 },
  { name: 'Ana Villanueva', amount: 12000, count: 6 },
  { name: 'Katrina Lim', amount: 9800, count: 5 },
  { name: 'Ramon Cruz', amount: 7500, count: 4 },
  { name: 'Sofia Tan', amount: 6200, count: 7 },
]

export default function Donate() {
  const store = useActivity()
  const { user } = useAuth()
  const toast = useToast()

  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All categories')
  const [status, setStatus] = useState('all')
  const [sort, setSort] = useState('featured')
  const [view, setView] = useState('grid')
  const [sortOpen, setSortOpen] = useState(false)
  const [visibleCount, setVisibleCount] = useState(6)
  const [tickerIndex, setTickerIndex] = useState(0)

  const getNgo = (id) => NGOS.find((n) => n.id === id)

  const extraVersion = store.getExtraCampaigns().length

  /* ---------- rotating live ticker ---------- */
  useEffect(() => {
    const t = setInterval(() => {
      setTickerIndex((i) => (i + 1) % LIVE_DONATIONS.length)
    }, 3800)
    return () => clearInterval(t)
  }, [])

  /* ---------- urgent spotlight ---------- */
  const urgentSpotlight = useMemo(() => {
    const allCampaigns = [...CAMPAIGNS, ...store.getExtraCampaigns()]
    const urgents = allCampaigns
      .filter((c) => c.status === 'urgent')
      .sort((a, b) => a.daysLeft - b.daysLeft)
    return urgents[0] || null
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [extraVersion])

  /* ---------- featured NGO (highest supporter count) ---------- */
  const featuredNgo = useMemo(() => {
    return [...NGOS].sort((a, b) => b.supporterCount - a.supporterCount)[0]
  }, [])

  /* ---------- your personal stats ---------- */
  const myStats = useMemo(() => {
    if (!user) return null
    const donations = store.getDonations(user.id)
    const total = donations.reduce((s, d) => s + d.amount, 0)
    const uniqueCampaigns = new Set(donations.map((d) => d.campaignId)).size
    const saves = store.getSaved(user.id).length
    return {
      total,
      count: donations.length,
      uniqueCampaigns,
      saves,
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  /* ---------- filtered + sorted ---------- */
  const filtered = useMemo(() => {
    const allCampaigns = [...CAMPAIGNS, ...store.getExtraCampaigns()]
    let list = [...allCampaigns]

    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter((c) => {
        const ngo = getNgo(c.ngoId)
        return (
          c.title.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q) ||
          (ngo && ngo.name.toLowerCase().includes(q))
        )
      })
    }

    if (category !== 'All categories') {
      list = list.filter((c) => c.category === category)
    }

    if (status !== 'all') {
      list = list.filter((c) => c.status === status)
    }

    const sorters = {
      featured: (a, b) => {
        const pa = STATUS_PRIORITY[a.status] ?? 99
        const pb = STATUS_PRIORITY[b.status] ?? 99
        if (pa !== pb) return pa - pb
        return a.daysLeft - b.daysLeft
      },
      urgent: (a, b) => a.daysLeft - b.daysLeft,
      funded: (a, b) => b.raised - a.raised,
      ending: (a, b) => a.daysLeft - b.daysLeft,
      newest: (a, b) => {
        const da = new Date(a.createdAt || 0).getTime()
        const db = new Date(b.createdAt || 0).getTime()
        return db - da
      },
      supporters: (a, b) => b.donorCount - a.donorCount,
    }

    return list.sort(sorters[sort] || sorters.featured)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, category, status, sort, extraVersion])

  const visible = filtered.slice(0, visibleCount)
  const hasMore = filtered.length > visibleCount

  /* ---------- share ---------- */
  function handleShare(campaign, e) {
    e.preventDefault()
    e.stopPropagation()
    const url = `${window.location.origin}/campaign/${campaign.id}`
    if (navigator.share) {
      navigator
        .share({ title: campaign.title, url })
        .catch(() => {})
    } else {
      navigator.clipboard.writeText(url)
      toast.push('Link copied to clipboard', 'success', 1800)
    }
  }

  const activeSortLabel =
    SORT_OPTIONS.find((o) => o.key === sort)?.label || 'Featured'

  const currentTicker = LIVE_DONATIONS[tickerIndex]

  return (
    <div className="container">
      {/* ---------- PAGE HEADER ---------- */}
      <div className="page-header">
        <h1 className="page-title">Donation campaigns</h1>
        <p className="page-subtitle">
          Transparent fundraising with visible progress. Every peso counts.
        </p>
      </div>

      {/* ---------- URGENT SPOTLIGHT ---------- */}
      {urgentSpotlight && (
        <Link
          to={`/campaign/${urgentSpotlight.id}`}
          className="urgent-spotlight"
        >
          <div className="urgent-spotlight-image">
            <img src={urgentSpotlight.image} alt="" />
            <span className="urgent-spotlight-badge">
              <Icon name="bell" size={12} />
              Urgent
            </span>
          </div>
          <div className="urgent-spotlight-body">
            <div className="urgent-spotlight-eyebrow">
              Most urgent right now
            </div>
            <h3 className="urgent-spotlight-title">
              {urgentSpotlight.title}
            </h3>
            <p className="urgent-spotlight-desc">
              {urgentSpotlight.description}
            </p>
            <div className="urgent-spotlight-progress">
              <ProgressBar
                value={urgentSpotlight.raised}
                goal={urgentSpotlight.goal}
              />
            </div>
            <div className="urgent-spotlight-footer">
              <span className="urgent-spotlight-meta">
                <Icon name="calendar" size={13} />
                {urgentSpotlight.daysLeft} days left
              </span>
              <span className="urgent-spotlight-cta">
                Donate now <Icon name="arrow-right" size={14} />
              </span>
            </div>
          </div>
        </Link>
      )}

      {/* ---------- TOOLBAR ---------- */}
      <div className="donate-toolbar">
        <div className="search">
          <span className="search-icon">
            <Icon name="search" size={16} />
          </span>
          <input
            placeholder="Search campaigns or NGOs…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="sort-dropdown">
          <button
            className="sort-trigger"
            onClick={() => setSortOpen((o) => !o)}
            type="button"
          >
            <span className="sort-label">Sort:</span>
            <span className="sort-value">{activeSortLabel}</span>
            <Icon name="chevron-down" size={14} />
          </button>

          {sortOpen && (
            <>
              <div
                className="sort-backdrop"
                onClick={() => setSortOpen(false)}
              />
              <div className="sort-menu">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.key}
                    className={`sort-option ${
                      sort === opt.key ? 'active' : ''
                    }`}
                    onClick={() => {
                      setSort(opt.key)
                      setSortOpen(false)
                    }}
                    type="button"
                  >
                    {opt.label}
                    {sort === opt.key && (
                      <Icon
                        name="check"
                        size={14}
                        color="var(--blue-700)"
                      />
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="view-toggle">
          <button
            className={`view-btn ${view === 'grid' ? 'active' : ''}`}
            onClick={() => setView('grid')}
            title="Grid view"
            type="button"
          >
            <Icon name="grid" size={16} />
          </button>
          <button
            className={`view-btn ${view === 'list' ? 'active' : ''}`}
            onClick={() => setView('list')}
            title="List view"
            type="button"
          >
            <Icon name="list" size={16} />
          </button>
        </div>
      </div>

      {/* ---------- CATEGORY PILLS ---------- */}
      <div className="filters">
        {CATEGORY_OPTIONS.map((c) => (
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

      {/* ---------- STATUS PILLS ---------- */}
      <div className="filters">
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s.key}
            className={`pill ${status === s.key ? 'is-active' : ''}`}
            onClick={() => setStatus(s.key)}
            type="button"
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* ---------- RESULTS COUNT ---------- */}
      <div className="donate-results">
        <span>
          {filtered.length}{' '}
          {filtered.length === 1 ? 'campaign' : 'campaigns'} found
        </span>
        {(search || category !== 'All categories' || status !== 'all') && (
          <button
            className="donate-clear"
            onClick={() => {
              setSearch('')
              setCategory('All categories')
              setStatus('all')
            }}
            type="button"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* ---------- MAIN + SIDEBAR LAYOUT ---------- */}
      <div className="donate-layout">
        {/* LEFT — CAMPAIGN GRID / LIST */}
        <div className="donate-main">
          {filtered.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">
                <Icon name="search" size={40} strokeWidth={1.5} />
              </div>
              <div className="empty-title">No campaigns match</div>
              <div>Try a different search or filter.</div>
            </div>
          ) : (
            <div
              className={view === 'grid' ? 'grid grid-3' : 'donate-list'}
            >
              {visible.map((c) => {
                const ngo = getNgo(c.ngoId)
                return (
                  <div
                    key={c.id}
                    className={`campaign-card ${
                      view === 'list' ? 'campaign-card-list' : ''
                    }`}
                  >
                    <Link
                      to={`/campaign/${c.id}`}
                      className="campaign-card-link"
                    >
                      <div className="campaign-card-media">
                        <img
                          src={c.image}
                          alt=""
                          onError={(e) => {
                            e.target.src = `https://placehold.co/800x400/eff4ff/1e40d8?text=${encodeURIComponent(
                              c.title
                            )}`
                          }}
                        />
                        <div className="campaign-card-badges">
                          <StatusTag status={c.status} />
                        </div>
                        <div className="campaign-card-hover-actions">
                          <button
                            type="button"
                            className="campaign-hover-btn"
                            onClick={(e) => handleShare(c, e)}
                            title="Share"
                          >
                            <Icon name="share" size={14} color="white" />
                          </button>
                        </div>
                      </div>

                      <div className="campaign-card-body">
                        <div className="campaign-card-title">
                          {c.title}
                        </div>
                        <div className="campaign-card-ngo">
                          {ngo?.name}
                        </div>

                        <div className="campaign-card-progress">
                          <ProgressBar value={c.raised} goal={c.goal} />
                        </div>

                        <div className="campaign-card-stats">
                          <span className="row" style={{ gap: 5 }}>
                            <Icon name="users" size={13} />
                            {c.donorCount}
                          </span>
                          <span className="row" style={{ gap: 5 }}>
                            <Icon name="calendar" size={13} />
                            {c.daysLeft}d left
                          </span>
                        </div>
                      </div>
                    </Link>

                    <div className="campaign-card-actions">
                      <SavedButton campaignId={c.id} />
                      <Link
                        to={`/campaign/${c.id}`}
                        className="btn btn-accent btn-sm campaign-donate-btn"
                      >
                        <Icon name="heart" size={13} /> Donate
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {hasMore && (
            <div className="donate-load-more">
              <button
                className="btn btn-ghost btn-lg"
                onClick={() => setVisibleCount((n) => n + 6)}
                type="button"
              >
                Load more campaigns
                <Icon name="chevron-down" size={16} />
              </button>
            </div>
          )}
        </div>

        {/* RIGHT — SIDEBAR */}
        <aside className="donate-sidebar">
          {/* 1. LIVE TICKER */}
          <div className="sidebar-card">
            <div className="sidebar-card-header">
              <h3 className="sidebar-card-title">
                <span className="live-dot" />
                Live donations
              </h3>
            </div>
            <div className="live-ticker">
              <div key={tickerIndex} className="live-ticker-item">
                <div className="live-ticker-avatar">
                  {currentTicker.name.charAt(0)}
                </div>
                <div className="live-ticker-body">
                  <div className="live-ticker-line">
                    <strong>{currentTicker.name}</strong> donated{' '}
                    <span className="live-ticker-amount">
                      ₱{currentTicker.amount.toLocaleString()}
                    </span>
                  </div>
                  <div className="live-ticker-campaign">
                    to {currentTicker.campaign}
                  </div>
                </div>
              </div>
              <div className="live-ticker-dots">
                {LIVE_DONATIONS.map((_, i) => (
                  <span
                    key={i}
                    className={`live-ticker-dot ${
                      i === tickerIndex ? 'active' : ''
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* 2. MATCHING CHALLENGE */}
          <div className="matching-card">
            <div className="matching-badge">
              <Icon name="trending" size={12} />
              Double your impact
            </div>
            <h3 className="matching-title">
              Every peso matched until March 31
            </h3>
            <p className="matching-desc">
              Angat Buhay Foundation will match all donations to education
              campaigns — up to ₱500,000.
            </p>
            <Link
              to="/campaign/camp-1"
              className="btn btn-white btn-sm matching-cta"
            >
              Donate to a matched campaign
              <Icon name="arrow-right" size={13} />
            </Link>
          </div>

          {/* 3. TOP SUPPORTERS */}
          <div className="sidebar-card">
            <div className="sidebar-card-header">
              <h3 className="sidebar-card-title">Top supporters</h3>
              <span className="sidebar-card-link">This week</span>
            </div>
            <div className="sidebar-list">
              {TOP_SUPPORTERS.map((s, i) => (
                <div key={s.name} className="leaderboard-item">
                  <div
                    className={`leaderboard-rank ${
                      i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : ''
                    }`}
                  >
                    {i + 1}
                  </div>
                  <div className="leaderboard-info">
                    <div className="leaderboard-name">{s.name}</div>
                    <div className="leaderboard-meta">
                      {s.count} {s.count === 1 ? 'donation' : 'donations'}
                    </div>
                  </div>
                  <div className="leaderboard-amount">
                    ₱{s.amount.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4. FEATURED NGO */}
          {featuredNgo && (
            <div className="sidebar-card">
              <div className="sidebar-card-header">
                <h3 className="sidebar-card-title">Featured NGO</h3>
              </div>
              <Link
                to={`/ngo/${featuredNgo.id}`}
                className="featured-ngo"
              >
                <div className="featured-ngo-cover">
                  <img src={featuredNgo.cover} alt="" />
                  <div className="featured-ngo-overlay" />
                </div>
                <div className="featured-ngo-body">
                  <img
                    src={featuredNgo.logo}
                    alt=""
                    className="featured-ngo-logo"
                  />
                  <div className="featured-ngo-name">
                    {featuredNgo.name}
                    {featuredNgo.verified && (
                      <span className="featured-ngo-verified">
                        <Icon name="check" size={10} />
                      </span>
                    )}
                  </div>
                  <div className="featured-ngo-tagline">
                    {featuredNgo.tagline}
                  </div>
                  <div className="featured-ngo-stats">
                    <Icon name="users" size={12} />
                    {featuredNgo.supporterCount.toLocaleString()} supporters
                  </div>
                </div>
              </Link>
            </div>
          )}

          {/* 5. YOUR IMPACT (logged in only) */}
          {user && myStats && (
            <div className="sidebar-card">
              <div className="sidebar-card-header">
                <h3 className="sidebar-card-title">Your impact</h3>
                <Link to="/my-kaia" className="sidebar-card-link">
                  View all
                </Link>
              </div>
              <div className="my-impact-grid">
                <div className="my-impact-cell">
                  <div className="my-impact-value">
                    ₱{myStats.total.toLocaleString()}
                  </div>
                  <div className="my-impact-label">Donated</div>
                </div>
                <div className="my-impact-cell">
                  <div className="my-impact-value">{myStats.count}</div>
                  <div className="my-impact-label">Gifts</div>
                </div>
                <div className="my-impact-cell">
                  <div className="my-impact-value">
                    {myStats.uniqueCampaigns}
                  </div>
                  <div className="my-impact-label">Causes</div>
                </div>
                <div className="my-impact-cell">
                  <div className="my-impact-value">{myStats.saves}</div>
                  <div className="my-impact-label">Saved</div>
                </div>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}