import { useMemo, useState } from 'react'
import { useData } from '../context/DataContext'
import { getGlobalSummary, formatPercent } from '../utils/calculations'
import { buildMetricDetail } from '../utils/metricDetails'
import { ORDER_STATUSES } from '../utils/constants'
import MetricCard from '../components/MetricCard'
import MetricDetailModal from '../components/MetricDetailModal'
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
  const [activeMetric, setActiveMetric] = useState(null)

  const statusFilteredOrders = useMemo(() => {
    if (statusTab === '全部') return orders
    return orders.filter((o) => o.status === statusTab)
  }, [orders, statusTab])

  const filteredOrders = useMemo(
    () => filterOrdersBySearch(statusFilteredOrders, searchQuery),
    [statusFilteredOrders, searchQuery]
  )

  const summary = useMemo(() => getGlobalSummary(filteredOrders), [filteredOrders])
  const isProductionView = statusTab === '全部' || statusTab === '生产中'

  const metricDetail = activeMetric
    ? buildMetricDetail(activeMetric, summary)
    : null

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
        <button type="button" className="btn-primary ml-auto shrink-0" onClick={() => { setEditingOrder(null); setModalOpen(true) }}>
          + 新增订单
        </button>
      </div>

      <MetricsSection
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        resultCount={filteredOrders.length}
        totalCount={statusFilteredOrders.length}
      >
        {isProductionView ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              <MetricCard
                title="总订单数"
                value={summary.totalOrders}
                unit="单"
                icon="📋"
                color="primary"
                onClick={() => setActiveMetric('orders')}
              />
              <MetricCard
                title="总已出货"
                value={summary.totalCumulativeShipping}
                unit=""
                icon="🚚"
                color="emerald"
                onClick={() => setActiveMetric('shipping')}
              />
              <MetricCard
                title="总已贴回"
                value={summary.totalCumulativeReturned}
                unit=""
                icon="📥"
                color="violet"
                onClick={() => setActiveMetric('returned')}
              />
              <MetricCard
                title="总不良合计"
                value={summary.totalDefects}
                unit="个"
                icon="⚠️"
                color="red"
                onClick={() => setActiveMetric('defects')}
              />
              <MetricCard
                title="平均订单完成率"
                value={formatPercent(summary.avgCompletionRate)}
                icon="📈"
                color="primary"
                onClick={() => setActiveMetric('completion')}
              />
              <MetricCard
                title="剩余数量"
                value={summary.totalRemaining}
                unit=""
                icon="📊"
                color="slate"
                onClick={() => setActiveMetric('remaining')}
              />
            </div>
          </>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="总订单数"
              value={summary.totalOrders}
              unit="单"
              icon="📋"
              color="primary"
              onClick={() => setActiveMetric('orders')}
            />
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
          if (window.confirm(`确定删除订单「${order.name}」？`)) {
            deleteOrder(order.id)
          }
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

      <MetricDetailModal
        open={!!metricDetail}
        title={metricDetail?.title}
        description={metricDetail?.description}
        totalLabel={metricDetail?.totalLabel}
        totalValue={metricDetail?.totalValue}
        columns={metricDetail?.columns || []}
        rows={metricDetail?.rows || []}
        onClose={() => setActiveMetric(null)}
      />
    </div>
  )
}
