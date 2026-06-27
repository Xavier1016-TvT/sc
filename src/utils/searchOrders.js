import { getOrderDisplayName } from './orderUnit'

const MATERIAL_SEARCH_FIELDS = ['code', 'name', 'spec', 'note', 'type', 'status']

const MATERIAL_FIELD_LABELS = {
  code: '物料编码',
  name: '物料名称',
  spec: '规格',
  note: '备注',
  type: '物料类型',
  status: '物料状态',
}

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

function textMatches(text, query) {
  return text && String(text).toLowerCase().includes(query)
}

function firstMatchingField(item, query, fields = MATERIAL_SEARCH_FIELDS) {
  return fields.find((field) => textMatches(item[field], query))
}

function pushHit(hits, hit) {
  hits.push(hit)
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
    ...(order.subProjects || []).flatMap((sp) =>
      (sp.chipFirmwares || []).flatMap((fw) => [fw.name, fw.spec, fw.program, fw.note])
    ),
    ...(order.subProjects || []).flatMap((sp) => {
      const legacy = sp.chipFirmware
      if (legacy && !sp.chipFirmwares?.length) {
        return [legacy.name, legacy.spec, legacy.program, legacy.note]
      }
      return []
    }),
    ...(order.subProjects || []).flatMap((sp) =>
      (sp.docConfirmations || []).flatMap((d) => [d.name, d.note])
    ),
    ...(order.subProjects || []).flatMap((sp) =>
      (sp.problemNotes || []).map((p) => p.note)
    ),
    ...(order.subProjects || []).flatMap((sp) =>
      (sp.shippingRecords || []).map((r) => r.note)
    ),
  ]

  return parts
    .filter(Boolean)
    .some((text) => String(text).toLowerCase().includes(q))
}

export function filterOrdersBySearch(orders, query) {
  if (!query.trim()) return orders
  return orders.filter((o) => matchOrderSearch(o, query))
}

/** 返回可点击的搜索命中列表，用于跳转到订单内具体位置 */
export function findOrderSearchHits(orders, query, limit = 25) {
  const q = query.trim().toLowerCase()
  if (!q) return []

  const hits = []

  for (const order of orders) {
    const orderName = getOrderDisplayName(order)

    if (textMatches(order.name, q)) {
      pushHit(hits, {
        id: `order-${order.id}-name`,
        orderId: order.id,
        orderName,
        category: '订单',
        title: order.name,
        detail: [order.status, order.manufacturer].filter(Boolean).join(' · '),
      })
    }

    if (textMatches(order.manufacturer, q)) {
      pushHit(hits, {
        id: `order-${order.id}-mfr`,
        orderId: order.id,
        orderName,
        category: '贴片厂',
        title: order.manufacturer,
        detail: orderName,
      })
    }

    if (textMatches(order.materialPrep?.note, q)) {
      pushHit(hits, {
        id: `order-${order.id}-mat-note`,
        orderId: order.id,
        orderName,
        section: 'material',
        category: '物料备注',
        title: order.materialPrep.note,
        detail: orderName,
      })
    }

    for (const item of order.materialPrep?.items || []) {
      const field = firstMatchingField(item, q)
      if (!field) continue
      pushHit(hits, {
        id: `order-${order.id}-mat-${item.id}`,
        orderId: order.id,
        orderName,
        section: 'material',
        targetId: item.id,
        category: '物料',
        title: item.name || item.code || '物料明细',
        detail: `${orderName} · ${MATERIAL_FIELD_LABELS[field] || field}`,
      })
    }

    for (const sub of order.subProjects || []) {
      if (textMatches(sub.name, q)) {
        pushHit(hits, {
          id: `sub-${sub.id}-name`,
          orderId: order.id,
          orderName,
          subId: sub.id,
          subName: sub.name,
          section: 'basic',
          category: '子项目',
          title: sub.name,
          detail: orderName,
        })
      }

      if (textMatches(sub.materialStatus?.note, q)) {
        pushHit(hits, {
          id: `sub-${sub.id}-mat-note`,
          orderId: order.id,
          orderName,
          subId: sub.id,
          subName: sub.name,
          section: 'material',
          category: '物料备注',
          title: sub.materialStatus.note,
          detail: `${orderName} / ${sub.name}`,
        })
      }

      for (const item of sub.materialStatus?.items || []) {
        const field = firstMatchingField(item, q)
        if (!field) continue
        pushHit(hits, {
          id: `sub-${sub.id}-mat-${item.id}`,
          orderId: order.id,
          orderName,
          subId: sub.id,
          subName: sub.name,
          section: 'material',
          targetId: item.id,
          category: '物料',
          title: item.name || item.code || '物料明细',
          detail: `${orderName} / ${sub.name}`,
        })
      }

      for (const fw of sub.chipFirmwares || []) {
        const chipField = ['name', 'spec', 'program', 'note'].find((f) => textMatches(fw[f], q))
        if (!chipField) continue
        pushHit(hits, {
          id: `sub-${sub.id}-chip-${fw.id}`,
          orderId: order.id,
          orderName,
          subId: sub.id,
          subName: sub.name,
          section: 'chip',
          targetId: fw.id,
          category: '芯片固件',
          title: fw[chipField],
          detail: `${orderName} / ${sub.name}`,
        })
      }

      for (const doc of sub.docConfirmations || []) {
        if (textMatches(doc.name, q) || textMatches(doc.note, q)) {
          pushHit(hits, {
            id: `sub-${sub.id}-doc-${doc.id}`,
            orderId: order.id,
            orderName,
            subId: sub.id,
            subName: sub.name,
            section: 'doc',
            targetId: doc.id,
            category: '资料确认',
            title: doc.name || '资料项',
            detail: `${orderName} / ${sub.name}`,
          })
        }
      }

      for (const note of sub.problemNotes || []) {
        if (textMatches(note.note, q)) {
          pushHit(hits, {
            id: `sub-${sub.id}-prob-${note.id}`,
            orderId: order.id,
            orderName,
            subId: sub.id,
            subName: sub.name,
            section: 'problem',
            targetId: note.id,
            category: '问题备注',
            title: note.note,
            detail: `${orderName} / ${sub.name}`,
          })
        }
      }

      for (const ship of sub.shippingRecords || []) {
        if (textMatches(ship.note, q)) {
          pushHit(hits, {
            id: `sub-${sub.id}-ship-${ship.id}`,
            orderId: order.id,
            orderName,
            subId: sub.id,
            subName: sub.name,
            section: 'shipping',
            targetId: ship.id,
            category: '出货',
            title: ship.note,
            detail: `${orderName} / ${sub.name}`,
          })
        }
      }
    }
  }

  return hits.slice(0, limit)
}
