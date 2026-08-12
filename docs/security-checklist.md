# AtölyeKart — Deploy Öncesi Güvenlik Checklist (Hafta 2)

- [x] Secret'lar client bundle'da değil (`VITE_` öneki yok; `WEBHOOK_URL/SECRET`, `JWT_SECRET`, `ADMIN_PASSWORD` sunucuda)
- [x] `.env` `.gitignore`'da; repoda yalnızca `.env.example` (`git ls-files | grep .env` → sadece örnek)
- [x] Tüm form uçları server-side yeniden doğruluyor (`api/_lib/validate.js`)
- [x] Rate limit: `/api/order` & `/api/stock-notify` → 10/dk, aşımda 429
- [x] Admin uçları JWT ile korunuyor (`/api/admin/orders`)
- [x] Webhook server→server; secret `X-Webhook-Secret` başlığında, tarayıcıya gitmiyor
- [x] HTTPS: Vercel varsayılan
- [x] Loglara secret yazılmıyor (yalnızca event adı/hata)
- [x] KVKK: açık rıza checkbox'ı + Gizlilik Politikası
- [ ] `npm audit` çalıştırıldı, kritik açık yok
- [ ] Vercel Environment Variables production/preview için dolduruldu

> Not: Rate limit ve order store in-memory (per-instance). Prod ölçek için Vercel KV / Upstash önerilir.
