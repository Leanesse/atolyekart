# AtölyeKart Hafta 2 — Test Notları

**Canlı URL (production):** https://atolyekart-omega.vercel.app
**Test tarihi:** 2026-08-12
**webhook.site alıcı:** https://webhook.site/353facec-566d-4ade-9a0e-9dac366f93d6

Tüm testler canlı Vercel dağıtımına `curl` ile yapıldı.

---

## 1. Statik site + katalog API

| İstek | Sonuç |
|-------|-------|
| `GET /` | **200** (React site yükleniyor) |
| `GET /api/products` | **200**, 12 ürün döndü |

## 2. Sunucu tarafı validasyon (server-side)

| İstek | Beklenen | Sonuç |
|-------|----------|-------|
| `POST /api/order` `{"email":"foo@bar"}` | 400 | **400** — tüm alan hataları (`name, productId, email, phone, quantity, consent`) |
| `POST /api/order` geçerli ama `consent:false` | 400 | **400** — `{"consent":"Açık rıza gerekli (KVKK)."}` |
| `POST /api/order` tam geçerli (`consent:true`) | 201 | **201** — `{"ok":true,"id":"ord-..."}` |
| `POST /api/stock-notify` geçerli | 201 | **201** — `{"ok":true}` |

> `foo@bar` (noktasız) hem client hem server tarafında reddediliyor — Hafta 2.1a bug fix'i canlıda doğrulandı.

## 3. Rate limit (10 istek / dakika / IP)

`POST /api/stock-notify` art arda 12 istek (aynı IP):

```
201 201 201 201 201 201 201 201 201 429 429 429
```

İlk 10 istek geçti (bir önceki geçerli stok testi dahil), 11.+ istekler **429** döndü. Aşımda:
`{"error":"Çok fazla istek. Bir dakika sonra deneyin."}`

## 4. JWT korumalı admin (2.4)

| İstek | Beklenen | Sonuç |
|-------|----------|-------|
| `POST /api/admin/login` yanlış parola | 401 | **401** — `{"error":"Parola hatalı."}` |
| `POST /api/admin/login` doğru parola | 200 | **200** — JWT token (`eyJhbGciOiJIUzI1NiI...`) döndü |
| `GET /api/admin/orders` token'sız | 401 | **401** |
| `GET /api/admin/orders` `Authorization: Bearer <token>` | 200 | **200** — `{"orders":[...]}` |

> Not: `orders` listesi instance'lar arası boş görünebilir — sipariş belleği in-memory
> (serverless per-instance). JWT kapısı (401 ↔ 200) kanıtlandı; kalıcılık için Vercel KV/Upstash
> ileri haftaya bırakıldı (güvenlik checklist'te de not düşülü).

## 5. Webhook teslimatı (server→server, secret korumalı)

webhook.site'a düşen `order.created` olayı (tam zarf + KVKK `consent`):

```json
{
  "event": "order.created",
  "source": "fpvstore",
  "id": "evt-1786530310757",
  "createdAt": "2026-08-12T10:25:10.757Z",
  "data": {
    "name": "İbrahim Yusuf Karagül",
    "productId": "gopro-mount-30",
    "productName": "GoPro Mount 30°",
    "phone": "5055309730",
    "email": "yusuf.karagul70@gmail.com",
    "quantity": 3,
    "consent": true
  }
}
```

- İstek başlığında `X-Webhook-Secret: 5cf36950209a…` var → secret **tarayıcıya değil**, sunucudan
  gönderiliyor. Bundle'da webhook URL'si veya secret **yok**.
- `stock.notify_requested` olayları da aynı `source: "fpvstore"` zarfı + secret başlığıyla düştü.

---

## Özet
Deploy, server-side validasyon, rate limit (429), JWT admin koruması ve secret'lı
server→server webhook teslimatı canlı ortamda uçtan uca doğrulandı. Secret'lar
`.env` / Vercel Environment Variables içinde; client bundle'a girmiyor.
