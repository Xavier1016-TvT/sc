import { useRef, useState } from 'react'
import { readFileAsDataUrl, isImageFile, getFileIcon, formatMaxFileSize } from '../utils/fileHelpers'
import { hasFileContent } from '../utils/cloudFiles'
import FileViewerModal from './FileViewerModal'
import { useFileUrl } from '../hooks/useFileUrl'

export default function FileUpload({
  value,
  onChange,
  accept = '*/*',
  label = '上传文件',
  preview = true,
}) {
  const inputRef = useRef(null)
  const [viewOpen, setViewOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { url, loading: urlLoading } = useFileUrl(value)

  const handleChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setLoading(true)
    try {
      const result = await readFileAsDataUrl(file)
      onChange(result)
    } catch (err) {
      alert(err.message || '文件上传失败')
    } finally {
      setLoading(false)
      e.target.value = ''
    }
  }

  const isImage = value && isImageFile(value)

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 flex-wrap">
        <button
          type="button"
          className="btn-secondary text-xs"
          disabled={loading}
          onClick={() => inputRef.current?.click()}
        >
          {loading ? '上传中…' : label}
        </button>
        {hasFileContent(value) && (
          <>
            <button
              type="button"
              className="inline-flex items-center gap-1 text-xs text-primary-600 hover:underline truncate max-w-[220px]"
              onClick={() => setViewOpen(true)}
              title="点击查看"
            >
              <span>{getFileIcon(value)}</span>
              <span className="truncate">{value.name}</span>
            </button>
            <button type="button" className="text-xs text-red-500 hover:underline" onClick={() => onChange(null)}>
              移除
            </button>
          </>
        )}
      </div>
      <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={handleChange} />
      <p className="text-xs text-slate-400">单文件最大 {formatMaxFileSize()}，上传后保存至云存储</p>
      {preview && hasFileContent(value) && isImage && (
        <button type="button" onClick={() => setViewOpen(true)} className="block" title="点击查看大图">
          {urlLoading ? (
            <div className="h-40 w-40 flex items-center justify-center bg-slate-100 rounded-lg border text-xs text-slate-400">
              加载中
            </div>
          ) : (
            <img
              src={url}
              alt={value.name}
              loading="lazy"
              className="max-h-40 max-w-full rounded-lg border border-slate-200 hover:opacity-90 hover:ring-2 hover:ring-primary-300 transition-all cursor-pointer object-contain"
            />
          )}
        </button>
      )}
      {preview && hasFileContent(value) && !isImage && (
        <button
          type="button"
          className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-100 hover:border-primary-300 transition-colors cursor-pointer"
          onClick={() => setViewOpen(true)}
        >
          <span>{getFileIcon(value)}</span>
          <span>点击查看文件</span>
        </button>
      )}
      {viewOpen && value && <FileViewerModal file={value} onClose={() => setViewOpen(false)} />}
    </div>
  )
}
