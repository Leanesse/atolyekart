import { describe, it, expect } from 'vitest'
import { normalizeEmail, isValidEmail, validateOrderForm } from './validation.js'

describe('normalizeEmail', () => {
  it('boşlukları kırpar ve küçük harfe çevirir', () => {
    expect(normalizeEmail('  User@Mail.COM ')).toBe('user@mail.com')
  })
})

describe('isValidEmail', () => {
  it('noktasız alan adını reddeder (foo@bar)', () => {
    expect(isValidEmail('foo@bar')).toBe(false)
  })
  it('boşluklu girişi normalize edip kabul eder', () => {
    expect(isValidEmail('  ali@site.com ')).toBe(true)
  })
  it('@ olmayanı reddeder', () => {
    expect(isValidEmail('alisite.com')).toBe(false)
  })
})

describe('validateOrderForm', () => {
  const base = { name: 'Ali', productId: 'p1', email: 'ali@site.com', phone: '5551112233', quantity: 2, consent: true }
  it('geçerli formu onaylar', () => {
    expect(validateOrderForm(base).valid).toBe(true)
  })
  it('noktasız e-postada email hatası verir', () => {
    const r = validateOrderForm({ ...base, email: 'foo@bar' })
    expect(r.valid).toBe(false)
    expect(r.errors.email).toBeTruthy()
  })
  it('consent false ise reddeder (KVKK)', () => {
    const r = validateOrderForm({ ...base, consent: false })
    expect(r.valid).toBe(false)
    expect(r.errors.consent).toBeTruthy()
  })
  it('adet 0 ise reddeder', () => {
    expect(validateOrderForm({ ...base, quantity: 0 }).valid).toBe(false)
  })
})
