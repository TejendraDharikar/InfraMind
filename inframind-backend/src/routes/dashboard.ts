import { Router, Request, Response } from 'express';
import prisma from '../db';

const router = Router();

// GET /api/dashboard/summary - Return dashboard summary
router.get('/summary', async (req: Request, res: Response) => {
  try {
    // Get total servers
    const totalServers = await prisma.server.count();

    // Get alerts by status
    const [openAlerts, criticalAlerts, warningAlerts] = await Promise.all([
      prisma.alert.count({ where: { status: 'open' } }),
      prisma.alert.count({ where: { severity: 'critical' } }),
      prisma.alert.count({ where: { severity: 'warning' } })
    ]);

    // Get server status distribution
    const [stableServers, unhealthyServers, offlineServers] = await Promise.all([
      prisma.server.count({ where: { status: 'stable' } }),
      prisma.server.count({ where: { status: 'unhealthy' } }),
      prisma.server.count({ where: { status: 'offline' } })
    ]);

    // Get metrics trend (last 24 hours)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentMetrics = await prisma.metric.findMany({
      where: {
        timestamp: {
          gte: twentyFourHoursAgo
        }
      },
      select: {
        cpuUsage: true,
        memoryUsage: true,
        networkUsage: true,
        diskUsage: true
      }
    });

    // Calculate average metrics
    const avgMetrics = {
      cpu: 0,
      memory: 0,
      network: 0,
      disk: 0
    };

    if (recentMetrics.length > 0) {
      const sumMetrics = recentMetrics.reduce(
        (acc, metric) => ({
          cpu: acc.cpu + metric.cpuUsage,
          memory: acc.memory + metric.memoryUsage,
          network: acc.network + metric.networkUsage,
          disk: acc.disk + metric.diskUsage
        }),
        { cpu: 0, memory: 0, network: 0, disk: 0 }
      );

      avgMetrics.cpu = Math.round((sumMetrics.cpu / recentMetrics.length) * 100) / 100;
      avgMetrics.memory = Math.round((sumMetrics.memory / recentMetrics.length) * 100) / 100;
      avgMetrics.network = Math.round((sumMetrics.network / recentMetrics.length) * 100) / 100;
      avgMetrics.disk = Math.round((sumMetrics.disk / recentMetrics.length) * 100) / 100;
    }

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalServers,
          totalAlerts: openAlerts,
          criticalAlerts,
          warningAlerts
        },
        serverStatus: {
          stable: stableServers,
          unhealthy: unhealthyServers,
          offline: offlineServers
        },
        metrics: {
          average: avgMetrics,
          recentDataPoints: recentMetrics.length
        }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard summary',
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
