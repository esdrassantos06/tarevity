import prisma from '@/lib/prisma';
import { redis } from '@/lib/redis';
import { logger } from '@/lib/logger';
import { successResponse, errorResponse } from '@/lib/api-response';
import { supabase } from '@/lib/supabase-server';
import { Resend } from 'resend';

export const dynamic = 'force-dynamic';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  database: 'ok' | 'error';
  redis: 'ok' | 'error';
  timestamp: string;
  dependencies?: {
    supabase?: 'ok' | 'error' | 'not_configured';
    resend?: 'ok' | 'error' | 'not_configured';
  };
}

export async function GET() {
  const timestamp = new Date().toISOString();
  const healthStatus: HealthStatus = {
    status: 'healthy',
    database: 'ok',
    redis: 'ok',
    timestamp,
    dependencies: {},
  };

  try {
    try {
      await prisma.$queryRaw`SELECT 1`;
      healthStatus.database = 'ok';
    } catch (error) {
      logger.error(
        'Database health check failed',
        error instanceof Error ? error : new Error(String(error)),
      );
      healthStatus.database = 'error';
      healthStatus.status = 'unhealthy';
    }

    try {
      const pong = await redis.ping();
      if (pong !== 'PONG') {
        throw new Error('Redis did not respond correctly');
      }
      healthStatus.redis = 'ok';
    } catch (error) {
      logger.error(
        'Redis health check failed',
        error instanceof Error ? error : new Error(String(error)),
      );
      healthStatus.redis = 'error';
      healthStatus.status = 'unhealthy';
    }

    if (
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY &&
      supabase
    ) {
      try {
        const { data: buckets, error: bucketsError } =
          await supabase.storage.listBuckets();
        if (bucketsError || !buckets) {
          throw bucketsError || new Error('Supabase Storage not accessible');
        }
        healthStatus.dependencies!.supabase = 'ok';
      } catch (error) {
        logger.warn('Supabase health check failed', {
          error: error instanceof Error ? error.message : String(error),
        });
        healthStatus.dependencies!.supabase = 'error';
        if (healthStatus.status === 'healthy') {
          healthStatus.status = 'degraded';
        }
      }
    } else {
      healthStatus.dependencies!.supabase = 'not_configured';
    }

    if (process.env.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        if (!resend) {
          throw new Error('Failed to create Resend client');
        }
        healthStatus.dependencies!.resend = 'ok';
      } catch (error) {
        logger.warn('Resend health check failed', {
          error: error instanceof Error ? error.message : String(error),
        });
        healthStatus.dependencies!.resend = 'error';
        if (healthStatus.status === 'healthy') {
          healthStatus.status = 'degraded';
        }
      }
    } else {
      healthStatus.dependencies!.resend = 'not_configured';
    }

    const statusCode =
      healthStatus.status === 'healthy'
        ? 200
        : healthStatus.status === 'degraded'
          ? 200
          : 503;

    return successResponse(healthStatus, statusCode);
  } catch (error) {
    logger.error(
      'Health check failed',
      error instanceof Error ? error : new Error(String(error)),
    );
    return errorResponse('Health check failed', 500, 'INTERNAL_ERROR');
  }
}
