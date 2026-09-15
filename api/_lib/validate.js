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
    color: clean(body?.color),
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

export function validateCustomPrint(body) {
  // Renkler çoktan seçmeli: colors[] yapısını temizle, tekil color alanını
  // (eski n8n akışı uyumlu) virgüllü özet olarak türet.
  const colors = Array.isArray(body?.colors)
    ? body.colors.filter((c) => typeof c === 'string').map((c) => clean(c)).filter(Boolean).slice(0, 8)
    : []
  const data = {
    name: clean(body?.name),
    email: email(body?.email),
    materialId: clean(body?.materialId),
    color: clean(body?.color) || colors.join(', '),
    colors,
    quantity: Number(body?.quantity),
    notes: clean(body?.notes),
    consent: body?.consent === true,
  }
  const errors = {}
  if (!data.name) errors.name = 'Ad gerekli.'
  if (!EMAIL_RE.test(data.email)) errors.email = 'Geçerli e-posta gerekli.'
  if (!data.notes) errors.notes = 'Ne istediğini kısaca yaz (not alanı).'
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
    consent: body?.consent === true,
  }
  const errors = {}
  if (!data.name) errors.name = 'Ad gerekli.'
  if (!EMAIL_RE.test(data.email)) errors.email = 'Geçerli e-posta gerekli.'
  if (!data.productId) errors.productId = 'Ürün gerekli.'
  if (!data.consent) errors.consent = 'Açık rıza gerekli (KVKK).'
  return { valid: Object.keys(errors).length === 0, errors, data }
}
