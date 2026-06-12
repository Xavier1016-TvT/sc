import { useEffect, useState } from 'react'
import { resolveFileUrl } from '../utils/cloudFiles'

export function useFileUrl(file) {
  const [url, setUrl] = useState(file?.dataUrl || '')
  const [loading, setLoading] = useState(Boolean(file?.fileID && !file?.dataUrl))
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function load() {
      if (!file) {
        setUrl('')
        setLoading(false)
        setError('')
        return
      }
      if (file.dataUrl) {
        setUrl(file.dataUrl)
        setLoading(false)
        setError('')
        return
      }
      if (!file.fileID) {
        setUrl('')
        setLoading(false)
        return
      }

      setLoading(true)
      setError('')
      try {
        const tempUrl = await resolveFileUrl(file)
        if (!cancelled) {
          setUrl(tempUrl)
          setLoading(false)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || '文件加载失败')
          setUrl('')
          setLoading(false)
        }
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [file?.fileID, file?.dataUrl, file?.name])

  return { url, loading, error }
}
