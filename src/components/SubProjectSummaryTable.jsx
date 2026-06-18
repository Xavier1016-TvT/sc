import { Link } from 'react-router-dom'
import { getSubProjectMetrics, formatDefectRate } from '../utils/calculations'
import { isLargeOrder } from '../utils/orderWorkflow'
import TableScrollBody from './TableScrollBody'

export default function SubProjectSummaryTable({
  orderId,
  order,
  subProjects,
  variant = 'full',
  editable = false,
  editingSub,
  onEditName,
  onStartRename,
  onDelete,
}) {
  if (!subProjects?.length) {
    return <p className="text-sm text-slate-400 text-center py-8">暂无子项目</p>
  }

  const large = isLargeOrder(order)

  if (variant === 'closed') {
    return (
      <TableScrollBody tableClassName="w-full min-w-[640px]">
          <thead>
            <tr>
              <th className="table-th">子项目</th>
              <th className="table-th">已出货</th>
              <th className="table-th">出货日期</th>
              {!large && (
                <>
                  <th className="table-th">已贴回</th>
                  <th className="table-th">贴回日期</th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {subProjects.map((sub) => {
              const m = getSubProjectMetrics(sub, order)
              return (
                <tr key={sub.id} className="hover:bg-slate-50/50">
                  <td className="table-td font-medium">{sub.name}</td>
                  <td className="table-td">{m.shipped} 个</td>
                  <td className="table-td">{m.lastShippingDate || '—'}</td>
                  {!large && (
                    <>
                      <td className="table-td">{m.returned > 0 ? `${m.returned} 个` : '0 个'}</td>
                      <td className="table-td">{m.lastReturnDate || '—'}</td>
                    </>
                  )}
                </tr>
              )
            })}
          </tbody>
      </TableScrollBody>
    )
  }

  return (
    <TableScrollBody tableClassName="w-full min-w-[1080px]">
        <thead>
          <tr>
            <th className="table-th">名称</th>
            <th className="table-th">资料确认</th>
            <th className="table-th">已出货</th>
            {!large && <th className="table-th">已贴回</th>}
            <th className="table-th">{large ? '未出货' : '未贴回'}</th>
            {large && <th className="table-th">贴片累计</th>}
            {large && <th className="table-th">测试累计</th>}
            <th className="table-th">不良率</th>
            {editable && <th className="table-th">操作</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {subProjects.map((sub) => {
            const m = getSubProjectMetrics(sub, order)
            return (
              <tr key={sub.id} className="hover:bg-slate-50/50">
                <td className="table-td font-medium">
                  {editable && editingSub === sub.id ? (
                    <input
                      className="input-field"
                      defaultValue={sub.name}
                      autoFocus
                      onBlur={(e) => onEditName(sub.id, e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
                    />
                  ) : (
                    sub.name
                  )}
                </td>
                <td className="table-td">
                  <span className="text-sm">
                    {m.docConfirmed}/{m.docTotal} 已确认
                  </span>
                </td>
                <td className="table-td">{m.shipped} 个</td>
                {!large && (
                  <td className="table-td">{m.returned > 0 ? `${m.returned} 个` : '0 个'}</td>
                )}
                <td className="table-td">{m.remaining} 个</td>
                {large && <td className="table-td">{m.smtCumulative} 个</td>}
                {large && <td className="table-td">{m.testCumulative} 个</td>}
                <td className="table-td">{formatDefectRate(m.defectRate)}</td>
                {editable && (
                  <td className="table-td">
                    <div className="flex gap-2">
                      <Link to={`/order/${orderId}/sub/${sub.id}`} className="btn-ghost">
                        进入详情
                      </Link>
                      <button type="button" className="btn-ghost" onClick={() => onStartRename(sub.id)}>
                        改名
                      </button>
                      <button
                        type="button"
                        className="text-xs text-red-500 hover:underline"
                        onClick={() => onDelete(sub)}
                      >
                        删除
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            )
          })}
        </tbody>
    </TableScrollBody>
  )
}
