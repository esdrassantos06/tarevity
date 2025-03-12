// src/app/api/auth/check-password/route.ts
import { NextResponse } from 'next/server'
import axiosClient from '@/lib/axios'
import { validatePasswordStrength } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const { password } = await req.json()

    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { message: 'Password is required' },
        { status: 400 },
      )
    }

    const isCompromised = await checkPasswordWithHIBP(password)

    const { score, isValid, errors } = validatePasswordStrength(password)

    return NextResponse.json({
      isCompromised,
      strength: score,
      isStrong: !isCompromised && score >= 70,
      isValid,
      errors,
    })
  } catch (error: unknown) {
    console.error('Error checking password:', error)

    if (error instanceof Error) {
      return NextResponse.json(
        { message: error.message || 'Error checking password' },
        { status: 500 },
      )
    } else {
      return NextResponse.json(
        { message: 'Unknown error checking password' },
        { status: 500 },
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
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')

    // Split the hash into prefix and suffix as per the k-anonymity model
    const prefix = hashHex.substring(0, 5).toUpperCase()
    const suffix = hashHex.substring(5).toUpperCase()

    // Fetch from API directly (no caching)
    const response = await axiosClient.get(
      `https://api.pwnedpasswords.com/range/${prefix}`,
      {
        headers: {
          'User-Agent': 'Tarevity-PasswordChecker',
        },
      },
    )

    // Get the response text (list of hash suffixes and counts)
    const text = await response.data

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
    'password',
    'password123',
    '123456',
    '12345678',
    'qwerty',
    'admin',
    'welcome',
    'letmein',
    'abc123',
    '1234567890',
  ]
  return commonPasswords.includes(password.toLowerCase())
}
