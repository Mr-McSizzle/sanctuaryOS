import React, { useEffect, useState } from "react";
import { useSystem } from "../../context/SystemContext";
import { Activity } from "lucide-react";
import { cn } from "../../utils/cn";
import { motion } from "framer-motion";

export default function EnergyGraph() {
  const { isCrisisMode } = useSystem();
  const [data, setData] = useState(Array(40).fill(50));

  useEffect(() => {
    const interval = setInterval(() => {
      setData((prev) => {
        const next = [...prev.slice(1)];
        let newValue;
        if (isCrisisMode) {
          newValue = Math.random() * 40 + 60; // 60 to 100
        } else {
          // Smooth random walk
          const last = prev[prev.length - 1];
          const change = (Math.random() - 0.5) * 15;
          newValue = Math.max(30, Math.min(70, last + change));
        }
        next.push(newValue);
        return next;
      });
    }, 400);

    return () => clearInterval(interval);
  }, [isCrisisMode]);

  const maxVal = 100;
  const height = 120;
  const width = 600; // SVG viewBox logical width
  const dx = width / (data.length - 1);

  // path string construct (smooth curve)
  const createPath = () => {
    return data.reduce((acc, val, i, arr) => {
      const x = i * dx;
      const y = height - (val / maxVal) * height;
      if (i === 0) return `M ${x},${y}`;
      const prevX = (i - 1) * dx;
      const prevY = height - (arr[i - 1] / maxVal) * height;
      const cpX = prevX + dx / 2;
      return `${acc} C ${cpX},${prevY} ${cpX},${y} ${x},${y}`;
    }, "");
  };

  const pathD = createPath();

  return (
    <div className="w-full h-full flex flex-col justify-between relative group">
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-2 rounded-lg backdrop-blur-md border",
            isCrisisMode ? "bg-red-500/10 border-red-500/20 text-red-400" : "bg-cyan-500/10 border-cyan-500/20 text-cyan-400"
          )}>
            <Activity size={18} />
          </div>
          <div>
            <div className="font-mono text-xs tracking-[0.2em] uppercase text-white/90">Power_Grid</div>
            <div className="font-mono text-[9px] tracking-widest text-white/40 uppercase mt-0.5">Substation Alpha</div>
          </div>
        </div>
        
        {/* Current Value overlay */}
        <div className="flex flex-col items-end">
          <div className={cn(
            "font-mono text-3xl font-bold tracking-tighter flex items-end drop-shadow-[0_0_10px_currentColor]",
            isCrisisMode ? "text-red-400" : "text-cyan-400"
          )}>
            {Math.round(data[data.length - 1])}
            <span className="text-sm font-normal ml-1 mb-1 opacity-70">kW</span>
          </div>
        </div>
      </div>

      <div className="absolute inset-0 top-16 w-full flex items-end overflow-hidden">
        {/* Decorative Grid Background for Chart */}
        <div className="absolute inset-0 flex flex-col justify-between opacity-10 pointer-events-none">
          <div className="w-full h-[1px] bg-white dashes" />
          <div className="w-full h-[1px] bg-white dashes" />
          <div className="w-full h-[1px] bg-white dashes" />
        </div>

        <svg viewBox={`0 0 ${width} ${height + 20}`} className="w-full h-full pb-2" preserveAspectRatio="none">
          <defs>
            <linearGradient id="cyanGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="redGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Solid fill gradient below the line */}
          <motion.path
            d={`${pathD} L ${width} ${height + 20} L 0 ${height + 20} Z`}
            fill={isCrisisMode ? "url(#redGrad)" : "url(#cyanGrad)"}
            className="transition-colors duration-500"
          />

          {/* Main glowing line */}
          <motion.path
            d={pathD}
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#glow)"
            className={cn("transition-colors duration-500", isCrisisMode ? "text-red-400" : "text-cyan-400")}
          />
          
          {/* Active dot at the end */}
          <circle 
            cx={width} 
            cy={height - (data[data.length - 1] / maxVal) * height} 
            r="4" 
            fill="currentColor" 
            className={cn("transition-colors duration-500 drop-shadow-[0_0_8px_currentColor]", isCrisisMode ? "text-red-400" : "text-cyan-300")} 
          />
        </svg>

        {/* Data overlay lines */}
        <div className="absolute bottom-2 left-0 right-0 flex justify-between px-2 font-mono text-[9px] text-white/30 tracking-widest pointer-events-none">
          <span>T-40s</span>
          <span>T-20s</span>
          <span>NOW</span>
        </div>
      </div>
    </div>
  );
}
