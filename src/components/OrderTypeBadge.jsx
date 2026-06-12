const STYLES = {
  小订单: 'bg-violet-50 text-violet-700 ring-violet-200',
  大订单: 'bg-orange-50 text-orange-700 ring-orange-200',
}

export default function OrderTypeBadge({ type = '小订单' }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset ${STYLES[type] || STYLES['小订单']}`}
    >
      {type}
    </span>
  )
}
