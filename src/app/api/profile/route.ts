import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

// GET user profile
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error fetching user profile:', error)
      throw error
    }

    return NextResponse.json(data, { status: 200 })
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error in profile API:', error)
      return NextResponse.json(
        { message: error.message || 'Error fetching profile' },
        { status: 500 },
      )
    } else {
      console.error('Unknown error in profile API:', error)
      return NextResponse.json(
        { message: 'Unknown error fetching profile' },
        { status: 500 },
      )
    }
  }
}

// Update user profile
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const updateData = await req.json()

    // Validate data
    if (!updateData.name?.trim()) {
      return NextResponse.json({ message: 'Name is required' }, { status: 400 })
    }

    // Update the user profile
    const { data, error } = await supabaseAdmin
      .from('users')
      .update({
        name: updateData.name,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      console.error('Error updating user profile:', error)
      throw error
    }

    return NextResponse.json(data, { status: 200 })
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error in profile update API:', error)
      return NextResponse.json(
        { message: error.message || 'Error updating profile' },
        { status: 500 },
      )
    } else {
      console.error('Unknown error in profile update API:', error)
      return NextResponse.json(
        { message: 'Unknown error updating profile' },
        { status: 500 },
      )
    }
  }
}
