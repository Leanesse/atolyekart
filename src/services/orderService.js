import { sendEvent } from './webhook.js'

/**
 * Sipariş talebini webhook'a gönderir ('order.created').
 * Bileşen yalnızca bunu çağırır; gönderim/zarf detayı burada.
 *
 * @param {import('../models/types').Order} payload
 * @returns {Promise<import('../models/types').WebhookEvent>}
 */
export async function submitOrder(payload) {
  return sendEvent('order.created', payload) // { name, productId, productName, phone }
}
