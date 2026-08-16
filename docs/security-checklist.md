# AtölyeKart — Deploy Öncesi Güvenlik Checklist (Hafta 2)

- [x] Secret'lar client bundle'da değil (`VITE_` öneki yok; `WEBHOOK_URL/SECRET`, `JWT_SECRET`, `ADMIN_PASSWORD` sunucuda)
- [x] `.env` `.gitignore`'da; repoda yalnızca `.env.example` (`git ls-files | grep .env` → sadece örnek)
- [x] Tüm form uçları server-side yeniden doğruluyor (`api/_lib/validate.js`)
- [x] Rate limit: `/api/order` & `/api/stock-notify` → 10/dk, aşımda 429
- [x] Admin uçları JWT ile korunuyor (`/api/admin/orders`)
- [x] Webhook server→server; secret `X-Webhook-Secret` başlığında, tarayıcıya gitmiyor
- [x] HTTPS + HSTS: canlı yanıt `strict-transport-security: max-age=63072000; includeSubDomains; preload`
- [x] Güvenlik başlıkları (`vercel.json`): CSP, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy` — canlıda doğrulandı
- [x] Çift gönderim koruması: web (`disabled={sending}`) + mobil (`orderSubmitting`/`stockSubmitting` + erken return)
- [x] Loglara secret yazılmıyor (yalnızca event adı/hata)
- [x] KVKK: açık rıza checkbox'ı (web) + "oku→onayla" modalı (mobil) + Gizlilik Politikası; server `consent===true` zorunlu
- [x] `npm audit --omit=dev` (runtime): **0 açık**. Tüm audit (devDeps dahil): açık var — hepsi `vercel` CLI (build-time), dağıtılan runtime bundle'ında değil.
- [x] Vercel Environment Variables production/preview için dolduruldu (`vercel env ls` ile doğrulandı)

> Not: Rate limit ve order store in-memory (per-instance). Prod ölçek için Vercel KV / Upstash önerilir. Girdiler server-side doğrulanıp normalize ediliyor (trim/lowercase/tip/regex); enjeksiyon hedefi yok (JSON webhook, SQL yok, React auto-escape).
