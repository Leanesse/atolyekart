import { verifyAdminToken } from '../_lib/jwt.js'
import { listOrders } from '../_lib/orderStore.js'

export default function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' })
  const auth = req.headers.authorization || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : ''
  if (!verifyAdminToken(token)) return res.status(401).json({ error: 'Yetkisiz.' })
  return res.status(200).json({ orders: listOrders() })
}
