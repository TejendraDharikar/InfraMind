import { Router, Request, Response } from 'express';
import prisma from '../db';

const router = Router();

/** @openapi
 * /api/dashboard/summary:
 *   get:
 *     tags: [Dashboard]
 *     summary: Dashboard summary
 *     description: Returns server counts, alert breakdown, status distribution, and 24h average metrics
 *     responses:
 *       200: { description: Dashboard summary data }
 */
router.get('/summary', async (req: Request, res: Response) => {
  try {
    const totalServers = await prisma.server.count();
    const [openAlerts, criticalAlerts, warningAlerts] = await Promise.all([
      prisma.alert.count({ where: { status: 'open' } }),
      prisma.alert.count({ where: { severity: 'critical', status: 'open' } }),
      prisma.alert.count({ where: { severity: 'warning', status: 'open' } })
    ]);

    const [stableServers, unhealthyServers, offlineServers] = await Promise.all([
      prisma.server.count({ where: { status: 'stable' } }),
      prisma.server.count({ where: { status: 'unhealthy' } }),
      prisma.server.count({ where: { status: 'offline' } })
    ]);

    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentMetrics = await prisma.metric.findMany({
      where: { timestamp: { gte: twentyFourHoursAgo } },
      select: { cpuUsage: true, memoryUsage: true, networkUsage: true, diskUsage: true }
    });

    const avgMetrics = { cpu: 0, memory: 0, network: 0, disk: 0 };
    if (recentMetrics.length > 0) {
      const sum = recentMetrics.reduce((acc, m) => ({
        cpu: acc.cpu + m.cpuUsage, memory: acc.memory + m.memoryUsage,
        network: acc.network + m.networkUsage, disk: acc.disk + m.diskUsage
      }), { cpu: 0, memory: 0, network: 0, disk: 0 });
      avgMetrics.cpu = Math.round((sum.cpu / recentMetrics.length) * 100) / 100;
      avgMetrics.memory = Math.round((sum.memory / recentMetrics.length) * 100) / 100;
      avgMetrics.network = Math.round((sum.network / recentMetrics.length) * 100) / 100;
      avgMetrics.disk = Math.round((sum.disk / recentMetrics.length) * 100) / 100;
    }

    res.status(200).json({
      success: true,
      data: {
        summary: { totalServers, totalAlerts: openAlerts, criticalAlerts, warningAlerts },
        serverStatus: { stable: stableServers, unhealthy: unhealthyServers, offline: offlineServers },
        metrics: { average: avgMetrics, recentDataPoints: recentMetrics.length }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch dashboard summary', timestamp: new Date().toISOString() });
  }
});

export default router;
