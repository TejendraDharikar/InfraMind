import prisma from '../../db';
import { GetServersQuery } from './schema';

export const serversQuery = {
  getServers: async (query: GetServersQuery) => {
    const { status, limit, offset } = query;
    const where = status ? { status } : {};
    const takeAmount = Math.min(limit, 1000);

    const [servers, total] = await Promise.all([
      prisma.server.findMany({
        where,
        include: { metrics: { orderBy: { timestamp: 'desc' }, take: 1 } },
        orderBy: { name: 'asc' },
        take: takeAmount,
        skip: offset
      }),
      prisma.server.count({ where })
    ]);

    return { servers, total, limit: takeAmount, offset };
  },

  getServerById: async (id: string) => {
    return prisma.server.findUnique({
      where: { id },
      include: { metrics: { orderBy: { timestamp: 'desc' }, take: 10 }, alerts: { orderBy: { createdAt: 'desc' }, take: 5 } }
    });
  }
};
