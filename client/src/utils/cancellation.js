export function getCancellationWindow(eventDateStr) {
  if (!eventDateStr) {
    return { allowed: true, diffDays: 999, message: '' }
  }

  const eventDate = new Date(eventDateStr)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  eventDate.setHours(0, 0, 0, 0)

  const diffDays = Math.round((eventDate - today) / (1000 * 60 * 60 * 24))

  if (diffDays < 0) {
    return {
      allowed: true,
      diffDays,
      message:
        'Event has already passed. You may still cancel for demo purposes.',
    }
  }

  if (diffDays >= 3) {
    return {
      allowed: true,
      diffDays,
      message: `You can cancel any time up to 3 days before the event. ${diffDays} days remaining.`,
    }
  }

  return {
    allowed: false,
    diffDays,
    message: `Cancellation window has closed. Volunteers must cancel at least 3 days before the event. Only ${diffDays} day${
      diffDays === 1 ? '' : 's'
    } remaining.`,
  }
}

export const CANCELLATION_REASONS = [
  'Schedule conflict',
  'Personal emergency',
  'Health / medical reason',
  'Transportation issue',
  'Family obligation',
  'Changed my mind',
  'Other',
]