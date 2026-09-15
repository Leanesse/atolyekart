import { validateCustomPrint } from './_lib/validate.js'
import { checkRateLimit } from './_lib/rateLimit.js'
import { buildEvent } from './_lib/webhook.js'
import { n8nFetch } from './_lib/n8n.js'
import { clientIp } from './_lib/clientIp.js'

// Özel baskı talebini n8n "H4 — Teklif Al" akışına iletir:
// doğrulama → TeklifTalepleri Data Table + müşteriye onay maili.
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' })
  const { allowed } = checkRateLimit(`custom:${clientIp(req)}`, { limit: 10, windowMs: 60000 })
  if (!allowed) return res.status(429).json({ error: 'Çok fazla istek. Bir dakika sonra deneyin.' })

  const { valid, errors, data } = validateCustomPrint(req.body)
  if (!valid) return res.status(400).json({ error: 'Doğrulama hatası', errors })

  const { status, body } = await n8nFetch('/webhook/teklif-al', {
    body: buildEvent('custom_print.requested', {
      name: data.name, email: data.email,
      materialId: data.materialId, color: data.color,
      quantity: data.quantity, notes: data.notes,
    }),
  })

  if (status === 400) return res.status(400).json({ error: 'Doğrulama hatası', errors: body?.hatalar })
  if (status !== 200) {
    console.error('[api/custom-print] n8n hatası:', status, body?.error)
    return res.status(502).json({ error: 'Talep iletilemedi.' })
  }
  return res.status(201).json({ ok: true })
}
