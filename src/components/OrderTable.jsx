import { Link } from 'react-router-dom'
import StatusBadge from './StatusBadge'
import OrderTypeBadge from './OrderTypeBadge'
import { isLargeOrder } from '../utils/orderWorkflow'
import { formatQty, getOrderUnit, formatOrderDocConfirmation, getOrderMaterialStatusText, hasOrderMaterialShortage, isOrderMaterialComplete } from '../utils/calculations'

export default function OrderTable({ orders, orderMetrics, onEdit, onDelete, mode = '全部', searchQuery = '' }) {
  if (!orders.length) {
    return (
      <div className="card text-center py-12 text-slate-400 text-sm">
        {searchQuery.trim()
          ? `未找到包含「${searchQuery.trim()}」的订单`
          : '暂无订单，点击上方「新增订单」开始'}
      </div>
    )
  }

  const metricsMap = Object.fromEntries(orderMetrics.map((m) => [m.order.id, m]))

  if (mode === '未下单') {
    return (
      <TableShell title="未下单订单">
        <thead className="bg-slate-50">
          <tr>
            <th className="table-th">订单名称</th>
            <th className="table-th">类型</th>
            <th className="table-th">订单数量</th>
            <th className="table-th">贴样日期</th>
            <th className="table-th">贴样数量</th>
            <th className="table-th">贴样结果</th>
            <th className="table-th">操作</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {orders.map((order) => {
            const s = order.sampleInfo || {}
            return (
              <tr key={order.id} className="hover:bg-slate-50/50">
                <td className="table-td font-medium">{order.name}</td>
                <td className="table-td"><OrderTypeBadge type={order.orderType} /></td>
                <td className="table-td">{formatQty(order.quantity, getOrderUnit(order))}</td>
                <td className="table-td">{s.date || '—'}</td>
                <td className="table-td">{s.quantity ?? '—'}</td>
                <td className="table-td">{s.result || '—'}</td>
                <td className="table-td">
                  <Actions order={order} onEdit={onEdit} onDelete={onDelete} />
                </td>
              </tr>
            )
          })}
        </tbody>
      </TableShell>
    )
  }

  if (mode === '已结单') {
    return (
      <TableShell title="已结单订单">
        <thead className="bg-slate-50">
          <tr>
            <th className="table-th">订单名称</th>
            <th className="table-th">类型</th>
            <th className="table-th">订单数量</th>
            <th className="table-th">已出货</th>
            <th className="table-th">已贴回</th>
            <th className="table-th">操作</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {orders.map((order) => {
            const m = metricsMap[order.id]
            return (
              <tr key={order.id} className="hover:bg-slate-50/50">
                <td className="table-td font-medium">{order.name}</td>
                <td className="table-td"><OrderTypeBadge type={order.orderType} /></td>
                <td className="table-td">{formatQty(order.quantity, getOrderUnit(order))}</td>
                <td className="table-td font-medium text-primary-600">
                  {formatQty(m?.cumulativeShipping ?? 0, getOrderUnit(order))}
                </td>
                <td className="table-td">
                  {isLargeOrder(order)
                    ? '—'
                    : formatQty(m?.cumulativeReturned ?? 0, getOrderUnit(order))}
                </td>
                <td className="table-td">
                  <Actions order={order} onEdit={onEdit} onDelete={onDelete} />
                </td>
              </tr>
            )
          })}
        </tbody>
      </TableShell>
    )
  }

  return (
    <TableShell title={mode === '生产中' ? '生产中订单' : '订单一览'}>
      <thead className="bg-slate-50">
        <tr>
          <th className="table-th">订单</th>
          <th className="table-th">状态</th>
          <th className="table-th">资料确认</th>
          <th className="table-th">物料状态</th>
          <th className="table-th">订单数</th>
          <th className="table-th">已出货</th>
          <th className="table-th">已贴回</th>
          <th className="table-th">操作</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {orders.map((order) => {
          const m = metricsMap[order.id]
          const docText = formatOrderDocConfirmation(order)
          const materialText = getOrderMaterialStatusText(order)
          const docDone = docText !== '—' && docText.includes('已确认')
          const materialShortage = hasOrderMaterialShortage(order)
          const materialComplete = isOrderMaterialComplete(order)
          return (
            <tr key={order.id} className="hover:bg-slate-50/50">
              <td className="table-td">
                <Link
                  to={`/order/${order.id}`}
                  className="font-medium text-slate-800 hover:text-primary-600 hover:underline"
                >
                  {order.name}
                </Link>
                {order.manufacturer && (
                  <div className="text-xs text-slate-400 mt-0.5">{order.manufacturer}</div>
                )}
              </td>
              <td className="table-td">
                <StatusBadge status={order.status} type="order" />
              </td>
              <td className="table-td">
                <span className={docDone ? 'text-emerald-700' : 'text-amber-700'}>{docText}</span>
              </td>
              <td className="table-td">
                <span
                  className={
                    materialShortage
                      ? 'text-red-700'
                      : materialComplete
                        ? 'text-emerald-700'
                        : 'text-slate-700'
                  }
                >
                  {materialText}
                </span>
              </td>
              <td className="table-td">{formatQty(order.quantity, getOrderUnit(order))}</td>
              <td className="table-td font-medium text-primary-600">
                {formatQty(m?.cumulativeShipping ?? 0, m?.unit ?? getOrderUnit(order))}
              </td>
              <td className="table-td">
                {isLargeOrder(order)
                  ? '—'
                  : formatQty(m?.cumulativeReturned ?? 0, m?.unit ?? getOrderUnit(order))}
              </td>
              <td className="table-td">
                <Actions order={order} onEdit={onEdit} onDelete={onDelete} />
              </td>
            </tr>
          )
        })}
      </tbody>
    </TableShell>
  )
}

function TableShell({ title, children }) {
  return (
    <div className="card overflow-hidden p-0">
      <div className="px-5 py-4 border-b border-slate-100">
        <h3 className="text-base font-semibold text-slate-800">{title}</h3>
      </div>
      <div className="table-scroll-x">
        <table className="w-full table-sticky">{children}</table>
      </div>
    </div>
  )
}

function Actions({ order, onEdit, onDelete }) {
  return (
    <div className="flex items-center gap-2">
      <Link to={`/order/${order.id}`} className="btn-ghost">
        查看详情
      </Link>
      <button type="button" className="btn-ghost" onClick={() => onEdit(order)}>
        编辑
      </button>
      <button
        type="button"
        className="text-xs text-red-500 hover:underline"
        onClick={() => onDelete(order)}
      >
        删除
      </button>
    </div>
  )
}
