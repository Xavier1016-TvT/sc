import { useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'

/** 读取 URL 中的 section / highlight，展开对应区块并滚动高亮 */
export function useSearchTarget({ onSection }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const onSectionRef = useRef(onSection)
  onSectionRef.current = onSection

  useEffect(() => {
    const section = searchParams.get('section')
    const highlight = searchParams.get('highlight')
    if (!section && !highlight) return

    if (section) onSectionRef.current?.(section)

    const timer = window.setTimeout(() => {
      const target =
        (highlight && document.getElementById(`highlight-${highlight}`)) ||
        (section && document.getElementById(`section-${section}`))

      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: highlight ? 'center' : 'start' })
        if (highlight) {
          target.classList.add('search-highlight')
          window.setTimeout(() => target.classList.remove('search-highlight'), 3000)
        }
      }

      const next = new URLSearchParams(searchParams)
      next.delete('section')
      next.delete('highlight')
      if (next.toString() !== searchParams.toString()) {
        setSearchParams(next, { replace: true })
      }
    }, 350)

    return () => window.clearTimeout(timer)
  }, [searchParams, setSearchParams])
}
