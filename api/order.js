import { validateOrder } from './_lib/validate.js'
import { checkRateLimit } from './_lib/rateLimit.js'
import { sendToWebhook } from './_lib/webhook.js'
import { addOrder } from './_lib/orderStore.js'

function clientIp(req) {
  return (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown'
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' })
  const { allowed } = checkRateLimit(`order:${clientIp(req)}`, { limit: 10, windowMs: 60000 })
  if (!allowed) return res.status(429).json({ error: 'Çok fazla istek. Bir dakika sonra deneyin.' })

  const { valid, errors, data } = validateOrder(req.body)
  if (!valid) return res.status(400).json({ error: 'Doğrulama hatası', errors })

  try {
    await sendToWebhook('order.created', {
      name: data.name, productId: data.productId, productName: data.productName,
      phone: data.phone, email: data.email, quantity: data.quantity,
    })
    const saved = addOrder(data)
    return res.status(201).json({ ok: true, id: saved.id })
  } catch (err) {
    console.error('[api/order]', err)
    return res.status(502).json({ error: 'Webhook iletilemedi.' })
  }
}
