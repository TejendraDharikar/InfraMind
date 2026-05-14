export interface Server {
  id: string;
  name: string;
  hostName: string;
  status: "stable" | "unhealthy" | "offline";
  metrics?: Metric[];
  alerts?: Alert[];
}

export interface Metric {
  id: string;
  serverId: string;
  timestamp: string;
  cpuUsage: number;
  memoryUsage: number;
  networkUsage: number;
  diskUsage: number;
}

export interface Alert {
  id: string;
  serverId: string;
  type: string;
  message: string;
  severity: "info" | "warning" | "critical";
  status: "open" | "acknowledged" | "resolved" | "closed";
  createdAt: string;
  resolvedAt?: string | null;
}

export interface DashboardSummary {
  summary: {
    totalServers: number;
    totalAlerts: number;
    criticalAlerts: number;
    warningAlerts: number;
  };
  serverStatus: {
    stable: number;
    unhealthy: number;
    offline: number;
  };
  metrics: {
    average: {
      cpu: number;
      memory: number;
      network: number;
      disk: number;
    };
    recentDataPoints: number;
  };
}

const API_BASE = "/api";

async function fetcher<T>(endpoint: string): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }
  const json = await res.json();
  if (!json.success) {
    throw new Error(json.error || "Unknown API error");
  }
  return json.data;
}

export const api = {
  getDashboardSummary: () => fetcher<DashboardSummary>("/dashboard/summary"),
  getServers: () => fetcher<Server[]>("/servers"),
  getLatestMetrics: (serverId: string) => fetcher<Metric[]>(`/metrics/server/${serverId}/latest`),
  getAllMetrics: (serverId?: string) => fetcher<Metric[]>(`/metrics${serverId ? `?serverId=${serverId}` : ''}`),
  getAlerts: () => fetcher<Alert[]>("/alerts?status=open"),
  getAllAlerts: () => fetcher<Alert[]>("/alerts"),
  
  resolveAlert: async (id: string) => {
    const res = await fetch(`${API_BASE}/alerts/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "resolved" })
    });
    if (!res.ok) throw new Error("Failed to resolve alert");
    return res.json();
  },

  // Webhooks
  getWebhooks: () => fetcher<any[]>("/webhooks"),
  createWebhook: async (data: { name: string, url: string, events: string }) => {
    const res = await fetch(`${API_BASE}/webhooks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("Failed to create webhook");
    return res.json();
  },
  deleteWebhook: async (id: string) => {
    const res = await fetch(`${API_BASE}/webhooks/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete webhook");
    return res.json();
  },
  toggleWebhook: async (id: string) => {
    const res = await fetch(`${API_BASE}/webhooks/${id}/toggle`, { method: "PUT" });
    if (!res.ok) throw new Error("Failed to toggle webhook");
    return res.json();
  }
};
