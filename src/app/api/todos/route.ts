import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { z } from 'zod'

// Define a robust schema for task validation
const todoSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(100, 'Title too long (maximum 100 characters)')
    .transform(val => val.trim()),
    
  description: z.string()
    .max(500, 'Description too long (maximum 500 characters)')
    .optional()
    .nullable()
    .transform(val => val ? val.trim() : val),
    
  priority: z.number()
    .int('Priority must be an integer')
    .min(1, 'Minimum priority is 1')
    .max(3, 'Maximum priority is 3')
    .default(1),
    
  due_date: z.string()
    .nullable()
    .optional()
    .refine(val => !val || /^\d{4}-\d{2}-\d{2}$/.test(val), {
      message: 'Invalid date (format YYYY-MM-DD)'
    })
    .refine(val => !val || new Date(val) > new Date(), {
      message: 'Due date must be in the future'
    })
    .or(z.null())
})

// Type for validated data
type TodoInput = z.infer<typeof todoSchema>

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

    // Parse and validate request body
    const body = await req.json();
    const result = todoSchema.safeParse(body);

    if (!result.success) {
      // Return detailed validation errors from Zod
      return NextResponse.json(
        { 
          message: 'Invalid data', 
          errors: result.error.format() 
        },
        { status: 400 },
      )
    }

    // Data is validated and sanitized
    const validData: TodoInput = result.data;

    // Use supabaseAdmin to bypass RLS
    const { data, error } = await supabaseAdmin
      .from('todos')
      .insert([
        {
          user_id: session.user.id,
          title: validData.title,
          description: validData.description,
          priority: validData.priority,
          due_date: validData.due_date,
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