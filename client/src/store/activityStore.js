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

/* =========================================================
   SEED DATA (demo content on first launch)
   ========================================================= */

const now = Date.now()
const days = (n) => new Date(now - n * 24 * 60 * 60 * 1000).toISOString()

const SEED_NOTIFICATIONS = [
  {
    id: 'seed-n-1',
    userId: 'u-1',
    type: 'system',
    title: 'Welcome to KAIA',
    body: 'Discover NGOs, donate, volunteer, and track your impact in one place.',
    link: '/discover',
    read: false,
    createdAt: days(0.5),
  },
  {
    id: 'seed-n-2',
    userId: 'u-1',
    type: 'signup',
    title: 'Volunteer ID issued',
    body: 'You are confirmed for "Relief Pack Assembly Day".',
    link: '/volunteer',
    read: false,
    createdAt: days(5),
  },
]

const SEED_COMMENTS = [
  {
    id: 'sc-1',
    postId: 'p-1',
    userId: 'u-1',
    userName: 'Demo Supporter',
    text: 'So inspiring! Just donated to this campaign.',
    createdAt: days(0.1),
  },
]

const SEED_FOLLOWS = [
  { userId: 'u-1', ngoId: 'ngo-1' },
  { userId: 'u-1', ngoId: 'ngo-3' },
  { userId: 'u-1', ngoId: 'ngo-4' },
]

const SEED_SIGNUPS = [
  {
    userId: 'u-1',
    opportunityId: 'vol-1',
    hours: 2,
    status: 'registered',
    createdAt: days(5),
  },
  {
    userId: 'u-1',
    opportunityId: 'vol-3',
    hours: 0,
    status: 'cancelled',
    cancellationReason: 'Schedule conflict',
    cancelledAt: days(2),
    createdAt: days(7),
  },
]

const SEED_VOLUNTEER_IDS = [
  {
    id: 'seed-vid-1',
    code: 'KAIA-VOL-DEMO2026',
    userId: 'u-1',
    opportunityId: 'vol-1',
    issuedAt: days(5),
    revoked: false,
  },
]

const SEED_APPLICATIONS = [
  {
    id: 'seed-app-1',
    userId: 'u-1',
    opportunityId: 'vol-1',
    name: 'Demo Supporter',
    age: 22,
    email: 'demo@kaia.ph',
    phone: '+63 917 123 4567',
    address: 'Quezon City, Metro Manila',
    emergencyName: 'Maria Dela Cruz',
    emergencyPhone: '+63 917 765 4321',
    skills: 'Event coordination',
    availability: ['Weekend mornings', 'Weekend afternoons'],
    submittedAt: days(5),
  },
  {
    id: 'seed-app-2',
    userId: 'u-fake-1',
    opportunityId: 'vol-1',
    name: 'Maria Santos',
    age: 25,
    email: 'maria.santos@example.com',
    phone: '+63 918 234 5678',
    address: 'Makati City, Metro Manila',
    emergencyName: 'Pedro Santos',
    emergencyPhone: '+63 918 876 5432',
    skills: 'Logistics, warehouse work',
    availability: ['Weekday evenings', 'Weekend mornings'],
    submittedAt: days(3),
  },
  {
    id: 'seed-app-3',
    userId: 'u-fake-2',
    opportunityId: 'vol-2',
    name: 'Jose Reyes',
    age: 30,
    email: 'jose.reyes@example.com',
    phone: '+63 919 345 6789',
    address: 'Pasig City, Metro Manila',
    emergencyName: 'Ana Reyes',
    emergencyPhone: '+63 919 987 6543',
    skills: 'Carpentry, painting',
    availability: ['Weekend mornings', 'Weekend afternoons'],
    submittedAt: days(2),
  },
]

function buildInitialState() {
  return {
    ...EMPTY,
    follows: [...SEED_FOLLOWS],
    signups: [...SEED_SIGNUPS],
    volunteerIds: [...SEED_VOLUNTEER_IDS],
    applications: [...SEED_APPLICATIONS],
    notifications: [...SEED_NOTIFICATIONS],
    comments: [...SEED_COMMENTS],
  }
}

function load() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return buildInitialState()
    const parsed = JSON.parse(raw)
    return { ...EMPTY, ...parsed }
  } catch {
    return buildInitialState()
  }
}

function save(state) {
  localStorage.setItem(KEY, JSON.stringify(state))
  window.dispatchEvent(new CustomEvent('kaia-store-change'))
}

let state = load()

function makeVolunteerCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = 'KAIA-VOL-'
  for (let i = 0; i < 8; i++) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)]
  }
  return code
}

