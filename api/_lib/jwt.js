import jwt from 'jsonwebtoken'

export function signAdminToken(payload = { role: 'admin' }) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' })
}

export function verifyAdminToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET)
  } catch {
    return null
  }
}
