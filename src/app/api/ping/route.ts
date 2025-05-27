import { pingDb } from '@/utils/pingDb'
import { NextRequest } from 'next/server'

export async function HEAD(request: NextRequest) {
  return pingDb(request)
}

export async function GET(request: NextRequest) {
  return pingDb(request)
}
