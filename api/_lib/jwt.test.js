import { describe, it, expect, beforeAll } from 'vitest'
import { signAdminToken, verifyAdminToken } from './jwt.js'

beforeAll(() => { process.env.JWT_SECRET = 'test-secret' })

describe('admin jwt', () => {
  it('imzalayıp doğrular (round-trip)', () => {
    const token = signAdminToken({ role: 'admin' })
    expect(verifyAdminToken(token)?.role).toBe('admin')
  })
  it('geçersiz token için null döner', () => {
    expect(verifyAdminToken('bozuk.token.xx')).toBeNull()
  })
})
