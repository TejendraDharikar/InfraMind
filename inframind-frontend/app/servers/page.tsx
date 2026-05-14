"use client";

import { useState, useEffect, useMemo } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { api, Server } from "../lib/api";
import { demoServers } from "../lib/demo-data";
import { useSocket } from "../lib/useSocket";

export default function ServersPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [servers, setServers] = useState<Server[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const socket = useSocket();

  useEffect(() => {
    const fetchServers = async () => {
      try {
        setIsLoading(true);
        const data = await api.getServers();
        setServers(data);
      } catch (error) {
        console.error("Failed to fetch real servers, using demo data", error);
        setServers(demoServers);
      } finally {
        setIsLoading(false);
      }
    };
    fetchServers();
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on('server_updated', (updatedServer: Server) => {
      setServers((prev) => prev.map(s => s.id === updatedServer.id ? { ...updatedServer, metrics: s.metrics } : s));
    });
    return () => {
      socket.off('server_updated');
    };
  }, [socket]);

  const filteredServers = useMemo(() => {
    return servers.filter(server => {
      const matchesSearch = server.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            server.hostName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || server.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [servers, searchTerm, statusFilter]);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "stable": return { bg: "bg-emerald-500/10", border: "border-emerald-500/20", text: "text-emerald-400", dot: "bg-emerald-500 animate-pulse" };
      case "warning": return { bg: "bg-amber-500/10", border: "border-amber-500/20", text: "text-amber-400", dot: "bg-amber-500 animate-pulse" };
      case "unhealthy": return { bg: "bg-red-500/10", border: "border-red-500/20", text: "text-red-400", dot: "bg-red-500 animate-pulse" };
      default: return { bg: "bg-slate-500/10", border: "border-slate-500/20", text: "text-slate-400", dot: "bg-slate-500" };
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Server Inventory</h1>
          <p className="text-slate-400">View and manage all your tracked infrastructure.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
            <input
              type="text"
              placeholder="Search servers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 bg-navy-800 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm text-slate-200 focus:outline-none focus:border-electric-blue/50 focus:ring-1 focus:ring-electric-blue/50 transition-all"
            />
          </div>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-navy-800 border border-white/10 text-slate-200 text-sm rounded-lg px-4 py-2 focus:outline-none focus:border-electric-blue/50 focus:ring-1 focus:ring-electric-blue/50"
          >
            <option value="all">All Statuses</option>
            <option value="stable">Stable</option>
            <option value="warning">Warning</option>
            <option value="unhealthy">Unhealthy</option>
            <option value="offline">Offline</option>
          </select>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="py-4 px-6 font-semibold text-slate-300 text-sm">Server Name</th>
                <th className="py-4 px-6 font-semibold text-slate-300 text-sm">Host IP</th>
                <th className="py-4 px-6 font-semibold text-slate-300 text-sm">Status</th>
                <th className="py-4 px-6 font-semibold text-slate-300 text-sm">CPU</th>
                <th className="py-4 px-6 font-semibold text-slate-300 text-sm">Memory</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-500">Loading servers...</td>
                </tr>
              ) : filteredServers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-500">No servers found matching your criteria.</td>
                </tr>
              ) : (
                filteredServers.map((server) => {
                  const config = getStatusConfig(server.status);
                  const latest = server.metrics?.[0];
                  
                  return (
                    <tr key={server.id} className="hover:bg-white/[0.02] transition-colors cursor-pointer group">
                      <td className="py-4 px-6">
                        <div className="font-medium text-slate-200 group-hover:text-electric-blue transition-colors">
                          {server.name}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-slate-400 font-mono text-sm">
                        {server.hostName}
                      </td>
                      <td className="py-4 px-6">
                        <div className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border items-center gap-1.5 ${config.bg} ${config.border} ${config.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`}></span>
                          {server.status.charAt(0).toUpperCase() + server.status.slice(1)}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-slate-300">
                        {latest ? (
                          <div className="flex items-center gap-2">
                            <span className="w-12">{latest.cpuUsage.toFixed(1)}%</span>
                            <div className="w-24 h-1.5 bg-navy-900 rounded-full overflow-hidden">
                              <div className="h-full bg-electric-blue" style={{ width: `${Math.min(latest.cpuUsage, 100)}%` }}></div>
                            </div>
                          </div>
                        ) : '—'}
                      </td>
                      <td className="py-4 px-6 text-slate-300">
                        {latest ? (
                          <div className="flex items-center gap-2">
                            <span className="w-12">{latest.memoryUsage.toFixed(1)}%</span>
                            <div className="w-24 h-1.5 bg-navy-900 rounded-full overflow-hidden">
                              <div className="h-full bg-electric-cyan" style={{ width: `${Math.min(latest.memoryUsage, 100)}%` }}></div>
                            </div>
                          </div>
                        ) : '—'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
