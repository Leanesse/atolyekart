# fpvstore — Atölye Web Sitesi

## Proje Hakkında
3D yazıcı ile üretilen **drone (FPV) parçaları** satan bir atölyenin tanıtım/vitrin web sitesi.
Marka adı: **fpvstore**

## Amaç
- **Ürün kataloğu / vitrin**: Drone parçalarını fiyat ve özellikleriyle sergilemek.
- Şimdilik satın alma/sepet **yok** — sadece ürünleri gösteren vitrin.
- Atölyeyi tanıtan ve iletişim bilgisi veren bölümler de bulunacak.

## Tasarım Kararları
- **Tarz:** Minimalist / gri tonlar — beyaz arka plan, ince gri çizgiler, sakin ve kurumsal.
  (Not: İlk deneme enerjik/renkli yapıldı, kullanıcı beğenmedi; minimalist griye çevrildi.)
- Vurgu rengi koyu antrasit; gradyan/neon yok. Bol boşluk, ince tipografi.
- Mobil uyumlu (responsive) olmalı.

## Teknik Yapı
- **React + Vite** projesi (JavaScript, JSX). Node 22 / npm 10.
- İlk sürüm tek dosya (`index.html`) idi; sonradan React'e dönüştürüldü.
  Standalone yedek: `index.standalone.html.bak`.
- Komutlar: `npm install`, `npm run dev` (geliştirme), `npm run build` (production).
- CSS tek dosyada global: `src/index.css` (aynı minimalist gri stiller, sınıf adları korundu).

### Dosya Yapısı
- `index.html` — Vite giriş noktası (`#root` + `src/main.jsx`)
- `src/main.jsx` — React kök render · `src/App.jsx` — bölümleri birleştirir
- `src/index.css` — tüm global stiller
- `src/models/types.js` — JSDoc `@typedef`'leri (Product, ProductVariant, Material, Review, CustomPrintRequest…)
- `src/utils/format.js` — `formatPrice(amount, currency)` (Intl ile TRY formatı)
- `src/data/` — statik seed veri: `categories.js`, `materials.js`, `products.js` (varyantlı), `reviews.js`, `customPrintRequests.js`
- `src/services/` — **webhook'a hazır async veri katmanı** (bileşenler doğrudan veriye değil buraya bağlı):
  - `productService.js` — `getProducts/getProductsByCategory/getProductBySlug`; ürüne türetilmiş `priceFrom/inStock/totalStock/averageRating/reviewCount` ekler
  - `materialService.js`, `reviewService.js`, `customPrintService.js` (`submitRequest` → ileride webhook POST noktası)
- `src/components/` — Header, Hero, About, Contact, Footer + katalog hiyerarşisi:
  - `ProductList.jsx` — katalog; `useEffect` ile `getProducts()` çeker, filtre state'i burada
  - `ProductCard.jsx` — tek kart (ProductView alır: fiyat/stok/puan); "Stokta yok" rozeti
  - `ProductImage.jsx` — `images[]` varsa foto, yoksa emoji fallback
- State: mobil menü (Header); kategori filtresi + async yükleme (ProductList); özel baskı formu (Contact → `customPrintService`)

### Veri Modeli Kararları
- **Ürün varyantlı:** her varyantın kendi `sku/materialId/color/price(sayı)/currency/stock`'u var.
- Fiyat sayı + para birimi; stok gerçek adet (0 = tükendi → rozet + buton devre dışı).
- Türetilen alanlar veride tutulmaz, `productService` içinde hesaplanır.
- Veri erişimi tamamen `services/*` arkasında (async) — ileride webhook/API'ye geçiş bileşenleri etkilemez.

## İçerik
- **Örnek/placeholder bilgilerle başlanacak** (telefon, e-posta, Instagram, adres, ürünler).
- Gerçek bilgiler daha sonra bu örneklerin yerine yazılacak.

## Planlanan Bölümler (taslak)
- Header / logo + menü
- Hero (tanıtım alanı, çarpıcı başlık)
- Ürünler / katalog (kartlar: görsel, ad, kısa açıklama, fiyat)
- Hakkımızda / atölye tanıtımı
- İletişim (telefon, e-posta, sosyal medya, adres)
- Footer

## Notlar / Yapılacaklar
- [x] index.html oluştur (tek dosya, enerjik/renkli tasarım)
- [x] Örnek ürün verilerini ekle (12 karışık ürün: frame/mount/koruyucu/aksesuar)
- [x] Veri modellerini kur (varyantlı ürün, malzeme, yorum, özel baskı talebi + servis katmanı)
- [ ] Servis içlerini gerçek webhook/API çağrılarıyla doldur
- [ ] Gerçek iletişim ve ürün bilgileriyle güncelle
- [ ] Ürün görsellerini emoji yerine gerçek fotoğraflarla değiştir
