import { getWorkflowDescription, isLargeOrder, isSmallOrder } from '../utils/orderWorkflow'
import OrderTypeBadge from './OrderTypeBadge'

export default function OrderWorkflowBanner({ order }) {
  const type = order.orderType || '小订单'

  return (
    <div
      className={`card text-sm ${
        isLargeOrder(order)
          ? 'bg-orange-50 border-orange-100 text-orange-800'
          : 'bg-violet-50 border-violet-100 text-violet-800'
      }`}
    >
      <div className="flex flex-wrap items-center gap-2 mb-1">
        <OrderTypeBadge type={type} />
        <span className="font-medium">{getWorkflowDescription(order)}</span>
      </div>
      {isSmallOrder(order) && (
        <p className="text-xs opacity-80 mt-1">
          生产中记录贴片厂出货；无需工序记录，结单后登记贴回日期、数量与照片。
        </p>
      )}
      {isLargeOrder(order) && (
        <p className="text-xs opacity-80 mt-1">
          生产中记录工厂出货与测试数量，完成率按出货计算。
        </p>
      )}
    </div>
  )
}
