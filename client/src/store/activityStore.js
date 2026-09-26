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
  checkins: [],
  volunteerIds: [],
  applications: [],
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

function makeVolunteerCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = 'KAIA-VOL-'
  for (let i = 0; i < 8; i++) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)]
  }
  return code
}

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
  getDonations: (userId) =>
    state.donations
      .filter((d) => d.userId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
  getTotalDonated: (userId) =>
    state.donations
      .filter((d) => d.userId === userId)
      .reduce((sum, d) => sum + d.amount, 0),
  getReceipt: (id) => state.receipts.find((r) => r.id === id),

  /* volunteer signups + application details */
  signUpForOpportunity: (userId, opportunityId, applicationDetails = {}) => {
    const exists = state.signups.find(
      (s) => s.userId === userId && s.opportunityId === opportunityId
    )
    if (exists) return null

    const hours = applicationDetails.hours || 0

    const signup = {
      userId,
      opportunityId,
      hours,
      status: 'registered',
      createdAt: new Date().toISOString(),
    }
    state.signups.push(signup)

    // store application details if provided
    if (applicationDetails.name) {
      state.applications.push({
        id: 'app-' + Date.now(),
        userId,
        opportunityId,
        name: applicationDetails.name,
        age: applicationDetails.age,
        phone: applicationDetails.phone,
        address: applicationDetails.address,
        emergencyName: applicationDetails.emergencyName,
        emergencyPhone: applicationDetails.emergencyPhone,
        skills: applicationDetails.skills || '',
        availability: applicationDetails.availability || [],
        submittedAt: new Date().toISOString(),
      })
    }

    // issue volunteer ID
    const volunteerId = {
      id: 'vid-' + Date.now(),
      code: makeVolunteerCode(),
      userId,
      opportunityId,
      issuedAt: new Date().toISOString(),
      revoked: false,
    }
    state.volunteerIds.push(volunteerId)

    save(state)
    return { signup, volunteerId }
  },

  getSignups: (userId) =>
    state.signups
      .filter((s) => s.userId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
  getTotalHours: (userId) =>
    state.signups
      .filter(
        (s) =>
          s.userId === userId &&
          (s.status === 'completed' || s.status === 'attended')
      )
      .reduce((sum, s) => sum + (s.hours || 0), 0),

  getApplication: (userId, opportunityId) =>
    state.applications.find(
      (a) => a.userId === userId && a.opportunityId === opportunityId
    ),
  getApplicationsForOpportunity: (opportunityId) =>
    state.applications.filter((a) => a.opportunityId === opportunityId),

  /* volunteer IDs */
  getVolunteerId: (userId, opportunityId) =>
    state.volunteerIds.find(
      (v) =>
        v.userId === userId &&
        v.opportunityId === opportunityId &&
        !v.revoked
    ),
  getVolunteerIdByCode: (code) =>
    state.volunteerIds.find((v) => v.code === code && !v.revoked),
  getVolunteerIds: (userId) =>
    state.volunteerIds.filter((v) => v.userId === userId && !v.revoked),

  /* check-ins */
  checkIn: (code, scannerNgoId) => {
    const volunteerId = state.volunteerIds.find(
      (v) => v.code === code && !v.revoked
    )
    if (!volunteerId) return { ok: false, reason: 'not_found' }

    const already = state.checkins.find(
      (c) => c.volunteerIdId === volunteerId.id
    )
    if (already) return { ok: false, reason: 'already_checked_in', volunteerId }

    const checkin = {
      id: 'ci-' + Date.now(),
      volunteerIdId: volunteerId.id,
      code: volunteerId.code,
      userId: volunteerId.userId,
      opportunityId: volunteerId.opportunityId,
      scannerNgoId: scannerNgoId || null,
      checkedInAt: new Date().toISOString(),
    }
    state.checkins.push(checkin)

    const signup = state.signups.find(
      (s) =>
        s.userId === volunteerId.userId &&
        s.opportunityId === volunteerId.opportunityId
    )
    if (signup) signup.status = 'attended'

    save(state)
    return { ok: true, checkin, volunteerId }
  },
  getCheckIns: (userId) => state.checkins.filter((c) => c.userId === userId),
  getCheckInsForOpportunity: (opportunityId) =>
    state.checkins.filter((c) => c.opportunityId === opportunityId),
  getCheckInsForNgo: (opportunityIds) =>
    state.checkins.filter((c) => opportunityIds.includes(c.opportunityId)),

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