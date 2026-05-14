import { Server } from "../lib/api";

interface ServerStatusGridProps {
  servers: Server[];
  isLoading?: boolean;
}

export default function ServerStatusGrid({ servers, isLoading }: ServerStatusGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="glass-card p-5 animate-pulse h-32">
            <div className="flex justify-between items-center mb-4">
              <div className="h-5 bg-white/10 rounded w-1/2"></div>
              <div className="h-6 w-16 bg-white/10 rounded-full"></div>
            </div>
            <div className="h-3 bg-white/10 rounded w-1/3 mb-4"></div>
            <div className="flex gap-4">
              <div className="h-8 bg-white/10 rounded w-full"></div>
              <div className="h-8 bg-white/10 rounded w-full"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {servers.map((server) => {
        const latestMetric = server.metrics?.[0];
        
        const statusConfig = {
          stable: { color: "bg-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20", text: "text-emerald-400" },
          warning: { color: "bg-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20", text: "text-amber-400" },
          unhealthy: { color: "bg-red-500", bg: "bg-red-500/10", border: "border-red-500/20", text: "text-red-400" },
          offline: { color: "bg-slate-500", bg: "bg-slate-500/10", border: "border-slate-500/20", text: "text-slate-400" },
        };
        
        const config = statusConfig[server.status as keyof typeof statusConfig] || statusConfig.offline;

        return (
          <div key={server.id} className="glass-card p-5 group cursor-pointer">
            <div className="flex justify-between items-start mb-1">
              <h4 className="font-semibold text-slate-100 group-hover:text-electric-blue transition-colors">{server.name}</h4>
              <div className={`px-2.5 py-1 rounded-full text-xs font-medium border flex items-center gap-1.5 ${config.bg} ${config.border} ${config.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${config.color} ${server.status === 'stable' ? 'animate-pulse' : ''}`}></span>
                {server.status.charAt(0).toUpperCase() + server.status.slice(1)}
              </div>
            </div>
            <p className="text-xs text-slate-400 mb-4 font-mono">{server.hostName}</p>
            
            <div className="grid grid-cols-2 gap-3 mt-auto">
              <div className="bg-navy-900/50 rounded-lg p-2 border border-white/5">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">CPU</p>
                <p className="font-medium text-sm text-slate-200">
                  {latestMetric ? `${latestMetric.cpuUsage.toFixed(1)}%` : '—'}
                </p>
              </div>
              <div className="bg-navy-900/50 rounded-lg p-2 border border-white/5">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Memory</p>
                <p className="font-medium text-sm text-slate-200">
                  {latestMetric ? `${latestMetric.memoryUsage.toFixed(1)}%` : '—'}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
