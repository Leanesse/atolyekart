import { verifyAdminToken } from '../_lib/jwt.js'
import { listOrders } from '../_lib/orderStore.js'
import { n8nFetch } from '../_lib/n8n.js'

// Siparişleri öncelikle n8n Siparişler Data Table'dan okur (kalıcı);
// n8n'e ulaşılamazsa bellek içi store'a düşer.
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' })
  const auth = req.headers.authorization || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : ''
  if (!verifyAdminToken(token)) return res.status(401).json({ error: 'Yetkisiz.' })

  const { status, body } = await n8nFetch('/webhook/talep-listesi?tablo=siparisler', { method: 'GET', timeoutMs: 20000 })
  if (status === 200 && Array.isArray(body?.satirlar)) {
    const orders = body.satirlar.map((o, i) => ({
      id: `ord-n8n-${o.id ?? i}`,
      createdAt: o.createdAt ?? '',
      name: o.Musteri ?? '',
      productName: o.Urun ?? '',
      quantity: Number(o.Adet) || 1,
      email: o.Email ?? '',
    }))
    return res.status(200).json({ orders })
  }

  console.warn('[api/admin/orders] n8n listesi alınamadı (status ' + status + '), belleğe dönüldü')
  return res.status(200).json({ orders: listOrders() })
}
