import { getCatalog } from './_lib/catalog.js'
import { checkRateLimit } from './_lib/rateLimit.js'
import { buildEvent } from './_lib/webhook.js'
import { n8nFetch } from './_lib/n8n.js'
import { clientIp } from './_lib/clientIp.js'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Tükenen ürün için AI alternatif önerisi (n8n "H4 — Stok Öneri (AI Agent)").
// AI yavaşlarsa/çökerse katalog tabanlı deterministik yedek öneriye düşer (ders 8 fallback deseni).
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' })
  const { allowed } = checkRateLimit(`suggest:${clientIp(req)}`, { limit: 5, windowMs: 60000 })
  if (!allowed) return res.status(429).json({ error: 'Çok fazla istek. Bir dakika sonra deneyin.' })

  const productId = String(req.body?.productId ?? '').trim()
  const productName = String(req.body?.productName ?? '').trim()
  const mail = String(req.body?.email ?? '').trim()
  const name = String(req.body?.name ?? '').trim() || 'Müşteri'
  if (!productId) return res.status(400).json({ error: 'Doğrulama hatası', errors: { productId: 'Ürün gerekli.' } })
  if (!EMAIL_RE.test(mail)) return res.status(400).json({ error: 'Doğrulama hatası', errors: { email: 'Geçerli e-posta gerekli.' } })

  const { status, body } = await n8nFetch('/webhook/stok-oneri', {
    body: buildEvent('stock.suggest_requested', { productId, productName, email: mail, name }),
    timeoutMs: 30000,
  })
  if (status === 200 && body?.oneri) {
    return res.status(200).json({ kaynak: 'ai', oneri: String(body.oneri) })
  }

  console.warn('[api/suggest] AI öneri alınamadı (status ' + status + '), katalog yedeğine dönüldü')
  const catalog = getCatalog()
  const hedef = catalog.find((p) => p.id === productId)
  const aday = catalog.filter((p) => p.id !== productId && p.inStock)
  const sirali = [...aday.filter((p) => hedef && p.categoryId === hedef.categoryId), ...aday.filter((p) => !hedef || p.categoryId !== hedef.categoryId)]
  const ilkUc = sirali.slice(0, 3).map((p) => `${p.name} (${p.priceFrom} ${p.currency}, stokta var)`)
  const oneri = hedef
    ? `"${hedef.name}" şu anda stokta yok. Stoktaki alternatiflerimiz: ${ilkUc.join(', ')}.`
    : `Stoktaki ürünlerimiz: ${ilkUc.join(', ')}.`
  return res.status(200).json({ kaynak: 'yedek', oneri })
}
