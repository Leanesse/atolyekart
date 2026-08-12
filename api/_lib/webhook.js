// Sunucu→sunucu webhook gönderimi. Secret .env'de kalır, tarayıcıya gitmez.
export function buildEvent(event, data) {
  return {
    event,
    source: 'fpvstore',
    id: `evt-${Date.now()}`,
    createdAt: new Date().toISOString(),
    data,
  }
}

export async function sendToWebhook(event, data) {
  const url = process.env.WEBHOOK_URL
  const payload = buildEvent(event, data)
  if (!url) {
    console.warn('[webhook] WEBHOOK_URL tanımsız, gönderim atlandı:', payload.event)
    return { status: 0, payload }
  }
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Webhook-Secret': process.env.WEBHOOK_SECRET ?? '',
    },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(`Webhook ${res.status}`)
  return { status: res.status, payload }
}
