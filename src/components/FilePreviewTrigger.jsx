import { useState } from 'react'
import FileViewerModal from './FileViewerModal'
import { isImageFile, getFileIcon } from '../utils/fileHelpers'
import { hasFileContent } from '../utils/cloudFiles'
import { useFileUrl } from '../hooks/useFileUrl'

/**
 * 点击打开文件预览。children 为空时显示默认文件名/缩略图。
 */
export default function FilePreviewTrigger({
  file,
  children,
  className = '',
  thumbnailClassName = 'max-h-32 rounded-lg border border-slate-200 hover:opacity-90 hover:ring-2 hover:ring-primary-300 transition-all cursor-pointer',
  nameClassName = 'text-xs text-primary-600 hover:underline truncate max-w-[240px] cursor-pointer',
}) {
  const [open, setOpen] = useState(false)
  const { url, loading } = useFileUrl(file)

  if (!hasFileContent(file)) return null

  const isImage = isImageFile(file)

  return (
    <>
      {children ? (
        <button type="button" className={className} onClick={() => setOpen(true)}>
          {children}
        </button>
      ) : isImage ? (
        <button type="button" className="block" onClick={() => setOpen(true)} title="点击查看大图">
          {loading ? (
            <div className={`${thumbnailClassName} flex items-center justify-center bg-slate-100 text-xs text-slate-400`}>
              加载中
            </div>
          ) : (
            <img src={url} alt={file.name} className={thumbnailClassName} loading="lazy" />
          )}
        </button>
      ) : (
        <button
          type="button"
          className={`inline-flex items-center gap-1.5 ${nameClassName}`}
          onClick={() => setOpen(true)}
          title="点击查看文件"
        >
          <span>{getFileIcon(file)}</span>
          <span className="truncate">{file.name}</span>
        </button>
      )}
      {open && <FileViewerModal file={file} onClose={() => setOpen(false)} />}
    </>
  )
}
