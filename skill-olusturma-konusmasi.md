# AtölyeKart — Skill Oluşturma Konuşması

> Tarih: 2026-07-29 · Proje: fpvstore (AtölyeKart Hafta 1)
> Konu: Ödev görselindeki **madde 1.5** (Skill + MCP + Sub-agent) kapsamında,
> projeye özel **bileşen standartları + webhook formatı** skill'i yazmak.

---

## 1. İstek

Kullanıcı, ödev PDF'indeki şu görsele dayanarak bir skill oluşturmamı istedi:

**1.5 Skill + MCP + Sub-agent (~30 dk)**
- BizCard'da yazdığınız skill mantığını hatırlayın; AtölyeKart için **bileşen standartları + webhook format skill'i** yazın.
- GitHub MCP ile bir repo oluşturun, ilk commit'i atın.
- QR kod kütüphanesini MCP üzerinden ekleyin (katalog sayfasına QR).
- İsterseniz sub-agent deneyin: bir ajan tasarım/stil, bir ajan ürün açıklamaları üzerinde çalışsın.

**1.6 İki webhook özelliği (~30 dk)**
- "Sipariş Ver": ziyaretçi bir ürün seçip sipariş bilgisi (ad, ürün, telefon) gönderir — ekranda onay + webhook.
- "Stok Bildirimi İste": tükenen bir ürün için ad + e-posta formu → webhook.
- webhook.site ile her iki formu test edin, payload'ın geldiğini doğrulayın.

---

## 2. Yaklaşım

`superpowers:writing-skills` skill'i devreye alındı. Skill'i doğru yazabilmek için
projenin **gerçek** kod desenleri incelendi:

- `src/services/customPrintService.js` — webhook'a hazır async gönderim noktası
- `src/services/productService.js` — `toView` ile türetilmiş alanlar
- `src/components/Contact.jsx` — form deseni (state + `update` + `sending`)
- `src/components/ProductCard.jsx` — `formatPrice`, ProductView kullanımı

Bu desenlerden yola çıkılarak projeye özel bir **referans skill'i** yazıldı.

---

## 3. Oluşturulan Skill

**Dosya:** `.claude/skills/atolyekart-standards/SKILL.md`

İki şeyi standartlaştırır:

### a) Bileşen standartları
| Kural | Nasıl |
|-------|-------|
| Bileşen tipi | `export default function Ad() {}` |
| Veri erişimi | Sadece `services/*` üzerinden async — asla `data/*` doğrudan |
| Async yükleme | `useEffect` + `alive` bayrağı cleanup |
| Türetilmiş alanlar | Veride değil, serviste hesapla |
| Fiyat | `formatPrice(amount, currency)` |
| Stil | Global CSS sınıfları, minimalist gri, inline yok |
| Metin dili | Türkçe |

**Form deseni:** tek `form` state nesnesi + `update(field, value)` yardımcısı +
`sending` durumu; gönderim serviste, buton `disabled={sending}`.

### b) Webhook formatı (madde 1.6'ya hazır)

Ortak **payload zarfı** — tüm webhook'lar aynı biçimi kullanır:
```json
{
  "event": "order.created",
  "source": "fpvstore",
  "id": "evt-1722250000000",
  "createdAt": "2026-07-29T10:00:00.000Z",
  "data": { }
}
```

Tanımlı olaylar ve zorunlu `data` alanları:

| event | `data` alanları |
|-------|------------------|
| `order.created` (Sipariş Ver) | `name`, `productId`/`productSlug`, `phone` |
| `stock.notify_requested` (Stok Bildirimi) | `name`, `email`, `productId` |
| `custom_print.requested` (Özel Baskı) | `name`, `email`, `materialId?`, `color?`, `quantity`, `notes?` |

**Kurallar:**
- Her dış gönderim `services/*` içinde `async` fonksiyonda; bileşen sadece çağırır.
- Webhook URL'si `.env` içinde `VITE_WEBHOOK_URL` (koda gömülmez).
- `buildEvent(event, data)` yardımcısı ile zarf üretilir.
- webhook.site ile iki form ayrı ayrı test edilir, `event`/`data` doğrulanır.

---

## 4. Sonraki Adımlar (ödevden kalanlar)

- [ ] **1.6:** "Sipariş Ver" ve "Stok Bildirimi İste" formlarını bu skill'e uygun kodla
- [ ] GitHub MCP ile repo + ilk commit
- [ ] QR kod kütüphanesini MCP üzerinden ekle (katalog sayfasına QR)
- [ ] (Opsiyonel) Sub-agent denemesi: tasarım / ürün açıklamaları
- [ ] webhook.site ile payload testleri

---

*Bu dosya, skill oluşturma oturumunun özetidir. Skill'in kendisi
`.claude/skills/atolyekart-standards/SKILL.md` içindedir.*
