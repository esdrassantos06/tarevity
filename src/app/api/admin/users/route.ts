import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

// GET handler to fetch all users
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || !session?.user?.is_admin) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabaseAdmin
      .from('users')
      .select('id, name, email, provider, is_admin, created_at')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching users:', error)
      throw error
    }

    return NextResponse.json(data || [], { status: 200 })
  } catch (error: unknown) {
    console.error('Error in admin users API:', error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { message: error.message || 'Failed to fetch users' },
        { status: 500 }
      )
    } else {
      return NextResponse.json(
        { message: 'Unknown error fetching users' },
        { status: 500 }
      )
    }
  }
}