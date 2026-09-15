// n8n köprü yardımcıları.
// WEBHOOK_URL "https://<tunnel>/webhook/vercel-event" biçimindedir; n8nBase() onu
// tunnel köküne indirger, böylece yeni n8n webhook yolları env eklemeden türetilir.
export function n8nBase() {
  const url = process.env.WEBHOOK_URL
  if (!url) {
    console.warn('[n8n] WEBHOOK_URL tanımsız — n8n çağrıları atlanacak')
    return null
  }
  const base = url.replace(/\/webhook\/.*$/, '')
  if (base === url || !/^https?:\/\//.test(base)) return null
  return base
}

// Hata fırlatmak yerine { status, body } döner; çağıran tarafın karar vermesi için.
export async function n8nFetch(path, { method = 'POST', body, timeoutMs = 30000 } = {}) {
  const base = n8nBase()
  if (!base) return { status: 0, body: null, error: 'WEBHOOK_URL tanımsız' }
  try {
    const res = await fetch(`${base}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Secret': process.env.WEBHOOK_SECRET ?? '',
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(timeoutMs),
    })
    const isJson = (res.headers.get('content-type') || '').includes('json')
    const payload = isJson ? await res.json().catch(() => null) : await res.text().catch(() => null)
    return { status: res.status, body: payload }
  } catch (err) {
    return { status: 0, body: null, error: err?.message ?? 'n8n çağrısı başarısız' }
  }
}
