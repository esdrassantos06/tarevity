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
      console.error('Error checking if email exists', error)
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
) {
  const normalizedEmail = email.toLowerCase().trim()

  const exists = await emailExists(normalizedEmail)
  if (exists) {
    throw new Error('Email already Registered')
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
      throw new Error('Email already registered')
    }
    throw new Error(error.message)
  }

  emailCheckCache.set(normalizedEmail, { exists: true, timestamp: Date.now() })

  return data
}
