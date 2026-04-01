import React, { useState, useEffect } from "react";
import { useSystem } from "../../context/SystemContext";
import { Battery, Zap, Sun, Server } from "lucide-react";
import { cn } from "../../utils/cn";
import { motion } from "framer-motion";

export default function PowerMatrix() {
  const { isCrisisMode } = useSystem();
  
  const [solarInput, setSolarInput] = useState(4.2);
  const [gridDraw, setGridDraw] = useState(1.1);
  const [batteryLevel, setBatteryLevel] = useState(88);

  useEffect(() => {
    const interval = setInterval(() => {
      setSolarInput(prev => Math.max(0, Math.min(10, prev + (Math.random() - 0.5) * 0.5)));
      setGridDraw(prev => isCrisisMode ? prev + Math.random() : Math.max(0, Math.min(5, prev + (Math.random() - 0.5) * 0.2)));
      
      if (isCrisisMode) {
        setBatteryLevel(prev => Math.max(0, prev - 0.1));
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [isCrisisMode]);

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex items-center gap-2 mb-6 text-white/70">
        <Zap size={18} className={isCrisisMode ? "text-red-400" : "text-yellow-400 line-through decoration-transparent"} />
        <span className="font-mono text-[11px] tracking-[0.2em] uppercase font-bold">Power_Routing</span>
      </div>

      <div className="flex-1 grid grid-cols-2 gap-4">
        {/* Battery Node */}
        <div className="col-span-1 border border-white/5 bg-black/40 rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-cyan-500/10 to-transparent opacity-50 pointer-events-none" />
          <div className="font-mono text-[9px] tracking-[0.2em] uppercase text-white/50 flex justify-between items-center">
             <span>Main Cells</span>
             <Battery size={14} className={isCrisisMode ? "text-red-400" : "text-cyan-400"} />
          </div>
          
          <div className="flex items-center gap-4 mt-4">
            {/* Battery Circular Indicator */}
            <div className="relative w-16 h-16 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="6" className="text-white/10" />
                <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="6" strokeDasharray="283" strokeDashoffset={283 - (283 * batteryLevel / 100)} className={cn("transition-all duration-1000", isCrisisMode ? "text-red-500" : "text-cyan-400")} />
              </svg>
              <div className="absolute font-mono text-sm font-bold">{Math.round(batteryLevel)}<span className="text-[9px]">%</span></div>
            </div>
            <div className="flex flex-col gap-1 z-10">
              <div className="font-mono text-[10px] text-white/40 uppercase tracking-widest">Status</div>
              <div className={cn("font-mono text-[11px] tracking-widest font-bold", isCrisisMode ? "text-red-400 animate-pulse" : "text-cyan-400")}>
                {isCrisisMode ? "DRAINING" : "MAINTAIN"}
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-1 flex flex-col gap-4">
          {/* Solar Node */}
          <div className="flex-1 border border-white/5 bg-black/40 rounded-2xl p-3 flex justify-between items-center relative overflow-hidden">
            <div className="z-10 flex flex-col">
              <div className="font-mono text-[9px] tracking-widest text-white/50 uppercase mb-1">Solar Array</div>
              <div className="font-mono text-lg text-yellow-500">{solarInput.toFixed(1)}<span className="text-[10px] text-white/50 ml-1">kW</span></div>
            </div>
            {/* Animated sun beams */}
            <div className="relative w-8 h-8 rounded-full border border-yellow-500/30 flex items-center justify-center">
              <div className="absolute w-12 h-12 bg-yellow-500/20 rounded-full blur-md animate-pulse" />
              <div className="w-4 h-4 rounded-full bg-yellow-400 shadow-[0_0_10px_orange]" />
            </div>
          </div>

          {/* Grid Node */}
          <div className={cn("flex-1 border border-white/5 rounded-2xl p-3 flex justify-between items-center transition-colors", isCrisisMode ? "bg-red-950/40 border-red-500/30" : "bg-black/40")}>
             <div className="z-10 flex flex-col">
              <div className="font-mono text-[9px] tracking-widest text-white/50 uppercase mb-1">Grid Draw</div>
              <div className={cn("font-mono text-lg", isCrisisMode ? "text-red-400" : "text-white/90")}>{gridDraw.toFixed(1)}<span className="text-[10px] text-white/50 ml-1">kW</span></div>
            </div>
            <Server size={20} className={cn("opacity-50", isCrisisMode ? "text-red-500 animate-pulse" : "")} />
          </div>
        </div>

      </div>
    </div>
  );
}
