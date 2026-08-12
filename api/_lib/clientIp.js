// x-forwarded-for is client-spoofable — demo-grade rate-limit key only
export function clientIp(req) {
  return (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown'
}
