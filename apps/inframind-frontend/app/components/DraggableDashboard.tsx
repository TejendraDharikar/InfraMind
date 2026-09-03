"use client";

import React, { useState, ReactNode, useEffect } from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import _ from "lodash";

const ResponsiveGridLayout = WidthProvider(Responsive);

interface DraggableDashboardProps {
  children: {
    stats: ReactNode;
    chart: ReactNode;
    alerts: ReactNode;
    serverGrid: ReactNode;
  };
}

const STORAGE_KEY = "inframind-dashboard-layout";

export default function DraggableDashboard({ children }: DraggableDashboardProps) {
  const [isLocked, setIsLocked] = useState(true);
  const [layouts, setLayouts] = useState<any>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    }
    return {
      lg: [
        { i: "stats", x: 0, y: 0, w: 12, h: 4, static: true },
        { i: "chart", x: 0, y: 4, w: 8, h: 10 },
        { i: "alerts", x: 8, y: 4, w: 4, h: 10 },
        { i: "serverGrid", x: 0, y: 14, w: 12, h: 8 },
      ],
      md: [
        { i: "stats", x: 0, y: 0, w: 10, h: 4, static: true },
        { i: "chart", x: 0, y: 4, w: 10, h: 10 },
        { i: "alerts", x: 0, y: 14, w: 10, h: 8 },
        { i: "serverGrid", x: 0, y: 22, w: 10, h: 10 },
      ],
    };
  });

  const onLayoutChange = (currentLayout: any, allLayouts: any) => {
    setLayouts(allLayouts);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allLayouts));
  };

  const toggleLock = () => {
    const newLocked = !isLocked;
    setIsLocked(newLocked);
    
    // Update static property for all items in all layouts
    const newLayouts = _.mapValues(layouts, (layout) =>
      layout.map((item: any) => ({
        ...item,
        static: item.i === "stats" ? true : newLocked, // Keep stats always static or as desired
      }))
    );
    setLayouts(newLayouts);
  };

  const resetLayout = () => {
    const defaultLayout = {
      lg: [
        { i: "stats", x: 0, y: 0, w: 12, h: 4, static: true },
        { i: "chart", x: 0, y: 4, w: 8, h: 10 },
        { i: "alerts", x: 8, y: 4, w: 4, h: 10 },
        { i: "serverGrid", x: 0, y: 14, w: 12, h: 8 },
      ],
    };
    setLayouts(defaultLayout);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <div>
      <div className="flex justify-end gap-3 mb-6">
        <button
          onClick={resetLayout}
          className="text-xs text-slate-400 hover:text-white transition-colors"
        >
          Reset Layout
        </button>
        <button
          onClick={toggleLock}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
            isLocked
              ? "bg-navy-800 text-slate-300 border border-white/5 hover:bg-navy-700"
              : "bg-electric-blue text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]"
          }`}
        >
          <span>{isLocked ? "🔒" : "🔓"}</span>
          {isLocked ? "Dashboard Locked" : "Layout Editing Mode"}
        </button>
      </div>

      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={30}
        draggableHandle=".drag-handle"
        onLayoutChange={onLayoutChange}
        margin={[24, 24]}
      >
        <div key="stats" className="overflow-visible">
          <div className={`${!isLocked && "ring-2 ring-electric-blue/20 rounded-2xl"}`}>
            {children.stats}
          </div>
        </div>

        <div key="chart">
          <div className={`h-full flex flex-col group ${!isLocked && "ring-2 ring-electric-blue/30 rounded-2xl p-1 bg-white/[0.02]"}`}>
            {!isLocked && (
              <div className="drag-handle absolute top-2 right-12 z-10 p-1 cursor-move opacity-0 group-hover:opacity-100 transition-opacity bg-navy-800 rounded text-xs border border-white/10">
                Move ✥
              </div>
            )}
            {children.chart}
          </div>
        </div>

        <div key="alerts">
          <div className={`h-full flex flex-col group ${!isLocked && "ring-2 ring-electric-blue/30 rounded-2xl p-1 bg-white/[0.02]"}`}>
            {!isLocked && (
              <div className="drag-handle absolute top-2 right-12 z-10 p-1 cursor-move opacity-0 group-hover:opacity-100 transition-opacity bg-navy-800 rounded text-xs border border-white/10">
                Move ✥
              </div>
            )}
            {children.alerts}
          </div>
        </div>

        <div key="serverGrid">
          <div className={`h-full flex flex-col group ${!isLocked && "ring-2 ring-electric-blue/30 rounded-2xl p-1 bg-white/[0.02]"}`}>
            {!isLocked && (
              <div className="drag-handle absolute top-2 right-12 z-10 p-1 cursor-move opacity-0 group-hover:opacity-100 transition-opacity bg-navy-800 rounded text-xs border border-white/10">
                Move ✥
              </div>
            )}
            {children.serverGrid}
          </div>
        </div>
      </ResponsiveGridLayout>
    </div>
  );
}
