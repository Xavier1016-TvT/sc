import { Link } from 'react-router-dom'
import { useRef } from 'react'
import { createMaterialItem } from '../utils/defaults'
import { MATERIAL_OPTIONS, MATERIAL_TYPES } from '../utils/constants'
import FilePreviewTrigger from './FilePreviewTrigger'
import { parseMaterialFileToItems } from '../utils/parseMaterialImport'
import { readFileAsDataUrl, readFileLocally } from '../utils/fileHelpers'
import {
  countShortageKinds,
  getShortageItems,
  getItemShortage,
  getSubProjectShortageSummaries,
} from '../utils/materialAggregate'

const EDIT_TEXT_COLS = [
  { field: 'code', label: '编码', minW: 'min-w-[120px]' },
  { field: 'name', label: '物料名称', minW: 'min-w-[200px]' },
  { field: 'spec', label: '规格', minW: 'min-w-[180px]' },
]

const EDIT_NUM_COLS = [
  { field: 'required', label: '需求量', minW: 'min-w-[88px]' },
  { field: 'received', label: '实到数', minW: 'min-w-[88px]' },
]

const SHORTAGE_HEADERS = ['编码', '物料名称', '规格', '缺料数', '物料类型', '备注']

function ShortageItemsTable({ items }) {
  return (
    <table className="material-table min-w-[960px]">
      <thead className="bg-red-100/60">
        <tr>
          {SHORTAGE_HEADERS.map((h) => (
            <th key={h} className="table-th text-red-800">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-red-100">
        {items.map((it) => (
          <tr key={it.id}>
            <td className="table-td font-medium text-red-900 whitespace-nowrap">{it.code || '—'}</td>
            <td className="table-td text-red-900">{it.name || '—'}</td>
            <td className="table-td text-red-800">{it.spec || '—'}</td>
            <td className="table-td font-semibold text-red-700 tabular-nums">{getItemShortage(it)}</td>
            <td className="table-td whitespace-nowrap">{it.type || '—'}</td>
            <td className="table-td text-red-800">{it.note || '—'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default function MaterialTable({
  materialStatus,
  onChange,
  variant = 'edit',
  readOnly = false,
  subProjects = [],
  orderId,
}) {
  const { option, note, file, items = [] } = materialStatus
  const isSummary = variant === 'summary'
  const shortageKinds = countShortageKinds(items)
  const shortageItems = getShortageItems(items)

  const update = (patch) => {
    if (readOnly) return
    onChange({ ...materialStatus, ...patch })
  }

  const importRef = useRef(null)

  const handleFileImport = async (rawFile) => {
    if (readOnly) return
    if (!rawFile) {
      update({ file: null })
      return
    }

    try {
      const localFile = await readFileLocally(rawFile)
      const { items: parsed, kind } = parseMaterialFileToItems(localFile)
      const cloudFile = await readFileAsDataUrl(rawFile)

      if (kind === 'image') {
        update({ file: cloudFile })
        return
      }

      if (parsed.length === 0) {
        update({ file: cloudFile })
        alert('文件已保存，但未解析到有效物料行。请检查表头是否为：编码、物料名称、规格等。')
        return
      }

      const msg =
        items.length > 0
          ? `已从文件解析 ${parsed.length} 条物料，是否覆盖当前明细表？`
          : `已从文件解析 ${parsed.length} 条物料，是否导入到明细表？`

      if (window.confirm(msg)) {
        update({ file: cloudFile, items: parsed })
      } else {
        update({ file: cloudFile })
      }
    } catch (err) {
      alert(err.message || '物料文件解析失败')
    }
  }

  const updateItem = (id, patch) => {
    update({
      items: items.map((it) => {
        if (it.id !== id) return it
        const next = { ...it, ...patch }
        if ('required' in patch || 'received' in patch) {
          next.shortage = Math.max(0, (Number(next.required) || 0) - (Number(next.received) || 0))
        }
        return next
      }),
    })
  }

  const addRow = () => update({ items: [...items, createMaterialItem()] })
  const removeRow = (id) => update({ items: items.filter((it) => it.id !== id) })

  if (isSummary) {
    const subShortages = getSubProjectShortageSummaries(subProjects)
    const showPerSub = subProjects.length > 1 && subShortages.length > 0

    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm text-slate-600">
            汇总状态：
            <strong
              className={
                shortageKinds > 0
                  ? 'text-red-700'
                  : option === '料齐'
                    ? 'text-emerald-700'
                    : 'text-slate-800'
              }
            >
              {option || '备料中'}
            </strong>
          </span>
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
              shortageKinds > 0
                ? 'bg-red-100 text-red-700 ring-1 ring-red-200'
                : 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200'
            }`}
          >
            {shortageKinds > 0 ? `缺料 ${shortageKinds} 种` : '物料已齐'}
          </span>
        </div>
        {note && <p className="text-xs text-slate-500">{note}</p>}

        {showPerSub && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-500">缺料子项目：</span>
            {subShortages.map((s) => (
              <span
                key={s.subId}
                className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 ring-1 ring-red-200"
              >
                {orderId ? (
                  <Link to={`/order/${orderId}/sub/${s.subId}`} className="hover:underline">
                    {s.subName}
                  </Link>
                ) : (
                  s.subName
                )}
                · 缺 {s.shortageKinds} 种
              </span>
            ))}
          </div>
        )}

        {shortageKinds > 0 ? (
          showPerSub ? (
            <div className="space-y-4">
              {subShortages.map((s) => (
                <div
                  key={s.subId}
                  className="overflow-x-auto -mx-1 px-1 border border-red-100 rounded-lg bg-red-50/40 p-3"
                >
                  <div className="text-sm font-semibold text-red-800 mb-2">
                    {orderId ? (
                      <Link to={`/order/${orderId}/sub/${s.subId}`} className="hover:underline">
                        {s.subName}
                      </Link>
                    ) : (
                      s.subName
                    )}
                    <span className="text-red-600 font-normal"> · 缺料 {s.shortageKinds} 种</span>
                  </div>
                  <ShortageItemsTable items={s.items} />
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto -mx-1 px-1 border border-red-100 rounded-lg bg-red-50/40">
              {subProjects.length === 1 && subShortages.length === 1 && (
                <p className="text-sm font-medium text-red-800 px-3 pt-3">
                  子项目：
                  {orderId ? (
                    <Link
                      to={`/order/${orderId}/sub/${subShortages[0].subId}`}
                      className="hover:underline ml-1"
                    >
                      {subShortages[0].subName}
                    </Link>
                  ) : (
                    subShortages[0].subName
                  )}
                </p>
              )}
              <ShortageItemsTable items={shortageItems} />
            </div>
          )
        ) : (
          <p className="text-sm text-emerald-700 bg-emerald-50 rounded-lg px-4 py-3">
            各子项目物料已齐，当前无缺料项
          </p>
        )}

        <p className="text-xs text-slate-400">
          总览由各子项目物料自动汇总，请在子项目详情中维护具体物料
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        {shortageKinds > 0 && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-700 ring-1 ring-red-200">
            缺料 {shortageKinds} 种
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="label-text">状态（备料中 / 料齐）</label>
          <select
            className="input-field"
            value={option}
            disabled={readOnly}
            onChange={(e) => update({ option: e.target.value })}
          >
            {MATERIAL_OPTIONS.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="mb-4">
        <label className="label-text">文字备注</label>
        <textarea
          className="textarea-field"
          rows={3}
          value={note}
          readOnly={readOnly}
          onChange={(e) => update({ note: e.target.value })}
          placeholder="可拖拽右下角拉高"
        />
      </div>

      {!readOnly && (
        <>
          <div className="flex items-center gap-2 flex-wrap">
            <button type="button" className="btn-secondary text-xs" onClick={() => importRef.current?.click()}>
              导入物料文件
            </button>
            {file && (
              <>
                <FilePreviewTrigger
                  file={file}
                  nameClassName="text-xs text-primary-600 hover:underline font-medium"
                />
                <span className="text-xs text-slate-400">点击文件名可在线打开表格/PDF</span>
                <button type="button" className="text-xs text-red-500 hover:underline" onClick={() => update({ file: null })}>
                  移除
                </button>
              </>
            )}
          </div>
          <input
            ref={importRef}
            type="file"
            className="hidden"
            accept=".xlsx,.xls,.wps,.csv,.jpg,.jpeg,.png"
            onChange={(e) => {
              const picked = e.target.files?.[0] || null
              handleFileImport(picked)
              e.target.value = ''
            }}
          />
          <p className="text-xs text-slate-400 mt-1 mb-4">
            Excel / CSV 按表头自动填入明细；导入后可点击文件名在线预览表格或 PDF
          </p>
        </>
      )}

      <div className="mt-2 flex justify-between items-center">
        <p className="text-sm text-slate-500">物料明细表（可增删行）</p>
        {!readOnly && (
          <button type="button" className="btn-secondary text-xs" onClick={addRow}>
            + 添加行
          </button>
        )}
      </div>
      <div className="overflow-x-auto -mx-1 px-1 mt-2">
        <table className="material-table">
          <thead className="bg-slate-50">
            <tr>
              {EDIT_TEXT_COLS.map(({ field, label, minW }) => (
                <th key={field} className={`table-th ${minW}`}>{label}</th>
              ))}
              {EDIT_NUM_COLS.map(({ field, label, minW }) => (
                <th key={field} className={`table-th ${minW} text-center`}>{label}</th>
              ))}
              <th className="table-th min-w-[72px] text-center">缺料数</th>
              <th className="table-th min-w-[100px]">物料状态</th>
              <th className="table-th min-w-[160px]">备注</th>
              <th className="table-th min-w-[96px]">物料类型</th>
              {!readOnly && <th className="table-th w-12" />}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((it) => {
              const isShort = getItemShortage(it) > 0
              return (
                <tr
                  key={it.id}
                  className={isShort ? 'bg-red-50/70' : undefined}
                >
                  {EDIT_TEXT_COLS.map(({ field, minW }) => (
                    <td key={field} className={`table-td ${minW}`}>
                      <input
                        type="text"
                        className={`input-field ${isShort ? 'border-red-200' : ''}`}
                        value={it[field]}
                        readOnly={readOnly}
                        onChange={(e) => updateItem(it.id, { [field]: e.target.value })}
                      />
                    </td>
                  ))}
                  {EDIT_NUM_COLS.map(({ field, minW }) => (
                    <td key={field} className={`table-td ${minW}`}>
                      <input
                        type="number"
                        className={`input-field ${isShort ? 'border-red-200' : ''}`}
                        value={it[field]}
                        readOnly={readOnly}
                        onChange={(e) =>
                          updateItem(it.id, { [field]: Number(e.target.value) })
                        }
                      />
                    </td>
                  ))}
                  <td className="table-td text-center">
                    <span
                      className={`inline-block min-w-[2.5rem] font-semibold tabular-nums ${
                        isShort ? 'text-red-700' : 'text-slate-400'
                      }`}
                    >
                      {isShort ? getItemShortage(it) : '—'}
                    </span>
                  </td>
                  <td className="table-td min-w-[100px]">
                    <input
                      type="text"
                      className="input-field"
                      value={it.status}
                      readOnly={readOnly}
                      onChange={(e) => updateItem(it.id, { status: e.target.value })}
                    />
                  </td>
                  <td className="table-td min-w-[160px]">
                    <textarea
                      className="input-field textarea-compact w-full"
                      rows={2}
                      value={it.note}
                      readOnly={readOnly}
                      onChange={(e) => updateItem(it.id, { note: e.target.value })}
                      placeholder="备注"
                    />
                  </td>
                  <td className="table-td min-w-[96px]">
                    <select
                      className="input-field"
                      value={it.type}
                      disabled={readOnly}
                      onChange={(e) => updateItem(it.id, { type: e.target.value })}
                    >
                      {MATERIAL_TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </td>
                  {!readOnly && (
                    <td className="table-td w-12 text-center">
                      <button type="button" className="text-xs text-red-500 hover:underline" onClick={() => removeRow(it.id)}>
                        删
                      </button>
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
