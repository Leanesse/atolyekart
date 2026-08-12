import { validateStockNotify } from './_lib/validate.js'
import { checkRateLimit } from './_lib/rateLimit.js'
import { sendToWebhook } from './_lib/webhook.js'
import { clientIp } from './_lib/clientIp.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' })
  const { allowed } = checkRateLimit(`stock:${clientIp(req)}`, { limit: 10, windowMs: 60000 })
  if (!allowed) return res.status(429).json({ error: 'Çok fazla istek. Bir dakika sonra deneyin.' })

  const { valid, errors, data } = validateStockNotify(req.body)
  if (!valid) return res.status(400).json({ error: 'Doğrulama hatası', errors })

  try {
    await sendToWebhook('stock.notify_requested', {
      name: data.name, productId: data.productId, productName: data.productName, email: data.email,
    })
    return res.status(201).json({ ok: true })
  } catch (err) {
    console.error('[api/stock-notify]', err)
    return res.status(502).json({ error: 'Webhook iletilemedi.' })
  }
}
