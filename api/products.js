import { getCatalog } from './_lib/catalog.js'

export default function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' })
  res.status(200).json({ products: getCatalog() })
}
