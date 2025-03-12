import { NextResponse } from 'next/server'
import { createUser, getUserByEmail } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json()

    // Validate data
    if (!name || !email || !password) {
      return NextResponse.json({ message: 'Incomplete data' }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(email)
    if (existingUser) {
      return NextResponse.json(
        { message: 'Email already registered' },
        { status: 400 },
      )
    }

    // Create new user
    const newUser = await createUser(name, email, password)

    return NextResponse.json(
      { message: 'User registered successfully', user: { id: newUser.id } },
      { status: 201 },
    )
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error registering user:', error)
      return NextResponse.json(
        { message: error.message || 'Error processing registration' },
        { status: 500 },
      )
    } else {
      console.error('Unknown error registering user:', error)
      return NextResponse.json(
        { message: 'Unknown error processing registration' },
        { status: 500 },
      )
    }
  }
}
