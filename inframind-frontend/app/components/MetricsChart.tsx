"use client";

import { useEffect } from "react";
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
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

export default function MetricsChart() {
  const cpuData = {
    labels: ["1 PM", "2 PM", "3 PM", "4 PM", "5 PM", "6 PM"],
    datasets: [
      {
        label: "CPU Usage (%)",
        data: [20, 35, 50, 45, 60, 70],
        borderColor: "#ef4444",
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const memoryData = {
    labels: ["1 PM", "2 PM", "3 PM", "4 PM", "5 PM", "6 PM"],
    datasets: [
      {
        label: "Memory Usage (%)",
        data: [40, 45, 50, 55, 58, 62],
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
      },
    },
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">CPU Usage</h3>
        <div className="relative h-80">
          <Line data={cpuData} options={chartOptions} />
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Memory Usage</h3>
        <div className="relative h-80">
          <Line data={memoryData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
}
