import z from "zod";

// ==========================================
// 1. Server Schemas
// ==========================================
export const ServerStatusSchema = z.enum([
  "stable",
  "warning",
  "unhealthy",
  "offline",
]);

export const ServerSchema = z.object({
  id: z.string(),
  name: z.string(),
  hostName: z.string(),
  status: ServerStatusSchema,
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  userId: z.string().nullable().optional(),
  projectId: z.string().nullable().optional(),
});

export type TServerSchema = z.infer<typeof ServerSchema>;

export const CreateServerBodySchema = z.object({
  name: z.string(),
  hostName: z.string(),
  status: ServerStatusSchema.default("stable"),
});

export type TCreateServerBodySchema = z.infer<typeof CreateServerBodySchema>;

export const UpdateServerBodySchema = z.object({
  name: z.string().optional(),
  hostName: z.string().optional(),
  status: ServerStatusSchema.optional(),
});

export type TUpdateServerBodySchema = z.infer<typeof UpdateServerBodySchema>;

export const GetServersQuerySchema = z.object({
  status: ServerStatusSchema.optional(),
  limit: z.coerce.number().default(100).optional(),
  offset: z.coerce.number().default(0).optional(),
});

export type TGetServersQuerySchema = z.infer<typeof GetServersQuerySchema>;

export const ServerResponseSchema = z.object({
  success: z.boolean(),
  data: ServerSchema,
  message: z.string().optional(),
});

export type TServerResponseSchema = z.infer<typeof ServerResponseSchema>;

export const ServersListResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(ServerSchema),
  pagination: z.object({
    total: z.number(),
    limit: z.number(),
    offset: z.number(),
  }).optional(),
  timestamp: z.string().optional(),
});

export type TServersListResponseSchema = z.infer<
  typeof ServersListResponseSchema
>;

// ==========================================
// 2. Metric Schemas
// ==========================================
export const MetricSchema = z.object({
  id: z.string(),
  serverId: z.string(),
  timestamp: z.string(),
  cpuUsage: z.number(),
  memoryUsage: z.number(),
  networkUsage: z.number(),
  diskUsage: z.number(),
});

export type TMetricSchema = z.infer<typeof MetricSchema>;

export const CreateMetricBodySchema = z.object({
  serverId: z.string(),
  cpuUsage: z.number(),
  memoryUsage: z.number(),
  networkUsage: z.number(),
  diskUsage: z.number(),
});

export type TCreateMetricBodySchema = z.infer<typeof CreateMetricBodySchema>;

export const GetMetricsQuerySchema = z.object({
  serverId: z.string().optional(),
  limit: z.coerce.number().default(100).optional(),
  offset: z.coerce.number().default(0).optional(),
});

export type TGetMetricsQuerySchema = z.infer<typeof GetMetricsQuerySchema>;

export const MetricResponseSchema = z.object({
  success: z.boolean(),
  data: MetricSchema,
  message: z.string().optional(),
});

export type TMetricResponseSchema = z.infer<typeof MetricResponseSchema>;

export const MetricsListResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(MetricSchema),
  pagination: z.object({
    total: z.number(),
    limit: z.number(),
    offset: z.number(),
  }).optional(),
  timestamp: z.string().optional(),
});

export type TMetricsListResponseSchema = z.infer<
  typeof MetricsListResponseSchema
>;

export const LatestMetricsResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(MetricSchema),
  count: z.number().optional(),
  timestamp: z.string().optional(),
});

export type TLatestMetricsResponseSchema = z.infer<
  typeof LatestMetricsResponseSchema
>;

// ==========================================
// 3. Alert Schemas
// ==========================================
export const AlertStatusSchema = z.enum([
  "open",
  "acknowledged",
  "resolved",
  "closed",
]);

export const AlertSeveritySchema = z.enum(["info", "warning", "critical"]);

export const AlertSchema = z.object({
  id: z.string(),
  serverId: z.string(),
  type: z.string(),
  message: z.string(),
  severity: AlertSeveritySchema,
  status: AlertStatusSchema,
  createdAt: z.string(),
  resolvedAt: z.string().nullable().optional(),
  userId: z.string().nullable().optional(),
  server: ServerSchema.optional(),
});

export type TAlertSchema = z.infer<typeof AlertSchema>;

export const CreateAlertBodySchema = z.object({
  serverId: z.string(),
  type: z.string(),
  message: z.string(),
  severity: AlertSeveritySchema,
  status: AlertStatusSchema,
});

export type TCreateAlertBodySchema = z.infer<typeof CreateAlertBodySchema>;

export const UpdateAlertBodySchema = z.object({
  status: AlertStatusSchema.optional(),
  message: z.string().optional(),
  severity: AlertSeveritySchema.optional(),
});

export type TUpdateAlertBodySchema = z.infer<typeof UpdateAlertBodySchema>;

export const GetAlertsQuerySchema = z.object({
  serverId: z.string().optional(),
  severity: z.string().optional(),
  status: z.string().optional(),
  limit: z.coerce.number().default(100).optional(),
  offset: z.coerce.number().default(0).optional(),
});

export type TGetAlertsQuerySchema = z.infer<typeof GetAlertsQuerySchema>;

export const AlertResponseSchema = z.object({
  success: z.boolean(),
  data: AlertSchema,
  message: z.string().optional(),
});

export type TAlertResponseSchema = z.infer<typeof AlertResponseSchema>;

export const AlertsListResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(AlertSchema),
  pagination: z.object({
    total: z.number(),
    limit: z.number(),
    offset: z.number(),
  }).optional(),
  timestamp: z.string().optional(),
});

export type TAlertsListResponseSchema = z.infer<
  typeof AlertsListResponseSchema
>;

// ==========================================
// 4. Webhook Schemas
// ==========================================
export const WebhookSchema = z.object({
  id: z.string(),
  name: z.string(),
  url: z.string(),
  events: z.string(),
  isActive: z.boolean(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type TWebhookSchema = z.infer<typeof WebhookSchema>;

export const CreateWebhookBodySchema = z.object({
  name: z.string(),
  url: z.string().url(),
  events: z.string(),
  isActive: z.boolean().default(true).optional(),
});

export type TCreateWebhookBodySchema = z.infer<typeof CreateWebhookBodySchema>;

export const WebhookResponseSchema = z.object({
  success: z.boolean(),
  data: WebhookSchema,
  message: z.string().optional(),
});

export type TWebhookResponseSchema = z.infer<typeof WebhookResponseSchema>;

export const WebhooksListResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(WebhookSchema),
  timestamp: z.string().optional(),
});

export type TWebhooksListResponseSchema = z.infer<
  typeof WebhooksListResponseSchema
>;
