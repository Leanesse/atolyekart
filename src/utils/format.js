// Para ve sayı formatlama yardımcıları — tek yerde.

/**
 * Fiyatı yerel para birimi formatında döndürür.
 * @param {number} amount   - Tutar (ör. 749)
 * @param {string} currency - ISO para birimi (ör. 'TRY')
 * @returns {string} ör. "749,00 ₺"
 */
export function formatPrice(amount, currency = 'TRY') {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}
