import { createProcessRecord } from '../utils/defaults'
import TableScrollBody from './TableScrollBody'

export default function ProcessRecordsTable({ records, onChange }) {
  const update = (id, patch) => {
    onChange(records.map((r) => (r.id === id ? { ...r, ...patch } : r)))
  }

  let smtRunning = 0
  let testRunning = 0
  const rowsWithCumulative = records.map((r) => {
    smtRunning += Number(r.smtQty) || 0
    testRunning += Number(r.testQty) || 0
    return { ...r, smtCumulative: smtRunning, testCumulative: testRunning }
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-slate-500">
          累计贴片：{smtRunning} 个 · 累计测试：{testRunning} 个
        </p>
        <button
          type="button"
          className="btn-secondary text-xs"
          onClick={() => onChange([...records, createProcessRecord()])}
        >
          + 添加行
        </button>
      </div>
      <TableScrollBody tableClassName="w-full min-w-[620px]">
          <thead>
            <tr>
              {['日期', '贴片', '贴片累计', '测试', '测试累计', ''].map((h) => (
                <th key={h} className="table-th">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rowsWithCumulative.map((r) => (
              <tr key={r.id}>
                <td className="table-td p-1">
                  <input type="date" className="input-field py-1" value={r.date} onChange={(e) => update(r.id, { date: e.target.value })} />
                </td>
                <td className="table-td p-1">
                  <input type="number" min="0" className="input-field py-1" value={r.smtQty} onChange={(e) => update(r.id, { smtQty: Number(e.target.value) })} />
                </td>
                <td className="table-td p-1 text-slate-600">{r.smtCumulative}</td>
                <td className="table-td p-1">
                  <input type="number" min="0" className="input-field py-1" value={r.testQty} onChange={(e) => update(r.id, { testQty: Number(e.target.value) })} />
                </td>
                <td className="table-td p-1 text-slate-600">{r.testCumulative}</td>
                <td className="table-td p-1">
                  <button type="button" className="text-xs text-red-500" onClick={() => onChange(records.filter((x) => x.id !== r.id))}>删</button>
                </td>
              </tr>
            ))}
          </tbody>
      </TableScrollBody>
    </div>
  )
}
