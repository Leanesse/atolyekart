import { customPrintRequests } from '../data/customPrintRequests.js'

const delay = (ms = 120) => new Promise(r => setTimeout(r, ms))

/**
 * Özel baskı talebini kaydeder.
 * ŞİMDİLİK: yeni bir CustomPrintRequest oluşturup bellekteki listeye ekler.
 * İLERİDE: bu fonksiyonun gövdesi webhook/backend'e `fetch(POST)` ile değişecek;
 *          çağıran bileşen (form) hiç değişmeyecek.
 *
 * @param {Omit<import('../models/types').CustomPrintRequest, 'id'|'status'|'createdAt'>} payload
 * @returns {Promise<import('../models/types').CustomPrintRequest>}
 */
export async function submitRequest(payload) {
  await delay()

  /** @type {import('../models/types').CustomPrintRequest} */
  const request = {
    id: `req-${Date.now()}`,
    status: 'new',
    createdAt: new Date().toISOString(),
    quantity: 1,
    ...payload,
  }

  customPrintRequests.push(request)

  // İleride webhook entegrasyonu buraya:
  // await fetch(WEBHOOK_URL, { method: 'POST', body: JSON.stringify(request) })
  console.log('[customPrintService] Yeni talep oluşturuldu:', request)

  return request
}
