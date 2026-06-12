import { formatPercent, formatQty } from './calculations'
import { isLargeOrder } from './orderWorkflow'

const orderNameCol = { key: 'orderName', label: '订单' }

export function buildMetricDetail(metricKey, summary) {
  const metrics = summary.orderMetrics

  switch (metricKey) {
    case 'orders':
      return {
        title: '总订单数明细',
        description: '当前筛选范围内的所有订单',
        totalLabel: '合计',
        totalValue: `${summary.totalOrders} 单`,
        columns: [
          orderNameCol,
          { key: 'orderType', label: '类型' },
          { key: 'status', label: '状态' },
          { key: 'quantity', label: '订单数量' },
        ],
        rows: metrics.map((m) => ({
          id: m.order.id,
          orderId: m.order.id,
          orderName: m.order.name,
          orderType: m.order.orderType || '小订单',
          status: m.order.status,
          quantity: formatQty(m.order.quantity, m.unit),
        })),
      }

    case 'shipping':
      return {
        title: '总已出货明细',
        description: '贴片厂已发出数量（按订单汇总）',
        totalLabel: '合计',
        totalValue: `${summary.totalCumulativeShipping}`,
        columns: [
          orderNameCol,
          { key: 'orderType', label: '类型' },
          { key: 'value', label: '已出货' },
        ],
        rows: metrics.map((m) => ({
          id: m.order.id,
          orderId: m.order.id,
          orderName: m.order.name,
          orderType: m.order.orderType || '小订单',
          value: formatQty(m.cumulativeShipping, m.unit),
        })),
      }

    case 'returned':
      return {
        title: '总已贴回明细',
        description: '小订单回到公司的数量（大订单不涉及贴回）',
        totalLabel: '合计',
        totalValue: `${summary.totalCumulativeReturned}`,
        columns: [
          orderNameCol,
          { key: 'orderType', label: '类型' },
          { key: 'value', label: '已贴回' },
        ],
        rows: metrics.map((m) => ({
          id: m.order.id,
          orderId: m.order.id,
          orderName: m.order.name,
          orderType: m.order.orderType || '小订单',
          value: isLargeOrder(m.order)
            ? '—'
            : formatQty(m.cumulativeReturned, m.unit),
        })),
      }

    case 'defects':
      return {
        title: '总不良合计明细',
        description: '各订单不良数量汇总',
        totalLabel: '合计',
        totalValue: `${summary.totalDefects} 个`,
        columns: [orderNameCol, { key: 'value', label: '不良合计' }],
        rows: metrics.map((m) => ({
          id: m.order.id,
          orderId: m.order.id,
          orderName: m.order.name,
          value: `${m.totalDefects} 个`,
        })),
      }

    case 'completion':
      return {
        title: '订单完成率明细',
        description: '小订单按贴回、大订单按出货计算',
        totalLabel: '平均完成率',
        totalValue: formatPercent(summary.avgCompletionRate),
        columns: [
          orderNameCol,
          { key: 'orderType', label: '类型' },
          { key: 'value', label: '完成率' },
        ],
        rows: metrics.map((m) => ({
          id: m.order.id,
          orderId: m.order.id,
          orderName: m.order.name,
          orderType: m.order.orderType || '小订单',
          value: formatPercent(m.completionRate),
        })),
      }

    case 'remaining':
      return {
        title: '剩余数量明细',
        description: '小订单为未贴回，大订单为未出货',
        totalLabel: '合计',
        totalValue: `${summary.totalRemaining}`,
        columns: [
          orderNameCol,
          { key: 'orderType', label: '类型' },
          { key: 'value', label: '剩余' },
        ],
        rows: metrics.map((m) => ({
          id: m.order.id,
          orderId: m.order.id,
          orderName: m.order.name,
          orderType: m.order.orderType || '小订单',
          value: formatQty(m.remaining, m.unit),
        })),
      }

    default:
      return null
  }
}
