"use client";

import { useState, useEffect, useMemo } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { api, Alert } from "../lib/api";
import { demoAlerts } from "../lib/demo-data";
import { useSocket } from "../lib/useSocket";

export default function AlertsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const socket = useSocket();

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setIsLoading(true);
        // getAllAlerts includes resolved ones in this theoretical view, but currently our endpoint
        // returns all anyway if no status query is provided.
        const data = await api.getAllAlerts();
        setAlerts(data);
      } catch (error) {
        console.error("Failed to fetch real alerts, using demo data", error);
        setAlerts(demoAlerts);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAlerts();
  }, []);

  useEffect(() => {
    if (!socket) return;
    
    socket.on('new_alert', (alert: Alert) => {
      setAlerts((prev) => [alert, ...prev]);
    });
    socket.on('alert_updated', (updatedAlert: Alert) => {
      setAlerts((prev) => prev.map(a => a.id === updatedAlert.id ? updatedAlert : a));
    });
    socket.on('alert_deleted', (deletedAlertId: string) => {
      setAlerts((prev) => prev.filter(a => a.id !== deletedAlertId));
    });

    return () => {
      socket.off('new_alert');
      socket.off('alert_updated');
      socket.off('alert_deleted');
    };
  }, [socket]);

  const handleResolve = async (id: string) => {
    try {
      setResolvingId(id);
      await api.resolveAlert(id);
      // We don't necessarily need to manually update state here because
      // the websocket 'alert_updated' event will catch it and update the UI.
    } catch (err) {
      console.error("Failed to resolve alert", err);
    } finally {
      setResolvingId(null);
    }
  };

  const filteredAlerts = useMemo(() => {
    return alerts.filter(alert => {
      const matchesStatus = statusFilter === "all" || alert.status === statusFilter;
      const matchesSeverity = severityFilter === "all" || alert.severity === severityFilter;
      return matchesStatus && matchesSeverity;
    });
  }, [alerts, statusFilter, severityFilter]);

  const getSeverityConfig = (severity: string, type: string) => {
    if (type === 'anomaly') {
      return { icon: "🧠", color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" };
    }
    switch (severity) {
      case "critical": return { icon: "🔴", color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" };
      case "warning": return { icon: "⚠️", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" };
      case "info": return { icon: "ℹ️", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" };
      default: return { icon: "🔔", color: "text-slate-400", bg: "bg-slate-500/10", border: "border-slate-500/20" };
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Alerts & Incidents</h1>
          <p className="text-slate-400">Manage and resolve system anomalies and notifications.</p>
        </div>
        
        <div className="flex gap-3">
          <select 
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-navy-800 border border-white/10 text-slate-200 text-sm rounded-lg px-4 py-2 focus:outline-none focus:border-electric-blue/50"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="warning">Warning</option>
            <option value="info">Info</option>
          </select>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-navy-800 border border-white/10 text-slate-200 text-sm rounded-lg px-4 py-2 focus:outline-none focus:border-electric-blue/50"
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="acknowledged">Acknowledged</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-10 text-slate-500">Loading alerts...</div>
        ) : filteredAlerts.length === 0 ? (
          <div className="glass-card flex flex-col items-center justify-center text-slate-500 p-12 text-center">
            <span className="text-5xl mb-4">✨</span>
            <p className="text-xl font-semibold text-slate-300">All clear!</p>
            <p className="mt-2">No alerts match your current filters.</p>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const config = getSeverityConfig(alert.severity, alert.type);
            const isResolved = alert.status === 'resolved' || alert.status === 'closed';
            
            return (
              <div key={alert.id} className={`glass-card p-5 flex flex-col md:flex-row md:items-center gap-5 transition-all ${isResolved ? 'opacity-60' : ''}`}>
                <div className={`w-12 h-12 shrink-0 rounded-xl border ${config.bg} ${config.border} flex items-center justify-center text-2xl`}>
                  {config.icon}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded border ${config.bg} ${config.border} ${config.color} uppercase tracking-wider`}>
                      {alert.type}
                    </span>
                    <span className="text-slate-400 text-xs">
                      {new Date(alert.createdAt).toLocaleString()}
                    </span>
                    {isResolved && (
                      <span className="text-emerald-400 text-xs flex items-center gap-1 font-medium bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        ✓ RESOLVED
                      </span>
                    )}
                  </div>
                  <p className={`text-lg ${isResolved ? 'text-slate-300 line-through' : 'text-slate-100 font-medium'}`}>
                    {alert.message}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-sm font-mono text-slate-500 bg-navy-900 px-3 py-1.5 rounded-lg border border-white/5">
                    Server: {alert.serverId}
                  </span>
                  
                  {!isResolved && (
                    <button 
                      onClick={() => handleResolve(alert.id)}
                      disabled={resolvingId === alert.id}
                      className="bg-emerald-500 hover:bg-emerald-400 text-navy-900 font-semibold px-4 py-2 rounded-lg transition-colors shadow-[0_0_15px_rgba(16,185,129,0.3)] disabled:opacity-50 flex items-center gap-2"
                    >
                      {resolvingId === alert.id ? "Resolving..." : "Resolve"}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </DashboardLayout>
  );
}
