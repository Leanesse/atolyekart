/**
 * Tükenen ürün için AI alternatif önerisi ister (n8n AI Agent akışı).
 *
 * @param {{ productId: string, productName?: string, email: string, name?: string }} payload
 * @returns {Promise<{kaynak: 'ai'|'yedek', oneri: string}>}
 */
export async function fetchAiSuggestion(payload) {
  const res = await fetch('/api/suggest', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(body.error || 'Öneri alınamadı.')
  return body
}

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
