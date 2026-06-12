const colorMap = {
  primary: 'from-primary-500 to-primary-600',
  emerald: 'from-emerald-500 to-emerald-600',
  amber: 'from-amber-500 to-amber-600',
  red: 'from-red-500 to-red-600',
  violet: 'from-violet-500 to-violet-600',
  slate: 'from-slate-500 to-slate-600',
}

export default function MetricCard({
  title,
  value,
  unit,
  icon,
  color = 'primary',
  onClick,
  clickable = false,
}) {
  const interactive = clickable || !!onClick

  const Wrapper = interactive ? 'button' : 'div'
  const wrapperProps = interactive
    ? {
        type: 'button',
        onClick,
        className:
          'card hover:shadow-md transition-all text-left w-full hover:ring-2 hover:ring-primary-200 cursor-pointer group',
      }
    : { className: 'card hover:shadow-md transition-shadow' }

  return (
    <Wrapper {...wrapperProps}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-slate-500 mb-1">{title}</p>
          <p className="text-2xl font-bold text-slate-800">
            {value}
            {unit && <span className="text-sm font-normal text-slate-400 ml-1">{unit}</span>}
          </p>
        </div>
        {icon && (
          <div
            className={`w-10 h-10 rounded-lg bg-gradient-to-br ${colorMap[color]} flex items-center justify-center text-white text-lg shrink-0`}
          >
            {icon}
          </div>
        )}
      </div>
      {interactive && (
        <p className="mt-3 pt-3 border-t border-slate-100 text-xs text-primary-600 group-hover:text-primary-700">
          点击查看明细 →
        </p>
      )}
    </Wrapper>
  )
}
