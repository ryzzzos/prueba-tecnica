import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { requestLogger } from './middlewares/requestLogger.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { healthRoutes } from './routes/health.routes.js';
import { categoryRoutes } from './routes/category.routes.js';
import { promotionRoutes } from './routes/promotion.routes.js';

export const createApp = (): Express => {
  const app = express();

  // Core Middlewares
  app.use(
    cors({
      origin: env.CORS_ORIGIN === '*' ? '*' : env.CORS_ORIGIN.split(',').map((o) => o.trim()),
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  if (env.NODE_ENV !== 'test') {
    app.use(requestLogger);
  }

  // Healthcheck Route (Public root level)
  app.use('/health', healthRoutes);

  // API v1 Routes
  app.use('/api/v1/categories', categoryRoutes);
  app.use('/api/v1/promotions', promotionRoutes);

  // Welcome Route
  app.get('/', (_req: Request, res: Response) => {
    res.json({
      name: 'Promotions Management API',
      version: '1.0.0',
      status: 'online',
      endpoints: {
        health: '/health',
        categories: '/api/v1/categories',
        promotions: '/api/v1/promotions',
        summary: '/api/v1/promotions/summary',
      },
    });
  });

  // 404 Catch-All Handler
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      error: 'Not Found',
      message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
    });
  });

  // Global Error Handler
  app.use(errorHandler);

  return app;
};

export const app = createApp();
