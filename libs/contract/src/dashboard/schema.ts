import z from "zod";

export const DashboardSummarySchema = z.object({
  summary: z.object({
    totalServers: z.number(),
    totalAlerts: z.number(),
    criticalAlerts: z.number(),
    warningAlerts: z.number(),
  }),
  serverStatus: z.object({
    stable: z.number(),
    unhealthy: z.number(),
    offline: z.number(),
  }),
  metrics: z.object({
    average: z.object({
      cpu: z.number(),
      memory: z.number(),
      network: z.number(),
      disk: z.number(),
    }),
    recentDataPoints: z.number(),
  }),
});

export type TDashboardSummarySchema = z.infer<typeof DashboardSummarySchema>;