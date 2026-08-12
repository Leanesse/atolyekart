import { signAdminToken } from '../_lib/jwt.js'

export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' })
  const { password } = req.body || {}
  if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Parola hatalı.' })
  }
  let token
  try {
    token = signAdminToken()
  } catch (err) {
    console.error('[api/admin/login] JWT imzalama hatası:', err)
    return res.status(500).json({ error: 'Sunucu yapılandırma hatası.' })
  }
  return res.status(200).json({ token })
}
