import { STORAGE_KEY, CLOUD_COLLECTION, CLOUD_STATE_DOC_ID } from './constants'
import {
  createDefaultState,
  createOrder,
  createSubProject,
  createDocConfirmation,
  createReturnRecord,
} from './defaults'
import { defaultMaterialPrep } from './orderSync'
import { getDatabase } from './cloudbase'
import { migrateEmbeddedFilesInState } from './cloudFiles'

function normalizeDocConfirmation(doc) {
  const base = createDocConfirmation(doc.name || '')
  const merged = { ...base, ...doc }
  if (merged.name === '首件确认' && merged.file && !merged.fileFront) {
    merged.fileFront = merged.file
  }
  return merged
}

function normalizeShippingRecord(record) {
  const shipDate = record.shipDate || record.date || ''
  const { date, returnDate, ...rest } = record
  return { ...rest, shipDate }
}

function normalizeReturnRecord(record) {
  const base = createReturnRecord()
  const image = record.image || record.frontImage || null
  const { frontImage, backImage, returnDate, ...rest } = record
  return {
    ...base,
    ...rest,
    date: record.date || '',
    image,
  }
}

function normalizeSubProject(sp) {
  const base = createSubProject()
  const shippingRecords = (sp.shippingRecords || []).map(normalizeShippingRecord)
  return {
    ...base,
    ...sp,
    defectRecords: sp.defectRecords || [],
    docConfirmations: (sp.docConfirmations?.length
      ? sp.docConfirmations
      : base.docConfirmations
    ).map(normalizeDocConfirmation),
    shippingRecords,
    returnRecords: (sp.returnRecords || []).map(normalizeReturnRecord),
  }
}

function normalizeOrder(order) {
  const base = createOrder()
  return {
    ...base,
    ...order,
    sampleInfo: { ...base.sampleInfo, ...(order.sampleInfo || {}) },
    materialPrep: {
      ...defaultMaterialPrep(),
      ...(order.materialPrep || {}),
      items: order.materialPrep?.items || [],
    },
    subProjects: (order.subProjects || []).map(normalizeSubProject),
  }
}

export function normalizeState(raw) {
  if (!raw) return createDefaultState()
  return {
    ...createDefaultState(),
    ...raw,
    manufacturers: raw.manufacturers?.length
      ? raw.manufacturers
      : createDefaultState().manufacturers,
    orders: (raw.orders || []).map(normalizeOrder),
  }
}

function loadLegacyLocalState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return normalizeState(JSON.parse(raw))
  } catch {
    return null
  }
}

function clearLegacyLocalState() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* ignore */
  }
}

function stripDocMeta(doc) {
  const { _id, _openid, updatedAt, ...rest } = doc || {}
  return rest
}

export async function loadCloudState() {
  const db = await getDatabase()
  const res = await db.collection(CLOUD_COLLECTION).doc(CLOUD_STATE_DOC_ID).get()
  const doc = Array.isArray(res.data) ? res.data[0] : res.data

  if (doc && (doc.manufacturers || doc.orders)) {
    return normalizeState(stripDocMeta(doc))
  }

  // 云端尚无数据：尝试从旧版本 localStorage 迁移
  const legacy = loadLegacyLocalState()
  let state = legacy || createDefaultState()

  if (legacy) {
    state = await migrateEmbeddedFilesInState(state)
    clearLegacyLocalState()
  }

  await saveCloudState(state, { force: true })
  return state
}

export async function saveCloudState(state, { force = false } = {}) {
  try {
    const db = await getDatabase()
    const payload = {
      manufacturers: state.manufacturers,
      orders: state.orders,
      updatedAt: Date.now(),
    }

    try {
      await db.collection(CLOUD_COLLECTION).doc(CLOUD_STATE_DOC_ID).update(payload)
    } catch {
      await db.collection(CLOUD_COLLECTION).doc(CLOUD_STATE_DOC_ID).set({
        ...payload,
      })
    }

    return { ok: true }
  } catch (err) {
    return {
      ok: false,
      message: err?.message || '云端保存失败，请检查网络或数据库权限',
    }
  }
}

export function subscribeCloudState(onChange) {
  let closed = false
  let watcher = null

  const start = async () => {
    const db = await getDatabase()
    watcher = db.collection(CLOUD_COLLECTION).doc(CLOUD_STATE_DOC_ID).watch({
      onChange: (snapshot) => {
        if (closed) return
        const doc = snapshot.docs?.[0]
        if (doc) onChange(normalizeState(stripDocMeta(doc)))
      },
      onError: (err) => {
        console.warn('CloudBase watch error:', err)
      },
    })
  }

  start()

  return () => {
    closed = true
    if (watcher?.close) watcher.close()
  }
}

/** @deprecated 仅兼容旧引用，请使用 loadCloudState */
export function loadState() {
  return createDefaultState()
}

/** @deprecated 仅兼容旧引用，请使用 saveCloudState */
export function saveState() {
  return { ok: true }
}
