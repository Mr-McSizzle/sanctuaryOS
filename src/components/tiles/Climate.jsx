import React, { useRef } from "react";
import { motion } from "framer-motion";
import { useSystem } from "../../context/SystemContext";
import { ThermometerSun } from "lucide-react";
import { cn } from "../../utils/cn";

export default function Climate() {
  const { temperature, setTemperature, isCrisisMode } = useSystem();
  
  // Create an array for tick marks on the dial
  const ticks = Array.from({ length: 40 });

  return (
    <div className="h-full w-full flex flex-col pt-1 pb-1 relative">
      <div className="flex items-center justify-between mb-4 z-10">
        <div className="flex items-center gap-2 text-white/70">
          <ThermometerSun size={18} className={isCrisisMode ? "text-red-400" : "text-cyan-400"} />
          <span className="font-mono text-[11px] tracking-[0.2em] uppercase font-bold">Climate_Ctrl</span>
        </div>
        <div className="flex gap-1.5 items-center">
          <span className="w-1.5 h-3 bg-white/20 rounded-sm" />
          <span className="w-1.5 h-4 bg-white/40 rounded-sm" />
          <span className={cn("w-1.5 h-5 rounded-sm shadow-[0_0_8px_currentColor]", isCrisisMode ? "bg-red-500 text-red-500" : "bg-cyan-400 text-cyan-400")} />
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center relative w-full mt-2">
        {/* Main Dial Container */}
        <div className="relative w-48 h-48 flex items-center justify-center group cursor-pointer" onClick={() => setTemperature((prev) => (prev >= 85 ? 40 : prev + 2))}>
          
          {/* Subtle Outer Glow */}
          <div className={cn(
            "absolute inset-4 rounded-full blur-[20px] opacity-40 transition-colors duration-700",
            isCrisisMode ? "bg-red-600" : "bg-cyan-500"
          )} />
          
          {/* Tick marks ring */}
          <div className="absolute inset-0 rounded-full animate-[spin_120s_linear_infinite]">
            {ticks.map((_, i) => {
              const active = (i / ticks.length) * 50 + 40 <= temperature;
              return (
                <div 
                  key={i} 
                  className="absolute left-1/2 top-0 h-full w-0.5 -translate-x-1/2"
                  style={{ transform: `rotate(${i * (360 / ticks.length)}deg)` }}
                >
                  <div className={cn(
                    "w-0.5 h-2 rounded-full transition-colors duration-500",
                    active ? (isCrisisMode ? "bg-red-400 shadow-[0_0_5px_rgba(239,68,68,0.8)]" : "bg-cyan-400 shadow-[0_0_5px_rgba(34,211,238,0.8)]") : "bg-white/10"
                  )} />
                </div>
              );
            })}
          </div>

          {/* Inner solid dial */}
          <div className="absolute inset-5 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex flex-col items-center justify-center shadow-inner group-hover:bg-black/40 transition-colors">
            {/* Thermostat Output */}
            <div className="text-4xl font-mono font-bold tracking-tighter flex items-start">
              <span className={isCrisisMode ? "text-white" : "text-white"}>{temperature}</span>
              <span className={cn("text-lg font-normal ml-0.5 mt-1", isCrisisMode ? "text-red-400" : "text-cyan-400")}>°</span>
            </div>
            <div className="text-[9px] font-mono tracking-widest text-white/40 mt-1 uppercase">Set Point</div>
          </div>
          
          {/* Decorative rotating accent */}
          <svg className="absolute inset-1 w-[calc(100%-8px)] h-[calc(100%-8px)] animate-[spin_20s_linear_infinite_reverse] opacity-50 pointer-events-none" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="10 30" className={isCrisisMode ? "text-red-500" : "text-cyan-500"} />
          </svg>
        </div>

        <div className="mt-8 flex justify-between w-full px-6 font-mono text-[10px] text-white/30 tracking-widest uppercase">
          <span className="flex flex-col items-center gap-1 group cursor-pointer hover:text-white/80 transition-colors" onClick={() => setTemperature(40)}>
            <span>MIN</span>
            <span>40°</span>
          </span>
          <span className="flex gap-2">
             <button onClick={() => setTemperature(prev => Math.max(40, prev - 1))} className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">-</button>
             <button onClick={() => setTemperature(prev => Math.min(90, prev + 1))} className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">+</button>
          </span>
          <span className="flex flex-col items-center gap-1 group cursor-pointer hover:text-white/80 transition-colors" onClick={() => setTemperature(90)}>
            <span>MAX</span>
            <span>90°</span>
          </span>
        </div>
      </div>
    </div>
  );
}
