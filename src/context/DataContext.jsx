import { createContext, useContext, useEffect, useMemo, useState, useCallback, useRef } from 'react'
import {
  loadCloudState,
  saveCloudState,
  subscribeCloudState,
} from '../utils/storage'
import {
  createOrder,
  createDefaultState,
} from '../utils/defaults'
import {
  applySampleInfoToOrder,
  applyMaterialPrepToOrder,
  applySubProjectPatch,
  createSubProjectFromOrder,
  afterSubProjectListChange,
  defaultSampleInfo,
  defaultMaterialPrep,
} from '../utils/orderSync'
import { generateId } from '../utils/id'
import { getActiveOrders, getDeletedOrders } from '../utils/orderFilters'
import { getOrderUnit } from '../utils/orderUnit'

const DataContext = createContext(null)

function mergeOrderPatch(order, patch) {
  let next = { ...order, ...patch }

  if (patch.sampleInfo) {
    const sampleInfo = { ...(order.sampleInfo || defaultSampleInfo()), ...patch.sampleInfo }
    next = applySampleInfoToOrder(next, sampleInfo)
  }

  if (patch.materialPrep && (order.subProjects || []).length > 0) {
    if (!(getOrderUnit(order) === '个' && order.status === '未下单')) {
      return order
    }
  }

  if (patch.materialPrep) {
    const materialPrep = { ...(order.materialPrep || defaultMaterialPrep()), ...patch.materialPrep }
    next = applyMaterialPrepToOrder(next, materialPrep)
  }

  return next
}

