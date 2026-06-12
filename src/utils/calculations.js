import { countShortageKinds } from './materialAggregate'
import { isLargeOrder, isSmallOrder } from './orderWorkflow'

/** 子项目不良数量 = 出货不良统计累加 */
export function getSubProjectDefects(subProject) {
  if (subProject.defectRecords?.length) {
    return subProject.defectRecords.reduce(
      (sum, r) => sum + (Number(r.defectQty) || 0),
      0
    )
  }
  return Number(subProject.defectQuantity) || 0
}

/** 子项目已出货数量 = 有出货日期的记录数量累加（贴片厂发出） */
export function getSubProjectShipped(subProject) {
  return (subProject.shippingRecords || []).reduce((sum, r) => {
    if (!r.shipDate) return sum
    return sum + (Number(r.quantity) || 0)
  }, 0)
}

/** 子项目已贴回数量 = 贴回记录数量累加（回到公司） */
export function getSubProjectReturned(subProject) {
  return (subProject.returnRecords || []).reduce(
    (sum, r) => sum + (Number(r.quantity) || 0),
    0
  )
}

/** 子项目累计贴片数量 = 生产工序记录中贴片数量累加 */
export function getSubProjectCumulative(subProject) {
  return (subProject.processRecords || []).reduce(
    (sum, r) => sum + (Number(r.smtQty) || 0),
    0
  )
}

/** 子项目累计测试数量 = 生产工序记录中测试数量累加 */
export function getSubProjectTestCumulative(subProject) {
  return (subProject.processRecords || []).reduce(
    (sum, r) => sum + (Number(r.testQty) || 0),
    0
  )
}

/** 子项目剩余：小订单看未贴回，大订单看未出货 */
export function getSubProjectRemaining(subProject, order) {
  const done = isLargeOrder(order)
    ? getSubProjectShipped(subProject)
    : getSubProjectReturned(subProject)
  const target = subProject.quantity ?? order?.quantity ?? 0
  return Math.max(0, (Number(target) || 0) - done)
}

/** 子项目不良率 */
export function getSubProjectDefectRate(subProject, order) {
  const base = isLargeOrder(order)
    ? getSubProjectShipped(subProject)
    : getSubProjectReturned(subProject)
  if (base <= 0) return 0
  return (getSubProjectDefects(subProject) / base) * 100
}

/** 子项目最近出货日期（贴片厂） */
export function getSubProjectLastShippingDate(subProject) {
  const dates = (subProject.shippingRecords || [])
    .map((r) => r.shipDate)
    .filter(Boolean)
  if (!dates.length) return ''
  return dates.sort().at(-1)
}

/** 子项目最近贴回日期（小订单） */
export function getSubProjectLastReturnDate(subProject) {
  const dates = (subProject.returnRecords || [])
    .map((r) => r.date)
    .filter(Boolean)
  if (!dates.length) return ''
  return dates.sort().at(-1)
}

/** 子项目资料确认进度 */
export function getDocConfirmationSummary(subProject) {
  const docs = subProject.docConfirmations || []
  const confirmed = docs.filter((d) => d.status === '已确认').length
  return { confirmed, total: docs.length }
}

export function getSubProjectMetrics(subProject, order) {
  const material = subProject.materialStatus || {}
  const items = material.items || []
  const docSummary = getDocConfirmationSummary(subProject)
  return {
    materialOption: material.option || '备料中',
    shortageKinds: countShortageKinds(items),
    docConfirmed: docSummary.confirmed,
    docTotal: docSummary.total,
    shipped: getSubProjectShipped(subProject),
    returned: getSubProjectReturned(subProject),
    lastShippingDate: getSubProjectLastShippingDate(subProject),
    lastReturnDate: getSubProjectLastReturnDate(subProject),
    remaining: getSubProjectRemaining(subProject, order),
    smtCumulative: getSubProjectCumulative(subProject),
    testCumulative: getSubProjectTestCumulative(subProject),
    defectRate: getSubProjectDefectRate(subProject, order),
  }
}

/** 订单数量单位，默认套 */
export function getOrderUnit(order) {
  return order?.quantityUnit === '个' ? '个' : '套'
}

export function formatQty(value, unit) {
  return `${value ?? 0} ${unit}`
}

function aggregateSubValues(order, getter) {
  const subs = order.subProjects || []
  if (subs.length === 0) return 0
  const values = subs.map(getter)
  if (getOrderUnit(order) === '个') {
    return values.reduce((sum, v) => sum + v, 0)
  }
  return Math.min(...values)
}

