import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import prisma from './db';
import { swaggerSpec } from './config/swagger';

import serversRouter from './api/servers';
import metricsRouter from './api/metrics';
import alertsRouter from './api/alerts';
import dashboardRouter from './routes/dashboard';
import webhooksRouter from './api/webhooks';

dotenv.config();

import http from 'http';
import { initSocket } from './socket';

const app: Express = express();
const port = process.env.PORT || 5000;
const httpServer = http.createServer(app);

// Initialize Socket.io
initSocket(httpServer);

// Middleware
app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
  }),
);
app.use(express.json());

// Swagger UI
app.use(
  '/api-docs',
  swaggerUi.serve as any,
  swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Inframind API Docs',
  }) as any,
);
app.get('/api-docs.json', (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

/** @openapi
 * /api/health:
 *   get:
 *     tags: [System]
 *     summary: Health check
 *     responses:
 *       200: { description: Server is healthy }
 */
app.get('/api/health', (req: Request, res: Response) => {
  res
    .status(200)
    .json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Mount route handlers
// Centralized router – all API routes are now defined in src/router.ts
import router from './router';
app.use('/api', router);

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Inframind Backend API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      servers: '/api/servers',
      metrics: '/api/metrics',
      alerts: '/api/alerts',
      dashboard: '/api/dashboard',
      webhooks: '/api/webhooks',
      docs: '/api-docs',
    },
  });
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    timestamp: new Date().toISOString(),
  });
});

// Start server
const server = httpServer.listen(port, () => {
  console.log(`\n🚀 Inframind Backend API`);
  console.log(`   Server:  http://localhost:${port}`);
  console.log(`   Swagger: http://localhost:${port}/api-docs`);
  console.log(`   Health:  http://localhost:${port}/api/health\n`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('\n🛑 SIGTERM received, shutting down gracefully...');
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('\n🛑 SIGINT received, shutting down gracefully...');
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
});
