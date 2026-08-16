# Webhook Kanıtı — İki Ayrı Event

fpvstore'daki iki form, dış bir webhook alıcısına (webhook.site) **standart zarf**
formatında POST atar: `{ event, source, id, createdAt, data }`
(`src/services/webhook.js`). Aşağıda webhook.site'a düşen gerçek iki isteğin
payload'ı yer alıyor (test URL'si: `https://webhook.site/74b5dec5-...`).

Test tarihi: 2026-07-29.

---

## 1) Sipariş Ver → `order.created`

Sipariş formu (Ad Soyad + Ürün + E-posta + Telefon + Adet) → onay ekranı → gönder.

```json
{
  "event": "order.created",
  "source": "fpvstore",
  "id": "evt-1785318687286",
  "createdAt": "2026-07-29T09:51:27.286Z",
  "data": {
    "name": "İbrahim Yusuf Karagül",
    "productId": "gopro-mount-30",
    "productName": "GoPro Mount 30°",
    "phone": "5055309730",
    "email": "yusuf.karagul70@gmail.com",
    "quantity": 4
  }
}
```

`data` alanları sözleşmeyle eşleşiyor: `name, productId, productName, phone, email, quantity` ✓

---

## 2) Stok Bildirimi İste → `stock.notify_requested`

Stok bildirimi formu (Ad Soyad + E-posta + Ürün) → gönder.

```json
{
  "event": "stock.notify_requested",
  "source": "fpvstore",
  "id": "evt-1785318666581",
  "createdAt": "2026-07-29T09:51:06.581Z",
  "data": {
    "name": "İbrahim Yusuf Karagül",
    "email": "yusuf.karagul70@gmail.com",
    "productId": "cinewhoop-duct-3",
    "productName": "3\" Cinewhoop Duct"
  }
}
```

`data` alanları sözleşmeyle eşleşiyor: `name, productId, productName, email` ✓

---

## Not
İki farklı `event` (`order.created` ve `stock.notify_requested`) aynı zarf
formatıyla, aynı `source: "fpvstore"` altında gönderiliyor. webhook.site test
token'ı geçici olduğundan payload'lar burada kalıcı olarak kaydedilmiştir.
