import { useState } from 'react'
import { createDocConfirmation } from '../utils/defaults'
import FileUpload from './FileUpload'
import FilePreviewTrigger from './FilePreviewTrigger'
import StatusBadge from './StatusBadge'
import { CONFIRM_STATUSES, DEFAULT_DOC_ITEMS } from '../utils/constants'

const PRESET_META = {
  钢网: {
    emoji: '🔲',
    hint: '钢网资料与版本',
    tone: 'from-sky-50 to-blue-50 border-sky-100 hover:border-sky-200',
  },
  BOM表: {
    emoji: '📋',
    hint: '物料清单核对',
    tone: 'from-violet-50 to-purple-50 border-violet-100 hover:border-violet-200',
  },
  生产标准: {
    emoji: '📐',
    hint: '工艺与检验标准',
    tone: 'from-amber-50 to-orange-50 border-amber-100 hover:border-amber-200',
  },
  首件确认: {
    emoji: '✅',
    hint: '正反面拍照确认',
    tone: 'from-emerald-50 to-teal-50 border-emerald-100 hover:border-emerald-200',
  },
}

function isFirstArticleItem(doc) {
  return doc.name === '首件确认' || doc.fileFront || doc.fileBack
}

function getPresetMeta(name) {
  return (
    PRESET_META[name] || {
      emoji: '📄',
      hint: '自定义确认资料',
      tone: 'from-slate-50 to-slate-100 border-slate-100 hover:border-slate-200',
    }
  )
}

