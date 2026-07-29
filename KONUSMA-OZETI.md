# fpvstore — Geliştirme Konuşması Özeti

> Bu dosya, fpvstore atölye web sitesinin sıfırdan kurulumu boyunca yapılan
> konuşmanın ve alınan kararların özetidir. (Son güncelleme: 2026-07-29)

---

## 1. Proje Nedir?

3D yazıcı ile üretilen **drone (FPV) parçaları** satan bir atölyenin tanıtım/vitrin
web sitesi. Marka adı: **fpvstore**.

- Amaç: ürün kataloğu / vitrin — parçaları fiyat ve özellikleriyle sergilemek.
- Şimdilik **sepet/satın alma yok**, sadece gösterim.
- Atölye tanıtımı ve iletişim bölümleri de var.

---

## 2. Konuşmanın Akışı (adım adım)

1. **CLAUDE.md ile başladık** — önce sorular eşliğinde bir proje dokümanı
   (CLAUDE.md) oluşturuldu, kararlar buraya yazıldı.
2. **İlk sürüm: tek dosya `index.html`** — karışık bir örnek ürün setiyle,
   enerjik/renkli tasarımda yapıldı.
3. **Tasarım değişikliği** — kullanıcı renkli tasarımı beğenmedi; **minimalist,
   gri tonlarda** yeniden düzenlendi (beyaz zemin, ince gri çizgiler, sakin/kurumsal).
4. **React'e dönüşüm** — tek dosya HTML, **React + Vite** projesine çevrildi.
   Standalone yedek `index.standalone.html.bak` olarak saklandı.
5. **Bileşenlere ayırma** — katalog `ProductList`, `ProductCard`, `ProductImage`
   bileşenlerine bölündü.
6. **Veri modelleri planı** (plan modu) — sorular eşliğinde tam bir veri modeli
   mimarisi tasarlandı ve onaylandı.
7. **"From" düzeltmesi** — Türkçe sayfada fiyat önünde İngilizce "from" görünüyordu;
   önce "başlangıç" yapıldı, sonra kullanıcı isteğiyle etiket tümden kaldırılıp
   **direkt fiyat** gösterildi. Kalan kullanılmayan `.price-from` CSS kuralı temizlendi.

---

## 3. Tasarım Kararları

- **Tarz:** Minimalist / gri tonlar — beyaz arka plan, ince gri çizgiler.
- Vurgu rengi koyu antrasit; **gradyan/neon yok**. Bol boşluk, ince tipografi.
- **Mobil uyumlu** (responsive).
- CSS değişkenleri: `--bg:#ffffff`, `--bg-soft:#f6f6f7`, `--ink:#1a1a1c`,
  `--muted:#8a8a90`, `--accent:#2c2c30` vb.

---

## 4. Teknik Yapı

- **React 18 + Vite** (JavaScript/JSX, TypeScript değil). Node 22 / npm 10.
- Komutlar: `npm install`, `npm run dev`, `npm run build`.
- CSS tek dosyada global: `src/index.css`.

### Dosya Yapısı
- `index.html` — Vite giriş noktası (`#root` + `src/main.jsx`)
- `src/main.jsx` — React kök render · `src/App.jsx` — bölümleri birleştirir
- `src/index.css` — tüm global stiller
- `src/models/types.js` — JSDoc `@typedef`'leri (Product, ProductVariant, Material, Review, CustomPrintRequest…)
- `src/utils/format.js` — `formatPrice(amount, currency)` (Intl ile TRY formatı)
- `src/data/` — statik seed veri: `categories.js`, `materials.js`, `products.js`, `reviews.js`, `customPrintRequests.js`
- `src/services/` — webhook'a hazır async veri katmanı:
  - `productService.js`, `materialService.js`, `reviewService.js`, `customPrintService.js`
- `src/components/` — Header, Hero, About, Contact, Footer + katalog:
  - `ProductList.jsx`, `ProductCard.jsx`, `ProductImage.jsx`

---

## 5. Veri Modeli Kararları

- **Ürün varyantlı:** her varyantın kendi `sku / materialId / color / price (sayı) / currency / stock` değeri var.
- **Fiyat sayı + para birimi**; stok gerçek adet (0 = tükendi → "Stokta yok" rozeti + buton devre dışı).
- **Türetilen alanlar** (`priceFrom`, `inStock`, `totalStock`, `averageRating`, `reviewCount`)
  veride tutulmaz, `productService` içinde hesaplanır.
- **Veri erişimi tamamen `services/*` arkasında (async)** — ileride webhook/API'ye
  geçiş bileşenleri etkilemez. Servis içleri şimdilik statik veri döndürür;
  `customPrintService.submitRequest` ileride webhook POST atılacak noktadır.

### Modeller
| Model | Dosya | Not |
|-------|-------|-----|
| Category | `data/categories.js` | id/label/icon/description + `filterCategories` |
| Material | `data/materials.js` | PETG, ABS, TPU + renkler |
| Product | `data/products.js` | 12 ürün, varyantlı |
| ProductVariant | `products.js` içinde | sku/price/stock/color/material |
| Review | `data/reviews.js` | 6 örnek yorum |
| CustomPrintRequest | `data/customPrintRequests.js` | boş seed, serviste oluşturulur |

---

## 6. Örnek/Placeholder İçerik

Telefon, e-posta, Instagram, adres ve ürünler **örnek bilgilerle** başladı.
Gerçek bilgiler daha sonra bunların yerine yazılacak.

---

## 7. Yol Boyunca Çözülen Hatalar

- `color: 'Mavi yok'` yazım hatası → `color: 'Mavi'` olarak düzeltildi.
- Türkçe sayfada fiyat önünde **"from"** İngilizce metni → önce "başlangıç",
  sonra etiket tümden kaldırılıp direkt fiyat gösterildi; kullanılmayan
  `.price-from` CSS kuralı temizlendi.

---

## 8. Yapılacaklar (açık maddeler)

- [ ] Servis içlerini gerçek **webhook/API** çağrılarıyla doldur.
- [ ] Gerçek iletişim ve ürün bilgileriyle güncelle.
- [ ] Ürün görsellerini emoji yerine gerçek fotoğraflarla değiştir.
