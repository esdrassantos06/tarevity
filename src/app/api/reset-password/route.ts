import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json()

    if (!token || !password) {
      return NextResponse.json(
        { message: 'Token and password are required' },
        { status: 400 },
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { message: 'Password must be at least 8 characters' },
        { status: 422 },
      )
    }

    return NextResponse.json(
      { message: 'Password reset successfully' },
      { status: 200 },
    )
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error in reset password API:', error.message)
      return NextResponse.json(
        { message: 'An error occurred while resetting the password' },
        { status: 500 },
      )
    } else {
      console.error('Unknown error in reset password API:', error)
      return NextResponse.json(
        { message: 'An unknown error occurred while resetting the password' },
        { status: 500 },
      )
    }
  }
}