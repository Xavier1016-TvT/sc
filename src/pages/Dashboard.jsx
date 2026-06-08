import { useMemo, useState } from 'react'
import { useData } from '../context/DataContext'
import { getGlobalSummary, getGlobalDefectRate, formatPercent, formatDefectRate, formatQty } from '../utils/calculations'
import { ORDER_STATUSES } from '../utils/constants'
import MetricCard from '../components/MetricCard'
import OrderChart from '../components/OrderChart'
import SampleStatusChart from '../components/SampleStatusChart'
import OrderTable from '../components/OrderTable'
import OrderModal from '../components/OrderModal'
import MetricsSection from '../components/MetricsSection'
import { filterOrdersBySearch } from '../utils/searchOrders'

export default function Dashboard() {
  const { orders, manufacturers, addOrder, updateOrder, deleteOrder, addManufacturer } = useData()
  const [statusTab, setStatusTab] = useState('全部')
  const [searchQuery, setSearchQuery] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingOrder, setEditingOrder] = useState(null)

  const statusFilteredOrders = useMemo(() => {
    if (statusTab === '全部') return orders
    return orders.filter((o) => o.status === statusTab)
  }, [orders, statusTab])

  const filteredOrders = useMemo(
    () => filterOrdersBySearch(statusFilteredOrders, searchQuery),
    [statusFilteredOrders, searchQuery]
  )

  const summary = useMemo(() => getGlobalSummary(filteredOrders), [filteredOrders])
  const globalDefectRate = getGlobalDefectRate(summary)
  const isProductionView = statusTab === '全部' || statusTab === '生产中'

  const chartData = summary.orderMetrics.map((m) => ({
    name: m.order.name.length > 8 ? m.order.name.slice(0, 8) + '…' : m.order.name,
    订单数量: m.order.quantity,
    累计出货: m.cumulativeShipping,
  }))

  const breakdown = (getter, formatter = (v) => v) =>
    summary.orderMetrics.map((m) => ({
      label: m.order.name,
      value: formatter(getter(m), m),
    }))

  const handleSave = (form) => {
    if (editingOrder) {
      updateOrder(editingOrder.id, form)
    } else {
      addOrder(form.name, form)
    }
  }

  const statusCounts = ORDER_STATUSES.reduce((acc, s) => {
    acc[s] = orders.filter((o) => o.status === s).length
    return acc
  }, {})

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex bg-white rounded-xl p-1 shadow-sm border border-slate-100">
          {['全部', ...ORDER_STATUSES].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setStatusTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusTab === tab
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {tab}
              {tab !== '全部' && (
                <span className="ml-1.5 text-xs opacity-75">({statusCounts[tab] || 0})</span>
              )}
              {tab === '全部' && (
                <span className="ml-1.5 text-xs opacity-75">({orders.length})</span>
              )}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400 ml-1">
          <span>未下单</span><span>→</span>
          <span>生产中</span><span>→</span>
          <span>已结单</span>
        </div>
        <button type="button" className="btn-primary ml-auto shrink-0" onClick={() => { setEditingOrder(null); setModalOpen(true) }}>
          + 新增订单
        </button>
      </div>

      {statusTab === '未下单' && (
        <div className="card bg-blue-50 border-blue-100 text-sm text-blue-800">
          未下单阶段：填写贴样情况与物料状态，确认后可流转至「生产中」。
        </div>
      )}
      {statusTab === '已结单' && (
        <div className="card bg-emerald-50 border-emerald-100 text-sm text-emerald-800">
          已结单阶段：仅展示订单名称、数量与最终出货数量。
        </div>
      )}

      <MetricsSection
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        resultCount={filteredOrders.length}
        totalCount={statusFilteredOrders.length}
      >
        {isProductionView ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              <MetricCard title="总订单数" value={summary.totalOrders} unit="单" icon="📋" color="primary" />
              <MetricCard title="总子项目数" value={summary.totalSubProjects} unit="个" icon="📦" color="violet" />
              <MetricCard
                title="总累计出货"
                value={summary.totalCumulativeShipping}
                unit=""
                icon="🚚"
                color="emerald"
                breakdown={breakdown(
                  (m) => m.cumulativeShipping,
                  (v, m) => formatQty(v, m.unit)
                )}
              />
              <MetricCard
                title="总不良合计"
                value={summary.totalDefects}
                unit="个"
                icon="⚠️"
                color="red"
                breakdown={breakdown((m) => m.totalDefects, (v) => `${v} 个`)}
              />
              <MetricCard
                title="平均订单完成率"
                value={formatPercent(summary.avgCompletionRate)}
                icon="📈"
                color="primary"
                breakdown={breakdown((m) => m.completionRate, formatPercent)}
              />
              <MetricCard
                title="总不良率"
                value={formatDefectRate(globalDefectRate)}
                icon="📉"
                color="amber"
                breakdown={breakdown((m) => m.defectRate, formatDefectRate)}
              />
              <MetricCard
                title="剩余未出货总数"
                value={summary.totalRemaining}
                unit=""
                icon="📊"
                color="slate"
                breakdown={breakdown(
                  (m) => m.remaining,
                  (v, m) => formatQty(v, m.unit)
                )}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <OrderChart data={chartData} />
              <SampleStatusChart counts={summary.sampleCounts} />
            </div>
          </>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard title="总订单数" value={summary.totalOrders} unit="单" icon="📋" color="primary" />
          </div>
        )}
      </MetricsSection>

      <OrderTable
        orders={filteredOrders}
        orderMetrics={summary.orderMetrics}
        mode={statusTab}
        searchQuery={searchQuery}
        onEdit={(order) => { setEditingOrder(order); setModalOpen(true) }}
        onDelete={(order) => {
          if (window.confirm(`确定删除订单「${order.name}」？`)) deleteOrder(order.id)
        }}
      />

      <OrderModal
        open={modalOpen}
        order={editingOrder}
        manufacturers={manufacturers}
        onSave={handleSave}
        onClose={() => setModalOpen(false)}
        onAddManufacturer={addManufacturer}
      />
    </div>
  )
}
