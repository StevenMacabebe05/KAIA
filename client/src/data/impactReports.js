export const IMPACT_REPORTS = {
  'ngo-1': {
    since: 2018,
    tagline: 'Since 2018, we\u2019ve reached more than 4,200 children.',
    thisYear: {
      meals: 12480,
      kits: 512,
      volunteers: 342,
      hours: 3410,
    },
    history: [
      { month: 'Aug', meals: 780, kits: 32, volunteers: 21 },
      { month: 'Sep', meals: 950, kits: 40, volunteers: 26 },
      { month: 'Oct', meals: 1120, kits: 48, volunteers: 34 },
      { month: 'Nov', meals: 1380, kits: 62, volunteers: 41 },
      { month: 'Dec', meals: 1650, kits: 78, volunteers: 52 },
      { month: 'Jan', meals: 2100, kits: 94, volunteers: 61 },
    ],
    milestones: [
      { date: '2026-01-10', title: '500 school kits distributed in QC', image: '/images/posts/post-1.jpg' },
      { date: '2025-11-22', title: 'Community kitchen opened in Bagong Silangan', image: '/images/posts/post-3.jpg' },
      { date: '2025-08-14', title: '1,000th hot meal served', image: '/images/posts/post-5.jpg' },
    ],
  },
  'ngo-3': {
    since: 2015,
    tagline: 'Over 8,000 rescues and 3,200 successful adoptions.',
    thisYear: { meals: 3420, kits: 87, volunteers: 156, hours: 1820 },
    history: [
      { month: 'Aug', meals: 380, kits: 8, volunteers: 18 },
      { month: 'Sep', meals: 420, kits: 12, volunteers: 22 },
      { month: 'Oct', meals: 510, kits: 15, volunteers: 28 },
      { month: 'Nov', meals: 620, kits: 18, volunteers: 31 },
      { month: 'Dec', meals: 710, kits: 20, volunteers: 34 },
      { month: 'Jan', meals: 780, kits: 24, volunteers: 41 },
    ],
    milestones: [
      { date: '2026-01-18', title: '3 emergency rescues this week', image: '/images/posts/post-6.jpg' },
      { date: '2025-12-05', title: 'Adoption drive adopted 42 pets', image: '/images/posts/post-4.jpg' },
    ],
  },
  'ngo-2': {
    since: 1996,
    tagline: 'Protecting Philippine biodiversity for over 25 years.',
    thisYear: { meals: 0, kits: 1200, volunteers: 280, hours: 4600 },
    history: [
      { month: 'Aug', meals: 0, kits: 120, volunteers: 32 },
      { month: 'Sep', meals: 0, kits: 160, volunteers: 40 },
      { month: 'Oct', meals: 0, kits: 180, volunteers: 48 },
      { month: 'Nov', meals: 0, kits: 200, volunteers: 55 },
      { month: 'Dec', meals: 0, kits: 240, volunteers: 61 },
      { month: 'Jan', meals: 0, kits: 300, volunteers: 74 },
    ],
    milestones: [
      { date: '2026-01-15', title: '10,000 mangrove propagules planted', image: '/images/posts/post-4.jpg' },
      { date: '2025-11-08', title: 'Coastal cleanup with 240 volunteers', image: '/images/posts/post-6.jpg' },
    ],
  },
}

export function getImpactForNgo(ngoId) {
  return IMPACT_REPORTS[ngoId] || null
}