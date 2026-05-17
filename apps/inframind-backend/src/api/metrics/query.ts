import prisma from '../../db';
import { GetMetricsQuery } from './schema';

export const metricsQuery = {
  getMetrics: async (query: GetMetricsQuery) => {
    const { serverId, limit, offset } = query;
    const where = serverId ? { serverId } : {};
    const takeAmount = Math.min(limit, 1000);

    const [metrics, total] = await Promise.all([
      prisma.metric.findMany({
        where,
        include: { server: true },
        orderBy: { timestamp: 'desc' },
        take: takeAmount,
        skip: offset,
      }),
      prisma.metric.count({ where }),
    ]);

    return { metrics, total, limit: takeAmount, offset };
  },

  getMetricById: async (id: string) => {
    return prisma.metric.findUnique({
      where: { id },
      include: { server: true },
    });
  },

  getLatestServerMetrics: async (serverId: string, limit = 24) => {
    const metrics = await prisma.metric.findMany({
      where: { serverId },
      orderBy: { timestamp: 'desc' },
      take: limit,
      include: { server: true },
    });
    return metrics.reverse();
  },
};
