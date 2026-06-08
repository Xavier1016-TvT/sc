/** 嵌入指标区域的订单搜索 */
export default function OrderSearchBar({
  value,
  onChange,
  resultCount,
  totalCount,
  embedded = false,
}) {
  return (
    <div className={embedded ? 'space-y-2' : 'flex flex-wrap items-center gap-3'}>
      {embedded && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-semibold text-slate-800">查找订单</p>
          {value.trim() && (
            <span className="text-xs text-slate-500">
              找到 {resultCount} / {totalCount} 条
            </span>
          )}
        </div>
      )}
      <div className={`relative ${embedded ? 'w-full' : 'flex-1 min-w-[200px] max-w-md'}`}>
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-sm">
          🔍
        </span>
        <input
          type="search"
          className="input-field pl-9 pr-9"
          placeholder="订单名称、厂家、子项目…"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        {value && (
          <button
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded text-slate-400 hover:bg-slate-100 hover:text-slate-600 text-sm"
            onClick={() => onChange('')}
            aria-label="清除搜索"
          >
            ×
          </button>
        )}
      </div>
      {!embedded && value.trim() && (
        <span className="text-sm text-slate-500">
          找到 {resultCount} / {totalCount} 条
        </span>
      )}
    </div>
  )
}
