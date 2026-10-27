export function StatusBadge({ status }) {
  const map = {
    active:      'bg-green-100 text-green-700',
    completed:   'bg-blue-100 text-blue-700',
    planning:    'bg-slate-100 text-slate-600',
    on_hold:     'bg-amber-100 text-amber-700',
    cancelled:   'bg-red-100 text-red-700',
    todo:        'bg-slate-100 text-slate-600',
    in_progress: 'bg-blue-100 text-blue-700',
    blocked:     'bg-red-100 text-red-700',
  }
  const cls = map[status] || 'bg-slate-100 text-slate-600'
  const label = status?.replace(/_/g, ' ') || 'unknown'
  return (
    <span className={`badge ${cls}`}>
      {label.charAt(0).toUpperCase() + label.slice(1)}
    </span>
  )
}

export function SeverityBadge({ severity }) {
  const map = {
    critical:      'bg-red-100 text-red-700 border border-red-200',
    high:          'bg-orange-100 text-orange-700 border border-orange-200',
    medium:        'bg-amber-100 text-amber-700 border border-amber-200',
    low:           'bg-green-100 text-green-700 border border-green-200',
    informational: 'bg-blue-100 text-blue-700 border border-blue-200',
    monitor:       'bg-slate-100 text-slate-600 border border-slate-200',
    immediate:     'bg-red-100 text-red-700 border border-red-200',
  }
  const cls = map[severity?.toLowerCase()] || 'bg-slate-100 text-slate-600'
  return <span className={`badge ${cls}`}>{severity}</span>
}

export function PriorityBadge({ priority }) {
  const map = {
    critical: 'bg-red-100 text-red-700',
    high:     'bg-orange-100 text-orange-700',
    medium:   'bg-amber-100 text-amber-700',
    low:      'bg-slate-100 text-slate-500',
  }
  const cls = map[priority] || 'bg-slate-100 text-slate-500'
  return <span className={`badge ${cls}`}>{priority}</span>
}
