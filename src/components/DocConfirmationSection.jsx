import { createDocConfirmation } from '../utils/defaults'
import FileUpload from './FileUpload'
import FilePreviewTrigger from './FilePreviewTrigger'
import { CONFIRM_STATUSES } from '../utils/constants'

function isFirstArticleItem(doc) {
  return doc.name === '首件确认' || doc.fileFront || doc.fileBack
}

export default function DocConfirmationSection({ items, onChange, onAdd, onRemove }) {
  const updateItem = (id, patch) => {
    onChange(items.map((d) => (d.id === id ? { ...d, ...patch } : d)))
  }

  const handleRemove = (doc) => {
    if (items.length <= 1) {
      if (!window.confirm(`确定删除确认项「${doc.name}」？删除后暂无确认项，可自行添加。`)) return
    } else if (!window.confirm(`确定删除确认项「${doc.name}」？`)) return
    onRemove(doc.id)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-slate-500">
          按订单需要添加确认项（如钢网、BOM、首件确认等），均可删除或改名
        </p>
        <button
          type="button"
          className="btn-secondary text-xs"
          onClick={() => {
            const name = prompt('请输入确认项名称')
            if (name?.trim()) onAdd(createDocConfirmation(name.trim()))
          }}
        >
          + 添加确认项
        </button>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-8 bg-slate-50 rounded-lg border border-dashed border-slate-200">
          暂无确认项，点击「添加确认项」按需创建
        </p>
      ) : (
        <div className="space-y-4">
          {items.map((doc) => (
            <div key={doc.id} className="p-4 bg-slate-50 rounded-lg border border-slate-100">
              <div className="flex items-center justify-between gap-3 mb-3">
                <input
                  type="text"
                  className="input-field font-medium max-w-xs"
                  value={doc.name}
                  onChange={(e) => updateItem(doc.id, { name: e.target.value })}
                  placeholder="确认项名称"
                />
                <button type="button" className="text-xs text-red-500 shrink-0" onClick={() => handleRemove(doc)}>
                  删除
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="label-text">状态</label>
                  <select
                    className="input-field"
                    value={doc.status}
                    onChange={(e) => updateItem(doc.id, { status: e.target.value })}
                  >
                    {CONFIRM_STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label-text">确认日期</label>
                  <input
                    type="date"
                    className="input-field"
                    value={doc.confirmDate}
                    onChange={(e) => updateItem(doc.id, { confirmDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="mt-3">
                <label className="label-text">备注</label>
                <textarea
                  className="textarea-field"
                  rows={3}
                  value={doc.note || ''}
                  onChange={(e) => updateItem(doc.id, { note: e.target.value })}
                  placeholder="文字备注，可拖拽右下角拉高"
                />
              </div>
              <div className="mt-3">
                {isFirstArticleItem(doc) ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="label-text">正面</label>
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
                    <div>
                      <label className="label-text">反面</label>
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
                  <FileUpload
                    value={doc.file}
                    onChange={(file) => updateItem(doc.id, { file })}
                    accept="*/*"
                    label="上传文件"
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
