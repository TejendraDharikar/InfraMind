"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";
import MetricsChart from "../components/MetricsChart";
import { api, Server, Metric } from "../lib/api";
import { demoServers, generateDemoMetrics } from "../lib/demo-data";
import { useSocket } from "../lib/useSocket";

export default function MetricsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [servers, setServers] = useState<Server[]>([]);
  const [selectedServerId, setSelectedServerId] = useState<string>("");
  const [metrics, setMetrics] = useState<Metric[]>([]);

  const socket = useSocket();

  useEffect(() => {
    const initData = async () => {
      try {
        setIsLoading(true);
        const serverData = await api.getServers();
        setServers(serverData);
        if (serverData.length > 0) {
          setSelectedServerId(serverData[0].id);
        }
      } catch (error) {
        console.error("Failed to fetch servers, using demo data", error);
        setServers(demoServers);
        setSelectedServerId(demoServers[0].id);
      } finally {
        setIsLoading(false);
      }
    };
    initData();
  }, []);

  useEffect(() => {
    if (!selectedServerId) return;

    const fetchMetrics = async () => {
      try {
        const metricData = await api.getLatestMetrics(selectedServerId);
        setMetrics(metricData);
      } catch (error) {
        console.error("Failed to fetch metrics, using demo data", error);
        setMetrics(generateDemoMetrics(selectedServerId));
      }
    };

    fetchMetrics();
  }, [selectedServerId]);

  useEffect(() => {
    if (!socket || !selectedServerId) return;
    
    socket.on('new_metric', (metric: Metric) => {
      if (metric.serverId === selectedServerId) {
        setMetrics((prev) => {
          const newMetrics = [metric, ...prev];
          return newMetrics.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()).slice(-24);
        });
      }
    });

    return () => {
      socket.off('new_metric');
    };
  }, [socket, selectedServerId]);

  return (
    <DashboardLayout>
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Metrics Explorer</h1>
          <p className="text-slate-400">Deep-dive into server performance and historical resource utilization.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-slate-300">Target Server:</label>
          <select 
            value={selectedServerId}
            onChange={(e) => setSelectedServerId(e.target.value)}
            disabled={isLoading || servers.length === 0}
            className="bg-navy-800 border border-white/10 text-slate-200 text-sm rounded-lg px-4 py-2 focus:outline-none focus:border-electric-blue/50 w-48"
          >
            {servers.length === 0 && <option value="">No servers available</option>}
            {servers.map(server => (
              <option key={server.id} value={server.id}>{server.name} ({server.hostName})</option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-6">
        {/* Main Combined Chart */}
        <MetricsChart data={metrics} isLoading={isLoading || !selectedServerId} />

        {/* Detailed Data Grid */}
        <div className="glass-card overflow-hidden mt-8">
          <div className="px-6 py-4 border-b border-white/5 bg-white/[0.02] flex justify-between items-center">
            <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              <span className="text-electric-cyan">📊</span> Raw Telemetry Log
            </h3>
            <span className="text-xs font-mono text-slate-500 bg-navy-900 px-2 py-1 rounded border border-white/5">
              {metrics.length} Data Points
            </span>
          </div>
          
          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-navy-800/90 backdrop-blur-md z-10">
                <tr className="border-b border-white/5">
                  <th className="py-3 px-6 font-semibold text-slate-300 text-sm">Timestamp</th>
                  <th className="py-3 px-6 font-semibold text-slate-300 text-sm">CPU Usage</th>
                  <th className="py-3 px-6 font-semibold text-slate-300 text-sm">Memory Usage</th>
                  <th className="py-3 px-6 font-semibold text-slate-300 text-sm">Disk Usage</th>
                  <th className="py-3 px-6 font-semibold text-slate-300 text-sm">Network I/O</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {metrics.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500">No telemetry data found for this server.</td>
                  </tr>
                ) : (
                  [...metrics].sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map((m) => (
                    <tr key={m.id} className="hover:bg-white/[0.02] transition-colors font-mono text-sm">
                      <td className="py-3 px-6 text-slate-400">
                        {new Date(m.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </td>
                      <td className={`py-3 px-6 ${m.cpuUsage > 80 ? 'text-red-400' : 'text-slate-300'}`}>
                        {m.cpuUsage.toFixed(2)}%
                      </td>
                      <td className={`py-3 px-6 ${m.memoryUsage > 80 ? 'text-red-400' : 'text-slate-300'}`}>
                        {m.memoryUsage.toFixed(2)}%
                      </td>
                      <td className={`py-3 px-6 ${m.diskUsage > 90 ? 'text-red-400' : 'text-slate-300'}`}>
                        {m.diskUsage.toFixed(2)}%
                      </td>
                      <td className="py-3 px-6 text-slate-300">
                        {m.networkUsage.toFixed(2)} MB/s
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