/** 整单累计出货（贴片厂发出） */
export function getOrderCumulativeShipping(order) {
  return aggregateSubValues(order, getSubProjectShipped)
}

/** 整单累计贴回（小订单，回到公司） */
export function getOrderCumulativeReturned(order) {
  if (isLargeOrder(order)) return 0
  return aggregateSubValues(order, getSubProjectReturned)
}

/** 订单已贴回总和（个） */
export function getOrderReturnedSum(order) {
  return (order.subProjects || []).reduce(
    (sum, sp) => sum + getSubProjectReturned(sp),
    0
  )
}

/** 订单已出货总和（个） */
export function getOrderShippedSum(order) {
  return (order.subProjects || []).reduce(
    (sum, sp) => sum + getSubProjectShipped(sp),
    0
  )
}

function getOrderProgressTotal(order) {
  return isLargeOrder(order)
    ? getOrderCumulativeShipping(order)
    : getOrderCumulativeReturned(order)
}

function getOrderProgressSum(order) {
  return isLargeOrder(order) ? getOrderShippedSum(order) : getOrderReturnedSum(order)
}

/** 不良合计 = 所有子项目不良数量之和 */
export function getOrderTotalDefects(order) {
  return (order.subProjects || []).reduce(
    (sum, sp) => sum + getSubProjectDefects(sp),
    0
  )
}

/** 订单完成率：小订单按贴回，大订单按出货 */
export function getOrderCompletionRate(order) {
  const qty = Number(order.quantity) || 0
  if (qty <= 0) return 0
  return (getOrderProgressTotal(order) / qty) * 100
}

/** 不良率 */
export function getOrderDefectRate(order) {
  const base = getOrderProgressSum(order)
  if (base <= 0) return 0
  return (getOrderTotalDefects(order) / base) * 100
}

/** 剩余数量 */
export function getOrderRemaining(order) {
  return Math.max(0, (Number(order.quantity) || 0) - getOrderProgressTotal(order))
}

export function getOrderMetrics(order) {
  const cumulativeShipping = getOrderCumulativeShipping(order)
  const cumulativeReturned = getOrderCumulativeReturned(order)
  const totalDefects = getOrderTotalDefects(order)
  const returnedSum = getOrderReturnedSum(order)
  return {
    subProjectCount: (order.subProjects || []).length,
    cumulativeShipping,
    cumulativeReturned,
    totalDefects,
    returnedSum,
    unit: getOrderUnit(order),
    completionRate: getOrderCompletionRate(order),
    defectRate: getOrderDefectRate(order),
    remaining: getOrderRemaining(order),
  }
}

export function getGlobalSummary(orders) {
  const orderMetrics = orders.map((o) => ({ order: o, ...getOrderMetrics(o) }))

  const sampleCounts = { 通过: 0, 未通过: 0, 进行中: 0 }
  orders.forEach((o) => {
    const result = o.sampleInfo?.result
    if (sampleCounts[result] !== undefined) {
      sampleCounts[result] += 1
    }
  })

  return {
    totalOrders: orders.length,
    totalSubProjects: orderMetrics.reduce((s, m) => s + m.subProjectCount, 0),
    orderMetrics,
    sampleCounts,
    totalCumulativeShipping: orderMetrics.reduce((s, m) => s + m.cumulativeShipping, 0),
    totalCumulativeReturned: orderMetrics.reduce((s, m) => s + m.cumulativeReturned, 0),
    totalDefects: orderMetrics.reduce((s, m) => s + m.totalDefects, 0),
    totalRemaining: orderMetrics.reduce((s, m) => s + m.remaining, 0),
    avgCompletionRate:
      orderMetrics.length > 0
        ? orderMetrics.reduce((s, m) => s + m.completionRate, 0) / orderMetrics.length
        : 0,
    totalReturnedSum: orderMetrics.reduce((s, m) => s + m.returnedSum, 0),
  }
}

export function getGlobalDefectRate(summary) {
  if (summary.totalReturnedSum <= 0) return 0
  return (summary.totalDefects / summary.totalReturnedSum) * 100
}

export function formatPercent(value, digits = 1) {
  return `${value.toFixed(digits)}%`
}

export function formatDefectRate(value) {
  return formatPercent(value, 2)
}

export function formatNumber(value) {
  return Number(value) || 0
}
