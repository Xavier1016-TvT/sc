import { getStorageApp } from './cloudbase'

const urlCache = new Map()

function sanitizeName(name = 'file') {
  return String(name).replace(/[^\w.\-()\u4e00-\u9fff]/g, '_')
}

function dataUrlToBlob(dataUrl) {
  const [header, base64] = dataUrl.split(',')
  const mime = header.match(/:(.*?);/)?.[1] || 'application/octet-stream'
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i)
  return new Blob([bytes], { type: mime })
}

export function isCloudFile(file) {
  return Boolean(file?.fileID)
}

export function hasFileContent(file) {
  return Boolean(file?.fileID || file?.dataUrl)
}

/** 上传 File / Blob，返回云文件引用（不含 dataUrl） */
export async function uploadFileToCloud(file, { name, type } = {}) {
  const cloudApp = await getStorageApp()
  const fileName = sanitizeName(name || file.name || 'file')
  const cloudPath = `dashboard/${Date.now()}_${Math.random().toString(36).slice(2, 8)}_${fileName}`

  const res = await cloudApp.uploadFile({
    cloudPath,
    filePath: file,
  })

  return {
    name: name || file.name || fileName,
    type: type || file.type || 'application/octet-stream',
    fileID: res.fileID,
    cloudPath,
  }
}

/** 从 dataUrl 上传到云存储 */
export async function uploadDataUrlToCloud({ dataUrl, name, type }) {
  const blob = dataUrlToBlob(dataUrl)
  return uploadFileToCloud(blob, { name, type })
}

/** 获取可访问的临时 URL */
export async function resolveFileUrl(file) {
  if (!file) return ''
  if (file.dataUrl) return file.dataUrl
  if (!file.fileID) return ''

  if (urlCache.has(file.fileID)) {
    const cached = urlCache.get(file.fileID)
    if (cached.expiresAt > Date.now()) return cached.url
  }

  const cloudApp = await getStorageApp()
  const { fileList } = await cloudApp.getTempFileURL({
    fileList: [{ fileID: file.fileID, maxAge: 86400 }],
  })
  const item = fileList?.[0]
  if (!item?.tempFileURL) {
    throw new Error(item?.errMsg || '无法获取文件链接')
  }

  urlCache.set(file.fileID, {
    url: item.tempFileURL,
    expiresAt: Date.now() + (item.maxAge || 3600) * 1000 - 60000,
  })
  return item.tempFileURL
}

/** 递归迁移 state 里遗留的 dataUrl 到云存储 */
export async function migrateEmbeddedFilesInState(state) {
  const next = JSON.parse(JSON.stringify(state))

  async function walk(node) {
    if (!node || typeof node !== 'object') return node
    if (Array.isArray(node)) {
      const arr = []
      for (const item of node) arr.push(await walk(item))
      return arr
    }

    if (node.dataUrl && !node.fileID && node.name) {
      try {
        const uploaded = await uploadDataUrlToCloud(node)
        return { name: uploaded.name, type: uploaded.type, fileID: uploaded.fileID, cloudPath: uploaded.cloudPath }
      } catch {
        return node
      }
    }

    const out = { ...node }
    for (const key of Object.keys(out)) {
      out[key] = await walk(out[key])
    }
    return out
  }

  return walk(next)
}

export function clearFileUrlCache() {
  urlCache.clear()
}
