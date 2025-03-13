import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { validateRequest } from '@/lib/validateRequest'
import { z } from 'zod'

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const userId = session.user.id

  try {
    const { data, error } = await supabaseAdmin
      .from('todos')
      .select(
        '*',
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json(data || [], { status: 200 })
  } catch (error: unknown) {
    console.error('Error fetching tasks:', error)
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : 'Unknown error fetching tasks',
      },
      { status: 500 },
    )
  }
}

const todoSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  description: z.string().max(500).nullable().optional(),
  priority: z.number().int().min(1).max(3),
  due_date: z.string().nullable().optional(),
  is_completed: z.boolean().optional(),
  status: z.enum(['active', 'review', 'completed']).optional()
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    // Parse and validate the request in one go
    const validation = await validateRequest(
      req,
      todoSchema,
      'Invalid todo data',
    )
    if (validation instanceof NextResponse) return validation

    // If we got here, validation passed and returned the parsed data
    const validatedData = validation.data
    const userId = session.user.id

    // Prepare the data with proper NULL handling
    const todoData = {
      user_id: userId,
      title: validatedData.title.trim(),
      description: validatedData.description === '' ? null : validatedData.description,
      priority: Number(validatedData.priority) || 1,
      due_date: validatedData.due_date === '' ? null : validatedData.due_date,
      is_completed: !!validatedData.is_completed,
      status: validatedData.status || 'active',
    };

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
      {
        message:
          error instanceof Error
            ? error.message
            : 'Unknown error creating task',
      },
      { status: 500 },
    )
  }
}