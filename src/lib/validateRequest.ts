import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

export async function validateRequest<T>(
  req: NextRequest,
  schema: z.ZodType<T>,
  errorMessage = 'Invalid request data'
): Promise<{ data: T } | NextResponse> {
  try {
    const body = await req.json();
    const result = schema.safeParse(body);
    
    if (!result.success) {
      const formattedErrors = result.error.errors.map(err => ({
        path: err.path.join('.'),
        message: err.message
      }));
      
      return NextResponse.json(
        { 
          message: errorMessage,
          errors: formattedErrors 
        },
        { status: 400 }
      );
    }
    
    return { data: result.data };
  } catch (error) {
    console.error('Error parsing request body:', error);
    return NextResponse.json(
      { message: 'Failed to parse request body' },
      { status: 400 }
    );
  }
}