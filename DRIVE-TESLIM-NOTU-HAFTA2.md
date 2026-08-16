# AtölyeKart — Hafta 2 Teslim Notu (Drive)

**Öğrenci:** İbrahim Yusuf Karagül
**Proje:** fpvstore — 3D baskı FPV / drone parçaları vitrin sitesi (React + Vite + Vercel Serverless + Expo)
**Hafta:** 2 — Deploy, güvenlik, KVKK, mobil (Expo)

---

## ⚠️ Kontrol edecek kişilere: iş `hafta2` DALINDA

Hafta 2 geliştirmeleri **bilerek `hafta2` branch'inde** tutuldu; `main` dalı Hafta 1
durumunu koruyor. Lütfen değerlendirmeyi aşağıdaki bağlantılar üzerinden yapın:

- **Kod (Hafta 2 dalı):** https://github.com/Leanesse/atolyekart/tree/hafta2
- **PR (Hafta 1 → Hafta 2 tüm fark):** https://github.com/Leanesse/atolyekart/pull/1
- **Canlı site:** https://atolyekart-omega.vercel.app
- **Canlı webhook olayları:** https://webhook.site/#!/view/353facec-566d-4ade-9a0e-9dac366f93d6

> Repo ana sayfası (`main`) Hafta 1'i gösterir; Hafta 2 için mutlaka **`hafta2`** dalına bakın.

---

## Teslim kriterleri → nerede bulunur

| Kriter | Konum (hafta2 dalında) |
|--------|------------------------|
| Canlı Vercel URL'si | https://atolyekart-omega.vercel.app · `TESLIM-HAFTA2.md` |
| `.env` commit edilmedi kanıtı | Repoda yalnız `.env.example`; `git ls-files \| grep .env` → sadece örnek |
| Vercel secret ekran görüntüsü | `docs/vercel-env.png` |
| Validasyon + rate limit test notu | `docs/test-notlari.md` (canlı curl: 400 / 201 / 429 / JWT 401↔200 / webhook) |
| Mobil (Expo) ekran görüntüleri | `docs/mobil-1-siparis-formu.jpg`, `docs/mobil-2-kvkk-onay.jpg`, `docs/mobil-3-stok-bildirimi.jpg` |
| Kısa düşünce yanıtları | `KISA-DUSUNCE.md` |
| Güvenlik checklist (deploy öncesi) | `docs/security-checklist.md` |
| Teslim özeti (hepsi bir arada) | `TESLIM-HAFTA2.md` |

---

## 2 dakikada hızlı kontrol

1. **Formlar + webhook:** Canlı sitede "Sipariş Ver" ve "Stok Bildirimi"ni doldurun;
   olayların yukarıdaki **webhook.site view** linkine `order.created` / `stock.notify_requested`
   olarak (secret başlığı + KVKK `consent` ile) düştüğünü görün.
2. **Admin (JWT):** https://atolyekart-omega.vercel.app/#admin — panel JWT korumalı.
   (Demo admin parolası bu nota **güvenlik gereği yazılmadı**; eğitmene ayrıca iletildi.)
3. **API güvenliği (curl):** hazır komutlar ve beklenen çıktılar `docs/test-notlari.md`'de
   (geçersiz e-posta → 400, geçerli → 201, 11.+ istek → 429).
4. **Yerelde:** `hafta2` dalını çekip `npm install && npm test` (20 birim testi) ve `npm run build`.
5. **Mobil:** `cd mobile && npx expo start` → Expo Go (SDK 54) ile tarama; katalog + iki form
   canlı API'ye bağlanır.

---

## Ne değişti (Hafta 1 → Hafta 2)

- Formlar artık **doğrudan webhook'a gitmiyor**; kendi **Vercel Serverless backend'imiz (`/api`)**
  arkasına alındı. Webhook secret'ı yalnız sunucuda (`X-Webhook-Secret`), tarayıcıya gitmiyor.
- Server-side validasyon + **rate limit (10/dk → 429)** + **JWT korumalı admin** uçları.
- **KVKK açık rıza** (web checkbox + mobil "oku→onayla" modalı) + **Gizlilik Politikası** (`#gizlilik`).
- Güvenlik başlıkları (CSP, X-Frame-Options, nosniff, HSTS), deploy öncesi güvenlik checklist.
- **Expo mobil uygulaması** (`/mobile`, SDK 54): katalog + Sipariş + Stok Bildirimi.
- Git + worktree egzersizi: `main`'de e-posta doğrulama hatası düzeltildi, ayrı worktree'de
  "sadece stokta olanlar" filtresi geliştirilip birleştirildi.
