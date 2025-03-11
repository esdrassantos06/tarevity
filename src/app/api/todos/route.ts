// src/app/api/todos/route.ts
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabaseAdmin
      .from('todos')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json(data || [], { status: 200 })
  } catch (error: unknown) {
    console.error('Error fetching tasks:', error)
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Unknown error fetching tasks' },
      { status: 500 },
    )
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    // Parse the request body
    const body = await req.json()
    console.log('Request body:', body)
    
    // Validate required fields
    if (!body.title || typeof body.title !== 'string' || body.title.trim() === '') {
      return NextResponse.json(
        { message: 'Title is required' },
        { status: 400 },
      )
    }

    // Prepare the data with proper NULL handling
    const todoData = {
      user_id: session.user.id,
      title: body.title.trim(),
      description: body.description === '' ? null : body.description,
      priority: Number(body.priority) || 1,
      due_date: body.due_date === '' ? null : body.due_date,
      is_completed: !!body.is_completed,
    }
    
    console.log('Prepared todo data:', todoData)

    const { data, error } = await supabaseAdmin
      .from('todos')
      .insert([todoData])
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { message: 'Database error: ' + error.message },
        { status: 500 },
      )
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error: unknown) {
    console.error('Error creating task:', error)
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Unknown error creating task' },
      { status: 500 },
    )
  }
}