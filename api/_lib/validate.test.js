import { describe, it, expect } from 'vitest'
import { validateOrder, validateStockNotify, validateCustomPrint } from './validate.js'

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
    expect(validateStockNotify({ name: 'Ali', email: 'ali@site.com', productId: 'p1', productName: 'X', consent: true }).valid).toBe(true)
  })
  it('geçersiz e-postayı reddeder', () => {
    expect(validateStockNotify({ name: 'Ali', email: 'foo@bar', productId: 'p1', consent: true }).valid).toBe(false)
  })
  it('consent yoksa reddeder', () => {
    expect(validateStockNotify({ name: 'Ali', email: 'ali@site.com', productId: 'p1', consent: false }).valid).toBe(false)
  })
})

describe('validateCustomPrint', () => {
  it('geçerli talebi onaylar', () => {
    expect(validateCustomPrint({ name: 'Ali', email: 'ali@site.com', quantity: 2, notes: 'STL hazır', consent: true }).valid).toBe(true)
  })
  it('renkleri çoktan seçmeli toplar ve color özetini üretir', () => {
    const r = validateCustomPrint({ name: 'Ali', email: 'ali@site.com', quantity: 1, notes: 'x', consent: true, colors: ['Siyah', '  Mor ', '', 42] })
    expect(r.data.colors).toEqual(['Siyah', 'Mor'])
    expect(r.data.color).toBe('Siyah, Mor')
  })
  it('renk verilmemişse color boş kalır', () => {
    const r = validateCustomPrint({ name: 'Ali', email: 'ali@site.com', quantity: 1, notes: 'x', consent: true })
    expect(r.data.colors).toEqual([])
    expect(r.data.color).toBe('')
  })
  it('en fazla 8 renk alır', () => {
    const r = validateCustomPrint({ name: 'Ali', email: 'ali@site.com', quantity: 1, notes: 'x', consent: true, colors: ['1','2','3','4','5','6','7','8','9','10'] })
    expect(r.data.colors.length).toBe(8)
  })
  it('not alanı boşsa reddeder', () => {
    expect(validateCustomPrint({ name: 'Ali', email: 'ali@site.com', quantity: 1, notes: '', consent: true }).valid).toBe(false)
  })
  it('geçersiz e-postayı reddeder', () => {
    expect(validateCustomPrint({ name: 'Ali', email: 'foo@bar', quantity: 1, notes: 'x', consent: true }).valid).toBe(false)
  })
  it('consent yoksa reddeder', () => {
    expect(validateCustomPrint({ name: 'Ali', email: 'ali@site.com', quantity: 1, notes: 'x', consent: false }).valid).toBe(false)
  })
})