export const activityStore = {
  getState: () => state,

  reset: () => {
    state = buildInitialState()
    save(state)
  },

  /* ---------- follows ---------- */
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

  /* ---------- donations ---------- */
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

  /* ---------- volunteer signups ---------- */
  signUpForOpportunity: (userId, opportunityId, applicationDetails = {}) => {
    const existing = state.signups.find(
      (s) => s.userId === userId && s.opportunityId === opportunityId
    )

    if (existing && existing.status !== 'cancelled') {
      return null
    }

    if (existing && existing.status === 'cancelled') {
      state.signups = state.signups.filter((s) => s !== existing)
      state.volunteerIds = state.volunteerIds.filter(
        (v) => !(v.userId === userId && v.opportunityId === opportunityId)
      )
    }

    const signup = {
      userId,
      opportunityId,
      hours: applicationDetails.hours || 0,
      status: 'registered',
      createdAt: new Date().toISOString(),
    }
    state.signups.push(signup)

    if (applicationDetails.name) {
      state.applications = state.applications.filter(
        (a) => !(a.userId === userId && a.opportunityId === opportunityId)
      )
      state.applications.push({
        id: 'app-' + Date.now(),
        userId,
        opportunityId,
        name: applicationDetails.name,
        age: applicationDetails.age,
        email: applicationDetails.email || '',
        phone: applicationDetails.phone,
        address: applicationDetails.address,
        emergencyName: applicationDetails.emergencyName,
        emergencyPhone: applicationDetails.emergencyPhone,
        skills: applicationDetails.skills || '',
        availability: applicationDetails.availability || [],
        submittedAt: new Date().toISOString(),
      })
    }

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

  getActiveSignups: (userId) =>
    state.signups.filter(
      (s) => s.userId === userId && s.status !== 'cancelled'
    ),

  getCancelledSignups: (userId) =>
    state.signups.filter(
      (s) => s.userId === userId && s.status === 'cancelled'
    ),

  getSignup: (userId, opportunityId) =>
    state.signups.find(
      (s) => s.userId === userId && s.opportunityId === opportunityId
    ),

  wasCancelled: (userId, opportunityId) => {
    const s = state.signups.find(
      (x) => x.userId === userId && x.opportunityId === opportunityId
    )
    return s && s.status === 'cancelled' ? s : null
  },

  getTotalHours: (userId) =>
    state.signups
      .filter(
        (s) =>
          s.userId === userId &&
          (s.status === 'completed' || s.status === 'attended')
      )
      .reduce((sum, s) => sum + (s.hours || 0), 0),

  cancelVolunteer: (userId, opportunityId, reason) => {
    const signup = state.signups.find(
      (s) => s.userId === userId && s.opportunityId === opportunityId
    )
    if (!signup) return { ok: false, reason: 'not_found' }
    if (signup.status === 'cancelled')
      return { ok: false, reason: 'already_cancelled' }

    signup.status = 'cancelled'
    signup.cancelledAt = new Date().toISOString()
    signup.cancellationReason = reason

    const vid = state.volunteerIds.find(
      (v) =>
        v.userId === userId &&
        v.opportunityId === opportunityId &&
        !v.revoked
    )
    if (vid) vid.revoked = true

    save(state)
    return { ok: true }
  },

  getCancellation: (userId, opportunityId) => {
    const signup = state.signups.find(
      (s) => s.userId === userId && s.opportunityId === opportunityId
    )
    if (signup && signup.status === 'cancelled') {
      return {
        reason: signup.cancellationReason,
        at: signup.cancelledAt,
      }
    }
    return null
  },

  /* ---------- applications ---------- */
  getApplication: (userId, opportunityId) =>
    state.applications.find(
      (a) => a.userId === userId && a.opportunityId === opportunityId
    ),

  getApplicationsForOpportunity: (opportunityId) =>
    state.applications.filter((a) => a.opportunityId === opportunityId),

  getApplicationsForNgo: (opportunityIds) => {
    return state.applications
      .filter((a) => opportunityIds.includes(a.opportunityId))
      .map((a) => {
        const signup = state.signups.find(
          (s) =>
            s.userId === a.userId && s.opportunityId === a.opportunityId
        )
        const checkin = state.checkins.find(
          (c) =>
            c.userId === a.userId && c.opportunityId === a.opportunityId
        )
        return {
          ...a,
          status: checkin ? 'attended' : signup?.status || 'registered',
          cancellationReason: signup?.cancellationReason || null,
          cancelledAt: signup?.cancelledAt || null,
          checkedInAt: checkin?.checkedInAt || null,
        }
      })
      .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
  },

  /* ---------- volunteer IDs ---------- */
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
    state.volunteerIds.filter(
      (v) => v.userId === userId && !v.revoked
    ),

  /* ---------- check-ins ---------- */
  checkIn: (code, scannerNgoId) => {
    const volunteerId = state.volunteerIds.find(
      (v) => v.code === code && !v.revoked
    )
    if (!volunteerId) return { ok: false, reason: 'not_found' }

    const already = state.checkins.find(
      (c) => c.volunteerIdId === volunteerId.id
    )
    if (already)
      return { ok: false, reason: 'already_checked_in', volunteerId }

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

  /* ---------- saves ---------- */
  isSaved: (userId, campaignId) =>
    state.saves.some(
      (s) => s.userId === userId && s.campaignId === campaignId
    ),
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

  /* ---------- NGO dashboard creations ---------- */
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

  /* ---------- notifications ---------- */
  addNotification: (
    userId,
    { type = 'system', title, body = '', link = null }
  ) => {
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
    state.notifications = state.notifications.filter(
      (n) => n.userId !== userId
    )
    save(state)
  },

  /* ---------- comments ---------- */
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