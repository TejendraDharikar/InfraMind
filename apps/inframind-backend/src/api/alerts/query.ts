import prisma from '../../db';
import { GetAlertsQuery } from './schema';

export const alertsQuery = {
  getAlerts: async (query: GetAlertsQuery) => {
    const { serverId, severity, status, limit, offset } = query;
    const where: any = {};
    if (serverId) where.serverId = serverId;
    if (severity) where.severity = severity;
    if (status) where.status = status;

    const takeAmount = Math.min(limit, 1000);
    const [alerts, total] = await Promise.all([
      prisma.alert.findMany({
        where,
        include: { server: true },
        orderBy: { createdAt: 'desc' },
        take: takeAmount,
        skip: offset,
      }),
      prisma.alert.count({ where }),
    ]);

    return { alerts, total, limit: takeAmount, offset };
  },

  getAlertById: async (id: string) => {
    return prisma.alert.findUnique({
      where: { id },
      include: { server: true },
    });
  },
};
