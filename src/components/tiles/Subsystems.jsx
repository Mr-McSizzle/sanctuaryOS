import React from "react";
import { useSystem } from "../../context/SystemContext";
import { Wrench, Droplet, Ghost } from "lucide-react";
import { cn } from "../../utils/cn";

export default function Subsystems() {
  const { isCrisisMode, waterMainOpen, setWaterMainOpen, garageOpen, setGarageOpen } = useSystem();

  return (
    <div className="w-full h-full flex flex-col justify-between">
      <div className="flex items-center gap-2 mb-4 text-white/70">
        <Wrench size={18} className={isCrisisMode ? "text-red-400" : "text-slate-400"} />
        <span className="font-mono text-[11px] tracking-[0.2em] uppercase font-bold">Subsystems</span>
      </div>

      <div className="flex flex-col gap-3">
        {/* Water Main */}
        <div className="flex items-center justify-between p-3 rounded-lg border border-white/5 bg-black/40">
          <div className="flex items-center gap-3">
            <Droplet size={16} className={cn("transition-colors", waterMainOpen ? "text-blue-400" : "text-white/20")} />
            <div className="flex flex-col">
              <span className="font-mono text-[10px] uppercase tracking-widest text-white/50">Water Main Value</span>
              <span className={cn("font-mono text-[9px] font-bold tracking-widest uppercase", waterMainOpen ? "text-blue-400" : "text-red-400")}>
                {waterMainOpen ? "Flowing" : "Closed"}
              </span>
            </div>
          </div>
          <button 
            onClick={() => setWaterMainOpen(!waterMainOpen)} 
            disabled={isCrisisMode}
            className={cn("w-10 h-5 rounded-full relative transition-colors cursor-pointer", waterMainOpen ? "bg-blue-600/50 border border-blue-400/50" : "bg-white/10 border border-white/20")}
          >
            <div className={cn("absolute top-0.5 w-3.5 h-3.5 bg-white rounded-full transition-all duration-300", waterMainOpen ? "right-1 blur-[0.5px] shadow-[0_0_5px_white]" : "left-1 opacity-50")} />
          </button>
        </div>

        {/* Garage Bay */}
        <div className="flex items-center justify-between p-3 rounded-lg border border-white/5 bg-black/40">
          <div className="flex items-center gap-3">
            <Ghost size={16} className={cn("transition-colors", garageOpen ? "text-yellow-400" : "text-white/20")} />
            <div className="flex flex-col">
              <span className="font-mono text-[10px] uppercase tracking-widest text-white/50">Vehicle Bay Doors</span>
              <span className={cn("font-mono text-[9px] font-bold tracking-widest uppercase", garageOpen && !isCrisisMode ? "text-yellow-400" : "text-white/70")}>
                {garageOpen ? "Unsecured (Open)" : "Secured (Closed)"}
              </span>
            </div>
          </div>
          <button 
            onClick={() => setGarageOpen(!garageOpen)} 
            disabled={isCrisisMode}
            className={cn("w-10 h-5 rounded-full relative transition-colors cursor-pointer", isCrisisMode ? "bg-red-900/50 border-red-500/50" : garageOpen ? "bg-yellow-600/50 border border-yellow-400/50" : "bg-white/10 border border-white/20")}
          >
            <div className={cn("absolute top-[1.5px] w-3.5 h-3.5 rounded-full transition-all duration-300", 
              isCrisisMode ? "bg-red-500 left-1 shadow-[0_0_10px_red]" : 
              garageOpen ? "bg-white right-1 blur-[0.5px] shadow-[0_0_5px_white]" : "bg-white/50 left-1")} 
            />
          </button>
        </div>
      </div>
    </div>
  );
}
