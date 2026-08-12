# AtölyeKart Hafta 2 — Tasarım Spec'i

**Tarih:** 2026-08-12
**Proje:** fpvstore (AtölyeKart) — React + Vite vitrin sitesi
**Kapsam:** Ders 3 + 4 — Deploy, güvenlik, KVKK, mobil (Expo)
**Seri:** AtölyeKart Haftalık Ödev Serisi'nin 2. haftası (toplam 6 hafta)

---

## 1. Amaç ve merkez fikir

Hafta 1'de sipariş ve stok-bildirim formları **tarayıcıdan doğrudan** webhook.site'a
POST atıyordu:

- Webhook URL'si `VITE_WEBHOOK_URL` ile client bundle'ına gömülüydü (herkese açık).
- CORS'u aşmak için `mode:'no-cors'` + `text/plain` kullanılıyordu → yanıt opak,
  HTTP durum kodu okunamıyor, server-side doğrulama yok.

**Hafta 2'nin çekirdeği:** Formlarla webhook arasına **kendi backend'imizi (Vercel
Serverless Functions)** koymak. Formlar artık kendi `/api/*` rotalarımıza gider; bu
rotalar server-side doğrulama + rate limit uygular ve secret'ı **sunucuda tutarak**
webhook'a iletir. Server→server gönderimde `no-cors` gerekmez; gerçek HTTP durum
kodları okunur.

Hafta sonunda AtölyeKart: gerçek bir Vercel URL'sinde canlı, secret'ları korunuyor,
rate limit + KVKK + (opsiyonel) admin JWT tamam, Expo Go ile telefonda çalışıyor.

---

## 2. Kapsam kararları (brainstorming'de netleştirildi)

| Karar | Seçim | Gerekçe |
|-------|-------|---------|
| JWT nereye? | **Admin korumalı API** (public forma değil) | Ödevin kendi netleştirmesi: public forma JWT gerçekçi değil; JWT admin/korumalı API içindir. |
| Expo kapsamı | **Minimal MVP** | Ödev yalnızca "Sipariş Ver" + "Stok Bildirimi"nin mobilde çalışmasını istiyor. |
| Expo konumu | **Aynı repo `/mobile`** | Seri aynı kod üzerine kuruluyor; ileri haftalar da aynı repoda. |
| Backend platformu | **Vercel Serverless Functions (`/api`)** | Ödev Vercel CLI deploy'u zorunlu kılıyor; API route'lar doğal uyum. |
| Yeni bağımlılık | Yalnızca `jsonwebtoken` | Rate limit ve sipariş belleği elle (in-memory) tutulur. |

---

## 3. Mimari

```
Tarayıcı (web) ──┐
                 ├─► /api/* (Vercel Serverless) ──► webhook.site (secret'li, server→server)
Expo (mobil) ────┘         │
                           └─ server-side validasyon + rate limit + JWT (admin)
```

### 3.1 API rotaları (`/api`)

| Rota | Metod | İş |
|------|-------|-----|
| `/api/products` | GET | Seed katalog döner (mobil bunu çeker; web isteğe bağlı kullanır) |
| `/api/order` | POST | Server-side validasyon + rate limit → `order.created` webhook'a iletir; belleğe kaydeder |
| `/api/stock-notify` | POST | Validasyon + rate limit → `stock.notify_requested` webhook'a iletir |
| `/api/admin/login` | POST | `ADMIN_PASSWORD` doğrular → JWT üretir |
| `/api/admin/orders` | GET | **JWT korumalı** — bellekteki siparişleri listeler |

### 3.2 Paylaşılan sunucu yardımcıları (`api/_lib/`)

Her biri tek sorumluluk, bağımsız test edilebilir:

- `webhook.js` — standart zarfı (`{ event, source:'fpvstore', id, createdAt, data }`)
  üretir ve `WEBHOOK_URL`'e `X-Webhook-Secret: WEBHOOK_SECRET` başlığıyla POST atar.
  Server→server olduğu için gerçek `response.status` okunur ve hata durumunda fırlatır.
- `validate.js` — sipariş ve stok-bildirim payload'ları için saf doğrulama fonksiyonları
  (`validateOrder`, `validateStockNotify`). Alan bazında hata mesajı döndürür.
- `rateLimit.js` — IP başına sabit pencere (dakikada 10 istek). Aşılırsa `429`.
  In-memory (per-instance) Map; sınırlaması notlanır.
