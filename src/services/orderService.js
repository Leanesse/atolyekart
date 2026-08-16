/**
 * Sipariş talebini kendi backend'imize (/api/order) POST eder.
 *
 * @param {import('../models/types').Order} payload
 * @returns {Promise<{ok: boolean, id: string}>}
 */
export async function submitOrder(payload) {
  const res = await fetch('/api/order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const body = await res.json().catch(() => ({}))
  if (!res.ok) {
    const err = new Error(body.error || 'Sipariş gönderilemedi.')
    err.fieldErrors = body.errors
    throw err
  }
  return body // { ok, id }
}
