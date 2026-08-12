// Canlı Vercel URL'si. Expo Go telefonda çalışırken localhost'a erişemez;
// bu yüzden deploy edilmiş üretim URL'si kullanılır.
const API_BASE = 'https://<CANLI-VERCEL-URL>'

export async function fetchProducts() {
  const res = await fetch(`${API_BASE}/api/products`)
  const body = await res.json()
  return body.products || []
}

export async function postOrder(payload) {
  const res = await fetch(`${API_BASE}/api/order`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(body.error || 'Sipariş gönderilemedi.')
  return body
}

export async function postStockNotify(payload) {
  const res = await fetch(`${API_BASE}/api/stock-notify`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(body.error || 'Bildirim gönderilemedi.')
  return body
}
