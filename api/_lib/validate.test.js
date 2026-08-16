import { describe, it, expect } from 'vitest'
import { validateOrder, validateStockNotify } from './validate.js'

const order = { name: 'Ali', productId: 'p1', productName: 'X', phone: '5551112233', email: 'ali@site.com', quantity: 2, consent: true }

describe('validateOrder', () => {
  it('geçerli siparişi onaylar ve email normalize eder', () => {
    const r = validateOrder({ ...order, email: ' Ali@Site.com ' })
    expect(r.valid).toBe(true)
    expect(r.data.email).toBe('ali@site.com')
    expect(r.data.quantity).toBe(2)
  })
  it('noktasız e-postayı reddeder', () => {
    expect(validateOrder({ ...order, email: 'foo@bar' }).valid).toBe(false)
  })
  it('consent yoksa reddeder', () => {
    expect(validateOrder({ ...order, consent: false }).valid).toBe(false)
  })
  it('adet tamsayı değilse reddeder', () => {
    expect(validateOrder({ ...order, quantity: 1.5 }).valid).toBe(false)
  })
})

describe('validateStockNotify', () => {
  it('geçerli bildirimi onaylar', () => {
    expect(validateStockNotify({ name: 'Ali', email: 'ali@site.com', productId: 'p1', productName: 'X' }).valid).toBe(true)
  })
  it('geçersiz e-postayı reddeder', () => {
    expect(validateStockNotify({ name: 'Ali', email: 'foo@bar', productId: 'p1' }).valid).toBe(false)
  })
})
