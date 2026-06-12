import { createProblemNote } from '../utils/defaults'
import FileUpload from './FileUpload'
import FilePreviewTrigger from './FilePreviewTrigger'

export default function ProblemNotesTable({ notes, onChange }) {
  const update = (id, patch) => {
    onChange(notes.map((n) => (n.id === id ? { ...n, ...patch } : n)))
  }

  const addPhoto = (id, file) => {
    const note = notes.find((n) => n.id === id)
    if (!note || !file) return
    update(id, { photos: [...(note.photos || []), file] })
  }

  const removePhoto = (noteId, idx) => {
    const note = notes.find((n) => n.id === noteId)
    if (!note) return
    update(noteId, { photos: note.photos.filter((_, i) => i !== idx) })
  }

  return (
    <div>
      <div className="flex items-center justify-end mb-4">
        <button type="button" className="btn-secondary text-xs" onClick={() => onChange([...notes, createProblemNote()])}>
          + 添加行
        </button>
      </div>
      <div className="space-y-4">
        {notes.map((n) => (
          <div key={n.id} className="p-4 bg-slate-50 rounded-lg border border-slate-100">
            <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-3">
              <div>
                <label className="label-text">日期</label>
                <input type="date" className="input-field" value={n.date} onChange={(e) => update(n.id, { date: e.target.value })} />
              </div>
              <div className="sm:col-span-1">
                <label className="label-text">文字备注</label>
                <textarea
                  className="textarea-field"
                  rows={4}
                  value={n.note}
                  onChange={(e) => update(n.id, { note: e.target.value })}
                  placeholder="输入问题描述，可拖拽右下角调节高度"
                />
              </div>
            </div>
            <div className="mt-3">
              <FileUpload
                value={null}
                onChange={(file) => addPhoto(n.id, file)}
                accept="image/*"
                label="上传照片"
                preview={false}
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {(n.photos || []).map((photo, idx) => (
                  <div key={idx} className="relative">
                    <FilePreviewTrigger
                      file={photo}
                      thumbnailClassName="h-20 w-20 object-cover rounded-lg border hover:ring-2 hover:ring-primary-300 transition-all cursor-pointer"
                    />
                    <button
                      type="button"
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs"
                      onClick={() => removePhoto(n.id, idx)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <button type="button" className="text-xs text-red-500 mt-2" onClick={() => onChange(notes.filter((x) => x.id !== n.id))}>
              删除此行
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
