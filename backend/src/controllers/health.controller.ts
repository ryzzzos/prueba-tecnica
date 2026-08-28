import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';

export const getHealth = async (_req: Request, res: Response): Promise<void> => {
  const startTime = Date.now();

  try {
    // Perform active ping query to PostgreSQL database
    await prisma.$queryRaw`SELECT 1`;
    const responseTimeMs = Date.now() - startTime;

    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: {
        database: {
          status: 'connected',
          latencyMs: responseTimeMs,
        },
      },
    });
  } catch (error) {
    console.error('[ERROR] Healthcheck failed - Database unreachable:', error);
    res.status(503).json({
      status: 'degraded',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: {
        database: {
          status: 'disconnected',
          error: error instanceof Error ? error.message : 'Unknown database error',
        },
      },
    });
  }
};
