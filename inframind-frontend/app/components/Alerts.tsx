"use client";

interface Alert {
  id: string;
  message: string;
  status: "stable" | "warning" | "critical";
  timestamp: string;
}

export default function Alerts() {
  const alerts: Alert[] = [
    {
      id: "1",
      message: "High CPU usage detected on Server-01",
      status: "critical",
      timestamp: "5m ago",
    },
    {
      id: "2",
      message: "Memory usage stable across all servers",
      status: "stable",
      timestamp: "10m ago",
    },
    {
      id: "3",
      message: "Unusual network traffic pattern detected",
      status: "warning",
      timestamp: "2m ago",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "stable":
        return "bg-green-100 text-green-800";
      case "warning":
        return "bg-yellow-100 text-yellow-800";
      case "critical":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "stable":
        return "✅";
      case "warning":
        return "⚠️";
      case "critical":
        return "🔴";
      default:
        return "ℹ️";
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">AI Alerts</h3>
      <div className="space-y-3">
        {alerts.length === 0 ? (
          <p className="text-gray-500">No alerts at this time</p>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-3 rounded-lg flex items-start gap-3 ${getStatusColor(
                alert.status,
              )}`}
            >
              <span className="text-xl">{getStatusIcon(alert.status)}</span>
              <div className="flex-1">
                <p className="font-medium">{alert.message}</p>
                <p className="text-sm opacity-75">{alert.timestamp}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
