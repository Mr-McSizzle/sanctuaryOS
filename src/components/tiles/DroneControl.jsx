import React from "react";
import { useSystem } from "../../context/SystemContext";
import { Crosshair, Target, ChevronUp, ExternalLink } from "lucide-react";
import { cn } from "../../utils/cn";
import { motion } from "framer-motion";

export default function DroneControl({ onOpenDroneView }) {
  const { isCrisisMode, droneDeployed, setDroneDeployed, droneBattery } = useSystem();

  return (
    <div className="w-full h-full flex flex-col justify-between overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-white/70">
          <Crosshair size={16} className={isCrisisMode ? "text-red-400" : "text-indigo-400"} />
          <span className="font-mono text-[11px] tracking-[0.2em] uppercase font-bold">Drone_01</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[8px] uppercase tracking-widest text-white/40">
            {droneBattery}%
          </span>
          <div className="w-4 h-1.5 border border-white/30 rounded-sm p-[0.5px] flex">
            <div className="h-full bg-white/70 rounded-[1px]" style={{ width: `${droneBattery}%` }} />
          </div>
        </div>
      </div>

      {/* Tactical view */}
      <div className="flex-1 rounded-lg bg-black/40 border border-white/5 overflow-hidden flex items-center justify-center relative my-2">
        <div className="absolute inset-0 pointer-events-none opacity-15" style={{ 
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', 
          backgroundSize: '20px 20px' 
        }} />
        <Target size={droneDeployed ? 48 : 32} className={cn(
          "transition-all duration-700",
          droneDeployed ? (isCrisisMode ? "text-red-500 animate-[pulse_1s_infinite] drop-shadow-[0_0_15px_red]" : "text-cyan-400 animate-[spin_10s_linear_infinite] drop-shadow-[0_0_10px_cyan]") : "text-white/10"
        )} strokeWidth={1} />
        
        {droneDeployed && (
          <motion.div 
            initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}
            className={cn("absolute w-24 h-24 rounded-full border border-dashed animate-[spin_4s_linear_infinite_reverse] pointer-events-none", 
              isCrisisMode ? "border-red-500/30" : "border-cyan-500/30"
            )} 
          />
        )}

        <div className="absolute bottom-1.5 inset-x-0 flex justify-center pointer-events-none">
          <span className="font-mono text-[8px] tracking-[0.2em] uppercase bg-black/80 px-2 py-0.5 rounded">
            {droneDeployed ? (isCrisisMode ? "PURSUIT" : "PATROL") : "DOCKED"}
          </span>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setDroneDeployed(!droneDeployed)}
          className={cn(
            "flex-1 py-1.5 rounded-lg font-mono text-[9px] tracking-widest uppercase font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all",
            isCrisisMode ? "bg-red-950/80 border border-red-500/50 text-red-500" 
              : droneDeployed ? "bg-white/10 border border-white/20 text-white/60" 
              : "bg-indigo-600/20 border border-indigo-500/50 text-indigo-300"
          )}
        >
          <ChevronUp size={12} className={cn(droneDeployed ? "rotate-180" : "animate-bounce")} />
          {droneDeployed ? "Recall" : "Deploy"}
        </button>
        {droneDeployed && (
          <button
            onClick={onOpenDroneView}
            className={cn(
              "px-3 py-1.5 rounded-lg font-mono text-[9px] tracking-widest uppercase font-bold cursor-pointer transition-all flex items-center gap-1",
              isCrisisMode ? "bg-red-950/80 border border-red-500/50 text-red-400" : "bg-cyan-600/20 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-600/30"
            )}
          >
            <ExternalLink size={11} />
            View
          </button>
        )}
      </div>
    </div>
  );
}
