interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  isLoading?: boolean;
}

export default function StatCard({ title, value, icon, trend, isLoading }: StatCardProps) {
  if (isLoading) {
    return (
      <div className="glass-card p-6 h-[116px] flex flex-col justify-between animate-pulse">
        <div className="flex justify-between items-start">
          <div className="h-4 bg-white/10 rounded w-24"></div>
          <div className="h-8 w-8 bg-white/10 rounded-lg"></div>
        </div>
        <div className="h-8 bg-white/10 rounded w-16 mt-4"></div>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 flex flex-col justify-between group">
      <div className="flex justify-between items-start">
        <h3 className="text-slate-400 font-medium text-sm">{title}</h3>
        <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center text-xl shadow-inner border border-white/5 group-hover:bg-electric-blue/10 group-hover:border-electric-blue/30 transition-colors">
          {icon}
        </div>
      </div>
      
      <div className="mt-4 flex items-baseline gap-3">
        <span className="text-3xl font-bold text-white tracking-tight">{value}</span>
        {trend && (
          <span className={`text-sm font-medium flex items-center gap-1 ${trend.isPositive ? 'text-emerald-400' : 'text-amber-400'}`}>
            {trend.isPositive ? '↑' : '↓'} {trend.value}
          </span>
        )}
      </div>
    </div>
  );
}
