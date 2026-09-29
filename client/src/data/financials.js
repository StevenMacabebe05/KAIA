export const FINANCIALS = {
  'ngo-1': {
    year: 2025,
    currency: 'PHP',
    totalRaised: 2400000,
    breakdown: [
      { label: 'Programs (school kits, meals, tuition)', pct: 78, color: '#1e40d8' },
      { label: 'Operations & staff', pct: 12, color: '#f97316' },
      { label: 'Fundraising & outreach', pct: 7, color: '#16a34a' },
      { label: 'Reserve fund', pct: 3, color: '#94a3b8' },
    ],
    years: [
      { year: 2023, raised: 1200000 },
      { year: 2024, raised: 1850000 },
      { year: 2025, raised: 2400000 },
    ],
    audited: true,
    auditor: 'Deloitte Philippines',
    lastUpdate: '2026-01-15',
  },
  'ngo-3': {
    year: 2025,
    currency: 'PHP',
    totalRaised: 1450000,
    breakdown: [
      { label: 'Animal rescue & rehabilitation', pct: 72, color: '#1e40d8' },
      { label: 'Shelter operations', pct: 18, color: '#f97316' },
      { label: 'Adoption programs', pct: 6, color: '#16a34a' },
      { label: 'Reserve fund', pct: 4, color: '#94a3b8' },
    ],
    years: [
      { year: 2023, raised: 890000 },
      { year: 2024, raised: 1180000 },
      { year: 2025, raised: 1450000 },
    ],
    audited: true,
    auditor: 'Sycip Gorres Velayo & Co.',
    lastUpdate: '2026-01-10',
  },
  'ngo-2': {
    year: 2025,
    currency: 'PHP',
    totalRaised: 3800000,
    breakdown: [
      { label: 'Conservation programs', pct: 74, color: '#1e40d8' },
      { label: 'Research & monitoring', pct: 14, color: '#f97316' },
      { label: 'Community engagement', pct: 8, color: '#16a34a' },
      { label: 'Administration', pct: 4, color: '#94a3b8' },
    ],
    years: [
      { year: 2023, raised: 2900000 },
      { year: 2024, raised: 3300000 },
      { year: 2025, raised: 3800000 },
    ],
    audited: true,
    auditor: 'KPMG Philippines',
    lastUpdate: '2026-01-12',
  },
}

export function getFinancialsForNgo(ngoId) {
  return FINANCIALS[ngoId] || null
}