import React from "react";
import { useSystem } from "../context/SystemContext";
import { Mic, LayoutDashboard, Settings, ShieldAlert, Map, Clock, Activity, ScanFace } from "lucide-react";
import { cn } from "../utils/cn";

export default function Sidebar({ onMicClick, onFloorPlan, onDiagnostics, onActivityLog }) {
  const { isCrisisMode } = useSystem();

  const iconClass = cn(
    "relative p-3 rounded-[1rem] cursor-pointer transition-all duration-300 group flex justify-center",
    "border border-white/5 hover:border-white/20 hover:-translate-y-1 shadow-lg",
    isCrisisMode 
      ? "hover:bg-red-500/20 text-red-300 hover:text-white hover:shadow-[0_0_15px_rgba(220,38,38,0.5)] bg-black/40" 
      : "hover:bg-cyan-500/20 text-cyan-500 hover:text-cyan-100 hover:shadow-[0_0_15px_rgba(34,211,238,0.3)] bg-black/40"
  );

  return (
    <div className="w-24 h-full py-8 flex flex-col items-center justify-between z-20 relative">
      <div className="absolute right-0 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-white/10 to-transparent" />
      
      {/* Top Icons */}
      <div className="flex flex-col gap-5 w-full px-4 items-center">
        {/* Dashboard (active) */}
        <div className={cn(
          "p-3.5 rounded-[1.2rem] shadow-xl relative group cursor-pointer transition-all", 
          isCrisisMode ? "bg-red-900/40 border border-red-500/50 shadow-[0_0_20px_rgba(220,38,38,0.3)]" : "bg-cyan-900/40 border border-cyan-500/50 shadow-[0_0_20px_rgba(34,211,238,0.2)]"
        )}>
          <div className={cn(
            "absolute -left-3 top-1/2 -translate-y-1/2 w-1.5 h-8 rounded-full",
            isCrisisMode ? "bg-red-500 shadow-[0_0_10px_rgba(220,38,38,1)]" : "bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,1)]"
          )} />
          <LayoutDashboard size={24} className={isCrisisMode ? "text-red-200" : "text-cyan-100 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]"} />
        </div>

        {/* Floor Plan */}
        <div className={iconClass} onClick={onFloorPlan} title="Floor Plan">
          <div className="absolute inset-0 rounded-[1rem] bg-white opacity-0 group-hover:opacity-5 transition-opacity" />
          <Map size={22} />
        </div>

        {/* System Diagnostics */}
        <div className={iconClass} onClick={onDiagnostics} title="System Diagnostics">
          <div className="absolute inset-0 rounded-[1rem] bg-white opacity-0 group-hover:opacity-5 transition-opacity" />
          <Activity size={22} />
        </div>

        {/* Activity Log */}
        <div className={iconClass} onClick={onActivityLog} title="Activity Log">
          <div className="absolute inset-0 rounded-[1rem] bg-white opacity-0 group-hover:opacity-5 transition-opacity" />
          <Clock size={22} />
        </div>

        {/* Settings */}
        <div className={iconClass} title="Settings">
          <div className="absolute inset-0 rounded-[1rem] bg-white opacity-0 group-hover:opacity-5 transition-opacity" />
          <Settings size={22} />
        </div>
      </div>

      {/* Mic Trigger */}
      <div 
        onClick={onMicClick}
        className={cn(
          "relative p-5 rounded-full cursor-pointer transition-all duration-500 group border-2 z-10",
          isCrisisMode 
            ? "bg-black/60 border-red-500/30 hover:border-red-400 hover:bg-red-950/80 shadow-[0_0_20px_rgba(220,38,38,0.2)]" 
            : "bg-black/60 border-cyan-500/30 hover:border-cyan-400 hover:bg-cyan-950/80 shadow-[0_0_20px_rgba(34,211,238,0.2)]"
        )}
      >
        <Mic size={26} className={cn(
          "transition-colors duration-300",
          isCrisisMode ? "text-red-500 group-hover:text-red-300 group-hover:drop-shadow-[0_0_8px_rgba(220,38,38,1)]" : "text-cyan-600 group-hover:text-cyan-200 group-hover:drop-shadow-[0_0_8px_rgba(34,211,238,1)]"
        )} />
        <div className={cn(
            "absolute inset-0 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500",
            isCrisisMode ? "bg-red-500/40" : "bg-cyan-500/40"
          )} 
        />
        <div className={cn(
          "absolute inset-[-4px] rounded-full border opacity-50 transition-all",
          isCrisisMode ? "border-red-500 group-hover:animate-ping" : "border-cyan-500 group-hover:animate-ping"
        )} />
      </div>

      {/* Bottom Icons */}
      <div className="flex flex-col gap-4 w-full px-4 items-center">
        <div className={iconClass}>
          {isCrisisMode ? <ShieldAlert size={22} className="animate-pulse drop-shadow-[0_0_5px_rgba(220,38,38,0.8)]" /> : <ShieldAlert size={22} className="opacity-40 hover:opacity-100 transition-opacity" />}
        </div>
      </div>
    </div>
  );
}