export function DataProvider({ children }) {
  const [state, setState] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [syncStatus, setSyncStatus] = useState('loading')
  const skipSaveRef = useRef(false)
  const saveTimerRef = useRef(null)
  const saveErrorShown = useRef(false)
  const remoteUpdatedAtRef = useRef(0)

  useEffect(() => {
    let unsubscribe = () => {}

    const boot = async () => {
      try {
        setSyncStatus('loading')
        const initial = await loadCloudState()
        remoteUpdatedAtRef.current = Date.now()
        setState(initial)
        setLoading(false)
        setSyncStatus('ready')

        unsubscribe = subscribeCloudState((remoteState) => {
          skipSaveRef.current = true
          remoteUpdatedAtRef.current = Date.now()
          setState(remoteState)
          setSyncStatus('synced')
          setTimeout(() => {
            skipSaveRef.current = false
          }, 300)
        })
      } catch (err) {
        setLoadError(err.message || '云端数据加载失败')
        setState(createDefaultState())
        setLoading(false)
        setSyncStatus('error')
      }
    }

    boot()
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    if (!state || loading || skipSaveRef.current) return

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)

    saveTimerRef.current = setTimeout(async () => {
      setSyncStatus('saving')
      const result = await saveCloudState(state)
      if (result.ok) {
        saveErrorShown.current = false
        setSyncStatus('saved')
      } else {
        setSyncStatus('error')
        if (!saveErrorShown.current) {
          saveErrorShown.current = true
          alert(result.message)
        }
      }
    }, 900)

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    }
  }, [state, loading])

  const updateState = useCallback((updater) => {
    setState((prev) => {
      if (!prev) return prev
      const next = typeof updater === 'function' ? updater(prev) : updater
      return { ...prev, ...next }
    })
  }, [])

  const addOrder = useCallback((name, extra = {}) => {
    const order = { ...createOrder(name), ...extra }
    updateState((prev) => ({ ...prev, orders: [...prev.orders, order] }))
    return order.id
  }, [updateState])

  const updateOrder = useCallback((orderId, patch) => {
    updateState((prev) => ({
      ...prev,
      orders: prev.orders.map((o) => {
        if (o.id !== orderId) return o
        let next = mergeOrderPatch(o, patch)

        if (getOrderUnit(next) === '个') {
          const subs = next.subProjects || []
          if (patch.name !== undefined && subs.length === 1) {
            next = applySubProjectPatch(next, subs[0].id, { name: patch.name })
          }
          if (patch.status === '生产中' && subs.length === 0 && next.name) {
            const sub = createSubProjectFromOrder(next.name, next)
            next = afterSubProjectListChange({ ...next, subProjects: [sub] })
          }
        }

        return next
      }),
    }))
  }, [updateState])

  const deleteOrder = useCallback((orderId) => {
    updateState((prev) => ({
      ...prev,
      orders: prev.orders.map((o) =>
        o.id === orderId ? { ...o, isDeleted: true } : o
      ),
    }))
  }, [updateState])

  const restoreOrder = useCallback((orderId) => {
    updateState((prev) => ({
      ...prev,
      orders: prev.orders.map((o) =>
        o.id === orderId ? { ...o, isDeleted: false } : o
      ),
    }))
  }, [updateState])

  const addSubProject = useCallback((orderId, name) => {
    const order = state?.orders?.find((o) => o.id === orderId && !o.isDeleted)
    if (order && getOrderUnit(order) === '个' && (order.subProjects || []).length >= 1) {
      return order.subProjects[0].id
    }
    const sub = createSubProjectFromOrder(name, order || createOrder(name))
    updateState((prev) => ({
      ...prev,
      orders: prev.orders.map((o) =>
        o.id === orderId
          ? afterSubProjectListChange({
              ...o,
              subProjects: [...(o.subProjects || []), sub],
            })
          : o
      ),
    }))
    return sub.id
  }, [state?.orders, updateState])

  const updateSubProject = useCallback((orderId, subId, patch) => {
    updateState((prev) => ({
      ...prev,
      orders: prev.orders.map((o) => {
        if (o.id !== orderId) return o
        let next = applySubProjectPatch(o, subId, patch)
        if (patch.name !== undefined && getOrderUnit(next) === '个') {
          const subs = next.subProjects || []
          if (subs.length === 1 && subs[0].id === subId) {
            next = { ...next, name: patch.name }
          }
        }
        return next
      }),
    }))
  }, [updateState])

  const deleteSubProject = useCallback((orderId, subId) => {
    updateState((prev) => ({
      ...prev,
      orders: prev.orders.map((o) =>
        o.id === orderId
          ? afterSubProjectListChange({
              ...o,
              subProjects: (o.subProjects || []).filter((sp) => sp.id !== subId),
            })
          : o
      ),
    }))
  }, [updateState])

  const addManufacturer = useCallback((name) => {
    const trimmed = name.trim()
    if (!trimmed) return
    updateState((prev) => {
      if (prev.manufacturers.includes(trimmed)) return prev
      return { ...prev, manufacturers: [...prev.manufacturers, trimmed] }
    })
  }, [updateState])

  const updateManufacturer = useCallback((oldName, newName) => {
    const trimmed = newName.trim()
    if (!trimmed || oldName === trimmed) return
    updateState((prev) => ({
      ...prev,
      manufacturers: prev.manufacturers.map((m) =>
        m === oldName ? trimmed : m
      ),
      orders: prev.orders.map((o) =>
        o.manufacturer === oldName ? { ...o, manufacturer: trimmed } : o
      ),
    }))
  }, [updateState])

  const resetData = useCallback(async () => {
    const empty = createDefaultState()
    setState(empty)
    await saveCloudState(empty, { force: true })
  }, [])

  const getOrder = useCallback(
    (orderId, { includeDeleted = false } = {}) => {
      const order = state?.orders?.find((o) => o.id === orderId)
      if (!order) return undefined
      if (!includeDeleted && order.isDeleted) return undefined
      return order
    },
    [state?.orders]
  )

  const getDeletedOrder = useCallback(
    (orderId) => {
      const order = state?.orders?.find((o) => o.id === orderId)
      return order?.isDeleted ? order : undefined
    },
    [state?.orders]
  )

  const getSubProject = useCallback(
    (orderId, subId) => {
      const order = getOrder(orderId)
      return order?.subProjects?.find((sp) => sp.id === subId)
    },
    [getOrder]
  )

  const allOrders = state?.orders || []
  const orders = useMemo(() => getActiveOrders(allOrders), [allOrders])
  const deletedOrders = useMemo(() => getDeletedOrders(allOrders), [allOrders])

  const value = useMemo(
    () => ({
      state,
      orders,
      deletedOrders,
      manufacturers: state?.manufacturers || [],
      loading,
      loadError,
      syncStatus,
      addOrder,
      updateOrder,
      deleteOrder,
      restoreOrder,
      addSubProject,
      updateSubProject,
      deleteSubProject,
      addManufacturer,
      updateManufacturer,
      resetData,
      getOrder,
      getDeletedOrder,
      getSubProject,
    }),
    [
      state,
      orders,
      deletedOrders,
      loading,
      loadError,
      syncStatus,
      addOrder,
      updateOrder,
      deleteOrder,
      restoreOrder,
      addSubProject,
      updateSubProject,
      deleteSubProject,
      addManufacturer,
      updateManufacturer,
      resetData,
      getOrder,
      getDeletedOrder,
      getSubProject,
    ]
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-slate-600">正在从云端加载数据…</p>
        </div>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="card max-w-md text-center">
          <p className="text-red-600 mb-2">加载失败</p>
          <p className="text-sm text-slate-600 mb-4">{loadError}</p>
          <button type="button" className="btn-primary" onClick={() => window.location.reload()}>
            重试
          </button>
        </div>
      </div>
    )
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within DataProvider')
  return ctx
}

export { generateId }