- `jwt.js` — `signAdminToken()` / `verifyAdminToken()`, `JWT_SECRET` ile.
- `orderStore.js` — bellekte sipariş listesi (`push`, `list`). Serverless'ta kalıcı
  değildir; demo için yeterli — kalıcılık için ileride Vercel KV/Upstash (not).

### 3.3 Ortak doğrulama (client + server)

`src/utils/validation.js` (web) ve `api/_lib/validate.js` aynı kuralları uygular:
- `email`: trim + regex (yerel@alan.tld; `foo@bar` gibi noktasız adres reddedilir).
- `quantity`: tamsayı ≥ 1.
- `name`: boş olamaz (trim sonrası).
- `consent` (sipariş): `true` olmalı (KVKK).

> Not: Web tarafı UX için doğrular; **sunucu her zaman yeniden doğrular** (güvenlik
> sınırı client değildir).

### 3.4 Geliştirme akışı

`vite dev` `/api`'yi servis etmez. Yerelde backend + frontend'i birlikte çalıştırmak
için **`vercel dev`** kullanılır (port 3000). `npm run dev:api` script'i eklenir.
Web fetch'leri göreli yol (`/api/...`) kullanır; böylece dev ve prod aynı kodla çalışır.

---

## 4. Ödev maddeleri → uygulama eşlemesi

### 2.1 Git + Worktree egzersizi

- **main'de gerçek hata + düzeltme:** Sipariş formu yalnızca HTML5 `type="email"`
  kullanıyor; `foo@bar` (noktasız) ve baştaki/sondaki boşluklu e-postayı kabul ediyor.
  Düzeltme: `src/utils/validation.js` içine `isValidEmail` + `normalizeEmail`,
  `OrderForm.jsx`'e bağla. TDD ile (önce başarısız test).
- **Ayrı worktree'de yeni özellik:** Kategori filtresi **zaten var** (`ProductList.jsx`),
  bu yüzden yeni özellik = katalogda **"Sadece stokta olanlar" toggle'ı** (mevcut
  türetilmiş `inStock` alanını kullanır). `git worktree` içinde geliştirilir.
- **Merge:** İki iş bağımsız (form vs katalog) → temiz merge. Komut dizisi belgelenir.

### 2.2 Deploy

- `vercel.json` (gerekliyse) + Vite framework preset (otomatik algılanır), `/api`
  fonksiyon dizini. `.vercelignore` gerekirse.
- **Manuel (kullanıcı):** `vercel login` → `vercel` (preview) → `vercel --prod`.
  Deploy hatası çıkarsa terminal çıktısı Claude'a verilir. Adımlar belgelenir.

### 2.3 Secret yönetimi

- `VITE_WEBHOOK_URL` (client-exposed) **kaldırılır**. Sunucu-only değişkenler:
  `WEBHOOK_URL`, `WEBHOOK_SECRET`, `JWT_SECRET`, `ADMIN_PASSWORD`.
