import { PrismaClient } from './generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { isDevelopment } from '@/utils/variables';

const globalForPrisma = global as unknown as {
  prisma?: PrismaClient;
  pool?: Pool;
  poolEndHandlersRegistered?: boolean;
};

// Create pool as singleton to avoid multiple pools during hot reload
const pool =
  globalForPrisma.pool ||
  new Pool({
    connectionString: process.env.DATABASE_URL!,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
    allowExitOnIdle: true,
  });

if (!globalForPrisma.pool) {
  globalForPrisma.pool = pool;
  pool.on('error', (err: Error) => {
    console.error('Unexpected error on idle PostgreSQL client', err);
  });
}

const adapter = new PrismaPg(pool);

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    log: isDevelopment ? ['query', 'info', 'warn', 'error'] : ['error'],
  });

if (!isDevelopment) {
  globalForPrisma.prisma = prisma;
}

if (
  typeof process !== 'undefined' &&
  !globalForPrisma.poolEndHandlersRegistered
) {
  globalForPrisma.poolEndHandlersRegistered = true;

  let isEnding = false;

  const cleanup = async () => {
    if (isEnding || !globalForPrisma.pool) {
      return;
    }
    isEnding = true;
    try {
      await globalForPrisma.pool.end();
    } catch {}
  };

  process.once('SIGINT', cleanup);
  process.once('SIGTERM', cleanup);
  process.once('beforeExit', cleanup);
}

export default prisma;
