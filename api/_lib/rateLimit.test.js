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
})
