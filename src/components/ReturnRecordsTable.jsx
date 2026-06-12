import { createReturnRecord } from '../utils/defaults'
import FileUpload from './FileUpload'
import FilePreviewTrigger from './FilePreviewTrigger'
import { getSubProjectReturned } from '../utils/calculations'

export default function ReturnRecordsTable({ records, onChange, subProject }) {
  const returned = getSubProjectReturned(subProject || { returnRecords: records })

  const update = (id, patch) => {
    onChange(records.map((r) => (r.id === id ? { ...r, ...patch } : r)))
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500">
        登记产品回到公司的贴回信息。已贴回 <span className="font-medium text-slate-700">{returned}</span> 个
      </p>
      <div className="flex justify-end">
        <button
          type="button"
          className="btn-secondary text-xs"
          onClick={() => onChange([...records, createReturnRecord()])}
        >
          + 添加贴回记录
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px]">
          <thead className="bg-slate-50">
            <tr>
              {['贴回日期', '数量', '照片', '备注', ''].map((h) => (
                <th key={h || 'action'} className="table-th">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {records.map((r) => (
              <tr key={r.id}>
                <td className="table-td p-1">
                  <input
                    type="date"
                    className="input-field py-1"
                    value={r.date || ''}
                    onChange={(e) => update(r.id, { date: e.target.value })}
                  />
                </td>
                <td className="table-td p-1">
                  <input
                    type="number"
                    min="0"
                    className="input-field py-1 w-24"
                    value={r.quantity}
                    onChange={(e) => update(r.id, { quantity: Number(e.target.value) })}
                  />
                </td>
                <td className="table-td p-1">
                  <FileUpload
                    value={r.image}
                    onChange={(file) => update(r.id, { image: file })}
                    accept="image/*"
                    label="上传"
                    preview={false}
                  />
                  {r.image && (
                    <FilePreviewTrigger
                      file={r.image}
                      thumbnailClassName="h-12 mt-1 rounded border hover:ring-2 hover:ring-primary-300 cursor-pointer"
                    />
                  )}
                </td>
                <td className="table-td p-1 min-w-[140px]">
                  <input
                    type="text"
                    className="input-field py-1"
                    value={r.note || ''}
                    placeholder="备注"
                    onChange={(e) => update(r.id, { note: e.target.value })}
                  />
                </td>
                <td className="table-td p-1">
                  <button
                    type="button"
                    className="text-xs text-red-500"
                    onClick={() => onChange(records.filter((x) => x.id !== r.id))}
                  >
                    删
                  </button>
                </td>
              </tr>
            ))}
            {!records.length && (
              <tr>
                <td colSpan={5} className="table-td text-center text-slate-400 py-8">
                  暂无贴回记录
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
