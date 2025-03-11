// src/app/api/auth/check-password/route.ts
import { NextResponse } from 'next/server'

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

    const encoder = new TextEncoder()
    const data = encoder.encode(password)
    const hashBuffer = await crypto.subtle.digest('SHA-1', data)
    

    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    

    const prefix = hashHex.substring(0, 5).toUpperCase()
    const suffix = hashHex.substring(5).toUpperCase()
    

    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      headers: {
        'User-Agent': 'Tarevity-PasswordChecker' 
      }
    })
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`)
    }
    

    const text = await response.text()

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
  
  // Comprimento
  if (password.length >= 8) score += 10
  if (password.length >= 12) score += 10
  if (password.length >= 16) score += 10
  

  if (/[a-z]/.test(password)) score += 10 
  if (/[A-Z]/.test(password)) score += 10 
  if (/[0-9]/.test(password)) score += 10 
  if (/[^A-Za-z0-9]/.test(password)) score += 20 
  
  // Complexidade
  const uniqueChars = new Set(password.split('')).size
  score += Math.min(20, uniqueChars * 2) 
  
 
  if (/(.)\1\1/.test(password)) score -= 10 
  if (/(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/i.test(password)) score -= 10 // Letras sequenciais
  if (/(?:012|123|234|345|456|567|678|789)/.test(password)) score -= 10 
  
  return Math.max(0, Math.min(100, score))
}