import { countShortageKinds } from './materialAggregate'

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

/** 子项目已出货数量 = 出货记录累加 */
export function getSubProjectShipped(subProject) {
  return (subProject.shippingRecords || []).reduce(
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

/** 子项目未出货 = 目标数量 - 已出货（目标取子项目数量，否则取订单数量） */
export function getSubProjectRemaining(subProject, order) {
  const shipped = getSubProjectShipped(subProject)
  const target = subProject.quantity ?? order?.quantity ?? 0
  return Math.max(0, (Number(target) || 0) - shipped)
}

/** 子项目不良率 = 不良数 ÷ 已出货 × 100% */
export function getSubProjectDefectRate(subProject) {
  const shipped = getSubProjectShipped(subProject)
  if (shipped <= 0) return 0
  return (getSubProjectDefects(subProject) / shipped) * 100
}

/** 子项目最近出货日期（取出货记录中最晚日期） */
export function getSubProjectLastShippingDate(subProject) {
  const dates = (subProject.shippingRecords || [])
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
    lastShippingDate: getSubProjectLastShippingDate(subProject),
    remaining: getSubProjectRemaining(subProject, order),
    smtCumulative: getSubProjectCumulative(subProject),
    testCumulative: getSubProjectTestCumulative(subProject),
    defectRate: getSubProjectDefectRate(subProject),
  }
}

/** 订单数量单位，默认套 */
export function getOrderUnit(order) {
  return order?.quantityUnit === '个' ? '个' : '套'
}

export function formatQty(value, unit) {
  return `${value ?? 0} ${unit}`
}

/** 整单累计出货：单位为套时取各子项目最小值，单位为个时取总和 */
export function getOrderCumulativeShipping(order) {
  const subs = order.subProjects || []
  if (subs.length === 0) return 0
  const shipped = subs.map(getSubProjectShipped)
  if (getOrderUnit(order) === '个') {
    return shipped.reduce((sum, v) => sum + v, 0)
  }
  return Math.min(...shipped)
}

/** 订单已出货总和（个）= 所有子项目已出货数量之和，用于不良率分母 */
export function getOrderShippedSum(order) {
  return (order.subProjects || []).reduce(
    (sum, sp) => sum + getSubProjectShipped(sp),
    0
  )
}

/** 不良合计 = 所有子项目不良数量之和 */
export function getOrderTotalDefects(order) {
  return (order.subProjects || []).reduce(
    (sum, sp) => sum + getSubProjectDefects(sp),
    0
  )
}

/** 订单完成率 = 累计出货 ÷ 订单数量 × 100% */
export function getOrderCompletionRate(order) {
  const qty = Number(order.quantity) || 0
  if (qty <= 0) return 0
  return (getOrderCumulativeShipping(order) / qty) * 100
}

/** 当前不良率 = 不良合计 ÷ 已出货总和 × 100% */
export function getOrderDefectRate(order) {
  const shipped = getOrderShippedSum(order)
  if (shipped <= 0) return 0
  return (getOrderTotalDefects(order) / shipped) * 100
}

/** 剩余未出货 = 订单数量 - 累计出货 */
export function getOrderRemaining(order) {
  return Math.max(0, (Number(order.quantity) || 0) - getOrderCumulativeShipping(order))
}

export function getOrderMetrics(order) {
  const cumulativeShipping = getOrderCumulativeShipping(order)
  const totalDefects = getOrderTotalDefects(order)
  const shippedSum = getOrderShippedSum(order)
  return {
    subProjectCount: (order.subProjects || []).length,
    cumulativeShipping,
    totalDefects,
    shippedSum,
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
    totalDefects: orderMetrics.reduce((s, m) => s + m.totalDefects, 0),
    totalRemaining: orderMetrics.reduce((s, m) => s + m.remaining, 0),
    avgCompletionRate:
      orderMetrics.length > 0
        ? orderMetrics.reduce((s, m) => s + m.completionRate, 0) / orderMetrics.length
        : 0,
    totalShippedSum: orderMetrics.reduce((s, m) => s + m.shippedSum, 0),
  }
}

export function getGlobalDefectRate(summary) {
  if (summary.totalShippedSum <= 0) return 0
  return (summary.totalDefects / summary.totalShippedSum) * 100
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
