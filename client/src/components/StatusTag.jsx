const LABELS = {
  urgent:          { text: 'Urgent',          bg: 'var(--orange-100)', fg: 'var(--orange-600)' },
  active:          { text: 'Active',          bg: 'var(--blue-100)',   fg: 'var(--blue-700)'   },
  almost_complete: { text: 'Almost Complete', bg: '#dcfce7',           fg: '#15803d'           },
  completed:       { text: 'Completed',       bg: 'var(--ink-100)',    fg: 'var(--ink-500)'    },
}

export default function StatusTag({ status }) {
  const s = LABELS[status] ?? LABELS.active
  return (
    <span className="status-tag" style={{ background: s.bg, color: s.fg }}>
      {s.text}
    </span>
  )
}