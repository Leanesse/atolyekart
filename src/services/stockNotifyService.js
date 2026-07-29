import { sendEvent } from './webhook.js'

/**
 * Stok bildirimi talebini webhook'a gönderir ('stock.notify_requested').
 * Ürün stoğa girince haber vermek için ziyaretçi bilgisi toplanır.
 *
 * @param {import('../models/types').StockNotifyRequest} payload
 * @returns {Promise<import('../models/types').WebhookEvent>}
 */
export async function submitStockNotify(payload) {
  return sendEvent('stock.notify_requested', payload) // { name, email, productId }
}
