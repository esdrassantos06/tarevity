import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const report = await req.json()
    console.log('CSP Violation:', report)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error processing CSP report:', error)
    return NextResponse.json({ error: 'Failed to process report' }, { status: 500 })
  }
}