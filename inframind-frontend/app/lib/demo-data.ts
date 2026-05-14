import { Server, Metric, Alert, DashboardSummary } from "./api";

const now = new Date();
const timeMinus = (minutes: number) => new Date(now.getTime() - minutes * 60000).toISOString();

export const demoServers: Server[] = [
  { id: "srv-1", name: "web-prod-01", hostName: "10.0.1.10", status: "stable" },
  { id: "srv-2", name: "api-prod-01", hostName: "10.0.1.20", status: "stable" },
  { id: "srv-3", name: "db-primary", hostName: "10.0.2.10", status: "unhealthy" },
  { id: "srv-4", name: "cache-redis-01", hostName: "10.0.3.10", status: "stable" },
];

export const generateDemoMetrics = (serverId: string): Metric[] => {
  const metrics: Metric[] = [];
  const baseLoad = serverId.includes("db") ? 60 : 30;

  for (let i = 23; i >= 0; i--) {
    const isAnomaly = serverId.includes("db") && i < 3;
    metrics.push({
      id: `met-${serverId}-${i}`,
      serverId,
      timestamp: timeMinus(i * 60),
      cpuUsage: isAnomaly ? 90 + Math.random() * 8 : baseLoad + Math.random() * 15,
      memoryUsage: isAnomaly ? 85 + Math.random() * 10 : baseLoad + 10 + Math.random() * 10,
      networkUsage: baseLoad - 10 + Math.random() * 20,
      diskUsage: serverId.includes("db") ? 75 : 40,
    });
  }
  return metrics;
};

export const demoAlerts: Alert[] = [
  {
    id: "alt-1",
    serverId: "srv-3",
    type: "cpu",
    message: "🔴 Critical: CPU usage at 94.2% on db-primary. Immediate action recommended.",
    severity: "critical",
    status: "open",
    createdAt: timeMinus(5),
  },
  {
    id: "alt-2",
    serverId: "srv-3",
    type: "anomaly",
    message: "🧠 AI Insight: 3 metrics elevated simultaneously on db-primary. Resource contention likely.",
    severity: "critical",
    status: "open",
    createdAt: timeMinus(10),
  },
  {
    id: "alt-3",
    serverId: "srv-1",
    type: "memory",
    message: "⚠️ Warning: Memory usage at 78% on web-prod-01. Monitor closely.",
    severity: "warning",
    status: "open",
    createdAt: timeMinus(45),
  },
];

export const demoDashboardSummary: DashboardSummary = {
  summary: { totalServers: 4, totalAlerts: 3, criticalAlerts: 2, warningAlerts: 1 },
  serverStatus: { stable: 3, unhealthy: 1, offline: 0 },
  metrics: {
    average: { cpu: 42.5, memory: 58.2, network: 28.1, disk: 48.9 },
    recentDataPoints: 96,
  },
};
