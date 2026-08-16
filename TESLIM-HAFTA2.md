# AtölyeKart — Hafta 2 Ödev Teslimi

**Proje:** fpvstore — 3D baskı drone (FPV) parçaları vitrin sitesi (React + Vite + Vercel Serverless + Expo)
**Öğrenci:** İbrahim Yusuf Karagül
**Canlı URL:** https://atolyekart-omega.vercel.app

---

## Teslim kriterleri kontrol listesi

- [x] **Canlı Vercel URL'si** — https://atolyekart-omega.vercel.app (public, protection kapalı)
- [x] **`.env` commit edilmedi kanıtı** — `git ls-files | grep -c '^\.env$'` → `0`; repoda yalnızca `.env.example`
- [x] **Vercel Environment Variables ekran görüntüsü** — `docs/vercel-env.png` (panel → Settings → Environment Variables)
- [x] **Validasyon + rate limit test notu** — `docs/test-notlari.md` (canlı curl kanıtları: 400/201/429, JWT 401↔200, webhook.site teslimatı)
- [x] **Expo Go / mobil ekran görüntüleri** — `docs/mobil-1-siparis-formu.jpg` (onay öncesi), `docs/mobil-2-kvkk-onay.jpg` (KVKK okundu → onay), `docs/mobil-3-stok-bildirimi.jpg`
- [ ] **Kısa düşünce yanıtları** — `KISA-DUSUNCE.md` (Hafta 2 soruları — öğrenci manuel dolduracak)

> Tek kalan: Hafta 2 "Kısa düşünce" yanıtları (aşağıdaki 2 soru).

---

## Hafta 2 maddeleri — durum

| # | Madde | Durum |
|---|-------|-------|
| 2.1 | Git + Worktree: main'de e-posta bug fix + ayrı worktree'de "stokta olanlar" filtresi + merge | ✅ |
| 2.2 | Vercel CLI ile deploy, canlı URL | ✅ (`atolyekart-omega.vercel.app`) |
| 2.3 | Secret yönetimi: `.env` (dev) + Vercel Env Vars (prod), `.env` gitignore | ✅ |
| 2.4 | JWT (admin korumalı API) + rate limit (10/dk → 429) | ✅ |
| 2.5 | KVKK açık rıza checkbox + Gizlilik Politikası (`#gizlilik`) | ✅ |
| 2.6 | Deploy öncesi güvenlik checklist | ✅ (`docs/security-checklist.md`) |
| 2.7 | Expo mobil port (katalog + Sipariş + Stok Bildirimi) | ✅ kod; ⏳ cihaz testi/ss |

> Netleştirmeye uyum: JWT public forma değil, **admin korumalı API'ye** (`/api/admin/orders`)
> uygulandı. Hafta 1'de doğrudan webhook'a giden formlar bu hafta **`/api` backend'i arkasına**
> alındı; webhook secret'ı yalnız sunucuda (`X-Webhook-Secret`), tarayıcıya gitmiyor.

---

## Mimari özet (Hafta 1 → Hafta 2)

- **Önce:** tarayıcı → doğrudan webhook.site (`no-cors`, `VITE_WEBHOOK_URL` bundle'da açık).
- **Şimdi:** tarayıcı/mobil → **kendi `/api` backend'imiz (Vercel Serverless)** → server-side
  validasyon + rate limit → `X-Webhook-Secret` başlığıyla server→server webhook.
- Admin uçları JWT ile korunuyor (`#admin` paneli). KVKK rızası hem client hem server doğrulanıyor.
- Mobil (`/mobile`, Expo) saf API istemcisi; canlı `atolyekart-omega.vercel.app`'e bağlanıyor.

## Çalıştırma

```bash
npm install
npm test            # 20 birim testi (validasyon, rate limit, JWT)
npm run build       # production derlemesi
npm run dev:api     # yerel full-stack (vercel dev — /api dahil)
# mobil:
cd mobile && npx expo start   # Expo Go ile telefondan tara
```

## Kalan tek adım (öğrenci)
`KISA-DUSUNCE.md`'yi Hafta 2 iki sorusuyla doldur:
1. Worktree egzersizinde hata + özelliği paralel yürütmek kolay mı zor mu oldu?
2. Mobil portta web'den farklı en çok neyi değiştirmen gerekti?
