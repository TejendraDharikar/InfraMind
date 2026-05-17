import express, { Router, Request, Response, NextFunction } from 'express';
import { initContract } from '@ts-rest/core';
import { initServer } from '@ts-rest/express';
import { createExpressEndpoints } from '@ts-rest/express';
import { z } from 'zod';
import * as controllers from './controllers';

/** ------------------------------------------------
 *  1️⃣ Define a ts‑rest contract – the single source of truth
 * ------------------------------------------------ */
const c = initContract();

// Simple schemas – replace with Zod/Zodios as needed
const IdParam = z.object({ id: z.string() });
const UserBody = z.object({
  id: z.string().optional(),
  email: z.string().email(),
  name: z.string().nullable().optional(),
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'MEMBER', 'VIEWER']),
});

export const apiContract = c.router({
  // Users
  getUsers: {
    method: 'GET',
    path: '/users',
    responses: { 200: z.array(UserBody) },
  },
  getUserById: {
    method: 'GET',
    path: '/users/:id',
    pathParams: IdParam,
    responses: { 200: UserBody, 404: z.null() },
  },
  createUser: {
    method: 'POST',
    path: '/users',
    body: UserBody,
    responses: { 201: UserBody },
  },
  updateUser: {
    method: 'PATCH',
    path: '/users/:id',
    pathParams: IdParam,
    body: UserBody,
    responses: { 200: UserBody },
  },
  deleteUser: {
    method: 'DELETE',
    path: '/users/:id',
    pathParams: IdParam,
    responses: { 204: z.null() },
  },

  // Projects – placeholder generic bodies
  getProjects: {
    method: 'GET',
    path: '/projects',
    responses: { 200: z.array(z.any()) },
  },
  getProjectById: {
    method: 'GET',
    path: '/projects/:id',
    pathParams: IdParam,
    responses: { 200: z.any() },
  },
  createProject: {
    method: 'POST',
    path: '/projects',
    body: z.any(),
    responses: { 201: z.any() },
  },
  updateProject: {
    method: 'PATCH',
    path: '/projects/:id',
    pathParams: IdParam,
    body: z.any(),
    responses: { 200: z.any() },
  },
  deleteProject: {
    method: 'DELETE',
    path: '/projects/:id',
    pathParams: IdParam,
    responses: { 204: z.null() },
  },

  // Subscriptions
  getSubscriptions: {
    method: 'GET',
    path: '/subscriptions',
    responses: { 200: z.array(z.any()) },
  },
  createSubscription: {
    method: 'POST',
    path: '/subscriptions',
    body: z.any(),
    responses: { 201: z.any() },
  },
  cancelSubscription: {
    method: 'DELETE',
    path: '/subscriptions/:id',
    pathParams: IdParam,
    responses: { 204: z.null() },
  },

  // Servers
  getServers: {
    method: 'GET',
    path: '/servers',
    responses: { 200: z.array(z.any()) },
  },
  getServerById: {
    method: 'GET',
    path: '/servers/:id',
    pathParams: IdParam,
    responses: { 200: z.any() },
  },
  createServer: {
    method: 'POST',
    path: '/servers',
    body: z.any(),
    responses: { 201: z.any() },
  },
  updateServer: {
    method: 'PATCH',
    path: '/servers/:id',
    pathParams: IdParam,
    body: z.any(),
    responses: { 200: z.any() },
  },
  deleteServer: {
    method: 'DELETE',
    path: '/servers/:id',
    pathParams: IdParam,
    responses: { 204: z.null() },
  },

  // Metrics
  getMetrics: {
    method: 'GET',
    path: '/metrics',
    responses: { 200: z.array(z.any()) },
  },
  createMetric: {
    method: 'POST',
    path: '/metrics',
    body: z.any(),
    responses: { 201: z.any() },
  },

  // Alerts
  getAlerts: {
    method: 'GET',
    path: '/alerts',
    responses: { 200: z.array(z.any()) },
  },
  createAlert: {
    method: 'POST',
    path: '/alerts',
    body: z.any(),
    responses: { 201: z.any() },
  },
  updateAlert: {
    method: 'PATCH',
    path: '/alerts/:id',
    pathParams: IdParam,
    body: z.any(),
    responses: { 200: z.any() },
  },
  deleteAlert: {
    method: 'DELETE',
    path: '/alerts/:id',
    pathParams: IdParam,
    responses: { 204: z.null() },
  },

  // Webhooks
  getWebhooks: {
    method: 'GET',
    path: '/webhooks',
    responses: { 200: z.array(z.any()) },
  },
  createWebhook: {
    method: 'POST',
    path: '/webhooks',
    body: z.any(),
    responses: { 201: z.any() },
  },
  updateWebhook: {
    method: 'PATCH',
    path: '/webhooks/:id',
    pathParams: IdParam,
    body: z.any(),
    responses: { 200: z.any() },
  },
  deleteWebhook: {
    method: 'DELETE',
    path: '/webhooks/:id',
    pathParams: IdParam,
    responses: { 204: z.null() },
  },
});
// Async wrapper to forward errors to Express error handler
const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };

// ==================== Middleware ====================
/**
 * Placeholder auth middleware. Replace with real authentication logic.
 */
const requireAuth = (req: Request, _res: Response, next: NextFunction) => {
  // TODO: verify JWT / session
  next();
};

/**
 * Placeholder admin‑role guard.
 */
const requireAdmin = (req: Request, _res: Response, next: NextFunction) => {
  // TODO: verify admin role
  next();
};

// Build the ts-rest server – map contract directly to controllers
const server = initServer().router(apiContract, {
  // Users
  getUsers: controllers.getUsers as any,
  getUserById: controllers.getUserById as any,
  createUser: controllers.createUser as any,
  updateUser: controllers.updateUser as any,
  deleteUser: controllers.deleteUser as any,

  // Projects
  getProjects: controllers.getProjects as any,
  getProjectById: controllers.getProjectById as any,
  createProject: controllers.createProject as any,
  updateProject: controllers.updateProject as any,
  deleteProject: controllers.deleteProject as any,

  // Subscriptions
  getSubscriptions: controllers.getSubscriptions as any,
  createSubscription: controllers.createSubscription as any,
  cancelSubscription: controllers.cancelSubscription as any,

  // Servers
  getServers: controllers.getServers as any,
  getServerById: controllers.getServerById as any,
  createServer: controllers.createServer as any,
  updateServer: controllers.updateServer as any,
  deleteServer: controllers.deleteServer as any,

  // Metrics
  getMetrics: controllers.getMetrics as any,
  createMetric: controllers.createMetric as any,

  // Alerts
  getAlerts: controllers.getAlerts as any,
  createAlert: controllers.createAlert as any,
  updateAlert: controllers.updateAlert as any,
  deleteAlert: controllers.deleteAlert as any,

  // Webhooks
  getWebhooks: controllers.getWebhooks as any,
  createWebhook: controllers.createWebhook as any,
  updateWebhook: controllers.updateWebhook as any,
  deleteWebhook: controllers.deleteWebhook as any,
});

/** ------------------------------------------------
 *  4️⃣ Export an Express Router for the main app to mount
 * ------------------------------------------------ */
const router: Router = express.Router();

// Apply global and per-resource middlewares on the Express router
router.use('/users', requireAuth);
router.post('/users', requireAdmin);
router.patch('/users', requireAdmin);
router.delete('/users', requireAdmin);

createExpressEndpoints(apiContract, server, router);
export default router;
