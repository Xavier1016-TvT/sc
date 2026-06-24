/** 未软删除的订单 */
export function getActiveOrders(orders = []) {
  return orders.filter((o) => !o.isDeleted)
}

/** 已软删除的订单 */
export function getDeletedOrders(orders = []) {
  return orders.filter((o) => o.isDeleted)
}

export function isOrderDeleted(order) {
  return order?.isDeleted === true
}
