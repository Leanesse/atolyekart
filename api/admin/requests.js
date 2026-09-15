import { verifyAdminToken } from '../_lib/jwt.js'
import { n8nFetch } from '../_lib/n8n.js'

const TABLOLAR = ['teklif', 'stok', 'siparisler']

// Admin panelin talep okuma ucu. n8n "H4 — Talep Listesi" webhook'una köprü olur:
// tablo=teklif → TeklifTalepleri, tablo=stok → StokBildirim, tablo=siparisler → Siparişler.
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' })
  const auth = req.headers.authorization || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : ''
  if (!verifyAdminToken(token)) return res.status(401).json({ error: 'Yetkisiz.' })

  const istenen = String(req.query.tablo ?? 'teklif')
  const tablo = TABLOLAR.includes(istenen) ? istenen : 'teklif'
  const { status, body } = await n8nFetch(`/webhook/talep-listesi?tablo=${tablo}`, { method: 'GET', timeoutMs: 20000 })

  if (status !== 200 || !Array.isArray(body?.satirlar)) {
    console.error('[api/admin/requests] n8n liste hatası:', status, body?.error)
    return res.status(502).json({ error: 'Talep listesi alınamadı.' })
  }
  return res.status(200).json({ requests: body.satirlar })
}
