import { NextResponse } from 'next/server'
import { createUser } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json()

    const normalizedEmail = email.toLowerCase().trim()
    const trimmedName = name.trim()

    if (!trimmedName || !normalizedEmail || !password) {
      return NextResponse.json({ message: 'Incomplete data' }, { status: 400 })
    }

    try {
      const newUser = await createUser(trimmedName, normalizedEmail, password)

      return NextResponse.json(
        { message: 'User registered successfully', user: { id: newUser.id } },
        { status: 201 },
      )
    } catch (createError) {
      if (createError instanceof Error) {
        if (createError.message.toLowerCase().includes('email already registered')) {
          return NextResponse.json(
            { message: 'Email already registered', code: 'EMAIL_EXISTS', silentError: true },
            { status: 409 },
          )
        }
        
        return NextResponse.json(
          { message: createError.message || 'Error processing registration' },
          { status: 500 },
        )
      }
    }

    return NextResponse.json(
      { message: 'Unknown error processing registration' },
      { status: 500 },
    )
  } catch (error: unknown) {
    console.error('Unexpected registration error:', error)
    return NextResponse.json(
      { message: 'An unexpected error occurred during registration' },
      { status: 500 },
    )
  }
}


