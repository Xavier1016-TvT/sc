import { useState } from 'react'

export default function MetricCard({ title, value, unit, icon, color = 'primary', breakdown = [] }) {
  const [expanded, setExpanded] = useState(false)
  const colorMap = {
    primary: 'from-primary-500 to-primary-600',
    emerald: 'from-emerald-500 to-emerald-600',
    amber: 'from-amber-500 to-amber-600',
    red: 'from-red-500 to-red-600',
    violet: 'from-violet-500 to-violet-600',
    slate: 'from-slate-500 to-slate-600',
  }

  return (
    <div className="card hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-slate-500 mb-1">{title}</p>
          <p className="text-2xl font-bold text-slate-800">
            {value}
            {unit && <span className="text-sm font-normal text-slate-400 ml-1">{unit}</span>}
          </p>
        </div>
        {icon && (
          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${colorMap[color]} flex items-center justify-center text-white text-lg shrink-0`}>
            {icon}
          </div>
        )}
      </div>
      {breakdown.length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            className="text-xs text-primary-600 hover:underline"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? '收起明细 ▲' : '查看各订单明细 ▼'}
          </button>
          {expanded && (
            <ul className="mt-2 space-y-1 max-h-36 overflow-y-auto">
              {breakdown.map((item) => (
                <li key={item.label} className="flex justify-between text-xs text-slate-600">
                  <span className="truncate mr-2">{item.label}</span>
                  <span className="font-medium shrink-0">{item.value}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
