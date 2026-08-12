/**
 * Stok bildirimini kendi backend'imize (/api/stock-notify) POST eder.
 *
 * @param {import('../models/types').StockNotifyRequest} payload
 * @returns {Promise<{ok: boolean}>}
 */
export async function submitStockNotify(payload) {
  const res = await fetch('/api/stock-notify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(body.error || 'Bildirim gönderilemedi.')
  return body // { ok }
}
