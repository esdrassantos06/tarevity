import { compare, hash } from 'bcryptjs'
import { supabase } from './supabase'

const emailCheckCache = new Map<
  string,
  { exists: boolean; timestamp: number }
>()
const EMAIL_CACHE_TTL = 60 * 1000

export async function hashPassword(password: string): Promise<string> {
  return await hash(password, 10)
}

export function validatePasswordStrength(
  password: string,
  getTranslation: (key: string) => string,
): {
  isValid: boolean
  errors: string[]
  score: number
} {
  const errors: string[] = []
  let score = 0

  const hasUppercase = /[A-Z]/.test(password)
  const hasLowercase = /[a-z]/.test(password)
  const hasDigit = /[0-9]/.test(password)
  const hasSpecial = /[^A-Za-z0-9]/.test(password)
  const hasRepeatingChars = /(.)\1{2,}/.test(password)
  const hasSequentialChars =
    /(abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|012|123|234|345|456|567|678|789)/i.test(
      password,
    )

  if (password.length >= 12) {
    score += 20
  } else if (password.length >= 8) {
    score += 10
  } else {
    errors.push(getTranslation('passwordMinLength'))
  }

  if (hasUppercase) score += 10
  if (hasLowercase) score += 10
  if (hasDigit) score += 10
  if (hasSpecial) score += 20

  if (!hasUppercase) errors.push(getTranslation('passwordRequiresUppercase'))
  if (!hasLowercase) errors.push(getTranslation('passwordRequiresLowercase'))
  if (!hasDigit) errors.push(getTranslation('passwordRequiresDigit'))
  if (!hasSpecial) errors.push(getTranslation('passwordRequiresSpecial'))

  if (hasRepeatingChars) {
    score -= 10
    errors.push(getTranslation('passwordNoRepeatingChars'))
  }

  if (hasSequentialChars) {
    score -= 10
    errors.push(getTranslation('passwordNoSequentialChars'))
  }

  const uniqueChars = new Set(password).size
  score += Math.min(20, uniqueChars * 2)

  score = Math.max(0, Math.min(100, score))

  return {
    isValid: errors.length === 0,
    errors,
    score,
  }
}

export async function verifyPassword(
  password: string,
  hashedPassword: string,
): Promise<boolean> {
  return await compare(password, hashedPassword)
}

export async function emailExists(email: string): Promise<boolean> {
  const normalizedEmail = email.toLowerCase().trim()

  const now = Date.now()
  const cachedResult = emailCheckCache.get(normalizedEmail)

  if (cachedResult && now - cachedResult.timestamp < EMAIL_CACHE_TTL) {
    return cachedResult.exists
  }

  try {
    const { count, error } = await supabase
      .from('users')
      .select('id', { count: 'exact', head: true })
      .eq('email', normalizedEmail)

    if (error) {
      console.error('auth.errorCheckingEmailExists', error)
      return false
    }

    const exists = count ? count > 0 : false

    emailCheckCache.set(normalizedEmail, { exists, timestamp: now })

    return exists
  } catch (error) {
    console.error('Error checking if email exists:', error)
    return false
  }
}

export async function getUserByEmail(email: string) {
  const normalizedEmail = email.toLowerCase().trim()
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', normalizedEmail)
    .single()

  if (error) {
    return null
  }

  return data
}

export async function createUser(
  name: string,
  email: string,
  password: string,
  getTranslation: (key: string) => string,
) {
  const normalizedEmail = email.toLowerCase().trim()

  const exists = await emailExists(normalizedEmail)
  if (exists) {
    throw new Error(getTranslation('emailAlreadyRegistered'))
  }

  const hashedPassword = await hashPassword(password)

  const { data, error } = await supabase
    .from('users')
    .insert([
      {
        name,
        email: normalizedEmail,
        password: hashedPassword,
        provider: 'email',
      },
    ])
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      emailCheckCache.set(normalizedEmail, {
        exists: true,
        timestamp: Date.now(),
      })
      throw new Error(getTranslation('emailAlreadyRegistered'))
    }
    throw new Error(error.message)
  }

  emailCheckCache.set(normalizedEmail, { exists: true, timestamp: Date.now() })

  return data
}
