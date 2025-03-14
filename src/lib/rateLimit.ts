import { NextRequest, NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.REDIS_URL || '',
  token: process.env.REDIS_TOKEN || '',
})

export async function rateLimiter(
  req: NextRequest,
  options: {
    limit: number
    window: number
    identifier?: string
  },
) {
  const { limit, window, identifier } = options

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'anonymous'
  const id = identifier || ip

  const key = `rate-limit:${req.nextUrl.pathname}:${id}`

  const count = ((await redis.get(key)) as number) || 0

  if (count >= limit) {
    return NextResponse.json(
      { error: 'Too many requests', retryAfter: window },
      { status: 429, headers: { 'Retry-After': window.toString() } },
    )
  }

  if (count === 0) {
    await redis.set(key, 1, { ex: window })
  } else {
    await redis.incr(key)
  }

  return null
}
