# AtölyeKart — Hafta 1 Ödev Teslimi

**Öğrenci:** İbrahim Yusuf Karagül
**Proje:** fpvstore — 3D baskı drone (FPV) parçaları vitrin sitesi (React + Vite)
**Tarih:** 29 Temmuz 2026

## GitHub Repo (public)
https://github.com/Leanesse/atolyekart

## Repodaki teslim dosyaları
- **`TESLIM.md`** — teslim özeti ve kriter kontrol listesi
- **`KISA-DUSUNCE.md`** — "Kısa düşünce" sorularının yanıtları
- **`webhook-kanit.md`** — iki ayrı webhook event'inin gerçek payload kanıtı
  (`order.created` + `stock.notify_requested`)
- **`docs/ekran-goruntusu.png`** — çalışan React sayfasının ekran görüntüsü

## Hafta 1 kapsamı — özet
- HTML → React geçişi (`ProductCard` / `ProductList` / `ProductImage`)
- `CLAUDE.md` ile proje bağlamı
- `/plan` ile varyantlı veri modeli + async servis katmanı
- Bileşen + webhook standartları için **skill**
- GitHub repo (public) + ilk commit
- Katalog sayfasında **QR kod** (`qrcode.react`)
- İki **webhook** özelliği: "Sipariş Ver" (onay ekranı + webhook) ve
  "Stok Bildirimi İste"; webhook.site ile test edildi

## Çalıştırma
```bash
npm install
cp .env.example .env      # VITE_WEBHOOK_URL değerini webhook.site adresinle doldur
npm run dev               # http://localhost:5173
```
