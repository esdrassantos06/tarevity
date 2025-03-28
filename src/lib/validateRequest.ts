import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getTranslations } from 'next-intl/server'

export async function validateRequest<T>(
  req: NextRequest,
  schema: z.ZodType<T>,
  errorMessage?: string,
): Promise<{ data: T } | NextResponse> {
  const t = await getTranslations('RequestValidation')

  try {
    const body = await req.json()
    const result = schema.safeParse(body)

    if (!result.success) {
      const formattedErrors = result.error.errors.map((err) => ({
        path: err.path.join('.'),
        message: err.message,
      }))

      return NextResponse.json(
        {
          message: errorMessage || t('invalidRequestData'),
          errors: formattedErrors,
        },
        { status: 400 },
      )
    }

    return { data: result.data }
  } catch (error) {
    console.error('Error parsing request body:', error)

    return NextResponse.json({ message: t('failedParseBody') }, { status: 400 })
  }
}
