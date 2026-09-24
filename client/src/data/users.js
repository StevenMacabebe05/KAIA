// Hardcoded accounts. ONLY these two can log in.

export const HARDCODED_ACCOUNTS = [
  {
    id: 'u-1',
    name: 'Demo Supporter',
    email: 'demo@kaia.ph',
    password: 'demo123',
    role: 'supporter',
    avatar: '',
    ngoId: null,
  },
  {
    id: 'u-2',
    name: 'Bahay Kalinga Rep',
    email: 'ngo@kaia.ph',
    password: 'demo123',
    role: 'ngo_rep',
    avatar: '',
    ngoId: 'ngo-1',
  },
]

export const DEMO_HINTS = [
  { label: 'Supporter', email: 'demo@kaia.ph', password: 'demo123' },
  { label: 'NGO Rep', email: 'ngo@kaia.ph', password: 'demo123' },
]