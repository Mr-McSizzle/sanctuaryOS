import React from "react";
import { useSystem } from "../../context/SystemContext";
import { Wind, Droplets } from "lucide-react";
import { cn } from "../../utils/cn";

export default function LifeSupport() {
  const { isCrisisMode, airPurificationOn, setAirPurificationOn } = useSystem();

  return (
    <div className="w-full h-full flex flex-col relative justify-between">
      <div className="flex items-center gap-2 mb-4 text-white/70">
        <Wind size={18} className={isCrisisMode ? "text-red-400" : "text-emerald-400"} />
        <span className="font-mono text-[11px] tracking-[0.2em] uppercase font-bold">Atmospherics</span>
      </div>

      <div className="flex justify-between items-center bg-black/40 p-4 rounded-xl border border-white/5 relative overflow-hidden group">
        <div className="z-10 relative">
          <div className="font-mono text-[9px] uppercase tracking-widest text-white/50 mb-1">Air Quality Idx</div>
          <div className="flex items-end gap-1">
            <span className={cn("font-mono text-3xl font-bold tracking-tighter drop-shadow-md", isCrisisMode ? "text-red-400" : "text-emerald-400")}>12</span>
            <span className="font-mono text-[10px] pb-1 opacity-50">/100</span>
          </div>
        </div>
        
        {/* Animated Fan */}
        <div className="relative w-12 h-12 flex items-center justify-center z-10">
          <div className={cn("absolute inset-0 border-2 rounded-full", isCrisisMode ? "border-red-500/30" : "border-emerald-500/30")} />
          <Wind size={24} className={cn(
            "opacity-80 transition-all",
            airPurificationOn ? "animate-[spin_3s_linear_infinite]" : "",
            isCrisisMode ? "text-red-400 animate-[spin_1s_linear_infinite]" : "text-emerald-400"
          )} />
        </div>
        
        <div className={cn("absolute top-0 right-0 w-32 h-32 blur-[40px] rounded-full pointer-events-none transition-colors", isCrisisMode ? "bg-red-500/20" : "bg-emerald-500/10")} />
      </div>

      <div className="grid grid-cols-2 gap-3 mt-3">
        <div className="bg-black/30 p-3 rounded-xl border border-white/5">
          <div className="font-mono text-[9px] uppercase tracking-widest text-white/50 mb-1 flex items-center gap-1"><Droplets size={10} /> Humidity</div>
          <div className="font-mono text-xl text-cyan-300">42<span className="text-[10px]">%</span></div>
        </div>
        <div className="bg-black/30 p-3 rounded-xl border border-white/5">
          <div className="font-mono text-[9px] uppercase tracking-widest text-white/50 mb-1">CO2 Level</div>
          <div className={cn("font-mono text-xl", isCrisisMode ? "text-red-400" : "text-white/90")}>415<span className="text-[10px] text-white/50">ppm</span></div>
        </div>
      </div>

      <button 
        onClick={() => setAirPurificationOn(!airPurificationOn)}
        disabled={isCrisisMode}
        className={cn(
          "w-full py-2 mt-4 rounded-lg font-mono text-[10px] tracking-[0.2em] font-bold uppercase transition-all duration-300 border backdrop-blur-md cursor-pointer",
          isCrisisMode ? "bg-red-950/80 border-red-500/50 text-red-500 cursor-not-allowed" :
          airPurificationOn ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]" : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10"
        )}
      >
        {isCrisisMode ? "Scrubbing Forced" : airPurificationOn ? "Bio-Filter Active" : "Bio-Filter Offline"}
      </button>

    </div>
  );
}
