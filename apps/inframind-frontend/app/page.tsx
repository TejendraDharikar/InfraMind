"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "./components/DashboardLayout";
import StatCard from "./components/StatCard";
import ServerStatusGrid from "./components/ServerStatusGrid";
import MetricsChart from "./components/MetricsChart";
import Alerts from "./components/Alerts";
import DraggableDashboard from "./components/DraggableDashboard";
import { api, DashboardSummary, Server, Metric, Alert } from "./lib/api";
import { demoDashboardSummary, demoServers, generateDemoMetrics, demoAlerts } from "./lib/demo-data";
import { useSocket } from "./lib/useSocket";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [servers, setServers] = useState<Server[]>([]);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  const socket = useSocket();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Fetch initial data from real API
        const [sumData, srvData, altData] = await Promise.all([
          api.getDashboardSummary(),
          api.getServers(),
          api.getAlerts()
        ]);
        
        setSummary(sumData);
        setServers(srvData);
        setAlerts(altData);

        // Fetch metrics for the first server as default for the chart
        if (srvData.length > 0) {
          const metData = await api.getLatestMetrics(srvData[0].id);
          setMetrics(metData);
        }
        
        setIsError(false);
      } catch (error) {
        console.error("Failed to fetch real data, falling back to demo data:", error);
        setIsError(true);
        
        // Fallback to demo data
        setSummary(demoDashboardSummary);
        setServers(demoServers);
        setAlerts(demoAlerts);
        setMetrics(generateDemoMetrics(demoServers[0].id));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    // Removed polling: const interval = setInterval(fetchData, 30000);
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on('new_metric', (metric: Metric) => {
      setMetrics((prev) => {
        // Only add if it's for the currently viewed server (which we assume is servers[0] for MVP)
        // In a full app, we'd have a selectedServer state
        if (servers.length > 0 && metric.serverId === servers[0].id) {
          // Add new metric, keep only latest 24
          const newMetrics = [metric, ...prev];
          return newMetrics.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()).slice(-24);
        }
        return prev;
      });
      
      // Also update the server grid latest metric
      setServers((prev) => 
        prev.map(s => {
          if (s.id === metric.serverId) {
            return { ...s, metrics: [metric] };
          }
          return s;
        })
      );
    });

    socket.on('new_alert', (alert: Alert) => {
      setAlerts((prev) => [alert, ...prev].slice(0, 50));
      
      setSummary((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          summary: {
            ...prev.summary,
            totalAlerts: prev.summary.totalAlerts + 1,
            criticalAlerts: alert.severity === 'critical' ? prev.summary.criticalAlerts + 1 : prev.summary.criticalAlerts,
            warningAlerts: alert.severity === 'warning' ? prev.summary.warningAlerts + 1 : prev.summary.warningAlerts,
          }
        };
      });
    });

    socket.on('alert_updated', (updatedAlert: Alert) => {
      setAlerts((prev) => prev.map(a => a.id === updatedAlert.id ? updatedAlert : a).filter(a => a.status === 'open'));
    });

    socket.on('alert_deleted', (deletedAlertId: string) => {
      setAlerts((prev) => prev.filter(a => a.id !== deletedAlertId));
    });

    socket.on('server_updated', (updatedServer: Server) => {
      setServers((prev) => prev.map(s => s.id === updatedServer.id ? { ...updatedServer, metrics: s.metrics } : s));
    });

    return () => {
      socket.off('new_metric');
      socket.off('new_alert');
      socket.off('alert_updated');
      socket.off('alert_deleted');
      socket.off('server_updated');
    };
  }, [socket, servers]);

  return (
    <DashboardLayout>
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Infrastructure Overview</h1>
          <p className="text-slate-400">Monitor your system health and AI-detected anomalies.</p>
        </div>
        
        {isError && !isLoading && (
          <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 px-3 py-1.5 rounded-lg text-sm flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            Using Demo Data (Backend Offline)
          </div>
        )}
      </div>

      <DraggableDashboard>
        {{
          stats: (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard 
                title="Total Servers" 
                value={summary?.summary.totalServers ?? 0} 
                icon="🖥️" 
                isLoading={isLoading} 
              />
              <StatCard 
                title="Active Alerts" 
                value={summary?.summary.totalAlerts ?? 0} 
                icon="⚠️" 
                trend={{ value: "2", isPositive: false }} 
                isLoading={isLoading} 
              />
              <StatCard 
                title="Avg CPU Usage" 
                value={`${summary?.metrics.average.cpu ?? 0}%`} 
                icon="⚡" 
                trend={{ value: "5%", isPositive: true }} 
                isLoading={isLoading} 
              />
              <StatCard 
                title="Avg Memory Usage" 
                value={`${summary?.metrics.average.memory ?? 0}%`} 
                icon="🧠" 
                trend={{ value: "12%", isPositive: false }} 
                isLoading={isLoading} 
              />
            </div>
          ),
          chart: (
            <MetricsChart data={metrics} isLoading={isLoading} />
          ),
          alerts: (
            <Alerts alerts={alerts} isLoading={isLoading} />
          ),
          serverGrid: (
            <div className="h-full">
              <h2 className="text-lg font-semibold text-slate-100 mb-4">Server Status</h2>
              <ServerStatusGrid servers={servers} isLoading={isLoading} />
            </div>
          )
        }}
      </DraggableDashboard>
    </DashboardLayout>
  );
}
