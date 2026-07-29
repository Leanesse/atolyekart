# Kısa Düşünce — AtölyeKart Hafta 1

Ödevin "Kısa düşünce" bölümündeki iki soruya kısa yanıtlar.

## 1) Veri modelini planlarken (/plan) BizCard'dakinden farklı ne fark ettim?

BizCard'da veri aslında düz ve tekildi (bir kartın alanları). AtölyeKart'ta ise
model **gerçek anlamda varyantlı**: her ürünün renk/malzemeye göre kendi `sku`,
`price`, `stock` değeri olan birden çok varyantı var. En net fark ettiğim şey,
"tekil bir üründen çoğula nasıl taşırım?" sorusunun tasarımı baştan
değiştirmesiydi:

- **Fiyatı string tutmak** (`"₺749"`) işe yarıyor gibi görünüyordu ama sıralama,
  "stokta yok" rozeti ve filtreleme imkânsız hale geliyordu. `/plan` adımı, kod
  yazmadan önce bunu fark ettirdi → fiyat **sayı + para birimi**, stok **gerçek adet**.
- **Türetilmiş alanlar** (`priceFrom`, `inStock`, `averageRating`) veride
  tutulmamalı; `productService` içinde hesaplanmalı. Böylece veri tek doğruluk
  kaynağı olarak kaldı.
- Veri erişimini **async servis katmanı** arkasına almak, ileride webhook/API'ye
  geçişte bileşenlerin hiç değişmemesini sağladı. Nitekim iki webhook özelliğini
  eklerken bileşenler yalnızca `services/*` çağırdı; bu kararın karşılığını aynı
  hafta içinde gördüm.

Özetle `/plan`, "iyi istek anatomisi"ni (bağlam + istek + sınır) gerçek bir
mimari karar öncesinde tekrar uygulamamı sağladı; kopyala-yapıştır değil,
"bu mantığı başka bir veri şeklinde de kurabiliyor muyum?" testiydi.

## 2) Skill / MCP / Sub-agent'tan hangisi bu ikinci denemede daha kolay geldi, neden?

**En çok işime yarayan: Skill.** `atolyekart-standards` skill'i bileşen
standartlarını ve webhook zarfını (`event/source/id/createdAt/data`) tek yerde
sabitlediği için, "Sipariş Ver" ve "Stok Bildirimi" formlarını eklerken mevcut
kodun biçimini yeniden keşfetmem gerekmedi — form deseni, servis katmanı ve
payload formatı hazır kurallar olarak geldi. İkinci denemede en çok hız
kazandıran buydu.

**MCP / GitHub:** Repoyu GitHub MCP yerine `gh` CLI ile oluşturdum; sonuç aynı
(repo + ilk commit + push). Cihaz-kodu (device flow) ile yetkilendirme tek
seferlik ufak bir sürtünme yarattı ama akıcıydı.

**Sub-agent:** Bu ödev tamamlamasını **subagent-driven-development** akışıyla
yürüttüm: her görev için taze bir implementer + ardından bir inceleme (spec +
kalite). Bu, bağlamı temiz tutmanın yanı sıra gerçek bir sorunu da yakaladı —
katalog QR'ı ürünler yüklenirken görünüyordu; inceleme bunu işaretledi ve tek
satırlık bir düzeltmeyle giderildi. Yani sub-agent "daha kolay"dan çok "daha
güvenli/denetimli" hissettirdi.

**Sonuç:** Tekrar kullanımda **skill** en pratik olanıydı (standartları hatırlama
yükünü kaldırdı); sub-agent kaliteyi güvenceye aldı; MCP'nin yerini bu turda CLI
tuttu.
