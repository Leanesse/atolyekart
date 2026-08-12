import { describe, it, expect } from 'vitest'
import { checkRateLimit } from './rateLimit.js'

describe('checkRateLimit', () => {
  it('limit içindeki istekleri geçirir, aşımı engeller', () => {
    const key = 'test-ip-' + Math.random()
    const opts = { limit: 3, windowMs: 60000 }
    expect(checkRateLimit(key, opts).allowed).toBe(true)
    expect(checkRateLimit(key, opts).allowed).toBe(true)
    expect(checkRateLimit(key, opts).allowed).toBe(true)
    expect(checkRateLimit(key, opts).allowed).toBe(false)
  })

  it('ilk çağrıda remaining limit-1 döner', () => {
    const key = 'test-remaining-' + Math.random()
    const opts = { limit: 5, windowMs: 60000 }
    const result = checkRateLimit(key, opts)
    expect(result.allowed).toBe(true)
    expect(result.remaining).toBe(4)
  })

  it('pencere sıfırlandıktan sonra istek tekrar geçer', async () => {
    const key = 'test-reset-' + Math.random()
    const opts = { limit: 2, windowMs: 20 }
    // Limiti tüket
    expect(checkRateLimit(key, opts).allowed).toBe(true)
    expect(checkRateLimit(key, opts).allowed).toBe(true)
    expect(checkRateLimit(key, opts).allowed).toBe(false)
    // Pencereyi bekle
    await new Promise(r => setTimeout(r, 30))
    // Sıfırlandıktan sonra tekrar geçmeli
    expect(checkRateLimit(key, opts).allowed).toBe(true)
  })

  it('opts belirtilmezse varsayılanlar uygulanır ve ilk çağrı geçer', () => {
    const key = 'test-defaults-' + Math.random()
    const result = checkRateLimit(key)
    expect(result.allowed).toBe(true)
    expect(result.remaining).toBe(9) // varsayılan limit=10
  })
})
