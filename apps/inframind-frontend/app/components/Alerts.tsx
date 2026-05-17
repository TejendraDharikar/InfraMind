import { Alert } from "../lib/api";

interface AlertsProps {
  alerts: Alert[];
  isLoading?: boolean;
}

export default function Alerts({ alerts, isLoading }: AlertsProps) {
  if (isLoading) {
    return (
      <div className="glass-card p-6 h-[400px] flex flex-col">
        <h3 className="text-lg font-semibold text-slate-100 mb-6 flex items-center gap-2">
          <span className="text-amber-400">⚠️</span> Active Alerts
        </h3>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse flex gap-3 p-3 bg-white/5 rounded-lg">
              <div className="h-8 w-8 bg-white/10 rounded-full shrink-0"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-white/10 rounded w-3/4"></div>
                <div className="h-3 bg-white/10 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const getSeverityConfig = (severity: string, type: string) => {
    if (type === 'anomaly') {
      return { 
        icon: "🧠", 
        color: "text-purple-400", 
        bg: "bg-purple-500/10", 
        border: "border-purple-500/20" 
      };
    }
    
    switch (severity) {
      case "critical":
        return { icon: "🔴", color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" };
      case "warning":
        return { icon: "⚠️", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" };
      case "info":
        return { icon: "ℹ️", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" };
      default:
        return { icon: "🔔", color: "text-slate-400", bg: "bg-slate-500/10", border: "border-slate-500/20" };
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  return (
    <div className="glass-card flex flex-col h-[400px]">
      <div className="p-6 pb-4 border-b border-white/5">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <span className="text-amber-400">⚠️</span> Active Alerts
          </h3>
          <span className="bg-red-500/20 text-red-400 text-xs font-bold px-2 py-1 rounded-full border border-red-500/20">
            {alerts.length} New
          </span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {alerts.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 p-6 text-center">
            <span className="text-4xl mb-3">✨</span>
            <p className="font-medium text-slate-300">All Systems Nominal</p>
            <p className="text-sm mt-1">No active alerts at this time.</p>
          </div>
        ) : (
          alerts.map((alert) => {
            const config = getSeverityConfig(alert.severity, alert.type);
            return (
              <div
                key={alert.id}
                className={`p-4 rounded-xl border ${config.bg} ${config.border} transition-all hover:bg-white/5 group`}
              >
                <div className="flex gap-3">
                  <div className="shrink-0 text-xl pt-0.5">{config.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium text-slate-200 leading-snug mb-1.5 group-hover:text-white transition-colors`}>
                      {alert.message}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span className="font-mono bg-black/20 px-1.5 py-0.5 rounded">{alert.type.toUpperCase()}</span>
                      <span>{formatTimeAgo(alert.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
