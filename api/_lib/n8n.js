// n8n köprü yardımcıları.
// WEBHOOK_URL "https://<tunnel>/webhook/vercel-event" biçimindedir; n8nBase() onu
// tunnel köküne indirger, böylece yeni n8n webhook yolları env eklemeden türetilir.
//
// NOT (2026-09): Vercel'in resolver'ı ts.net adresi için ara sıra IPv4 kaydı
// döndürmüyor (yalnız AAAA) — Vercel fonksiyonundan IPv6 outbound olmadığı için
// fetch anında ENOTFOUND patlıyor. Bu yüzden funnel hostname'i DoH (Cloudflare)
// üzerinden IPv4'e çözülüp undici Agent ile o IP'ye bağlanılıyor (SNI/Host
// doğru hostname ile). DoH başarısız olursa normal fetch'e düşer.

import { Agent, fetch as undiciFetch } from 'undici'

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

// DoH ile funnel hostname'inin IPv4'ünü çöz (5 dk cache)
const _ipCache = { ip: null, t: 0 }
async function funnelIPv4(hostname) {
  if (_ipCache.ip && Date.now() - _ipCache.t < 300000) return _ipCache.ip
  try {
    const r = await fetch(`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(hostname)}&type=A`, {
      headers: { accept: 'application/dns-json' },
      signal: AbortSignal.timeout(5000),
    })
    const ans = (await r.json()).Answer?.filter((a) => a.type === 1)
    const ip = ans?.[0]?.data ?? null
    if (ip) {
      _ipCache.ip = ip
      _ipCache.t = Date.now()
      console.log('[n8n] funnel IPv4 (DoH):', ip)
    }
    return ip
  } catch (e) {
    console.warn('[n8n] DoH çözümlemesi başarısız:', e?.message)
    return null
  }
}

// Hata sorunu yaşayan hostnamelere karşı IP-pinned dispatcher
async function pinnedDispatcher(hostname) {
  const ip = await funnelIPv4(hostname)
  if (!ip) return undefined
  return new Agent({
    connect: {
      lookup: (h, opts, cb) => cb(null, [{ address: ip, family: 4 }]),
    },
  })
}

// Hata fırlatmak yerine { status, body } döner; çağıran tarafın karar vermesi için.
export async function n8nFetch(path, { method = 'POST', body, timeoutMs = 30000 } = {}) {
  const base = n8nBase()
  if (!base) return { status: 0, body: null, error: 'WEBHOOK_URL tanımsız' }

  let hostname
  try {
    hostname = new URL(base).hostname
  } catch {
    return { status: 0, body: null, error: 'WEBHOOK_URL bozuk' }
  }

  const init = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-Webhook-Secret': process.env.WEBHOOK_SECRET ?? '',
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  }

  try {
    // 1) Önce normal fetch (DNS sağlıklıysa en hızlı yol)
    const r = await fetch(`${base}${path}`, { ...init, signal: AbortSignal.timeout(timeoutMs) })
    const isJson = (r.headers.get('content-type') || '').includes('json')
    const payload = isJson ? await r.json().catch(() => null) : await r.text().catch(() => null)
    return { status: r.status, body: payload }
  } catch (firstErr) {
    // 2) DNS/egress kaynaklı anlık hatalarda DoH-çözümlü IP üzerinden dene
    try {
      const dispatcher = await pinnedDispatcher(hostname)
      if (!dispatcher) return { status: 0, body: null, error: firstErr?.message ?? 'fetch failed' }
      const r = await undiciFetch(`${base}${path}`, {
        ...init,
        dispatcher,
        signal: AbortSignal.timeout(timeoutMs),
      })
      const isJson = (r.headers.get('content-type') || '').includes('json')
      const payload = isJson ? await r.json().catch(() => null) : await r.text().catch(() => null)
      return { status: r.status, body: payload }
    } catch (err) {
      return { status: 0, body: null, error: err?.message ?? firstErr?.message ?? 'n8n çağrısı başarısız' }
    }
  }
}
