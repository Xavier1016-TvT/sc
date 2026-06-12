import { Link } from 'react-router-dom'

export default function MetricDetailModal({
  open,
  title,
  description,
  totalLabel,
  totalValue,
  columns,
  rows,
  onClose,
}) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-slate-100 shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-800">{title}</h2>
              {description && (
                <p className="text-sm text-slate-500 mt-1">{description}</p>
              )}
            </div>
            <button
              type="button"
              className="text-slate-400 hover:text-slate-600 text-xl leading-none"
              onClick={onClose}
              aria-label="关闭"
            >
              ×
            </button>
          </div>
          {totalLabel && (
            <p className="mt-3 text-sm">
              <span className="text-slate-500">{totalLabel}：</span>
              <span className="font-semibold text-slate-800">{totalValue}</span>
            </p>
          )}
        </div>

        <div className="overflow-auto flex-1 px-6 py-4">
          {!rows?.length ? (
            <p className="text-center text-slate-400 py-8 text-sm">暂无明细数据</p>
          ) : (
            <table className="w-full min-w-[480px]">
              <thead className="bg-slate-50 sticky top-0">
                <tr>
                  {columns.map((col) => (
                    <th key={col.key} className="table-th">{col.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((row, idx) => (
                  <tr key={row.id || idx} className="hover:bg-slate-50/50">
                    {columns.map((col) => (
                      <td key={col.key} className="table-td">
                        {col.key === 'orderName' && row.orderId ? (
                          <Link
                            to={`/order/${row.orderId}`}
                            className="text-primary-600 hover:underline font-medium"
                            onClick={onClose}
                          >
                            {row.orderName}
                          </Link>
                        ) : col.render ? (
                          col.render(row)
                        ) : (
                          row[col.key]
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-100 shrink-0 flex justify-end">
          <button type="button" className="btn-secondary" onClick={onClose}>关闭</button>
        </div>
      </div>
    </div>
  )
}
