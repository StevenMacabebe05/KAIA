export function formatPeso(amount) {
  return `₱${Number(amount || 0).toLocaleString()}`
}

export function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function percent(value, goal) {
  if (!goal) return 0
  return Math.min(100, Math.round((value / goal) * 100))
}