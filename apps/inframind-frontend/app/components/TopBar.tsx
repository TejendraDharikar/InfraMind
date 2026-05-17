export default function TopBar() {
  return (
    <header className="h-16 bg-navy-900/50 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-8 sticky top-0 z-10">
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
          <input
            type="text"
            placeholder="Search servers, metrics, or alerts..."
            className="w-full bg-navy-800 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm text-slate-200 focus:outline-none focus:border-electric-blue/50 focus:ring-1 focus:ring-electric-blue/50 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-6 pl-6">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-sm font-medium text-emerald-500">System Operational</span>
        </div>

        <button className="relative text-slate-400 hover:text-white transition-colors">
          <span className="text-xl">🔔</span>
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-navy-900">
            3
          </span>
        </button>

        <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-electric-blue to-electric-cyan p-[2px]">
          <div className="h-full w-full rounded-full bg-navy-800 flex items-center justify-center border border-navy-900">
            <span className="text-xs font-bold text-white">TM</span>
          </div>
        </div>
      </div>
    </header>
  );
}
