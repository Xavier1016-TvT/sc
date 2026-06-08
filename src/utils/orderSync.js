import { createSubProject, createMaterialItem } from './defaults'
import {
  defaultMaterialStatus,
  aggregateMaterialFromSubProjects,
} from './materialAggregate'

export function defaultSampleInfo() {
  return { date: '', quantity: 0, result: '', image: null }
}

export function defaultMaterialPrep() {
  return defaultMaterialStatus()
}

export function applySampleInfoToOrder(order, sampleInfo) {
  return { ...order, sampleInfo }
}

export function applyMaterialPrepToOrder(order, materialPrep) {
  return { ...order, materialPrep }
}

function recomputeOrderMaterial(order) {
  const subs = order.subProjects || []
  if (subs.length === 0) return order
  return { ...order, materialPrep: aggregateMaterialFromSubProjects(subs) }
}

/** 子项目更新后回写订单总物料 */
export function applySubProjectPatch(order, subId, patch) {
  let subProjects = (order.subProjects || []).map((sp) =>
    sp.id === subId ? { ...sp, ...patch } : sp
  )
  let nextOrder = { ...order, subProjects }
  if (patch.materialStatus) {
    nextOrder = recomputeOrderMaterial(nextOrder)
  }
  return nextOrder
}

/** 新建子项目（未下单阶段订单物料可复制到首个子项目，此处保持独立空表） */
export function createSubProjectFromOrder(name, order) {
  const sub = createSubProject(name)
  const prep = order?.materialPrep
  if (prep?.items?.length && !(order.subProjects || []).length) {
    sub.materialStatus = {
      ...defaultMaterialStatus(),
      option: prep.option || '备料中',
      note: prep.note || '',
      file: prep.file || null,
      items: prep.items.map((it) => ({
        ...createMaterialItem(),
        code: it.code,
        name: it.name,
        spec: it.spec,
        required: it.required,
        received: it.received,
        shortage: it.shortage,
        status: it.status,
        note: it.note,
        type: it.type || '贴片',
      })),
    }
  }
  return sub
}

export function afterSubProjectListChange(order) {
  return recomputeOrderMaterial(order)
}
