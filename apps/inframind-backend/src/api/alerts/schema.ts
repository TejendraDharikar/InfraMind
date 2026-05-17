import { z } from 'zod';

export const AlertStatusSchema = z.enum([
  'open',
  'acknowledged',
  'resolved',
  'closed',
]);
export const AlertSeveritySchema = z.enum(['info', 'warning', 'critical']);

// Schemas for validating incoming request payloads/queries
export const GetAlertsQuerySchema = z.object({
  serverId: z.string().optional(),
  severity: z.string().optional(),
  status: z.string().optional(),
  limit: z.coerce.number().default(100),
  offset: z.coerce.number().default(0),
});

export const CreateAlertBodySchema = z.object({
  serverId: z.string(),
  type: z.string(),
  message: z.string(),
  severity: AlertSeveritySchema,
  status: AlertStatusSchema,
});

export const UpdateAlertBodySchema = z.object({
  status: AlertStatusSchema.optional(),
  message: z.string().optional(),
  severity: AlertSeveritySchema.optional(),
});

// Types inferred from Schemas
export type GetAlertsQuery = z.infer<typeof GetAlertsQuerySchema>;
export type CreateAlertBody = z.infer<typeof CreateAlertBodySchema>;
export type UpdateAlertBody = z.infer<typeof UpdateAlertBodySchema>;
