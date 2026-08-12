# AtölyeKart Hafta 2 — Backend, Güvenlik, KVKK, Expo Mobil — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Hafta 1'de tarayıcıdan doğrudan webhook'a giden formları, kendi Vercel Serverless backend'imizin (`/api`) arkasına almak; secret'ları sunucuda tutmak; server-side validasyon + rate limit + KVKK rızası + opsiyonel admin JWT eklemek; canlıya deploy etmek ve minimal bir Expo mobil uygulaması ile "Sipariş Ver" + "Stok Bildirimi"ni telefonda çalıştırmak.

**Architecture:** Web (React+Vite) ve mobil (Expo) istemcileri, Vercel Serverless Functions (`/api/*`) ile konuşur. API route'ları payload'ı server-side doğrular, IP başına rate-limit uygular ve `X-Webhook-Secret` başlığıyla server→server webhook'a iletir (secret asla tarayıcıya gitmez). Admin uçları JWT ile korunur. Paylaşılan saf mantık `api/_lib/` ve `src/utils/` altında, TDD ile.

**Tech Stack:** React 18, Vite 5, Vercel Serverless Functions (Node runtime), `jsonwebtoken`, Vitest (yeni test runner), Expo (React Native).

## Global Constraints

- Marka/kaynak sabiti: webhook zarfında `source: 'fpvstore'`, `event` biçimi `konu.eylem` (`order.created`, `stock.notify_requested`) — verbatim korunacak.
- Secret'lar **client bundle'a girmez**: sunucu değişkenleri `VITE_` öneki almaz (`WEBHOOK_URL`, `WEBHOOK_SECRET`, `JWT_SECRET`, `ADMIN_PASSWORD`). Eski `VITE_WEBHOOK_URL` kaldırılır.
- `.env` `.gitignore`'da kalır; yalnızca `.env.example` commit edilir.
- Sunucu istemciye güvenmez: her `/api` uç noktası payload'ı yeniden doğrular.
- Rate limit: `/api/order` ve `/api/stock-notify` için IP başına **dakikada 10 istek**; aşımda `429`.
- Tasarım dili değişmez: minimalist gri, mevcut CSS sınıf adları korunur.
- Node 22 / npm 10. Yeni bağımlılık yalnızca `jsonwebtoken` (+ devDep `vitest`, `vercel`).
- Türetilen ürün alanları veride tutulmaz; sunucu tarafında hesaplanır.

---

## Dosya Yapısı

