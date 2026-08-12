// Paylaşılabilir saf doğrulama (client). Sunucu ayrıca api/_lib/validate.js ile doğrular.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function normalizeEmail(raw) {
  return String(raw ?? '').trim().toLowerCase()
}

export function isValidEmail(raw) {
  return EMAIL_RE.test(normalizeEmail(raw))
}

export function validateOrderForm(form) {
  const errors = {}
  if (!String(form?.name ?? '').trim()) errors.name = 'Ad Soyad gerekli.'
  if (!String(form?.productId ?? '').trim()) errors.productId = 'Ürün seçin.'
  if (!isValidEmail(form?.email)) errors.email = 'Geçerli bir e-posta girin (ör. ad@site.com).'
  if (!String(form?.phone ?? '').trim()) errors.phone = 'Telefon gerekli.'
  const q = Number(form?.quantity)
  if (!Number.isInteger(q) || q < 1) errors.quantity = 'Adet en az 1 olmalı.'
  if (form?.consent !== true) errors.consent = 'Devam için açık rıza gerekli.'
  return { valid: Object.keys(errors).length === 0, errors }
}
