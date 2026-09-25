const KEY = 'kaia_activity_v1'

const EMPTY = {
  follows: [],
  donations: [],
  signups: [],
  saves: [],
  extraPosts: [],
  extraCampaigns: [],
  extraOpportunities: [],
  notifications: [],
  comments: [],
  receipts: [],
}

const SEED_NOTIFICATIONS = [
  {
    id: 'seed-n-1',
    userId: 'u-1',
    type: 'system',
    title: 'Welcome to KAIA',
    body: 'Discover NGOs, donate, volunteer, and track your impact in one place.',
    link: '/discover',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: 'seed-n-2',
    userId: 'u-1',
    type: 'follow',
    title: 'You followed Angat Buhay Foundation',
    body: 'Their posts will now appear in your Home feed.',
    link: '/ngo/ngo-1',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
  },
]

const SEED_COMMENTS = [
  {
    id: 'sc-1',
    postId: 'p-1',
    userId: 'u-1',
    userName: 'Demo Supporter',
    text: 'So inspiring! Just donated to this campaign.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
]

function load() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) {
      return {
        ...EMPTY,
        notifications: [...SEED_NOTIFICATIONS],
        comments: [...SEED_COMMENTS],
      }
    }
    const parsed = JSON.parse(raw)
    return {
      ...EMPTY,
      ...parsed,
      notifications:
        parsed.notifications && parsed.notifications.length > 0
          ? parsed.notifications
          : [...SEED_NOTIFICATIONS],
      comments:
        parsed.comments && parsed.comments.length > 0
          ? parsed.comments
          : [...SEED_COMMENTS],
    }
  } catch {
    return {
      ...EMPTY,
      notifications: [...SEED_NOTIFICATIONS],
      comments: [...SEED_COMMENTS],
    }
  }
}

function save(state) {
  localStorage.setItem(KEY, JSON.stringify(state))
  window.dispatchEvent(new CustomEvent('kaia-store-change'))
}

let state = load()

export const activityStore = {
  getState: () => state,

  reset: () => {
    state = {
      ...EMPTY,
      notifications: [...SEED_NOTIFICATIONS],
      comments: [...SEED_COMMENTS],
    }
    save(state)
  },

  /* follows */
  isFollowing: (userId, ngoId) =>
    state.follows.some((f) => f.userId === userId && f.ngoId === ngoId),
  toggleFollow: (userId, ngoId) => {
    const exists = state.follows.find(
      (f) => f.userId === userId && f.ngoId === ngoId
    )
    if (exists) state.follows = state.follows.filter((f) => f !== exists)
    else state.follows.push({ userId, ngoId })
    save(state)
    return !exists
  },
  getFollowedNgoIds: (userId) =>
    state.follows.filter((f) => f.userId === userId).map((f) => f.ngoId),

  /* donations */
  donate: (userId, campaignId, amount) => {
    const ref = 'KA-' + Date.now().toString(36).toUpperCase()
    const receipt = {
      id: 'r-' + Date.now(),
      userId,
      campaignId,
      amount,
      ref,
      createdAt: new Date().toISOString(),
    }
    state.donations.push({
      userId,
      campaignId,
      amount,
      ref,
      createdAt: new Date().toISOString(),
    })
    state.receipts.push(receipt)
    save(state)
    return receipt
  },
  getDonations: (userId) => state.donations.filter((d) => d.userId === userId),
  getTotalDonated: (userId) =>
    state.donations
      .filter((d) => d.userId === userId)
      .reduce((sum, d) => sum + d.amount, 0),
  getReceipt: (id) => state.receipts.find((r) => r.id === id),

  /* volunteer */
  signUpForOpportunity: (userId, opportunityId, hours = 0) => {
    const exists = state.signups.find(
      (s) => s.userId === userId && s.opportunityId === opportunityId
    )
    if (exists) return false
    state.signups.push({
      userId,
      opportunityId,
      hours,
      status: 'registered',
      createdAt: new Date().toISOString(),
    })
    save(state)
    return true
  },
  getSignups: (userId) => state.signups.filter((s) => s.userId === userId),
  getTotalHours: (userId) =>
    state.signups
      .filter((s) => s.userId === userId && s.status === 'completed')
      .reduce((sum, s) => sum + (s.hours || 0), 0),

  /* saves */
  isSaved: (userId, campaignId) =>
    state.saves.some((s) => s.userId === userId && s.campaignId === campaignId),
  toggleSave: (userId, campaignId) => {
    const exists = state.saves.find(
      (s) => s.userId === userId && s.campaignId === campaignId
    )
    if (exists) state.saves = state.saves.filter((s) => s !== exists)
    else state.saves.push({ userId, campaignId })
    save(state)
    return !exists
  },
  getSaved: (userId) => state.saves.filter((s) => s.userId === userId),

  /* NGO dashboard creations */
  createPost: (post) => {
    state.extraPosts.push({
      id: `p-new-${Date.now()}`,
      createdAt: new Date().toISOString(),
      ...post,
    })
    save(state)
  },
  createCampaign: (campaign) => {
    state.extraCampaigns.push({
      id: `camp-new-${Date.now()}`,
      raised: 0,
      donorCount: 0,
      daysLeft: 60,
      status: 'active',
      ...campaign,
    })
    save(state)
  },
  createOpportunity: (opp) => {
    state.extraOpportunities.push({
      id: `vol-new-${Date.now()}`,
      registered: 0,
      ...opp,
    })
    save(state)
  },
  getExtraPosts: () => state.extraPosts,
  getExtraCampaigns: () => state.extraCampaigns,
  getExtraOpportunities: () => state.extraOpportunities,

  /* notifications */
  addNotification: (userId, { type = 'system', title, body = '', link = null }) => {
    state.notifications.unshift({
      id: `n-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      userId,
      type,
      title,
      body,
      link,
      read: false,
      createdAt: new Date().toISOString(),
    })
    if (state.notifications.length > 50) {
      state.notifications = state.notifications.slice(0, 50)
    }
    save(state)
  },
  getNotifications: (userId) =>
    state.notifications.filter((n) => n.userId === userId),
  getUnreadCount: (userId) =>
    state.notifications.filter((n) => n.userId === userId && !n.read).length,
  markAsRead: (id) => {
    const n = state.notifications.find((x) => x.id === id)
    if (n && !n.read) {
      n.read = true
      save(state)
    }
  },
  markAllAsRead: (userId) => {
    let changed = false
    state.notifications.forEach((n) => {
      if (n.userId === userId && !n.read) {
        n.read = true
        changed = true
      }
    })
    if (changed) save(state)
  },
  clearNotifications: (userId) => {
    state.notifications = state.notifications.filter((n) => n.userId !== userId)
    save(state)
  },

  /* comments */
  getComments: (postId) => state.comments.filter((c) => c.postId === postId),
  addComment: (postId, userId, userName, text) => {
    if (!text.trim()) return
    state.comments.push({
      id: `c-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      postId,
      userId,
      userName,
      text: text.trim(),
      createdAt: new Date().toISOString(),
    })
    save(state)
  },
  getCommentCount: (postId) =>
    state.comments.filter((c) => c.postId === postId).length,
}