- `.env` zaten `.gitignore`'da (doğrulanır). `.env.example` yeni değişkenlerle güncellenir.
- Dev/prod ayrımı: yerelde `.env`; prod'da **Vercel Environment Variables**
  (Production / Preview / Development scope'ları). Belgelenir + ekran görüntüsü (kullanıcı).

### 2.4 JWT + Rate Limiting

- **JWT:** `#admin` hash'iyle açılan minik admin paneli (`AdminPanel.jsx`) → parola
  girer → `/api/admin/login`'den token alır (localStorage) → `/api/admin/orders`'u
  Bearer ile çeker. Public form JWT'siz kalır (netleştirmeye uygun).
- **Rate limit:** `/api/order` ve `/api/stock-notify` → dakikada 10 istek; aşımda `429`
  + kullanıcıya anlaşılır mesaj.

### 2.5 KVKK + Privacy Policy

- Sipariş formuna **zorunlu açık rıza checkbox'ı** ("Ad, telefon, e-posta bilgilerimin
  … işlenmesine açık rıza veriyorum"). Sunucu `consent===true` doğrular.
- `PrivacyPolicy.jsx` (`#gizlilik`) — Claude ile üretilen Gizlilik Politikası taslağı;
  footer ve rıza metninden linklenir. Toplanan veri, amaç, saklama, iletişim içerir.

### 2.6 Security checklist

- `docs/security-checklist.md` — AtölyeKart için doldurulmuş deploy-öncesi liste:
  secret'lar client bundle'da değil, `.env` gitignore'da, server-side validasyon,
  rate limit, HTTPS (Vercel), loglarda secret yok, `npm audit`, KVKK/rıza, CORS.

### 2.7 Expo mobil port (`/mobile`)

- Aynı repoda `/mobile` Expo uygulaması (blank template). **Saf API istemcisi:**
  - Katalog: `GET {API_BASE}/api/products` (FlatList).
  - Sipariş: `POST {API_BASE}/api/order`.
  - Stok bildirimi: `POST {API_BASE}/api/stock-notify`.
  - `API_BASE` = canlı Vercel URL'si (Expo config/env üzerinden).
  - Böylece Metro cross-package import derdi olmaz; mobil web koduna bağımlı değildir.
- Ekranlar (React Native): Katalog listesi, Sipariş Ver formu, Stok Bildirimi formu.
- **Manuel (kullanıcı):** `npx expo start` → Expo Go ile QR tara → iki formu telefonda
  doğrula.

---

## 5. Test stratejisi

- **Birim (TDD):**
  - `validate.js` / `validation.js`: e-posta uç durumları (`foo@bar`, boşluklu, geçerli),
    adet (0, negatif, ondalık, geçerli), consent (false → red).
  - `rateLimit.js`: 10 istek geçer, 11. `429`.
  - `jwt.js`: sign→verify round-trip; geçersiz/expired token reddi.
- **Manuel/entegrasyon:** `docs/test-notlari.md`'ye canlı endpoint'lere `curl` çıktıları
  (geçerli sipariş 2xx, geçersiz 400, rate limit 429, admin 401 vs 200).

---

## 6. Teslim çıktıları

`TESLIM-HAFTA2.md` tüm kriterleri eşler:

- [ ] Canlı Vercel URL'si
- [ ] `.env` commit edilmedi kanıtı (`git ls-files | grep -c .env` = yalnız `.env.example`)
- [ ] Vercel Environment Variables ekran görüntüsü
- [ ] Validasyon + rate limit test notu (`docs/test-notlari.md`)
- [ ] Expo Go / mobil ekran görüntüsü
- [ ] Kısa düşünce yanıtları (`KISA-DUSUNCE-HAFTA2.md`):
  1. Worktree'de hata + özelliği paralel yürütmek kolay mı zor mu oldu?
  2. Mobil portta web'den farklı en çok neyi değiştirmen gerekti?

**Zorunlu çekirdek:** Deploy, secret yönetimi, server-side validasyon, rate limit,
KVKK, Expo önizleme. **Opsiyonel/ileri:** Admin JWT paneli.

---

## 7. Manuel adımlar (yalnız kullanıcı yapabilir)

Claude scaffold + belgeler; şu adımları kullanıcı yürütür:

1. `vercel login` ve `vercel --prod` (deploy).
2. Vercel panelinde Environment Variables ekleme + ekran görüntüsü.
3. Telefonda Expo Go ile tarama ve iki formun doğrulanması.

Bu adımlar için `! <komut>` ile terminalde çalıştırma önerilir (çıktı sohbete düşer).

---

## 8. Faz sırası (implementasyon planına girdi)

1. **Faz 0 — Temizlik/hazırlık:** validation util + testler (main'de bug fix, 2.1a).
2. **Faz 1 — Backend iskeleti:** `api/_lib/*` + `/api/products`, `/api/order`,
   `/api/stock-notify`; web fetch'lerini `/api`'ye çevir; `vercel dev`.
3. **Faz 2 — Güvenlik:** secret taşıma (2.3), rate limit (2.4), KVKK + privacy (2.5),
   admin JWT (2.4), security checklist (2.6).
4. **Faz 3 — Worktree özelliği:** stokta-olanlar toggle'ı (2.1b) + merge.
5. **Faz 4 — Deploy:** vercel config + canlıya alma (2.2, manuel).
6. **Faz 5 — Expo:** `/mobile` MVP (2.7).
7. **Faz 6 — Teslim:** test notları, teslim dosyaları, kısa düşünce.

> Faz 3 (worktree) egzersiz amaçlı bilinçli olarak ayrı worktree'de yürütülür; sırası
> esnektir ama backend hazır olduktan sonra merge çakışması riski en düşüktür.
