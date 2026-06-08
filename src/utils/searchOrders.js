/** 按关键词匹配订单（名称、厂家、状态、交期、子项目名称） */
export function matchOrderSearch(order, query) {
  const q = query.trim().toLowerCase()
  if (!q) return true

  const parts = [
    order.name,
    order.manufacturer,
    order.status,
    order.deliveryDate,
    order.sampleInfo?.result,
    order.materialPrep?.option,
    ...(order.subProjects || []).map((sp) => sp.name),
  ]

  return parts
    .filter(Boolean)
    .some((text) => String(text).toLowerCase().includes(q))
}

export function filterOrdersBySearch(orders, query) {
  if (!query.trim()) return orders
  return orders.filter((o) => matchOrderSearch(o, query))
}
