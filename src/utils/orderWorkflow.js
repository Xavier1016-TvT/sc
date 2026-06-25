/** 小订单：工厂贴片 → 发回公司 → 公司测试 */
export function isSmallOrder(order) {
  return (order?.orderType || '小订单') === '小订单'
}

/** 大订单：工厂贴片 + 测试 + 出货 */
export function isLargeOrder(order) {
  return order?.orderType === '大订单'
}

export function getWorkflowDescription(order) {
  if (isLargeOrder(order)) {
    return '大订单'
  }
  return '小订单'
}

/** 小订单结单后需登记贴回 */
export function isReturnRequired(order) {
  return isSmallOrder(order)
}

/** @deprecated 使用 isReturnRequired */
export function needsReturnRegistration(order) {
  return isReturnRequired(order)
}

/** 完成进度按什么统计：小订单看贴回，大订单看出货 */
export function getProgressQty(order, metrics) {
  if (isLargeOrder(order)) {
    return metrics.cumulativeShipping
  }
  return metrics.cumulativeReturned
}
