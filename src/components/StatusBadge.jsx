const COLORS = {
  通过: '#22c55e',
  未通过: '#ef4444',
  进行中: '#f59e0b',
}

export default function StatusBadge({ status, type = 'sample' }) {
  const styles = {
    sample: {
      通过: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
      未通过: 'bg-red-50 text-red-700 ring-red-200',
      进行中: 'bg-amber-50 text-amber-700 ring-amber-200',
    },
    confirm: {
      已确认: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
      未确认: 'bg-slate-50 text-slate-600 ring-slate-200',
    },
    order: {
      未下单: 'bg-slate-50 text-slate-600 ring-slate-200',
      生产中: 'bg-blue-50 text-blue-700 ring-blue-200',
      已结单: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    },
  }

  const cls = styles[type]?.[status] || 'bg-slate-50 text-slate-600 ring-slate-200'

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset ${cls}`}>
      {status}
    </span>
  )
}

export { COLORS }
