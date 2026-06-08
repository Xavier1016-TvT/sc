import { createShippingRecord } from '../utils/defaults'
import FileUpload from './FileUpload'
import FilePreviewTrigger from './FilePreviewTrigger'
import { getSubProjectShipped } from '../utils/calculations'

export default function ShippingTable({ records, onChange, subProject }) {
  const shipped = getSubProjectShipped(subProject || { shippingRecords: records })

  const update = (id, patch) => {
    onChange(records.map((r) => (r.id === id ? { ...r, ...patch } : r)))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">已出货数量（自动）：{shipped} 个</p>
        <button
          type="button"
          className="btn-secondary text-xs"
          onClick={() => onChange([...records, createShippingRecord()])}
        >
          + 添加行
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead className="bg-slate-50">
            <tr>
              {['日期', '出货数量', '出货单', '备注', ''].map((h) => (
                <th key={h || 'action'} className="table-th">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {records.map((r) => (
              <tr key={r.id}>
                <td className="table-td p-1">
                  <input type="date" className="input-field py-1" value={r.date} onChange={(e) => update(r.id, { date: e.target.value })} />
                </td>
                <td className="table-td p-1">
                  <input type="number" min="0" className="input-field py-1" value={r.quantity} onChange={(e) => update(r.id, { quantity: Number(e.target.value) })} />
                </td>
                <td className="table-td p-1">
                  <FileUpload
                    value={r.slipImage}
                    onChange={(file) => update(r.id, { slipImage: file })}
                    accept="image/*"
                    label="上传"
                    preview={false}
                  />
                  {r.slipImage && (
                    <FilePreviewTrigger
                      file={r.slipImage}
                      thumbnailClassName="h-12 mt-1 rounded border hover:ring-2 hover:ring-primary-300 cursor-pointer"
                    />
                  )}
                </td>
                <td className="table-td p-1 min-w-[160px]">
                  <input
                    type="text"
                    className="input-field py-1"
                    value={r.note || ''}
                    placeholder="备注"
                    onChange={(e) => update(r.id, { note: e.target.value })}
                  />
                </td>
                <td className="table-td p-1">
                  <button type="button" className="text-xs text-red-500" onClick={() => onChange(records.filter((x) => x.id !== r.id))}>删</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
