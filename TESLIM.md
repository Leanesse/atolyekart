# AtölyeKart — Hafta 1 Ödev Teslimi

**Proje:** fpvstore — 3D baskı drone (FPV) parçaları vitrin sitesi (React + Vite)
**GitHub repo (public):** https://github.com/Leanesse/atolyekart
**Öğrenci:** İbrahim Yusuf Karagül

---

## Teslim kriterleri kontrol listesi

- [x] **GitHub repo linki** — https://github.com/Leanesse/atolyekart (public)
- [x] **Çalışan React sayfası** — `npm install && npm run dev` → http://localhost:5173/
      (ekran görüntüsü: `docs/ekran-goruntusu.png` — eklenecek)
- [x] **webhook.site'ta iki ayrı event kanıtı** — bkz. `webhook-kanit.md`
- [x] **Kısa düşünce yanıtları** — bkz. `KISA-DUSUNCE.md`

---

## Hafta 1 maddeleri — durum

| # | Madde | Durum |
|---|-------|-------|
| 1.1 | HTML sayfa + `CLAUDE.md` (sektör/hedef kitle/kategori) | ✅ (`index.standalone.html.bak`, `CLAUDE.md`) |
| 1.2 | React'e geçiş + `ProductCard`/`ProductList`/`ProductImage` | ✅ |
| 1.3 | `/plan` ile veri modeli planlama (varyantlı model + servis katmanı) | ✅ |
| 1.4 | Hata yönetimi + ekran görüntüsü tekniği | ✅ |
| 1.5 | Bileşen + webhook **skill**'i / GitHub / QR | ✅ skill + repo (`gh` CLI) + QR (`qrcode.react`) |
| 1.6 | İki webhook (Sipariş Ver + Stok Bildirimi) + webhook.site testi | ✅ |

> Not: GitHub repo, MCP yerine `gh` CLI ile oluşturuldu; QR, MCP yerine `qrcode.react`
> npm paketiyle eklendi (ikisi de sonucu aynı: repo + katalogda QR).

---

## Webhook veri sözleşmesi (PDF s.3) uyumu

Tüm webhook'lar ortak zarf kullanır: `{ event, source:'fpvstore', id, createdAt, data }`
(`src/services/webhook.js`).

- **`order.created`** → `data`: `name, productId, productName, phone, email, quantity`
- **`stock.notify_requested`** → `data`: `name, productId, productName, email`

Gerçek gönderim örnekleri `webhook-kanit.md` dosyasında.

---

## Çalıştırma

```bash
npm install
cp .env.example .env      # VITE_WEBHOOK_URL değerini webhook.site adresinle doldur
npm run dev               # http://localhost:5173
npm run build             # production derlemesi
```
