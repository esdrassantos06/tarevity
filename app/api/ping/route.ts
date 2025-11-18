import { pingDb } from '@/lib/pingDb';
import { NextRequest } from 'next/server';

export async function HEAD(request: NextRequest) {
  return pingDb(request);
}

export async function GET(request: NextRequest) {
  return pingDb(request);
}