export default function DocConfirmationSection({ items, onChange, onAdd, onRemove }) {
  const [customName, setCustomName] = useState('')
  const [showCustom, setShowCustom] = useState(false)

  const existingNames = new Set(items.map((d) => d.name.trim()))

  const updateItem = (id, patch) => {
    onChange(items.map((d) => (d.id === id ? { ...d, ...patch } : d)))
  }

  const handleRemove = (doc) => {
    if (items.length <= 1) {
      if (!window.confirm(`确定删除确认项「${doc.name}」？删除后暂无确认项，可自行添加。`)) return
    } else if (!window.confirm(`确定删除确认项「${doc.name}」？`)) return
    onRemove(doc.id)
  }

  const addByName = (name) => {
    const trimmed = name.trim()
    if (!trimmed) return
    if (existingNames.has(trimmed)) return
    onAdd(createDocConfirmation(trimmed))
    setCustomName('')
    setShowCustom(false)
  }

  const confirmedCount = items.filter((d) => d.status === '已确认').length

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-700">资料确认清单</p>
          <p className="text-xs text-slate-400 mt-0.5">
            点击下方常用项快速添加，或自定义名称；每项可改名、上传附件
          </p>
        </div>
        {items.length > 0 && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-medium ring-1 ring-primary-100">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
            {confirmedCount}/{items.length} 已确认
          </span>
        )}
      </div>

      <div className="rounded-xl border border-dashed border-slate-200 bg-gradient-to-br from-slate-50/80 to-white p-4">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">快速添加</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {DEFAULT_DOC_ITEMS.map((name) => {
            const meta = PRESET_META[name]
            const added = existingNames.has(name)
            return (
              <button
                key={name}
                type="button"
                disabled={added}
                onClick={() => addByName(name)}
                className={`group relative flex flex-col items-start gap-1 rounded-xl border bg-gradient-to-br p-3 text-left transition-all ${
                  added
                    ? 'border-emerald-200 bg-emerald-50/60 opacity-80 cursor-default'
                    : `${meta.tone} hover:shadow-sm active:scale-[0.98]`
                }`}
              >
                <span className="text-xl leading-none">{meta.emoji}</span>
                <span className="text-sm font-semibold text-slate-800">{name}</span>
                <span className="text-[11px] text-slate-500 leading-snug">{meta.hint}</span>
                {added && (
                  <span className="absolute top-2 right-2 text-[10px] font-medium text-emerald-700 bg-white/90 px-1.5 py-0.5 rounded-full ring-1 ring-emerald-200">
                    已添加
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {!showCustom ? (
          <button
            type="button"
            onClick={() => setShowCustom(true)}
            className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-600 hover:border-primary-200 hover:text-primary-700 hover:bg-primary-50/40 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            自定义确认项
          </button>
        ) : (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <input
              type="text"
              className="input-field flex-1 min-w-[160px]"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addByName(customName)}
              placeholder="例如：测试报告、包装规范…"
              autoFocus
            />
            <button
              type="button"
              className="btn-primary shrink-0"
              disabled={!customName.trim() || existingNames.has(customName.trim())}
              onClick={() => addByName(customName)}
            >
              添加
            </button>
            <button
              type="button"
              className="btn-secondary shrink-0"
              onClick={() => {
                setShowCustom(false)
                setCustomName('')
              }}
            >
              取消
            </button>
          </div>
        )}
      </div>

      {items.length === 0 ? (
        <div className="text-center py-10 px-4 rounded-xl bg-slate-50/60 border border-slate-100">
          <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-2xl">
            📎
          </div>
          <p className="text-sm font-medium text-slate-600">还没有确认项</p>
          <p className="text-xs text-slate-400 mt-1">从上方选择钢网、BOM、首件确认等常用项即可开始</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((doc, index) => {
            const meta = getPresetMeta(doc.name)
            const isConfirmed = doc.status === '已确认'
            return (
              <div
                key={doc.id}
                id={`highlight-${doc.id}`}
                className={`rounded-xl border overflow-hidden transition-shadow hover:shadow-sm ${
                  isConfirmed ? 'border-emerald-100 bg-white' : 'border-slate-100 bg-white'
                }`}
              >
                <div className={`flex flex-wrap items-center gap-3 px-4 py-3 border-b ${
                  isConfirmed ? 'bg-emerald-50/40 border-emerald-50' : 'bg-slate-50/60 border-slate-100'
                }`}>
                  <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-white shadow-sm text-lg shrink-0">
                    {meta.emoji}
                  </span>
                  <div className="flex-1 min-w-[140px]">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">
                        第 {index + 1} 项
                      </span>
                      <StatusBadge status={doc.status} type="confirm" />
                    </div>
                    <input
                      type="text"
                      className="mt-1 w-full bg-transparent border-0 border-b border-transparent hover:border-slate-200 focus:border-primary-300 focus:ring-0 px-0 py-0.5 text-base font-semibold text-slate-800 placeholder:text-slate-300"
                      value={doc.name}
                      onChange={(e) => updateItem(doc.id, { name: e.target.value })}
                      placeholder="确认项名称"
                    />
                  </div>
                  <div className="flex items-center gap-1 p-0.5 rounded-lg bg-white ring-1 ring-slate-200 shrink-0">
                    {CONFIRM_STATUSES.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => updateItem(doc.id, { status: s })}
                        className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                          doc.status === s
                            ? s === '已确认'
                              ? 'bg-emerald-600 text-white shadow-sm'
                              : 'bg-slate-600 text-white shadow-sm'
                            : 'text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
                    title="删除"
                    onClick={() => handleRemove(doc)}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>

                <div className="p-4 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="label-text">确认日期</label>
                      <input
                        type="date"
                        className="input-field"
                        value={doc.confirmDate}
                        onChange={(e) => updateItem(doc.id, { confirmDate: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="label-text">备注</label>
                      <input
                        type="text"
                        className="input-field"
                        value={doc.note || ''}
                        onChange={(e) => updateItem(doc.id, { note: e.target.value })}
                        placeholder="可选备注"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="label-text">
                      {isFirstArticleItem(doc) ? '首件照片（正 / 反）' : '附件资料'}
                    </label>
                    {isFirstArticleItem(doc) ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-1">
                        <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-3">
                          <p className="text-xs text-slate-500 mb-2">正面</p>
                          <FileUpload
                            value={doc.fileFront}
                            onChange={(file) => updateItem(doc.id, { fileFront: file })}
                            accept="image/*"
                            label="上传正面"
                            preview={false}
                          />
                          {doc.fileFront && (
                            <FilePreviewTrigger
                              file={doc.fileFront}
                              thumbnailClassName="h-20 mt-2 rounded border hover:ring-2 hover:ring-primary-300 cursor-pointer"
                            />
                          )}
                        </div>
                        <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-3">
                          <p className="text-xs text-slate-500 mb-2">反面</p>
                          <FileUpload
                            value={doc.fileBack}
                            onChange={(file) => updateItem(doc.id, { fileBack: file })}
                            accept="image/*"
                            label="上传反面"
                            preview={false}
                          />
                          {doc.fileBack && (
                            <FilePreviewTrigger
                              file={doc.fileBack}
                              thumbnailClassName="h-20 mt-2 rounded border hover:ring-2 hover:ring-primary-300 cursor-pointer"
                            />
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="mt-1 rounded-lg border border-slate-100 bg-slate-50/50 p-3">
                        <FileUpload
                          value={doc.file}
                          onChange={(file) => updateItem(doc.id, { file })}
                          accept="*/*"
                          label="上传文件"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
