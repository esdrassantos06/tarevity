import { Redis } from '@upstash/redis'
import { NextResponse } from 'next/server'
import { getTranslations } from 'next-intl/server'

const redis = new Redis({
  url: process.env.REDIS_URL || '',
  token: process.env.REDIS_TOKEN || '',
})

interface ProtectionConfig {
  windowMs: number
  maxAttempts: number
  blockDuration: number
  identifier: string
  type: 'bruteforce' | 'ratelimit'
}

const DEFAULT_CONFIGS = {
  bruteforce: {
    windowMs: 15 * 60 * 1000,
    maxAttempts: 5,
    blockDuration: 60 * 60 * 1000,
  },
  ratelimit: {
    windowMs: 60 * 1000,
    maxAttempts: 30,
    blockDuration: 15 * 60 * 1000,
  },
}

export async function protectRoute(
  config: Partial<ProtectionConfig> &
    Pick<ProtectionConfig, 'identifier' | 'type'>,
) {
  const t = await getTranslations('RateLimiter')
  const finalConfig = {
    ...DEFAULT_CONFIGS[config.type],
    ...config,
  }

  const { windowMs, maxAttempts, blockDuration, identifier, type } = finalConfig

  const now = Date.now()
  const key = `${type}:${identifier}`
  const blockKey = `${type}:block:${identifier}`

  // Verificar se está bloqueado
  const isBlocked = await redis.get(blockKey)
  if (isBlocked) {
    const remainingTime = Math.ceil(
      (parseInt(isBlocked as string) - now) / 1000 / 60,
    )
    return NextResponse.json(
      {
        error: t('tooManyRequests.error'),
        message: t('tooManyRequests.message', { minutes: remainingTime }),
      },
      {
        status: 429,
        headers: {
          'Retry-After': (remainingTime * 60).toString(),
        },
      },
    )
  }

  const attempts = await redis.get(key)
  const attemptsList = attempts ? JSON.parse(attempts as string) : []

  const recentAttempts = Array.isArray(attemptsList)
    ? attemptsList.filter((attempt) => {
        const attemptTime = new Date(attempt.timestamp).getTime()
        return now - attemptTime < windowMs
      })
    : []
  recentAttempts.push(now)

  if (recentAttempts.length > maxAttempts) {
    await redis.set(blockKey, now + blockDuration)
    await redis.expire(blockKey, Math.ceil(blockDuration / 1000))

    const blockMinutes = Math.ceil(blockDuration / 1000 / 60)
    return NextResponse.json(
      {
        error: t('tooManyRequests.error'),
        message: t('tooManyRequests.message', { minutes: blockMinutes }),
      },
      {
        status: 429,
        headers: {
          'Retry-After': (blockMinutes * 60).toString(),
          'X-RateLimit-Limit': maxAttempts.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': Math.floor(
            Date.now() / 1000 + blockDuration / 1000,
          ).toString(),
        },
      },
    )
  }

  // Atualizar lista de tentativas
  await redis.set(key, JSON.stringify(recentAttempts))
  await redis.expire(key, Math.ceil(windowMs / 1000))

  return null
}

// Helpers para criar identificadores consistentes
export function createIdentifier(params: {
  userId?: string
  ip?: string
  path?: string
  email?: string
}) {
  const { userId, ip, path, email } = params
  const parts = []

  if (userId) parts.push(userId)
  if (ip) parts.push(ip)
  if (path) parts.push(path)
  if (email) parts.push(email.slice(0, 3))

  return parts.join(':')
}

// Configurações pré-definidas para rotas comuns
export const PROTECTION_CONFIGS = {
  auth: {
    login: {
      maxAttempts: 5,
      windowMs: 15 * 60 * 1000,
      type: 'bruteforce' as const,
    },
    register: {
      maxAttempts: 3,
      windowMs: 60 * 60 * 1000,
      type: 'bruteforce' as const,
    },
    forgotPassword: {
      maxAttempts: 3,
      windowMs: 60 * 60 * 1000,
      type: 'bruteforce' as const,
    },
    resetPassword: {
      maxAttempts: 3,
      windowMs: 60 * 60 * 1000,
      type: 'bruteforce' as const,
    },
  },
  api: {
    default: {
      maxAttempts: 50,
      windowMs: 60 * 1000,
      type: 'ratelimit' as const,
    },
    admin: { maxAttempts: 20, windowMs: 60 * 1000, type: 'ratelimit' as const },
    upload: {
      maxAttempts: 5,
      windowMs: 60 * 60 * 1000,
      type: 'ratelimit' as const,
    },
  },
}
