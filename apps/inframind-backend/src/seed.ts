import prisma from './db';

/**
 * Seed script — populates the database with demo data
 * Run with: npm run seed
 */

async function main() {
  console.log('🌱 Seeding Inframind database...\n');

  // Clear existing data
  await prisma.alert.deleteMany();
  await prisma.metric.deleteMany();
  await prisma.server.deleteMany();
  console.log('  ✓ Cleared existing data');

  // Create demo servers
  const servers = await Promise.all([
    prisma.server.create({
      data: { name: 'web-prod-01', hostName: '10.0.1.10', status: 'stable' },
    }),
    prisma.server.create({
      data: { name: 'api-prod-01', hostName: '10.0.1.20', status: 'stable' },
    }),
    prisma.server.create({
      data: { name: 'db-primary', hostName: '10.0.2.10', status: 'unhealthy' },
    }),
    prisma.server.create({
      data: { name: 'cache-redis-01', hostName: '10.0.3.10', status: 'stable' },
    }),
  ]);
  console.log(`  ✓ Created ${servers.length} servers`);

  // Generate 24 hours of metrics (one per hour per server)
  const now = new Date();
  let metricCount = 0;

  for (const server of servers) {
    for (let hour = 23; hour >= 0; hour--) {
      const timestamp = new Date(now.getTime() - hour * 60 * 60 * 1000);
      const timeOfDay = timestamp.getHours();

      // Simulate realistic usage patterns
      const baseLoad = server.name.includes('db')
        ? 55
        : server.name.includes('api')
          ? 40
          : server.name.includes('web')
            ? 35
            : 25;
      const peakMultiplier =
        timeOfDay >= 9 && timeOfDay <= 17
          ? 1.4
          : timeOfDay >= 18 && timeOfDay <= 22
            ? 1.2
            : 0.7;
      const jitter = () => (Math.random() - 0.5) * 15;

      // DB server spikes at hours 14-16 to create anomaly data
      const dbSpike =
        server.name.includes('db') && timeOfDay >= 14 && timeOfDay <= 16
          ? 25
          : 0;

      await prisma.metric.create({
        data: {
          serverId: server.id,
          timestamp,
          cpuUsage: Math.min(
            100,
            Math.max(5, baseLoad * peakMultiplier + jitter() + dbSpike),
          ),
          memoryUsage: Math.min(
            100,
            Math.max(
              10,
              (baseLoad + 15) * peakMultiplier + jitter() + dbSpike * 0.8,
            ),
          ),
          networkUsage: Math.min(
            100,
            Math.max(2, (baseLoad - 10) * peakMultiplier + jitter()),
          ),
          diskUsage: Math.min(
            100,
            Math.max(
              20,
              45 + (server.name.includes('db') ? 25 : 0) + jitter() * 0.3,
            ),
          ),
        },
      });
      metricCount++;
    }
  }
  console.log(
    `  ✓ Created ${metricCount} metric data points (24h × ${servers.length} servers)`,
  );

  // Create demo alerts
  const dbServer = servers.find((s) => s.name.includes('db'))!;
  const webServer = servers.find((s) => s.name.includes('web'))!;
  const apiServer = servers.find((s) => s.name.includes('api'))!;

  const alerts = await Promise.all([
    prisma.alert.create({
      data: {
        serverId: dbServer.id,
        type: 'cpu',
        message:
          '🔴 Critical: CPU usage at 92.3% on db-primary. Immediate action recommended — consider scaling resources or investigating runaway processes.',
        severity: 'critical',
        status: 'open',
      },
    }),
    prisma.alert.create({
      data: {
        serverId: dbServer.id,
        type: 'memory',
        message:
          '🔴 Critical: Memory usage at 88.7% on db-primary. Risk of OOM kills. Review memory allocation.',
        severity: 'critical',
        status: 'open',
      },
    }),
    prisma.alert.create({
      data: {
        serverId: dbServer.id,
        type: 'anomaly',
        message:
          '🧠 AI Insight: 3 metrics elevated simultaneously on db-primary. This pattern suggests a resource contention issue — consider reviewing active workloads.',
        severity: 'critical',
        status: 'open',
      },
    }),
    prisma.alert.create({
      data: {
        serverId: webServer.id,
        type: 'cpu',
        message:
          '⚠️ Warning: CPU usage at 73.5% on web-prod-01. Monitor closely — may require attention if trend continues.',
        severity: 'warning',
        status: 'open',
      },
    }),
    prisma.alert.create({
      data: {
        serverId: apiServer.id,
        type: 'network',
        message:
          '⚠️ Warning: Unusual network traffic pattern detected on api-prod-01. Review recent deployment changes.',
        severity: 'warning',
        status: 'acknowledged',
      },
    }),
    prisma.alert.create({
      data: {
        serverId: webServer.id,
        type: 'disk',
        message:
          '⚠️ Warning: Disk usage at 78.2% on web-prod-01. Consider cleaning old logs and temporary files.',
        severity: 'warning',
        status: 'open',
      },
    }),
    prisma.alert.create({
      data: {
        serverId: apiServer.id,
        type: 'cpu',
        message:
          '✅ Resolved: CPU spike on api-prod-01 has normalized after auto-scaling event.',
        severity: 'info',
        status: 'resolved',
        resolvedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
      },
    }),
  ]);
  console.log(`  ✓ Created ${alerts.length} alerts`);

  console.log('\n✅ Seed complete!');
  console.log(
    `   ${servers.length} servers | ${metricCount} metrics | ${alerts.length} alerts\n`,
  );
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
