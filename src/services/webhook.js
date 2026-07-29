// Ortak webhook yardımcısı — tüm dış gönderimler bu zarfı ve bu POST'u kullanır.
// URL koda gömülmez; .env'deki VITE_WEBHOOK_URL'den okunur.

const WEBHOOK_URL = import.meta.env.VITE_WEBHOOK_URL

/**
 * Standart webhook zarfını üretir.
 * @param {string} event  - 'konu.eylem' (ör. 'order.created')
 * @param {Object} data   - Olaya özel alanlar
 * @returns {import('../models/types').WebhookEvent}
 */
export function buildEvent(event, data) {
  return {
    event,
    source: 'fpvstore',
    id: `evt-${Date.now()}`,
    createdAt: new Date().toISOString(),
    data,
  }
}

/**
 * Zarfı oluşturup VITE_WEBHOOK_URL'e POST atar.
 * URL tanımlı değilse gönderimi atlar (dev kolaylığı) ve zarfı yine döndürür.
 *
 * NOT: Tarayıcıdan üçüncü taraf bir webhook'a gönderiyoruz. Çoğu webhook alıcısı
 * (webhook.site, Zapier, Make, n8n…) CORS izin başlığı döndürmez; bu yüzden
 * `Content-Type: application/json` bir CORS preflight (OPTIONS) tetikler ve asıl
 * POST tarayıcı tarafından iptal edilir. Bunu önlemek için isteği "basit istek"
 * yapıyoruz: `mode:'no-cors'` + `text/plain`. Body yine JSON zarfıdır.
 * Karşılık opak olduğundan HTTP durum kodu okunamaz; yalnızca ağ hatası yakalanır.
 *
 * @param {string} event
 * @param {Object} data
 * @returns {Promise<import('../models/types').WebhookEvent>}
 */
export async function sendEvent(event, data) {
  const payload = buildEvent(event, data)

  if (!WEBHOOK_URL) {
    console.warn('[webhook] VITE_WEBHOOK_URL tanımlı değil, gönderim atlandı:', payload)
    return payload
  }

  await fetch(WEBHOOK_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
    body: JSON.stringify(payload),
  })

  return payload
}
