import OrderSearchBar from './OrderSearchBar'

/** 指标区：顶部搜索 + 下方指标卡片 */
export default function MetricsSection({
  searchQuery,
  onSearchChange,
  resultCount,
  totalCount,
  children,
}) {
  return (
    <div className="space-y-4">
      <div className="card bg-gradient-to-r from-white to-slate-50/80 border-slate-200">
        <OrderSearchBar
          embedded
          value={searchQuery}
          onChange={onSearchChange}
          resultCount={resultCount}
          totalCount={totalCount}
        />
      </div>
      {children}
    </div>
  )
}
