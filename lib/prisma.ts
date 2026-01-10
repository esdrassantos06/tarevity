import { PrismaClient } from './generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { isDevelopment } from '@/utils/variables';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const globalForPrisma = global as unknown as { prisma?: PrismaClient };

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    log: isDevelopment ? ['query', 'info', 'warn', 'error'] : ['error'],
  });

if (!isDevelopment) {
  globalForPrisma.prisma = prisma;
}

export default prisma;
