import { createMaterialItem } from './defaults'
import { MATERIAL_OPTIONS } from './constants'

export function defaultMaterialStatus() {
  return { option: '备料中', note: '', file: null, items: [] }
}

/** 缺料种类数（shortage > 0 的行数） */
export function countShortageKinds(items = []) {
  return items.filter((it) => getItemShortage(it) > 0).length
}

export function getItemShortage(item) {
  const shortage = Number(item.shortage)
  if (shortage > 0) return shortage
  const required = Number(item.required) || 0
  const received = Number(item.received) || 0
  return Math.max(0, required - received)
}

export function getShortageItems(items = []) {
  return items.filter((it) => getItemShortage(it) > 0)
}

/** 各子项目缺料概况（仅含存在缺料的子项目） */
export function getSubProjectShortageSummaries(subProjects = []) {
  return (subProjects || [])
    .map((sub) => {
      const items = sub.materialStatus?.items || []
      const shortageKinds = countShortageKinds(items)
      if (shortageKinds === 0) return null
      return {
        subId: sub.id,
        subName: sub.name || '未命名子项目',
        shortageKinds,
        items: getShortageItems(items),
      }
    })
    .filter(Boolean)
}

function itemKey(item) {
  return [item.code, item.name, item.spec].map((v) => String(v || '').trim()).join('||')
}

/** 各子项目物料汇总为订单总物料 */
export function aggregateMaterialFromSubProjects(subProjects) {
  const map = new Map()

  ;(subProjects || []).forEach((sub) => {
    ;(sub.materialStatus?.items || []).forEach((item) => {
      const key = itemKey(item)
      if (!key.replace(/\|/g, '')) return

      if (!map.has(key)) {
        map.set(key, {
          ...createMaterialItem(),
          code: item.code,
          name: item.name,
          spec: item.spec,
          type: item.type || '贴片',
          status: item.status || '',
          note: item.note || '',
          required: 0,
          received: 0,
          shortage: 0,
        })
      }
      const row = map.get(key)
      row.required += Number(item.required) || 0
      row.received += Number(item.received) || 0
      row.shortage = Math.max(0, row.required - row.received)
    })
  })

  const items = Array.from(map.values())
  const shortageKinds = countShortageKinds(items)
  const subs = subProjects || []

  let option = '备料中'
  if (subs.length > 0 && subs.every((sp) => sp.materialStatus?.option === '料齐')) {
    option = shortageKinds > 0 ? '备料中' : '料齐'
  }

  return {
    option,
    note: subs.length ? `汇总 ${subs.length} 个子项目物料` : '',
    file: null,
    items,
  }
}

export function getMaterialSubtitle(material, { isSummary = false } = {}) {
  const items = material?.items || []
  const shortageKinds = countShortageKinds(items)
  const parts = [material?.option || '备料中']
  if (shortageKinds > 0) {
    parts.push(`缺料 ${shortageKinds} 种`)
  } else if (items.length) {
    parts.push('无缺料')
  }
  if (isSummary) parts.push('总览')
  return parts.join(' · ')
}

export { MATERIAL_OPTIONS }
