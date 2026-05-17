import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/", icon: "📊" },
    { name: "Servers", href: "/servers", icon: "🖥️" },
    { name: "Metrics", href: "/metrics", icon: "📈" },
    { name: "Alerts", href: "/alerts", icon: "⚠️" },
    { name: "Settings", href: "/settings", icon: "⚙️" },
    { name: "API Docs", href: "http://localhost:5000/api-docs", icon: "📖", external: true },
  ];

  return (
    <div className="w-64 h-screen bg-navy-900 border-r border-white/5 flex flex-col fixed left-0 top-0">
      <div className="h-16 flex items-center px-6 border-b border-white/5">
        <span className="text-xl font-bold text-gradient tracking-wide">Inframind</span>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              target={item.external ? "_blank" : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                isActive
                  ? "bg-electric-blue/10 text-electric-blue shadow-[0_0_15px_rgba(59,130,246,0.15)]"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/5">
        <button className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
          <span className="text-lg">⚙️</span>
          <span className="font-medium">Settings</span>
        </button>
      </div>
    </div>
  );
}
