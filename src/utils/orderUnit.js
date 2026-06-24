import { getOrderUnit } from './calculations'

export { getOrderUnit }

/** 单位「套」：一套内含多个子项目 */
export function isSetOrder(order) {
  return getOrderUnit(order) === '套'
}

/** 单位「个」：单个产品，名称即子项目名 */
export function isPieceOrder(order) {
  return getOrderUnit(order) === '个'
}

export function getOrderNameLabel(order) {
  return isPieceOrder(order) ? '子项目名称' : '订单名称'
}

export function getOrderPrimarySub(order) {
  const subs = order?.subProjects || []
  return subs.length > 0 ? subs[0] : null
}

/** 列表/导航展示名：个 → 优先子项目名，否则订单名 */
export function getOrderDisplayName(order) {
  if (!order) return ''
  if (isPieceOrder(order)) {
    return getOrderPrimarySub(order)?.name || order.name || ''
  }
  return order.name || ''
}

/** 订单详情入口（个/套统一进订单页，样品与物料流程不变） */
export function getOrderDetailPath(order) {
  if (!order) return '/'
  return `/order/${order.id}`
}

/** 是否按子项目汇总展示物料（未下单的个订单仍用订单级物料） */
export function orderShowsSubProjectMaterial(order) {
  const subs = order?.subProjects || []
  if (!subs.length) return false
  if (isPieceOrder(order) && order.status === '未下单') return false
  return true
}
