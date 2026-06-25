/** 构建搜索命中后的跳转路径（含区块定位参数） */
export function getSearchHitPath(hit) {
  const params = new URLSearchParams()
  if (hit.section) params.set('section', hit.section)
  if (hit.targetId) params.set('highlight', hit.targetId)
  const qs = params.toString()
  const suffix = qs ? `?${qs}` : ''
  if (hit.subId) return `/order/${hit.orderId}/sub/${hit.subId}${suffix}`
  return `/order/${hit.orderId}${suffix}`
}