**Yeni (backend):**
- `api/_lib/validate.js` — `validateOrder`, `validateStockNotify` (saf, framework'süz)
- `api/_lib/webhook.js` — `buildEvent`, `sendToWebhook` (server→server POST)
- `api/_lib/rateLimit.js` — `checkRateLimit(key)` (in-memory sabit pencere)
- `api/_lib/jwt.js` — `signAdminToken`, `verifyAdminToken`
- `api/_lib/orderStore.js` — `addOrder`, `listOrders` (in-memory)
- `api/_lib/catalog.js` — `getCatalog()` (seed veriden minimal görünüm)
- `api/products.js` — `GET` katalog
- `api/order.js` — `POST` sipariş
- `api/stock-notify.js` — `POST` stok bildirimi
- `api/admin/login.js` — `POST` parola → JWT
- `api/admin/orders.js` — `GET` (JWT korumalı) sipariş listesi

**Yeni (web):**
- `src/utils/validation.js` — `normalizeEmail`, `isValidEmail`, `validateOrderForm`
- `src/components/AdminPanel.jsx` — `#admin` hash paneli
- `src/components/PrivacyPolicy.jsx` — `#gizlilik` sayfası

**Yeni (test/config/doc):**
- `api/_lib/validate.test.js`, `api/_lib/rateLimit.test.js`, `api/_lib/jwt.test.js`
- `src/utils/validation.test.js`
- `vitest.config.js`, `vercel.json`
- `docs/security-checklist.md`, `docs/test-notlari.md`
- `TESLIM-HAFTA2.md`

**Yeni (mobil):** `mobile/` (Expo app — kendi `package.json`'ı)

**Değişecek:**
- `src/services/orderService.js` — `POST /api/order`
- `src/services/stockNotifyService.js` — `POST /api/stock-notify`
- `src/components/OrderForm.jsx` — consent checkbox + client validasyon + hata gösterimi
- `src/components/StockNotify.jsx` — API hatası gösterimi
- `src/components/ProductList.jsx` — "Sadece stokta olanlar" toggle (worktree'de)
- `src/components/Footer.jsx` — Gizlilik Politikası linki
- `src/App.jsx` — `#admin` / `#gizlilik` hash yönlendirme
- `src/index.css` — consent/hata/admin/toggle için minik stiller
- `.env.example`, `package.json` (scriptler + bağımlılıklar)
- `src/services/webhook.js` — **silinir** (client-side webhook kaldırılıyor)

---

## FAZ 0 — Test altyapısı + main'de bug fix (Ödev 2.1a)

### Task 1: Vitest kurulumu

**Files:**
- Modify: `package.json`
- Create: `vitest.config.js`

- [ ] **Step 1: Vitest'i devDependency olarak kur**

Run: `npm install -D vitest@^2`
Expected: `package.json` `devDependencies`'e `vitest` eklenir, hata yok.

- [ ] **Step 2: `vitest.config.js` oluştur**

```js
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.js', 'api/**/*.test.js'],
  },
})
```

- [ ] **Step 3: `test` script'ini ekle**

`package.json` `scripts` içine ekle:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 4: Boş çalıştır, runner ayakta mı doğrula**

Run: `npm test`
Expected: "No test files found" benzeri çıktı, exit 0 veya "no tests" — çökme yok.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json vitest.config.js
git commit -m "chore: Vitest test runner ekle"
```

---

### Task 2: E-posta doğrulama util'i + main'deki bug fix (2.1a)

Mevcut bug: sipariş formu yalnız HTML5 `type=email` kullanıyor; `foo@bar` (noktasız) ve baştaki/sondaki boşluklu e-postayı kabul ediyor. Bu görev main dalında, gerçek bir küçük hatayı düzeltir.

**Files:**
- Create: `src/utils/validation.js`
- Test: `src/utils/validation.test.js`

**Interfaces:**
- Produces:
  - `normalizeEmail(raw: string): string` — trim + lowercase
  - `isValidEmail(raw: string): boolean` — nokta içeren geçerli alan adı şart
  - `validateOrderForm(form: {name,productId,email,phone,quantity,consent}): { valid: boolean, errors: Record<string,string> }`

- [ ] **Step 1: Failing test yaz**

`src/utils/validation.test.js`:
```js
import { describe, it, expect } from 'vitest'
import { normalizeEmail, isValidEmail, validateOrderForm } from './validation.js'

describe('normalizeEmail', () => {
  it('boşlukları kırpar ve küçük harfe çevirir', () => {
    expect(normalizeEmail('  User@Mail.COM ')).toBe('user@mail.com')
  })
})

describe('isValidEmail', () => {
  it('noktasız alan adını reddeder (foo@bar)', () => {
    expect(isValidEmail('foo@bar')).toBe(false)
  })
  it('boşluklu girişi normalize edip kabul eder', () => {
    expect(isValidEmail('  ali@site.com ')).toBe(true)
  })
  it('@ olmayanı reddeder', () => {
    expect(isValidEmail('alisite.com')).toBe(false)
  })
})

describe('validateOrderForm', () => {
  const base = { name: 'Ali', productId: 'p1', email: 'ali@site.com', phone: '5551112233', quantity: 2, consent: true }
  it('geçerli formu onaylar', () => {
    expect(validateOrderForm(base).valid).toBe(true)
  })
  it('noktasız e-postada email hatası verir', () => {
    const r = validateOrderForm({ ...base, email: 'foo@bar' })
    expect(r.valid).toBe(false)
    expect(r.errors.email).toBeTruthy()
  })
  it('consent false ise reddeder (KVKK)', () => {
    const r = validateOrderForm({ ...base, consent: false })
    expect(r.valid).toBe(false)
    expect(r.errors.consent).toBeTruthy()
  })
  it('adet 0 ise reddeder', () => {
    expect(validateOrderForm({ ...base, quantity: 0 }).valid).toBe(false)
  })
})
```

- [ ] **Step 2: Testin başarısız olduğunu doğrula**

Run: `npm test -- src/utils/validation.test.js`
Expected: FAIL — "Cannot find module './validation.js'".

- [ ] **Step 3: Minimal implementasyon**

`src/utils/validation.js`:
```js
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
```

- [ ] **Step 4: Testlerin geçtiğini doğrula**

Run: `npm test -- src/utils/validation.test.js`
Expected: PASS (tüm testler yeşil).

- [ ] **Step 5: Commit (main'deki bug fix)**

```bash
git add src/utils/validation.js src/utils/validation.test.js
git commit -m "fix: sipariş e-posta doğrulaması (noktasız/boşluklu adresi reddet)"
```

---

## FAZ 1 — Backend iskeleti (Ödev 2.3 secret temeli)

### Task 3: Sunucu tarafı webhook yardımcısı

**Files:**
- Create: `api/_lib/webhook.js`

**Interfaces:**
- Produces:
  - `buildEvent(event: string, data: object): { event, source, id, createdAt, data }`
  - `sendToWebhook(event: string, data: object): Promise<{ status: number }>` — `WEBHOOK_URL` tanımlı değilse `{ status: 0 }` döndürüp atlar (dev kolaylığı).

- [ ] **Step 1: Implementasyon**

`api/_lib/webhook.js`:
```js
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
```

- [ ] **Step 2: Commit**

```bash
git add api/_lib/webhook.js
git commit -m "feat(api): sunucu tarafı webhook gönderimi (secret'li)"
```

---

### Task 4: Sunucu tarafı validasyon

**Files:**
- Create: `api/_lib/validate.js`
- Test: `api/_lib/validate.test.js`

**Interfaces:**
- Produces:
  - `validateOrder(body): { valid, errors, data }` — temizlenmiş `data` (name, productId, productName, phone, email, quantity, consent) döndürür.
  - `validateStockNotify(body): { valid, errors, data }` — (name, email, productId, productName).

- [ ] **Step 1: Failing test yaz**

`api/_lib/validate.test.js`:
```js
import { describe, it, expect } from 'vitest'
import { validateOrder, validateStockNotify } from './validate.js'

const order = { name: 'Ali', productId: 'p1', productName: 'X', phone: '5551112233', email: 'ali@site.com', quantity: 2, consent: true }

describe('validateOrder', () => {
  it('geçerli siparişi onaylar ve email normalize eder', () => {
    const r = validateOrder({ ...order, email: ' Ali@Site.com ' })
    expect(r.valid).toBe(true)
    expect(r.data.email).toBe('ali@site.com')
    expect(r.data.quantity).toBe(2)
  })
  it('noktasız e-postayı reddeder', () => {
    expect(validateOrder({ ...order, email: 'foo@bar' }).valid).toBe(false)
  })
  it('consent yoksa reddeder', () => {
    expect(validateOrder({ ...order, consent: false }).valid).toBe(false)
  })
  it('adet tamsayı değilse reddeder', () => {
    expect(validateOrder({ ...order, quantity: 1.5 }).valid).toBe(false)
  })
})

describe('validateStockNotify', () => {
  it('geçerli bildirimi onaylar', () => {
    expect(validateStockNotify({ name: 'Ali', email: 'ali@site.com', productId: 'p1', productName: 'X' }).valid).toBe(true)
  })
  it('geçersiz e-postayı reddeder', () => {
    expect(validateStockNotify({ name: 'Ali', email: 'foo@bar', productId: 'p1' }).valid).toBe(false)
  })
})
```

- [ ] **Step 2: Fail doğrula**

Run: `npm test -- api/_lib/validate.test.js`
Expected: FAIL — modül bulunamadı.

- [ ] **Step 3: Implementasyon**

`api/_lib/validate.js`:
```js
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
```

- [ ] **Step 4: Pass doğrula**

Run: `npm test -- api/_lib/validate.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add api/_lib/validate.js api/_lib/validate.test.js
git commit -m "feat(api): server-side sipariş/stok doğrulaması"
```

---

### Task 5: In-memory rate limit

**Files:**
- Create: `api/_lib/rateLimit.js`
- Test: `api/_lib/rateLimit.test.js`

**Interfaces:**
- Produces: `checkRateLimit(key: string, opts?: {limit?:number, windowMs?:number}): { allowed: boolean, remaining: number }`

- [ ] **Step 1: Failing test yaz**

`api/_lib/rateLimit.test.js`:
```js
import { describe, it, expect } from 'vitest'
import { checkRateLimit } from './rateLimit.js'

describe('checkRateLimit', () => {
  it('limit içindeki istekleri geçirir, aşımı engeller', () => {
    const key = 'test-ip-' + Math.random()
    const opts = { limit: 3, windowMs: 60000 }
    expect(checkRateLimit(key, opts).allowed).toBe(true)
    expect(checkRateLimit(key, opts).allowed).toBe(true)
    expect(checkRateLimit(key, opts).allowed).toBe(true)
    expect(checkRateLimit(key, opts).allowed).toBe(false)
  })
})
```

- [ ] **Step 2: Fail doğrula**

Run: `npm test -- api/_lib/rateLimit.test.js`
Expected: FAIL — modül yok.

- [ ] **Step 3: Implementasyon**

`api/_lib/rateLimit.js`:
```js
// In-memory sabit pencere. Not: Vercel'de per-instance; kalıcı değil (demo).
const buckets = new Map()

export function checkRateLimit(key, { limit = 10, windowMs = 60000 } = {}) {
  const now = Date.now()
  const b = buckets.get(key)
  if (!b || now >= b.reset) {
    buckets.set(key, { count: 1, reset: now + windowMs })
    return { allowed: true, remaining: limit - 1 }
  }
  if (b.count >= limit) return { allowed: false, remaining: 0 }
  b.count += 1
  return { allowed: true, remaining: limit - b.count }
}
```

- [ ] **Step 4: Pass doğrula**

Run: `npm test -- api/_lib/rateLimit.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add api/_lib/rateLimit.js api/_lib/rateLimit.test.js
git commit -m "feat(api): IP başına in-memory rate limit"
```

---

### Task 6: Katalog kaynağı + order store

**Files:**
- Create: `api/_lib/catalog.js`
- Create: `api/_lib/orderStore.js`

**Interfaces:**
- Produces:
  - `getCatalog(): Array<{id,slug,name,categoryId,emoji,description,priceFrom,currency,inStock}>`
  - `addOrder(record): object` (id + createdAt ekler), `listOrders(): Array`

- [ ] **Step 1: `catalog.js` yaz**

`api/_lib/catalog.js` (mevcut seed veriyi minimal görünüme indirger):
```js
import { products } from '../../src/data/products.js'

export function getCatalog() {
  return products.map((p) => {
    const prices = p.variants.map((v) => v.price)
    return {
      id: p.id,
      slug: p.slug,
      name: p.name,
      categoryId: p.categoryId,
      emoji: p.emoji,
      description: p.description,
      priceFrom: prices.length ? Math.min(...prices) : 0,
      currency: p.variants[0]?.currency ?? 'TRY',
      inStock: p.variants.some((v) => v.stock > 0),
    }
  })
}
```

- [ ] **Step 2: `orderStore.js` yaz**

`api/_lib/orderStore.js`:
```js
// In-memory sipariş listesi. Not: serverless'ta kalıcı değil; admin demo amaçlı.
const orders = []

export function addOrder(record) {
  const saved = { id: `ord-${Date.now()}`, createdAt: new Date().toISOString(), ...record }
  orders.unshift(saved)
  return saved
}

export function listOrders() {
  return orders
}
```

- [ ] **Step 3: Commit**

```bash
git add api/_lib/catalog.js api/_lib/orderStore.js
git commit -m "feat(api): katalog kaynağı ve in-memory order store"
```

---

### Task 7: `/api/products`, `/api/order`, `/api/stock-notify` uçları

**Files:**
- Create: `api/products.js`, `api/order.js`, `api/stock-notify.js`
- Create: `vercel.json`
- Modify: `package.json` (dev:api script + vercel devDep)

**Interfaces:**
- Consumes: `getCatalog`, `validateOrder`, `validateStockNotify`, `checkRateLimit`, `sendToWebhook`, `addOrder`.

- [ ] **Step 1: `vercel` CLI'yi devDependency olarak kur**

Run: `npm install -D vercel`
Expected: `vercel` devDependency olarak eklenir.

- [ ] **Step 2: `dev:api` script'i ekle**

`package.json` `scripts` içine: `"dev:api": "vercel dev"`

- [ ] **Step 3: `vercel.json` oluştur**

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "vite",
  "functions": { "api/**/*.js": { "runtime": "nodejs22.x" } }
}
```

- [ ] **Step 4: `api/products.js`**

```js
import { getCatalog } from './_lib/catalog.js'

export default function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' })
  res.status(200).json({ products: getCatalog() })
}
```

- [ ] **Step 5: `api/order.js`**

```js
import { validateOrder } from './_lib/validate.js'
import { checkRateLimit } from './_lib/rateLimit.js'
import { sendToWebhook } from './_lib/webhook.js'
import { addOrder } from './_lib/orderStore.js'

function clientIp(req) {
  return (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown'
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' })
  const { allowed } = checkRateLimit(`order:${clientIp(req)}`, { limit: 10, windowMs: 60000 })
  if (!allowed) return res.status(429).json({ error: 'Çok fazla istek. Bir dakika sonra deneyin.' })

  const { valid, errors, data } = validateOrder(req.body)
  if (!valid) return res.status(400).json({ error: 'Doğrulama hatası', errors })

  try {
    await sendToWebhook('order.created', {
      name: data.name, productId: data.productId, productName: data.productName,
      phone: data.phone, email: data.email, quantity: data.quantity,
    })
    const saved = addOrder(data)
    return res.status(201).json({ ok: true, id: saved.id })
  } catch (err) {
    console.error('[api/order]', err)
    return res.status(502).json({ error: 'Webhook iletilemedi.' })
  }
}
```

- [ ] **Step 6: `api/stock-notify.js`**

```js
import { validateStockNotify } from './_lib/validate.js'
import { checkRateLimit } from './_lib/rateLimit.js'
import { sendToWebhook } from './_lib/webhook.js'

function clientIp(req) {
  return (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown'
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' })
  const { allowed } = checkRateLimit(`stock:${clientIp(req)}`, { limit: 10, windowMs: 60000 })
  if (!allowed) return res.status(429).json({ error: 'Çok fazla istek. Bir dakika sonra deneyin.' })

  const { valid, errors, data } = validateStockNotify(req.body)
  if (!valid) return res.status(400).json({ error: 'Doğrulama hatası', errors })

  try {
    await sendToWebhook('stock.notify_requested', {
      name: data.name, productId: data.productId, productName: data.productName, email: data.email,
    })
    return res.status(201).json({ ok: true })
  } catch (err) {
    console.error('[api/stock-notify]', err)
    return res.status(502).json({ error: 'Webhook iletilemedi.' })
  }
}
```

- [ ] **Step 7: Testlerin hâlâ geçtiğini doğrula (regresyon yok)**

Run: `npm test`
Expected: Tüm birim testleri PASS.

- [ ] **Step 8: Commit**

```bash
git add api/products.js api/order.js api/stock-notify.js vercel.json package.json package-lock.json
git commit -m "feat(api): products/order/stock-notify uçları + vercel.json"
```

---

### Task 8: Web servislerini `/api`'ye bağla + eski client webhook'u kaldır

**Files:**
- Modify: `src/services/orderService.js`
- Modify: `src/services/stockNotifyService.js`
- Delete: `src/services/webhook.js`

**Interfaces:**
- Produces:
  - `submitOrder(payload): Promise<{ ok, id }>` — hata durumunda `Error(mesaj)` fırlatır (`err.fieldErrors` opsiyonel).
  - `submitStockNotify(payload): Promise<{ ok }>`.

- [ ] **Step 1: `orderService.js`'i güncelle**

```js
// Sipariş talebini kendi backend'imize (/api/order) POST eder.
export async function submitOrder(payload) {
  const res = await fetch('/api/order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const body = await res.json().catch(() => ({}))
  if (!res.ok) {
    const err = new Error(body.error || 'Sipariş gönderilemedi.')
    err.fieldErrors = body.errors
    throw err
  }
  return body // { ok, id }
}
```

- [ ] **Step 2: `stockNotifyService.js`'i güncelle**

```js
// Stok bildirimini kendi backend'imize (/api/stock-notify) POST eder.
export async function submitStockNotify(payload) {
  const res = await fetch('/api/stock-notify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(body.error || 'Bildirim gönderilemedi.')
  return body // { ok }
}
```

- [ ] **Step 3: Eski client webhook'u sil**

Run: `git rm src/services/webhook.js`
Expected: Dosya silinir. (Not: `VITE_WEBHOOK_URL` kullanan tek yer burasıydı.)

- [ ] **Step 4: Build kırılmadı mı doğrula**

Run: `npm run build`
Expected: Başarılı build (webhook.js'e referans kalmadı).

- [ ] **Step 5: Commit**

```bash
git add src/services/orderService.js src/services/stockNotifyService.js
git commit -m "refactor: form servislerini /api'ye taşı, client webhook'u kaldır"
```

---

## FAZ 2 — Güvenlik: secret, KVKK, admin JWT (Ödev 2.3/2.4/2.5/2.6)

### Task 9: Secret env örneği + eski VITE değişkenini temizle

**Files:**
- Modify: `.env.example`

- [ ] **Step 1: `.env.example`'ı güncelle**

```bash
# --- SUNUCU (tarayıcıya GİTMEZ; VITE_ öneki YOK) ---
# Webhook alıcı URL'si (webhook.site / n8n / Make ...)
WEBHOOK_URL=
# Webhook'a X-Webhook-Secret başlığıyla giden paylaşılan sır
WEBHOOK_SECRET=
# Admin JWT imza sırrı (uzun, rastgele)
JWT_SECRET=
# Admin paneli parolası
ADMIN_PASSWORD=
```

- [ ] **Step 2: `.env`'in gitignore'da olduğunu doğrula**

Run: `git check-ignore .env`
Expected: `.env` (yani yok sayılıyor). Ayrıca `git ls-files | grep -c '^\.env$'` → `0`.

- [ ] **Step 3: Commit**

```bash
git add .env.example
git commit -m "chore: sunucu secret'ları için .env.example (VITE_WEBHOOK_URL kaldırıldı)"
```

---

### Task 10: JWT yardımcısı

**Files:**
- Create: `api/_lib/jwt.js`
- Test: `api/_lib/jwt.test.js`
- Modify: `package.json` (`jsonwebtoken`)

**Interfaces:**
- Produces: `signAdminToken(payload?): string`, `verifyAdminToken(token): object | null`

- [ ] **Step 1: `jsonwebtoken` kur**

Run: `npm install jsonwebtoken`
Expected: dependency eklenir.

- [ ] **Step 2: Failing test yaz**

`api/_lib/jwt.test.js`:
```js
import { describe, it, expect, beforeAll } from 'vitest'
import { signAdminToken, verifyAdminToken } from './jwt.js'

beforeAll(() => { process.env.JWT_SECRET = 'test-secret' })

describe('admin jwt', () => {
  it('imzalayıp doğrular (round-trip)', () => {
    const token = signAdminToken({ role: 'admin' })
    expect(verifyAdminToken(token)?.role).toBe('admin')
  })
  it('geçersiz token için null döner', () => {
    expect(verifyAdminToken('bozuk.token.xx')).toBeNull()
  })
})
```

- [ ] **Step 3: Fail doğrula**

Run: `npm test -- api/_lib/jwt.test.js`
Expected: FAIL — modül yok.

- [ ] **Step 4: Implementasyon**

`api/_lib/jwt.js`:
```js
import jwt from 'jsonwebtoken'

export function signAdminToken(payload = { role: 'admin' }) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' })
}

export function verifyAdminToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET)
  } catch {
    return null
  }
}
```

- [ ] **Step 5: Pass doğrula**

Run: `npm test -- api/_lib/jwt.test.js`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add api/_lib/jwt.js api/_lib/jwt.test.js package.json package-lock.json
git commit -m "feat(api): admin JWT sign/verify"
```

---

### Task 11: Admin uçları (`/api/admin/login`, `/api/admin/orders`)

**Files:**
- Create: `api/admin/login.js`, `api/admin/orders.js`

**Interfaces:**
- Consumes: `signAdminToken`, `verifyAdminToken`, `listOrders`.

- [ ] **Step 1: `api/admin/login.js`**

```js
import { signAdminToken } from '../_lib/jwt.js'

export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' })
  const { password } = req.body || {}
  if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Parola hatalı.' })
  }
  return res.status(200).json({ token: signAdminToken() })
}
```

- [ ] **Step 2: `api/admin/orders.js`**

```js
import { verifyAdminToken } from '../_lib/jwt.js'
import { listOrders } from '../_lib/orderStore.js'

export default function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' })
  const auth = req.headers.authorization || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : ''
  if (!verifyAdminToken(token)) return res.status(401).json({ error: 'Yetkisiz.' })
  return res.status(200).json({ orders: listOrders() })
}
```

- [ ] **Step 3: Commit**

```bash
git add api/admin/login.js api/admin/orders.js
git commit -m "feat(api): JWT korumalı admin login + orders uçları"
```

---

### Task 12: OrderForm'a KVKK rızası + client validasyon + hata gösterimi (2.5)

**Files:**
- Modify: `src/components/OrderForm.jsx`
- Modify: `src/index.css`

- [ ] **Step 1: OrderForm'a validasyon + consent bağla**

`src/components/OrderForm.jsx` değişiklikleri:
1. Üstte import: `import { validateOrderForm } from '../utils/validation.js'`
2. `emptyForm`'a `consent: false` ekle: `const emptyForm = { name: '', productId: '', phone: '', email: '', quantity: 1, consent: false }`
3. `errors` state ekle: `const [errors, setErrors] = useState({})`
4. `handleReview`'i validasyonlu yap:
```js
function handleReview(e) {
  e.preventDefault()
  const { valid, errors } = validateOrderForm(form)
  setErrors(errors)
  if (valid) setStep('confirm')
}
```
5. `handleConfirm` içindeki `submitOrder` çağrısına `consent: form.consent` ekle ve hata mesajını API'den göster:
```js
const result = await submitOrder({
  name: form.name, productId: form.productId, productName: selectedProduct?.name,
  phone: form.phone, email: form.email, quantity: Number(form.quantity) || 1, consent: form.consent,
})
```
`catch (err)` bloğunda: `alert(err.message || 'Sipariş gönderilemedi, lütfen tekrar deneyin.')`

- [ ] **Step 2: `form` adımına consent checkbox + hata metinleri ekle**

`step === 'form'` bloğunda, "Devam" butonundan hemen önce ekle:
```jsx
<div className="field field-consent">
  <label className="consent">
    <input type="checkbox" checked={form.consent}
      onChange={e => update('consent', e.target.checked)} />
    <span>
      Ad, telefon ve e-posta bilgilerimin siparişimle ilgili iletişim amacıyla
      işlenmesine açık rıza veriyorum. (<a href="#gizlilik">Gizlilik Politikası</a>)
    </span>
  </label>
  {errors.consent && <p className="field-error">{errors.consent}</p>}
</div>
```
Ayrıca e-posta alanının altına: `{errors.email && <p className="field-error">{errors.email}</p>}`

- [ ] **Step 3: Minik stil ekle**

`src/index.css` sonuna:
```css
.field-error { color: #b23; font-size: .82rem; margin-top: 4px; }
.consent { display: flex; gap: 8px; align-items: flex-start; font-size: .85rem; color: #444; }
.consent input { margin-top: 3px; }
```

- [ ] **Step 4: Build doğrula**

Run: `npm run build`
Expected: Başarılı.

- [ ] **Step 5: Commit**

```bash
git add src/components/OrderForm.jsx src/index.css
git commit -m "feat: sipariş formuna KVKK açık rıza + client doğrulama"
```

---

### Task 13: Privacy Policy sayfası + admin paneli + hash yönlendirme

**Files:**
- Create: `src/components/PrivacyPolicy.jsx`
- Create: `src/components/AdminPanel.jsx`
- Modify: `src/App.jsx`
- Modify: `src/components/Footer.jsx`
- Modify: `src/index.css`

**Interfaces:**
- Consumes: `#gizlilik` ve `#admin` hash rotaları.

- [ ] **Step 1: `PrivacyPolicy.jsx` oluştur**

```jsx
// Gizlilik Politikası (KVKK) taslağı — #gizlilik ile açılır.
export default function PrivacyPolicy() {
  return (
    <section id="gizlilik">
      <div className="container legal">
        <a className="back-link" href="#">← Ana sayfa</a>
        <h1>Gizlilik Politikası</h1>
        <p><strong>Veri sorumlusu:</strong> fpvstore atölyesi.</p>
        <h2>Toplanan veriler</h2>
        <p>Sipariş ve stok bildirimi formlarında ad soyad, e-posta ve telefon bilgisi toplanır.</p>
        <h2>İşleme amacı</h2>
        <p>Yalnızca siparişinizle ilgili iletişim ve stok bilgilendirmesi için kullanılır; üçüncü taraflara pazarlama amacıyla satılmaz.</p>
        <h2>Saklama ve haklarınız</h2>
        <p>Verileriniz talebin karşılanması için gereken süre boyunca saklanır. KVKK kapsamında erişim, düzeltme ve silme talebinde bulunabilirsiniz.</p>
        <h2>İletişim</h2>
        <p>Talepleriniz için iletişim bölümündeki e-posta adresini kullanabilirsiniz.</p>
        <p className="legal-note">Bu metin bir taslaktır; yayına almadan önce hukuki gözden geçirme önerilir.</p>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: `AdminPanel.jsx` oluştur**

```jsx
import { useState } from 'react'

// Basit admin paneli — #admin ile açılır. Parola → JWT → sipariş listesi.
export default function AdminPanel() {
  const [password, setPassword] = useState('')
  const [token, setToken] = useState('')
  const [orders, setOrders] = useState([])
  const [error, setError] = useState('')

  async function login(e) {
    e.preventDefault()
    setError('')
    const res = await fetch('/api/admin/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    const body = await res.json().catch(() => ({}))
    if (!res.ok) { setError(body.error || 'Giriş başarısız.'); return }
    setToken(body.token)
    loadOrders(body.token)
  }

  async function loadOrders(tk) {
    const res = await fetch('/api/admin/orders', { headers: { Authorization: `Bearer ${tk}` } })
    const body = await res.json().catch(() => ({}))
    if (res.ok) setOrders(body.orders || [])
  }

  return (
    <section id="admin">
      <div className="container legal">
        <a className="back-link" href="#">← Ana sayfa</a>
        <h1>Admin — Siparişler</h1>
        {!token ? (
          <form className="contact-form" onSubmit={login}>
            <div className="field">
              <label>Parola</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            {error && <p className="field-error">{error}</p>}
            <button className="btn btn-primary" type="submit">Giriş</button>
          </form>
        ) : (
          <ul className="admin-orders">
            {orders.length === 0 && <li>Henüz sipariş yok (bellek sıfırlanmış olabilir).</li>}
            {orders.map(o => (
              <li key={o.id}>{o.createdAt} · {o.name} · {o.productName} · {o.quantity} adet</li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
```

- [ ] **Step 3: `App.jsx`'e hash yönlendirme ekle**

`src/App.jsx`'i güncelle:
```jsx
import { useEffect, useState } from 'react'
import Header from './components/Header.jsx'
import Hero from './components/Hero.jsx'
import ProductList from './components/ProductList.jsx'
import OrderForm from './components/OrderForm.jsx'
import StockNotify from './components/StockNotify.jsx'
import About from './components/About.jsx'
import Contact from './components/Contact.jsx'
import Footer from './components/Footer.jsx'
import PrivacyPolicy from './components/PrivacyPolicy.jsx'
import AdminPanel from './components/AdminPanel.jsx'

export default function App() {
  const [hash, setHash] = useState(window.location.hash)
  useEffect(() => {
    const onHash = () => setHash(window.location.hash)
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  if (hash === '#gizlilik') return <><Header /><main><PrivacyPolicy /></main><Footer /></>
  if (hash === '#admin') return <><Header /><main><AdminPanel /></main><Footer /></>

  return (
    <>
      <Header />
      <main>
        <Hero />
        <ProductList />
        <OrderForm />
        <StockNotify />
        <About />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
```

- [ ] **Step 4: Footer'a gizlilik linki ekle**

`src/components/Footer.jsx` içindeki uygun bir yere ekle:
```jsx
<a href="#gizlilik">Gizlilik Politikası</a>
```

- [ ] **Step 5: Legal/admin stilleri ekle**

`src/index.css` sonuna:
```css
.legal { max-width: 720px; }
.legal h1 { margin-bottom: 16px; }
.legal h2 { margin-top: 20px; font-size: 1rem; }
.legal-note { color: #888; font-size: .82rem; margin-top: 24px; }
.back-link { display: inline-block; margin-bottom: 12px; color: #555; text-decoration: none; }
.admin-orders { list-style: none; padding: 0; font-size: .9rem; }
.admin-orders li { padding: 8px 0; border-bottom: 1px solid #eee; }
```

- [ ] **Step 6: Build doğrula**

Run: `npm run build`
Expected: Başarılı.

- [ ] **Step 7: Commit**

```bash
git add src/components/PrivacyPolicy.jsx src/components/AdminPanel.jsx src/App.jsx src/components/Footer.jsx src/index.css
git commit -m "feat: gizlilik politikası + JWT'li admin paneli (#admin/#gizlilik)"
```

---

### Task 14: Güvenlik checklist dokümanı (2.6)

**Files:**
- Create: `docs/security-checklist.md`

- [ ] **Step 1: Checklist'i yaz**

`docs/security-checklist.md`:
```markdown
# AtölyeKart — Deploy Öncesi Güvenlik Checklist (Hafta 2)

- [x] Secret'lar client bundle'da değil (`VITE_` öneki yok; `WEBHOOK_URL/SECRET`, `JWT_SECRET`, `ADMIN_PASSWORD` sunucuda)
- [x] `.env` `.gitignore`'da; repoda yalnızca `.env.example` (`git ls-files | grep .env` → sadece örnek)
- [x] Tüm form uçları server-side yeniden doğruluyor (`api/_lib/validate.js`)
- [x] Rate limit: `/api/order` & `/api/stock-notify` → 10/dk, aşımda 429
- [x] Admin uçları JWT ile korunuyor (`/api/admin/orders`)
- [x] Webhook server→server; secret `X-Webhook-Secret` başlığında, tarayıcıya gitmiyor
- [x] HTTPS: Vercel varsayılan
- [x] Loglara secret yazılmıyor (yalnızca event adı/hata)
- [x] KVKK: açık rıza checkbox'ı + Gizlilik Politikası
- [ ] `npm audit` çalıştırıldı, kritik açık yok
- [ ] Vercel Environment Variables production/preview için dolduruldu

> Not: Rate limit ve order store in-memory (per-instance). Prod ölçek için Vercel KV / Upstash önerilir.
```

- [ ] **Step 2: `npm audit` çalıştır ve son iki maddeyi işaretle**

Run: `npm audit`
Expected: Çıktıyı incele; kritik açık yoksa checklist'te `npm audit` maddesini `[x]` yap.

- [ ] **Step 3: Commit**

```bash
git add docs/security-checklist.md
git commit -m "docs: deploy öncesi güvenlik checklist (Hafta 2)"
```

---

## FAZ 3 — Worktree özelliği (Ödev 2.1b)

### Task 15: Ayrı worktree'de "Sadece stokta olanlar" toggle'ı

Bu görev **ayrı bir git worktree'de** yürütülür (egzersizin amacı bu). Kategori filtresi zaten var; bu yeni, bağımsız bir özellik.

**Files:**
- Modify: `src/components/ProductList.jsx`
- Modify: `src/index.css`

- [ ] **Step 1: Worktree oluştur**

```bash
git worktree add ../atolyekart-stok-filtresi -b feature/stok-filtresi
```
Expected: `../atolyekart-stok-filtresi` dizininde yeni branch. Bu dizinde `npm install` çalıştır.

- [ ] **Step 2: ProductList'e toggle ekle**

Worktree'deki `src/components/ProductList.jsx`:
1. Yeni state: `const [inStockOnly, setInStockOnly] = useState(false)`
2. `visible` hesabını güncelle:
```js
const byCat = activeCat === 'all' ? items : items.filter(p => p.categoryId === activeCat)
const visible = inStockOnly ? byCat.filter(p => p.inStock) : byCat
```
3. `.filters` bloğunun hemen altına toggle ekle:
```jsx
<label className="stock-toggle">
  <input type="checkbox" checked={inStockOnly}
    onChange={e => setInStockOnly(e.target.checked)} />
  Sadece stokta olanlar
</label>
```

- [ ] **Step 3: Stil ekle**

`src/index.css` sonuna:
```css
.stock-toggle { display: inline-flex; gap: 6px; align-items: center; font-size: .85rem; color: #444; margin: 8px 0 16px; }
```

- [ ] **Step 4: Build doğrula (worktree içinde)**

Run: `npm run build`
Expected: Başarılı.

- [ ] **Step 5: Worktree'de commit**

```bash
git add src/components/ProductList.jsx src/index.css
git commit -m "feat: katalogda 'sadece stokta olanlar' filtresi"
```

- [ ] **Step 6: main'e merge et ve worktree'yi kaldır**

Ana çalışma dizininde:
```bash
git checkout main
git merge feature/stok-filtresi
git worktree remove ../atolyekart-stok-filtresi
git branch -d feature/stok-filtresi
```
Expected: Temiz merge (form vs katalog bağımsız). Çakışma çıkarsa `src/index.css` sonundaki eklemeler elle birleştirilir.

- [ ] **Step 7: main'de build + test doğrula**

Run: `npm run build && npm test`
Expected: İkisi de başarılı.

---

## FAZ 4 — Deploy (Ödev 2.2) — MANUEL (kullanıcı)

### Task 16: Vercel'e deploy + Environment Variables

Bu görev kullanıcı tarafından yürütülür; Claude adımları ve doğrulamayı belgeler. Komutları `! <komut>` ile bu oturumda çalıştırmak çıktının sohbete düşmesini sağlar.

- [ ] **Step 1: Vercel login**

Run: `! npx vercel login`
Expected: Tarayıcı/e-posta ile giriş.

- [ ] **Step 2: Preview deploy**

Run: `! npx vercel`
Expected: Preview URL. Hata çıkarsa terminal çıktısını Claude'a ver.

- [ ] **Step 3: Environment Variables ekle (Vercel panelinden)**

Vercel projesi → Settings → Environment Variables:
`WEBHOOK_URL`, `WEBHOOK_SECRET`, `JWT_SECRET`, `ADMIN_PASSWORD` (Production + Preview).
Bu ekranın **ekran görüntüsünü** al (teslim kriteri) → `docs/vercel-env.png`.

- [ ] **Step 4: Production deploy**

Run: `! npx vercel --prod`
Expected: Canlı URL. Bu URL teslimde kullanılacak.

- [ ] **Step 5: Canlı doğrulama**

Run: `! curl -s -X POST https://<canli-url>/api/order -H 'Content-Type: application/json' -d '{"email":"foo@bar"}'`
Expected: `400` + doğrulama hataları (server-side validasyon çalışıyor).

---

## FAZ 5 — Expo mobil MVP (Ödev 2.7)

### Task 17: Expo uygulaması iskeleti (`/mobile`)

**Files:**
- Create: `mobile/` (Expo app), `mobile/app.json`, `mobile/App.js`, `mobile/src/api.js`, `mobile/.env` örneği

- [ ] **Step 1: Expo app oluştur**

```bash
npx create-expo-app@latest mobile --template blank
```
Expected: `mobile/` altında Expo projesi.

- [ ] **Step 2: API tabanını yapılandır**

`mobile/src/api.js`:
```js
// Canlı Vercel URL'si. Expo Go telefonda çalışırken localhost'a erişemez;
// bu yüzden deploy edilmiş üretim URL'si kullanılır.
const API_BASE = 'https://<CANLI-VERCEL-URL>'

export async function fetchProducts() {
  const res = await fetch(`${API_BASE}/api/products`)
  const body = await res.json()
  return body.products || []
}

export async function postOrder(payload) {
  const res = await fetch(`${API_BASE}/api/order`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(body.error || 'Sipariş gönderilemedi.')
  return body
}

export async function postStockNotify(payload) {
  const res = await fetch(`${API_BASE}/api/stock-notify`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(body.error || 'Bildirim gönderilemedi.')
  return body
}
```

- [ ] **Step 3: Commit**

```bash
git add mobile/src/api.js mobile/app.json
git commit -m "feat(mobile): Expo iskeleti + API istemcisi"
```

---

### Task 18: Mobil ekranlar — katalog + iki form

**Files:**
- Modify: `mobile/App.js`

- [ ] **Step 1: `App.js`'i üç bölümlü hale getir**

`mobile/App.js` (katalog listesi + Sipariş + Stok bildirimi; RN bileşenleriyle):
```jsx
import { useEffect, useState } from 'react'
import { SafeAreaView, ScrollView, View, Text, TextInput, Button, FlatList, Switch, Alert, StyleSheet } from 'react-native'
import { fetchProducts, postOrder, postStockNotify } from './src/api'

export default function App() {
  const [products, setProducts] = useState([])
  const [order, setOrder] = useState({ name: '', email: '', phone: '', productId: '', quantity: '1', consent: false })
  const [stock, setStock] = useState({ name: '', email: '', productId: '' })

  useEffect(() => { fetchProducts().then(setProducts).catch(() => {}) }, [])

  async function submitOrder() {
    try {
      const p = products.find(x => x.id === order.productId)
      await postOrder({ ...order, productName: p?.name, quantity: Number(order.quantity) || 1 })
      Alert.alert('Tamam', 'Siparişin alındı.')
    } catch (e) { Alert.alert('Hata', e.message) }
  }
  async function submitStock() {
    try {
      const p = products.find(x => x.id === stock.productId)
      await postStockNotify({ ...stock, productName: p?.name })
      Alert.alert('Tamam', 'Bildirim kaydedildi.')
    } catch (e) { Alert.alert('Hata', e.message) }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.wrap}>
        <Text style={styles.h1}>fpvstore</Text>

        <Text style={styles.h2}>Katalog</Text>
        <FlatList
          scrollEnabled={false}
          data={products}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{item.emoji} {item.name}</Text>
              <Text style={styles.muted}>{item.priceFrom} {item.currency} · {item.inStock ? 'Stokta' : 'Tükendi'}</Text>
            </View>
          )}
        />

        <Text style={styles.h2}>Sipariş Ver</Text>
        <TextInput style={styles.input} placeholder="Ad Soyad" value={order.name} onChangeText={v => setOrder({ ...order, name: v })} />
        <TextInput style={styles.input} placeholder="E-posta" autoCapitalize="none" value={order.email} onChangeText={v => setOrder({ ...order, email: v })} />
        <TextInput style={styles.input} placeholder="Telefon" value={order.phone} onChangeText={v => setOrder({ ...order, phone: v })} />
        <TextInput style={styles.input} placeholder="Ürün ID (ör. gopro-mount-30)" autoCapitalize="none" value={order.productId} onChangeText={v => setOrder({ ...order, productId: v })} />
        <TextInput style={styles.input} placeholder="Adet" keyboardType="numeric" value={order.quantity} onChangeText={v => setOrder({ ...order, quantity: v })} />
        <View style={styles.row}>
          <Switch value={order.consent} onValueChange={v => setOrder({ ...order, consent: v })} />
          <Text style={styles.consent}>KVKK açık rıza veriyorum</Text>
        </View>
        <Button title="Sipariş Ver" onPress={submitOrder} />

        <Text style={styles.h2}>Stok Bildirimi İste</Text>
        <TextInput style={styles.input} placeholder="Ad Soyad" value={stock.name} onChangeText={v => setStock({ ...stock, name: v })} />
        <TextInput style={styles.input} placeholder="E-posta" autoCapitalize="none" value={stock.email} onChangeText={v => setStock({ ...stock, email: v })} />
        <TextInput style={styles.input} placeholder="Ürün ID" autoCapitalize="none" value={stock.productId} onChangeText={v => setStock({ ...stock, productId: v })} />
        <Button title="Bildir" onPress={submitStock} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  wrap: { padding: 20, gap: 8 },
  h1: { fontSize: 24, fontWeight: '600', marginBottom: 8 },
  h2: { fontSize: 18, fontWeight: '600', marginTop: 20, marginBottom: 8 },
  card: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
  cardTitle: { fontSize: 15 },
  muted: { color: '#777', fontSize: 13 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 6, padding: 10, marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  consent: { fontSize: 13, color: '#444' },
})
```

> Not: `<CANLI-VERCEL-URL>` Faz 4'ten sonra `mobile/src/api.js`'de doldurulur; aksi halde formlar hata döndürür.

- [ ] **Step 2: Expo başlat (MANUEL — kullanıcı)**

Run: `! npx expo start` (mobile/ içinde)
Expected: QR kod. Telefonda **Expo Go** ile tara.

- [ ] **Step 3: Mobilde iki formu doğrula (MANUEL)**

Telefonda: bir sipariş + bir stok bildirimi gönder → canlı `/api`'ye ulaşıp `webhook.site`'a düştüğünü doğrula. Ekran görüntüsü al → `docs/mobil-ekran.png`.

- [ ] **Step 4: Commit**

```bash
git add mobile/App.js
git commit -m "feat(mobile): katalog + sipariş + stok bildirimi ekranları"
```

---

## FAZ 6 — Test notları + teslim dosyaları + hafta 1 temizliği

### Task 19: Test notları + teslim özeti

**Files:**
- Create: `docs/test-notlari.md`
- Create: `TESLIM-HAFTA2.md`

- [ ] **Step 1: Test notlarını yaz**

`docs/test-notlari.md` — Faz 4/5'teki curl çıktıları ve rate-limit denemesi (11. isteğin 429 döndüğü) + admin 401/200 örnekleriyle doldur. Geçerli sipariş `201`, geçersiz `400`, rate limit `429`.

- [ ] **Step 2: Rate limit'i canlıda test et ve nota ekle**

Run: `! for i in $(seq 1 12); do curl -s -o /dev/null -w "%{http_code} " -X POST https://<canli-url>/api/stock-notify -H 'Content-Type: application/json' -d '{"name":"A","email":"a@b.com","productId":"gopro-mount-30"}'; done; echo`
Expected: İlk 10 → `201`/`502`, sonrakiler `429`. Çıktıyı `docs/test-notlari.md`'ye yapıştır.

- [ ] **Step 3: `TESLIM-HAFTA2.md` yaz**

Kriter eşlemesi: canlı Vercel URL'si, `.env` commit edilmedi kanıtı, `docs/vercel-env.png`, `docs/test-notlari.md`, `docs/mobil-ekran.png`, kısa düşünce (KISA-DUSUNCE.md'ye işaret). Zorunlu çekirdek ve opsiyonel admin JWT'yi ayır.

- [ ] **Step 4: Commit**

```bash
git add docs/test-notlari.md TESLIM-HAFTA2.md
git commit -m "docs: Hafta 2 test notları + teslim özeti"
```

---

### Task 20: Hafta 1 notlarını temizle

Hafta 1'e özel teslim/çalışma notlarını arşivle, kök dizini sadeleştir. `KISA-DUSUNCE.md`'ye **dokunma** (kullanıcı Hafta 2 için manuel güncelleyecek).

**Files:**
- Move: `TESLIM.md`, `webhook-kanit.md`, `DRIVE-TESLIM-NOTU.md`, `KONUSMA-OZETI.md`, `skill-olusturma-konusmasi.md`, `docs/ekran-goruntusu.png` → `docs/arsiv/hafta1/`

- [ ] **Step 1: Arşiv klasörü oluştur ve taşı**

```bash
mkdir -p docs/arsiv/hafta1
git mv TESLIM.md webhook-kanit.md DRIVE-TESLIM-NOTU.md docs/arsiv/hafta1/ 2>/dev/null || true
git mv docs/ekran-goruntusu.png docs/arsiv/hafta1/ 2>/dev/null || true
```
Not: `KONUSMA-OZETI.md` ve `skill-olusturma-konusmasi.md` `.gitignore`'da/izlenmiyorsa `mv` ile taşınır:
```bash
mv KONUSMA-OZETI.md skill-olusturma-konusmasi.md docs/arsiv/hafta1/ 2>/dev/null || true
```

- [ ] **Step 2: `Odev_AtolyeKart_Hafta1.pdf` silinmesini kesinleştir (git status'ta zaten D)**

```bash
git rm --cached Odev_AtolyeKart_Hafta1.pdf 2>/dev/null || true
```

- [ ] **Step 3: Build + test son kontrol**

Run: `npm run build && npm test`
Expected: İkisi de başarılı (taşımalar kaynak koda dokunmadı).

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: Hafta 1 teslim notlarını docs/arsiv/hafta1'e taşı"
```

---

## ⏸️ MANUEL DURAK — Kullanıcı `KISA-DUSUNCE.md`'yi günceller

Buraya kadar tüm otomatik iş biter. **Kullanıcı** `KISA-DUSUNCE.md`'yi Hafta 2 soruları için manuel doldurur:
1. Worktree'de hata + özelliği paralel yürütmek kolay mı zor mu oldu?
2. Mobil portta web'den farklı en çok neyi değiştirmen gerekti?

Kullanıcı "tamam" dedikten sonra Faz 7'ye geçilir.

---

## FAZ 7 — GitHub fork/teslim (kullanıcı onayından sonra)

### Task 21: GitHub'a Hafta 2 teslimi (fork)

> Yürütme anında netleştir: "fork" ile kastedilen (a) mevcut repo'da `hafta2` teslim branch'i, (b) yeni repo (`atolyekart-hafta2`), yoksa (c) gerçek GitHub fork. Varsayılan öneri: (b) yeni repo — Hafta 2 anlık görüntüsünü temiz tutar.

- [ ] **Step 1: Kullanıcıdan fork hedefini onayla**

Kullanıcıya (a)/(b)/(c) seçeneklerini sor; yanıtı bekle.

- [ ] **Step 2 (varsayılan (b) — yeni repo): oluştur ve push et**

```bash
gh repo create atolyekart-hafta2 --public --source=. --remote=hafta2 --push
```
Expected: Yeni public repo, kod push edilir. URL `TESLIM-HAFTA2.md`'ye eklenir.

- [ ] **Step 3: Teslim dosyasına canlı + repo linklerini işle**

`TESLIM-HAFTA2.md`'ye yeni repo URL'si ve canlı Vercel URL'sini yaz, commit et ve push et.

```bash
git add TESLIM-HAFTA2.md
git commit -m "docs: teslim linklerini ekle (repo + canlı URL)"
git push hafta2 main
```

---

## Self-Review Notları (plan yazarı)

- **Spec kapsamı:** 2.1 (Task 2 bug + Task 15 worktree), 2.2 (Task 16), 2.3 (Task 9 + 16.3), 2.4 (Task 5 rate limit + 10/11 JWT + admin uçları), 2.5 (Task 12 consent + 13 privacy), 2.6 (Task 14), 2.7 (Task 17-18) → hepsi karşılanıyor.
- **Ek istekler:** Hafta 1 temizlik (Task 20), manuel KISA-DUSUNCE durağı, fork (Task 21) eklendi.
- **Tip tutarlılığı:** `submitOrder`→`{ok,id}`, `sendToWebhook`→`{status,payload}`, `validateOrder`→`{valid,errors,data}`, `checkRateLimit`→`{allowed,remaining}`, `verifyAdminToken`→`object|null` — kullanım yerleriyle uyumlu.
- **Bilinen sınır:** rate limit + order store in-memory (serverless per-instance); demo için kabul, checklist'te notlandı.
