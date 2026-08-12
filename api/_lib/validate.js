const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const clean = (v) => String(v ?? '').trim()
const email = (v) => clean(v).toLowerCase()

export function validateOrder(body) {
  const data = {
    name: clean(body?.name),
    productId: clean(body?.productId),
    productName: clean(body?.productName),
    phone: clean(body?.phone),
    email: email(body?.email),
    quantity: Number(body?.quantity),
    consent: body?.consent === true,
  }
  const errors = {}
  if (!data.name) errors.name = 'Ad gerekli.'
  if (!data.productId) errors.productId = 'Ürün gerekli.'
  if (!EMAIL_RE.test(data.email)) errors.email = 'Geçerli e-posta gerekli.'
  if (!data.phone) errors.phone = 'Telefon gerekli.'
  if (!Number.isInteger(data.quantity) || data.quantity < 1) errors.quantity = 'Adet en az 1.'
  if (!data.consent) errors.consent = 'Açık rıza gerekli (KVKK).'
  return { valid: Object.keys(errors).length === 0, errors, data }
}

export function validateStockNotify(body) {
  const data = {
    name: clean(body?.name),
    email: email(body?.email),
    productId: clean(body?.productId),
    productName: clean(body?.productName),
  }
  const errors = {}
  if (!data.name) errors.name = 'Ad gerekli.'
  if (!EMAIL_RE.test(data.email)) errors.email = 'Geçerli e-posta gerekli.'
  if (!data.productId) errors.productId = 'Ürün gerekli.'
  return { valid: Object.keys(errors).length === 0, errors, data }
}
