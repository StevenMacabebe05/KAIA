const KEY = 'kaia_activity_v1'

const EMPTY = {
  follows: [],
  donations: [],
  signups: [],
  saves: [],
  extraPosts: [],
  extraCampaigns: [],
  extraOpportunities: [],
}

function load() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? { ...EMPTY, ...JSON.parse(raw) } : { ...EMPTY }
  } catch {
    return { ...EMPTY }
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
    state = { ...EMPTY }
    save(state)
  },

  isFollowing: (userId, ngoId) =>
    state.follows.some((f) => f.userId === userId && f.ngoId === ngoId),
  toggleFollow: (userId, ngoId) => {
    const exists = state.follows.find(
      (f) => f.userId === userId && f.ngoId === ngoId
    )
    if (exists) {
      state.follows = state.follows.filter((f) => f !== exists)
    } else {
      state.follows.push({ userId, ngoId })
    }
    save(state)
    return !exists
  },
  getFollowedNgoIds: (userId) =>
    state.follows.filter((f) => f.userId === userId).map((f) => f.ngoId),

  donate: (userId, campaignId, amount) => {
    state.donations.push({
      userId,
      campaignId,
      amount,
      createdAt: new Date().toISOString(),
    })
    save(state)
  },
  getDonations: (userId) =>
    state.donations.filter((d) => d.userId === userId),
  getTotalDonated: (userId) =>
    state.donations
      .filter((d) => d.userId === userId)
      .reduce((sum, d) => sum + d.amount, 0),

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

  isSaved: (userId, campaignId) =>
    state.saves.some((s) => s.userId === userId && s.campaignId === campaignId),
  toggleSave: (userId, campaignId) => {
    const exists = state.saves.find(
      (s) => s.userId === userId && s.campaignId === campaignId
    )
    if (exists) {
      state.saves = state.saves.filter((s) => s !== exists)
    } else {
      state.saves.push({ userId, campaignId })
    }
    save(state)
    return !exists
  },
  getSaved: (userId) => state.saves.filter((s) => s.userId === userId),

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
}