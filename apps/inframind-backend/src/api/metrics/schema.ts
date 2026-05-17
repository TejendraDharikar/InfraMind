import { z } from 'zod';

export const GetMetricsQuerySchema = z.object({
  serverId: z.string().optional(),
  limit: z.coerce.number().default(100),
  offset: z.coerce.number().default(0),
});

export const CreateMetricBodySchema = z.object({
  serverId: z.string(),
  cpuUsage: z.number(),
  memoryUsage: z.number(),
  networkUsage: z.number(),
  diskUsage: z.number(),
});

export type GetMetricsQuery = z.infer<typeof GetMetricsQuerySchema>;
export type CreateMetricBody = z.infer<typeof CreateMetricBodySchema>;
