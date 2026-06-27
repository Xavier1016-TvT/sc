const STORAGE_KEY = 'dashboard-filters'

export function saveDashboardFilters({ q = '', tab = '全部' }) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ q, tab }))
  } catch {
    /* ignore */
  }
}

export function loadDashboardFilters() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

/** 带筛选条件的首页路径（浏览器后退、面包屑返回时保留搜索） */
export function getDashboardHomePath(filters = loadDashboardFilters()) {
  const params = new URLSearchParams()
  if (filters.q?.trim()) params.set('q', filters.q.trim())
  if (filters.tab && filters.tab !== '全部') params.set('tab', filters.tab)
  const qs = params.toString()
  return qs ? `/?${qs}` : '/'
}
