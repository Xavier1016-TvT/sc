const MATERIAL_SEARCH_FIELDS = ['code', 'name', 'spec', 'note', 'type', 'status']

function collectMaterialItems(order) {
  const items = [...(order.materialPrep?.items || [])]
  ;(order.subProjects || []).forEach((sp) => {
    items.push(...(sp.materialStatus?.items || []))
  })
  return items
}

function materialItemSearchTexts(item) {
  return MATERIAL_SEARCH_FIELDS.map((field) => item[field]).filter(Boolean)
}

/** 按关键词匹配订单（名称、厂家、状态、交期、子项目、物料明细） */
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
    order.materialPrep?.note,
    ...(order.subProjects || []).map((sp) => sp.name),
    ...(order.subProjects || []).map((sp) => sp.materialStatus?.option),
    ...(order.subProjects || []).map((sp) => sp.materialStatus?.note),
    ...collectMaterialItems(order).flatMap(materialItemSearchTexts),
  ]

  return parts
    .filter(Boolean)
    .some((text) => String(text).toLowerCase().includes(q))
}

export function filterOrdersBySearch(orders, query) {
  if (!query.trim()) return orders
  return orders.filter((o) => matchOrderSearch(o, query))
}
