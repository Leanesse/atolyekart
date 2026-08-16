// In-memory sipariş listesi. Not: serverless'ta kalıcı değil; admin demo amaçlı.
const orders = []

export function addOrder(record) {
  const saved = { id: `ord-${Date.now()}`, createdAt: new Date().toISOString(), ...record }
  orders.unshift(saved)
  return saved
}

export function listOrders() {
  return orders
}
