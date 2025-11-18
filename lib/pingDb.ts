import prisma from './prisma';
import { redis } from './redis';

import { NextResponse, NextRequest } from 'next/server';

export async function pingDb(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token || token !== process.env.HEALTH_CHECK_TOKEN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.$queryRaw`SELECT 1`;
    const pong = await redis.ping();
    if (pong !== 'PONG') throw new Error('Redis did not respond correctly.');

    return NextResponse.json({
      database: 'ok',
      redis: 'ok',
      message: 'All systems operational',
    });
  } catch (error) {
    console.error('Error pinging database:', error);
    return NextResponse.json(
      { message: 'Database is not running' },
      { status: 500 },
    );
  }
}
