import { uploadDataUrlToCloud, uploadFileToCloud } from './cloudFiles'
/** 单文件大小上限（15MB） */
export const MAX_FILE_SIZE = 15 * 1024 * 1024

export function formatMaxFileSize() {
  return `${Math.round(MAX_FILE_SIZE / 1024 / 1024)}MB`
}

export function isImageFile(file) {
  if (!file) return false
  return file.type?.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(file.name || '')
}

export function isPdfFile(file) {
  if (!file) return false
  return file.type === 'application/pdf' || /\.pdf$/i.test(file.name || '')
}

export function isCsvFile(file) {
  if (!file) return false
  return file.type === 'text/csv' || /\.csv$/i.test(file.name || '')
}

export function isSpreadsheetFile(file) {
  return /\.(xlsx|xls|wps)$/i.test(file?.name || '')
}

export function dataUrlToText(dataUrl) {
  const base64 = dataUrl.split(',')[1]
  if (!base64) return ''
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i)
  return new TextDecoder('utf-8').decode(bytes)
}

export function parseCsv(text) {
  return text
    .trim()
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => {
      const cells = []
      let cur = ''
      let inQuotes = false
      for (let i = 0; i < line.length; i += 1) {
        const ch = line[i]
        if (ch === '"') {
          inQuotes = !inQuotes
        } else if (ch === ',' && !inQuotes) {
          cells.push(cur.trim())
          cur = ''
        } else {
          cur += ch
        }
      }
      cells.push(cur.trim())
      return cells
    })
}

export function openInNewTab(dataUrl) {
  window.open(dataUrl, '_blank', 'noopener,noreferrer')
}

export function downloadDataUrl(dataUrl, filename) {
  const a = document.createElement('a')
  a.href = dataUrl
  a.download = filename || 'download'
  a.click()
}

function readRawFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () =>
      resolve({ name: file.name, dataUrl: reader.result, type: file.type, size: file.size })
    reader.onerror = () => reject(new Error('文件读取失败'))
    reader.readAsDataURL(file)
  })
}

/** 压缩大图，减轻 localStorage 压力，避免上传后页面卡死/白屏 */
function compressImageFile(file, maxDim = 2560, quality = 0.88) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()

    img.onload = () => {
      URL.revokeObjectURL(url)
      let { width, height } = img
      const scale = Math.min(1, maxDim / Math.max(width, height, 1))
      width = Math.max(1, Math.round(width * scale))
      height = Math.max(1, Math.round(height * scale))

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('无法处理图片'))
        return
      }
      ctx.drawImage(img, 0, 0, width, height)

      const usePng = /png$/i.test(file.name) || file.type === 'image/png'
      const mime = usePng ? 'image/png' : 'image/jpeg'
      const dataUrl = canvas.toDataURL(mime, usePng ? undefined : quality)
      resolve({
        name: file.name,
        dataUrl,
        type: mime,
        size: file.size,
        compressed: true,
      })
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('图片加载失败'))
    }

    img.src = url
  })
}

function shouldCompressImage(file) {
  if (/\.(gif|heic|heif)$/i.test(file.name || '')) return false
  if (!file.type?.startsWith('image/')) return /\.(jpe?g|png|webp|bmp)$/i.test(file.name || '')
  return file.type !== 'image/gif'
}

export async function readFileAsDataUrl(file) {
  if (!file) throw new Error('未选择文件')
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`文件大小不能超过 ${formatMaxFileSize()}`)
  }

  if (shouldCompressImage(file) && file.size > 400 * 1024) {
    try {
      const compressed = await compressImageFile(file)
      return uploadDataUrlToCloud(compressed)
    } catch {
      // 压缩失败则原样上传
    }
  }

  return uploadFileToCloud(file, { name: file.name, type: file.type })
}

/** 仅本地读取（解析 Excel/CSV 等，不上传） */
export async function readFileLocally(file) {
  if (!file) throw new Error('未选择文件')
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`文件大小不能超过 ${formatMaxFileSize()}`)
  }
  return readRawFileAsDataUrl(file)
}

export function getFileIcon(file) {
  if (isImageFile(file)) return '🖼️'
  if (isPdfFile(file)) return '📄'
  if (isCsvFile(file) || isSpreadsheetFile(file)) return '📊'
  return '📎'
}
