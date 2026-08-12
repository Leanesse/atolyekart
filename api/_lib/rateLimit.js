// In-memory sabit pencere. Not: Vercel'de per-instance; kalıcı değil (demo).
const buckets = new Map()

export function checkRateLimit(key, { limit = 10, windowMs = 60000 } = {}) {
  const now = Date.now()
  const b = buckets.get(key)
  if (!b || now >= b.reset) {
    buckets.set(key, { count: 1, reset: now + windowMs })
    return { allowed: true, remaining: limit - 1 }
  }
  if (b.count >= limit) return { allowed: false, remaining: 0 }
  b.count += 1
  return { allowed: true, remaining: limit - b.count }
}
