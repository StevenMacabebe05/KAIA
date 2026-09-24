export const ACHIEVEMENTS = [
  {
    id: 'first-donation',
    title: 'First Gift',
    description: 'Made your first donation',
    icon: 'heart',
    check: ({ donations }) => donations.length >= 1,
  },
  {
    id: 'generous',
    title: 'Generous',
    description: 'Donated to 3+ campaigns',
    icon: 'trending',
    check: ({ donations }) => donations.length >= 3,
  },
  {
    id: 'volunteer',
    title: 'Volunteer',
    description: 'Signed up for your first opportunity',
    icon: 'hand',
    check: ({ signups }) => signups.length >= 1,
  },
  {
    id: 'dedicated',
    title: 'Dedicated',
    description: 'Signed up for 3+ opportunities',
    icon: 'users',
    check: ({ signups }) => signups.length >= 3,
  },
  {
    id: 'explorer',
    title: 'Explorer',
    description: 'Followed 3+ NGOs',
    icon: 'globe',
    check: ({ follows }) => follows.length >= 3,
  },
  {
    id: 'curator',
    title: 'Curator',
    description: 'Saved 2+ campaigns',
    icon: 'book',
    check: ({ saves }) => saves.length >= 2,
  },
]