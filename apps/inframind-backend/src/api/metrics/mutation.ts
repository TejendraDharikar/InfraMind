import prisma from '../../db';
import { CreateMetricBody } from './schema';
import { analyzeMetrics } from '../../services/anomaly';
import { getIo } from '../../socket';

export const metricsMutation = {
  createMetric: async (data: CreateMetricBody) => {
    const server = await prisma.server.findUnique({
      where: { id: data.serverId },
    });
    if (!server) throw new Error('Server not found');

    const metric = await prisma.metric.create({
      data,
      include: { server: true },
    });

    const anomalies = analyzeMetrics({
      cpuUsage: data.cpuUsage,
      memoryUsage: data.memoryUsage,
      networkUsage: data.networkUsage,
      diskUsage: data.diskUsage,
      serverName: server.name,
    });

    const generatedAlerts = [];
    for (const anomaly of anomalies) {
      const alert = await prisma.alert.create({
        data: {
          serverId: data.serverId,
          type: anomaly.type,
          message: anomaly.message,
          severity: anomaly.severity,
          status: 'open',
        },
      });
      generatedAlerts.push(alert);
      getIo().emit('new_alert', alert);
    }

    if (generatedAlerts.length > 0) {
      // Fire webhooks
      const activeWebhooks = await prisma.webhook.findMany({
        where: { isActive: true },
      });
      for (const webhook of activeWebhooks) {
        const hasCritical = generatedAlerts.some(
          (a) => a.severity === 'critical',
        );
        if (hasCritical || webhook.events.includes('all')) {
          try {
            fetch(webhook.url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                server: server.name,
                alerts: generatedAlerts,
              }),
            }).catch((e) =>
              console.error(`Webhook ${webhook.name} failed:`, e.message),
            );
          } catch (err) {
            console.error(`Failed to fire webhook ${webhook.name}`, err);
          }
        }
      }
    }

    if (anomalies.some((a) => a.severity === 'critical')) {
      const updatedServer = await prisma.server.update({
        where: { id: data.serverId },
        data: { status: 'unhealthy' },
      });
      getIo().emit('server_updated', updatedServer);
    }

    getIo().emit('new_metric', metric);

    return { metric, alerts: generatedAlerts };
  },
};
