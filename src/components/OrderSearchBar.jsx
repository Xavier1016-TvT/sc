import { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { findOrderSearchHits } from '../utils/searchOrders'
import { getSearchHitPath } from '../utils/searchNavigation'

/** 嵌入指标区域的订单搜索（含结果列表，点击直达对应位置） */
export default function OrderSearchBar({
  value,
  onChange,
  resultCount,
  totalCount,
  embedded = false,
  orders = [],
}) {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const wrapRef = useRef(null)

  const hits = useMemo(
    () => (value.trim() ? findOrderSearchHits(orders, value) : []),
    [orders, value]
  )

  const handleSelect = (hit) => {
    onChange('')
    setOpen(false)
    navigate(getSearchHitPath(hit))
  }

  const showDropdown = open && value.trim() && hits.length > 0

  return (
    <div
      className={embedded ? 'space-y-2' : 'flex flex-wrap items-center gap-3'}
      ref={wrapRef}
      onBlur={(e) => {
        if (!wrapRef.current?.contains(e.relatedTarget)) setOpen(false)
      }}
    >
      {embedded && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-semibold text-slate-800">查找订单</p>
          {value.trim() && (
            <span className="text-xs text-slate-500">
              找到 {resultCount} / {totalCount} 条
              {hits.length > 0 && ` · ${hits.length} 个可定位结果`}
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
          placeholder="订单名称、厂家、子项目、物料编码/名称…"
          value={value}
          onChange={(e) => {
            onChange(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && hits[0]) {
              e.preventDefault()
              handleSelect(hits[0])
            }
            if (e.key === 'Escape') setOpen(false)
          }}
        />
        {value && (
          <button
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded text-slate-400 hover:bg-slate-100 hover:text-slate-600 text-sm"
            onClick={() => {
              onChange('')
              setOpen(false)
            }}
            aria-label="清除搜索"
          >
            ×
          </button>
        )}

        {showDropdown && (
          <div className="absolute left-0 right-0 top-full mt-1 z-40 bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden max-h-72 overflow-y-auto">
            <p className="px-3 py-2 text-[11px] text-slate-400 border-b border-slate-100">
              点击结果直达对应订单位置
            </p>
            <ul>
              {hits.map((hit) => (
                <li key={hit.id}>
                  <button
                    type="button"
                    className="w-full text-left px-3 py-2.5 hover:bg-primary-50 transition-colors border-b border-slate-50 last:border-0"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleSelect(hit)}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
                        {hit.category}
                      </span>
                      <span className="text-sm font-medium text-slate-800 truncate">{hit.title}</span>
                    </div>
                    {hit.detail && (
                      <p className="text-xs text-slate-400 mt-0.5 truncate pl-0.5">{hit.detail}</p>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {open && value.trim() && hits.length === 0 && (
          <div className="absolute left-0 right-0 top-full mt-1 z-40 bg-white rounded-xl border border-slate-200 shadow-lg px-3 py-3 text-sm text-slate-400">
            未找到可定位的匹配项
          </div>
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
