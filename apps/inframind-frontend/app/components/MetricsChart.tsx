"use client";

import { useMemo } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions
} from "chart.js";
import { Metric } from "../lib/api";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface MetricsChartProps {
  data: Metric[];
  isLoading?: boolean;
}

export default function MetricsChart({ data, isLoading }: MetricsChartProps) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return null;

    // Sort chronologically
    const sortedData = [...data].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    const labels = sortedData.map((m) => {
      const d = new Date(m.timestamp);
      return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
    });

    return {
      labels,
      datasets: [
        {
          label: "CPU Usage (%)",
          data: sortedData.map((m) => m.cpuUsage),
          borderColor: "#3b82f6", // electric blue
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          borderWidth: 2,
          pointBackgroundColor: "#0f172a",
          pointBorderColor: "#3b82f6",
          pointBorderWidth: 2,
          pointRadius: 3,
          pointHoverRadius: 5,
          tension: 0.4,
          fill: true,
        },
        {
          label: "Memory Usage (%)",
          data: sortedData.map((m) => m.memoryUsage),
          borderColor: "#06b6d4", // electric cyan
          backgroundColor: "rgba(6, 182, 212, 0.1)",
          borderWidth: 2,
          pointBackgroundColor: "#0f172a",
          pointBorderColor: "#06b6d4",
          pointBorderWidth: 2,
          pointRadius: 3,
          pointHoverRadius: 5,
          tension: 0.4,
          fill: true,
          hidden: true, // Hide by default to prevent clutter
        },
      ],
    };
  }, [data]);

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index",
      intersect: false,
    },
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: "#94a3b8", // slate-400
          usePointStyle: true,
          pointStyle: "circle",
          padding: 20,
          font: { family: "var(--font-inter)", size: 12 }
        },
      },
      tooltip: {
        backgroundColor: "rgba(15, 23, 42, 0.9)", // navy-900
        titleColor: "#f8fafc",
        bodyColor: "#cbd5e1",
        borderColor: "rgba(255,255,255,0.1)",
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
        titleFont: { family: "var(--font-inter)", size: 13 },
        bodyFont: { family: "var(--font-inter)", size: 12 },
      },
    },
    scales: {
      x: {
        grid: { color: "rgba(255, 255, 255, 0.05)", drawTicks: false },
        ticks: { color: "#64748b", font: { family: "var(--font-inter)", size: 11 }, maxTicksLimit: 8 },
        border: { display: false }
      },
      y: {
        beginAtZero: true,
        max: 100,
        grid: { color: "rgba(255, 255, 255, 0.05)", drawTicks: false },
        ticks: { color: "#64748b", font: { family: "var(--font-inter)", size: 11 }, stepSize: 25 },
        border: { display: false }
      },
    },
  };

  if (isLoading) {
    return (
      <div className="glass-card p-6 h-[400px] flex flex-col">
        <h3 className="text-lg font-semibold text-slate-100 mb-6 flex items-center gap-2">
          <span className="text-electric-blue">📈</span> Resource Utilization
        </h3>
        <div className="flex-1 animate-pulse bg-white/5 rounded-lg border border-white/5"></div>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 h-[400px] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
          <span className="text-electric-blue">📈</span> Resource Utilization
        </h3>
        <select className="bg-navy-900 border border-white/10 text-slate-300 text-sm rounded-md px-3 py-1.5 focus:outline-none focus:border-electric-blue/50">
          <option>Last 24 Hours</option>
          <option>Last 7 Days</option>
          <option>Last 30 Days</option>
        </select>
      </div>
      
      <div className="flex-1 relative w-full">
        {chartData ? (
          <Line data={chartData} options={options} />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-slate-500">
            No metric data available
          </div>
        )}
      </div>
    </div>
  );
}
