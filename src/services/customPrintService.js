// Özel baskı talebini kendi backend'imize (/api/custom-print) POST eder.
// Oradan n8n "H4 — Teklif Al" akışına gider: tabloya kayıt + müşteriye onay maili.
export async function submitRequest(payload) {
  const res = await fetch('/api/custom-print', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const body = await res.json().catch(() => ({}))
  if (!res.ok) {
    const err = new Error(body.error || 'Talep gönderilemedi.')
    err.fieldErrors = body.errors
    throw err
  }
  return body // { ok: true }
}
