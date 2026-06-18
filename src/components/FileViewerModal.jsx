import { useMemo, useEffect, useState } from 'react'
import {
  isImageFile,
  isPdfFile,
  isCsvFile,
  isSpreadsheetFile,
  dataUrlToText,
  parseCsv,
  getFileIcon,
} from '../utils/fileHelpers'
import { resolveFileUrl } from '../utils/cloudFiles'
import { useFileUrl } from '../hooks/useFileUrl'
import { loadSpreadsheetRows } from '../utils/spreadsheetPreview'

function TableRowsPreview({ rows }) {
  if (!rows.length) {
    return <p className="text-sm text-slate-500">表格为空或无法解析</p>
  }

  return (
    <div className="overflow-auto max-h-[70vh] border border-slate-200 rounded-lg bg-white">
      <table className="w-full text-sm">
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={i === 0 ? 'bg-slate-100 font-medium' : 'border-t border-slate-100'}>
              {(Array.isArray(row) ? row : [row]).map((cell, j) => (
                <td key={j} className="px-3 py-2 whitespace-nowrap text-slate-700">
                  {String(cell ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function CsvPreview({ text }) {
  const rows = useMemo(() => {
    try {
      return parseCsv(text)
    } catch {
      return []
    }
  }, [text])
  return <TableRowsPreview rows={rows} />
}

function SpreadsheetPreview({ file, url }) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    loadSpreadsheetRows(file, url)
      .then((data) => {
        if (!cancelled) setRows(data)
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || '表格加载失败')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [file, url])

  if (loading) return <p className="text-center text-slate-500 py-12">表格加载中…</p>
  if (error) return <p className="text-center text-red-600 py-12">{error}</p>
  return <TableRowsPreview rows={rows} />
}

function BinaryFilePreview({ file, url }) {
  const openUrl = async () => {
    const href = url || (await resolveFileUrl(file))
    window.open(href, '_blank', 'noopener,noreferrer')
  }

  const download = async () => {
    const href = url || (await resolveFileUrl(file))
    const a = document.createElement('a')
    a.href = href
    a.download = file.name || 'download'
    a.click()
  }

  return (
    <div className="text-center py-10 px-4 bg-white rounded-lg">
      <div className="text-5xl mb-4">{getFileIcon(file)}</div>
      <p className="font-medium text-slate-800 mb-1">{file.name}</p>
      <p className="text-sm text-slate-500 mb-6">该文件类型暂不支持在线预览，可下载或在新窗口打开</p>
      <div className="flex flex-wrap justify-center gap-3">
        <button type="button" className="btn-primary" onClick={download}>
          下载文件
        </button>
        <button type="button" className="btn-secondary" onClick={openUrl}>
          新窗口打开
        </button>
      </div>
    </div>
  )
}

export default function FileViewerModal({ file, onClose }) {
  const { url, loading, error } = useFileUrl(file)

  if (!file) return null

  const image = isImageFile(file)
  const pdf = isPdfFile(file)
  const csv = isCsvFile(file)
  const sheet = isSpreadsheetFile(file)
  const csvText = csv && file.dataUrl ? dataUrlToText(file.dataUrl) : ''

  const handleDownload = async () => {
    const href = url || (await resolveFileUrl(file))
    const a = document.createElement('a')
    a.href = href
    a.download = file.name || 'download'
    a.click()
  }

  const handleOpen = async () => {
    const href = url || (await resolveFileUrl(file))
    window.open(href, '_blank', 'noopener,noreferrer')
  }

  const showBinaryFallback =
    !loading && !error && !image && !pdf && !(csv && csvText) && !sheet

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`查看文件 ${file.name}`}
      >
        <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-lg">{getFileIcon(file)}</span>
            <span className="font-medium text-slate-800 truncate">{file.name}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button type="button" className="btn-secondary text-xs" onClick={handleDownload}>
              下载
            </button>
            <button type="button" className="btn-secondary text-xs" onClick={handleOpen}>
              新窗口
            </button>
            <button
              type="button"
              className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-500 text-xl leading-none"
              onClick={onClose}
              aria-label="关闭"
            >
              ×
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-5 bg-slate-50/50">
          {loading && <p className="text-center text-slate-500 py-12">文件加载中…</p>}
          {error && <p className="text-center text-red-600 py-12">{error}</p>}
          {!loading && !error && image && url && (
            <img
              src={url}
              alt={file.name}
              loading="lazy"
              decoding="async"
              className="max-w-full max-h-[75vh] mx-auto rounded-lg shadow-md object-contain bg-white"
            />
          )}
          {!loading && !error && pdf && url && (
            <iframe
              src={url}
              title={file.name}
              className="w-full h-[75vh] rounded-lg border border-slate-200 bg-white"
            />
          )}
          {!loading && !error && csv && csvText && <CsvPreview text={csvText} />}
          {!loading && !error && sheet && <SpreadsheetPreview file={file} url={url} />}
          {showBinaryFallback && <BinaryFilePreview file={file} url={url} />}
        </div>
      </div>
    </div>
  )
}
