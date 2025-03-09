import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

// Get all user tasks
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    // Use supabaseAdmin for GET requests too, to bypass RLS consistently
    const { data, error } = await supabaseAdmin
      .from('todos')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json(data || [], { status: 200 })
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error fetching tasks:', error)
      return NextResponse.json(
        { message: error.message || 'Error fetching tasks' },
        { status: 500 },
      )
    } else {
      console.error('Unknown error fetching tasks:', error)
      return NextResponse.json(
        { message: 'Unknown error fetching tasks' },
        { status: 500 },
      )
    }
  }
}

// Create new task
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    // Correct syntax for parsing request body
    const { title, description, priority, due_date } = await req.json()

    // Validate data
    if (!title) {
      return NextResponse.json(
        { message: 'Title is required' },
        { status: 400 },
      )
    }

    // Use supabaseAdmin to bypass RLS
    const { data, error } = await supabaseAdmin
      .from('todos')
      .insert([
        {
          user_id: session.user.id,
          title,
          description,
          priority: priority || 1,
          due_date: due_date || null,
        },
      ])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data, { status: 201 })
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error creating task:', error)
      return NextResponse.json(
        { message: error.message || 'Error creating task' },
        { status: 500 },
      )
    } else {
      console.error('Unknown error creating task:', error)
      return NextResponse.json(
        { message: 'Unknown error creating task' },
        { status: 500 },
      )
    }
  }
}