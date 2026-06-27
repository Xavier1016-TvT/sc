import { Link } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { useData } from '../context/DataContext'
import StatusBadge from '../components/StatusBadge'
import OrderTypeBadge from '../components/OrderTypeBadge'
import PageBreadcrumb from '../components/PageBreadcrumb'
import TableScrollBody from '../components/TableScrollBody'
import { formatQty, getOrderUnit } from '../utils/calculations'
import { getDashboardHomePath } from '../utils/dashboardNav'
import { filterOrdersBySearch } from '../utils/searchOrders'

export default function RecycleBin() {
  const { deletedOrders, restoreOrder } = useData()
  const [searchQuery, setSearchQuery] = useState('')

  const filteredOrders = useMemo(
    () => filterOrdersBySearch(deletedOrders, searchQuery),
    [deletedOrders, searchQuery]
  )

  const handleRestore = (order) => {
    if (window.confirm(`确定恢复订单「${order.name}」？恢复后将重新出现在首页列表。`)) {
      restoreOrder(order.id)
    }
  }

  return (
    <div className="space-y-6">
      <PageBreadcrumb
        items={[
          { label: '首页', to: getDashboardHomePath() },
          { label: '回收站' },
        ]}
      />

      <div className="card bg-gradient-to-br from-slate-50 to-white border-slate-200">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center text-xl shrink-0">
              🗑️
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">回收站</h2>
              <p className="text-sm text-slate-500 mt-1">
                已删除的订单会保留在这里，可随时恢复；数据不会从云端真正移除
              </p>
            </div>
          </div>
          <Link to="/" className="btn-secondary shrink-0">
            返回首页
          </Link>
        </div>
      </div>

      <div className="card">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <input
            type="search"
            className="input-field max-w-md flex-1 min-w-[200px]"
            placeholder="搜索已删除订单…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <span className="text-sm text-slate-500 ml-auto">
            共 {filteredOrders.length} 条
            {searchQuery.trim() && deletedOrders.length !== filteredOrders.length
              ? ` / ${deletedOrders.length} 条已删除`
              : ''}
          </span>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="text-center py-14 text-slate-400">
            <div className="text-4xl mb-3">📭</div>
            <p className="text-sm font-medium text-slate-500">
              {searchQuery.trim() ? '没有匹配的已删除订单' : '回收站是空的'}
            </p>
            <p className="text-xs mt-1">
              {searchQuery.trim()
                ? '试试其他关键词'
                : '在首页删除订单后，会出现在这里'}
            </p>
          </div>
        ) : (
          <TableScrollBody tableClassName="w-full min-w-[720px]">
            <thead>
              <tr>
                <th className="table-th">订单名称</th>
                <th className="table-th">类型</th>
                <th className="table-th">状态</th>
                <th className="table-th">数量</th>
                <th className="table-th">贴片厂</th>
                <th className="table-th">子项目</th>
                <th className="table-th">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/50">
                  <td className="table-td font-medium text-slate-700">{order.name}</td>
                  <td className="table-td">
                    <OrderTypeBadge type={order.orderType} />
                  </td>
                  <td className="table-td">
                    <StatusBadge status={order.status} type="order" />
                  </td>
                  <td className="table-td">{formatQty(order.quantity, getOrderUnit(order))}</td>
                  <td className="table-td">{order.manufacturer || '—'}</td>
                  <td className="table-td">{(order.subProjects || []).length} 个</td>
                  <td className="table-td">
                    <button
                      type="button"
                      className="btn-primary text-xs"
                      onClick={() => handleRestore(order)}
                    >
                      恢复订单
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </TableScrollBody>
        )}
      </div>
    </div>
  )
}
