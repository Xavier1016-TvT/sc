import { createDefectRecord } from '../utils/defaults'
import TableScrollBody from './TableScrollBody'

export default function DefectStatsTable({ records, onChange }) {
  const update = (id, patch) => {
    onChange(records.map((r) => (r.id === id ? { ...r, ...patch } : r)))
  }

  let running = 0
  const rowsWithCumulative = records.map((r) => {
    running += Number(r.defectQty) || 0
    return { ...r, cumulative: running }
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          不良合计（自动）：{running} 个
        </p>
        <button
          type="button"
          className="btn-secondary text-xs"
          onClick={() => onChange([...records, createDefectRecord()])}
        >
          + 添加行
        </button>
      </div>
      <TableScrollBody tableClassName="w-full min-w-[400px]">
          <thead>
            <tr>
              {['日期', '不良数', '累计', ''].map((h) => (
                <th key={h} className="table-th">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rowsWithCumulative.map((r) => (
              <tr key={r.id}>
                <td className="table-td p-1">
                  <input
                    type="date"
                    className="input-field py-1"
                    value={r.date}
                    onChange={(e) => update(r.id, { date: e.target.value })}
                  />
                </td>
                <td className="table-td p-1">
                  <input
                    type="number"
                    min="0"
                    className="input-field py-1"
                    value={r.defectQty}
                    onChange={(e) => update(r.id, { defectQty: Number(e.target.value) })}
                  />
                </td>
                <td className="table-td p-1 text-slate-600">{r.cumulative}</td>
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
          </tbody>
      </TableScrollBody>
    </div>
  )
}
