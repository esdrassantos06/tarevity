import { NextRequest, NextResponse } from 'next/server'
import { createUser, emailExists } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json()

    const normalizedEmail = email.toLowerCase().trim()
    const trimmedName = name.trim()

    if (!trimmedName || !normalizedEmail || !password) {
      return NextResponse.json({ message: 'Incomplete data' }, { status: 400 })
    }

    const exists = await emailExists(normalizedEmail)
    if (exists) {
      return NextResponse.json(
        {
          message: 'Email already registered',
          code: 'EMAIL_EXISTS',
          silentError: true,
        },
        { status: 409 },
      )
    }

    const newUser = await createUser(
      trimmedName,
      normalizedEmail,
      password,
      (key) => key,
    )

    return NextResponse.json(
      { message: 'User registered successfully', user: { id: newUser.id } },
      { status: 201 },
    )
  } catch (error: unknown) {
    console.error('Unexpected registration error:', error)

    if (error instanceof Error) {
      if (error.message.toLowerCase().includes('email already registered')) {
        return NextResponse.json(
          {
            message: 'Email already registered',
            code: 'EMAIL_EXISTS',
            silentError: true,
          },
          { status: 409 },
        )
      }

      return NextResponse.json(
        { message: error.message || 'Error processing registration' },
        { status: 500 },
      )
    }

    return NextResponse.json(
      { message: 'An unexpected error occurred during registration' },
      { status: 500 },
    )
  }
}
