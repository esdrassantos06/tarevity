// src/app/api/auth/check-password/route.ts
import { NextResponse } from 'next/server'
import { redis } from '@/lib/redis'

export async function POST(req: Request) {
  try {
    const { password } = await req.json()

    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { message: 'Password is required' },
        { status: 400 }
      )
    }

    const isCompromised = await checkPasswordWithHIBP(password)
    
    const strength = calculatePasswordStrength(password)

    return NextResponse.json({
      isCompromised,
      strength,
      isStrong: !isCompromised && strength >= 70
    })
  } catch (error: unknown) {
    console.error('Error checking password:', error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { message: error.message || 'Error checking password' },
        { status: 500 }
      )
    } else {
      return NextResponse.json(
        { message: 'Unknown error checking password' },
        { status: 500 }
      )
    }
  }
}

async function checkPasswordWithHIBP(password: string): Promise<boolean> {
  try {
    // Compute the SHA-1 hash of the password
    const encoder = new TextEncoder()
    const data = encoder.encode(password)
    const hashBuffer = await crypto.subtle.digest('SHA-1', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    
    // Split the hash into prefix and suffix as per the k-anonymity model
    const prefix = hashHex.substring(0, 5).toUpperCase()
    const suffix = hashHex.substring(5).toUpperCase()
    
    // Check if the result is in Redis cache
    const cacheKey = `pwned:${prefix}`
    const cachedResult = await redis.get(cacheKey)
    
    if (cachedResult) {
      // Parse the cached result
      const lines = (cachedResult as string).split(/\r?\n/)
      for (const line of lines) {
        const parts = line.split(':')
        if (parts.length === 2) {
          const [returnedSuffix, count] = parts
          if (returnedSuffix === suffix) {
            return parseInt(count, 10) > 0
          }
        }
      }
      return false
    }
    
    // If not in cache, fetch from API
    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      headers: {
        'User-Agent': 'Tarevity-PasswordChecker' 
      }
    })
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`)
    }
    
    // Get the response text (list of hash suffixes and counts)
    const text = await response.text()
    
    // Cache the result with a TTL of 24 hours (86400 seconds)
    // This is safe to cache since password hash prefixes change slowly
    await redis.set(cacheKey, text, { ex: 86400 })
    
    // Check if the password is in the results
    const lines = text.split(/\r?\n/)
    for (const line of lines) {
      const parts = line.split(':')
      if (parts.length === 2) {
        const [returnedSuffix, count] = parts
        if (returnedSuffix === suffix) {
          return parseInt(count, 10) > 0
        }
      }
    }
    
    return false
  } catch (error) {
    console.error('Error checking HIBP:', error)
    
    // Fallback to checking against common password list
    return isCommonPassword(password)
  }
}

function isCommonPassword(password: string): boolean {
  const commonPasswords = [
    'password', 'password123', '123456', '12345678', 'qwerty',
    'admin', 'welcome', 'letmein', 'abc123', '1234567890'
  ]
  return commonPasswords.includes(password.toLowerCase())
}

function calculatePasswordStrength(password: string): number {
  let score = 0
  
  // Length
  if (password.length >= 8) score += 10
  if (password.length >= 12) score += 10
  if (password.length >= 16) score += 10
  
  // Character types
  if (/[a-z]/.test(password)) score += 10 
  if (/[A-Z]/.test(password)) score += 10 
  if (/[0-9]/.test(password)) score += 10 
  if (/[^A-Za-z0-9]/.test(password)) score += 20 
  
  // Complexity
  const uniqueChars = new Set(password.split('')).size
  score += Math.min(20, uniqueChars * 2) 
  
  // Penalize patterns
  if (/(.)\1\1/.test(password)) score -= 10 
  if (/(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/i.test(password)) score -= 10 // Sequential letters
  if (/(?:012|123|234|345|456|567|678|789)/.test(password)) score -= 10 
  
  return Math.max(0, Math.min(100, score))
}