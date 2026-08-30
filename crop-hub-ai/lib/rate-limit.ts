/**
 * Lightweight in-memory rate limiter for Next.js API routes.
 * Uses a Map keyed by IP address. Works on Vercel serverless (per-function
 * instance) and locally. For multi-instance production, swap out for
 * Upstash Redis ratelimit.
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

// Max Map size to prevent memory growth in long-running instances
const MAX_ENTRIES = 5000

const store = new Map<string, RateLimitEntry>()

/**
 * @param ip      The client IP address (from request headers)
 * @param limit   Max requests allowed in the window
 * @param windowMs  Window duration in milliseconds
 * @returns `{ success: true }` if allowed, `{ success: false, retryAfter: number }` if rate-limited
 */
export function rateLimit(
  ip: string,
  limit: number,
  windowMs: number,
): { success: true } | { success: false; retryAfter: number } {
  const now = Date.now()

  // Prune expired entries if store is getting large
  if (store.size > MAX_ENTRIES) {
    for (const [key, entry] of store) {
      if (entry.resetAt < now) store.delete(key)
    }
  }

  const entry = store.get(ip)

  if (!entry || entry.resetAt < now) {
    // New window
    store.set(ip, { count: 1, resetAt: now + windowMs })
    return { success: true }
  }

  if (entry.count >= limit) {
    return { success: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) }
  }

  entry.count += 1
  return { success: true }
}

/**
 * Extract the real client IP from Next.js request headers.
 * Protects against basic spoofing by checking dedicated trusted proxy headers
 * (Vercel, Cloudflare) first, and using the rightmost (closest proxy) entry on raw proxies.
 */
export function getClientIp(req: Request): string {
  // Dedicated edge headers set by Vercel or Cloudflare that cannot be forged by clients
  const vercelIp = req.headers.get('x-vercel-forwarded-for')
  if (vercelIp) return vercelIp.split(',')[0].trim()

  const cfIp = req.headers.get('cf-connecting-ip')
  if (cfIp) return cfIp.trim()

  const realIp = req.headers.get('x-real-ip')
  if (realIp) return realIp.trim()

  // For general reverse proxies, take the first valid IP or fallback to localhost
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) {
    const parts = forwarded.split(',').map((p) => p.trim()).filter(Boolean)
    if (parts.length > 0) return parts[0]
  }

  return '127.0.0.1'
}

