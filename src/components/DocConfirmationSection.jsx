import { createDocConfirmation } from '../utils/defaults'
import FileUpload from './FileUpload'
import FilePreviewTrigger from './FilePreviewTrigger'
import { CONFIRM_STATUSES } from '../utils/constants'

export default function DocConfirmationSection({ items, onChange, onAdd, onRemove }) {
  const updateItem = (id, patch) => {
    onChange(items.map((d) => (d.id === id ? { ...d, ...patch } : d)))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-slate-500">各确认项可独立填写，不必全部完成</p>
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
      <div className="space-y-4">
        {items.map((doc) => (
          <div key={doc.id} className="p-4 bg-slate-50 rounded-lg border border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium text-slate-700">{doc.name}</span>
              {!['钢网', 'BOM表', '生产标准', '首件确认'].includes(doc.name) && (
                <button type="button" className="text-xs text-red-500" onClick={() => onRemove(doc.id)}>
                  删除
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
              <div>
                <label className="label-text">备注</label>
                <input
                  className="input-field"
                  value={doc.note}
                  onChange={(e) => updateItem(doc.id, { note: e.target.value })}
                  placeholder="文字备注"
                />
              </div>
            </div>
            <div className="mt-3">
              {doc.name === '首件确认' ? (
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
    </div>
  )
}
