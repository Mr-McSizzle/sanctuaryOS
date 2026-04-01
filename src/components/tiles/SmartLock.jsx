import React from "react";
import { motion } from "framer-motion";
import { useSystem } from "../../context/SystemContext";
import { Shield, ShieldAlert, Lock, Unlock } from "lucide-react";
import { cn } from "../../utils/cn";

export default function SmartLock() {
  const { isLocked, toggleLock, isCrisisMode } = useSystem();

  return (
    <div className="w-full flex flex-col items-center justify-center p-4 relative group">
      {/* Background status glow */}
      <div className={cn(
        "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] rounded-full blur-[40px] opacity-20 pointer-events-none transition-colors duration-1000",
        isCrisisMode ? "bg-red-600" : isLocked ? "bg-emerald-500" : "bg-orange-500"
      )} />

      <button
        onClick={toggleLock}
        disabled={isCrisisMode}
        className="relative w-40 h-40 rounded-full flex items-center justify-center outline-none group cursor-pointer"
      >
        {/* Outer mechanical gear ring */}
        <div className={cn(
          "absolute inset-0 border border-dashed rounded-full transition-all duration-1000",
          isCrisisMode ? "border-red-500/50" : isLocked ? "border-emerald-500/50" : "border-orange-500/50",
          isLocked ? "rotate-180" : "rotate-0",
          isCrisisMode && "animate-[spin_4s_linear_infinite]"
        )} />
        
        {/* Inner track */}
        <div className="absolute inset-2 border-2 border-black/50 rounded-full" />
        <div className={cn(
          "absolute inset-2 border-2 border-solid rounded-full opacity-30 transition-colors duration-700",
          isCrisisMode ? "border-red-500" : isLocked ? "border-emerald-500" : "border-orange-500"
        )} />

        {/* Main button bulk */}
        <div className={cn(
          "absolute inset-4 rounded-full flex flex-col items-center justify-center gap-2 backdrop-blur-md transition-all duration-500 shadow-xl",
          isCrisisMode 
            ? "bg-red-950/80 border-[3px] border-red-500/50 text-red-500 shadow-[0_0_30px_rgba(220,38,38,0.5)]" 
            : isLocked 
              ? "bg-emerald-950/80 border-[3px] border-emerald-500/40 text-emerald-400 group-hover:border-emerald-400 group-hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]"
              : "bg-orange-950/80 border-[3px] border-orange-500/40 text-orange-400 group-hover:border-orange-400 group-hover:shadow-[0_0_20px_rgba(249,115,22,0.4)]"
        )}>
          <motion.div
            animate={{ scale: isLocked ? 1 : 1.15, rotate: isLocked ? 0 : [0, -10, 10, -10, 0] }}
            transition={{ rotate: { duration: 0.5 } }}
            className="flex items-center justify-center"
          >
            {isCrisisMode ? (
              <ShieldAlert size={36} className="drop-shadow-[0_0_10px_rgba(220,38,38,0.8)]" />
            ) : isLocked ? (
              <Shield size={36} className="drop-shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
            ) : (
              <Unlock size={36} className="drop-shadow-[0_0_10px_rgba(249,115,22,0.8)]" />
            )}
          </motion.div>

          <span className="font-mono text-[9px] uppercase tracking-[0.2em] font-bold opacity-80 mt-1">
            {isCrisisMode ? "Lockdown" : isLocked ? "Secured" : "Unsecured"}
          </span>
        </div>
      </button>

      {/* Decorative lines connecting to corners (implied logic) */}
      <div className="absolute top-0 w-[1px] h-4 bg-white/10" />
      <div className="absolute bottom-0 w-[1px] h-4 bg-white/10" />
      <div className="absolute left-0 w-4 h-[1px] bg-white/10" />
      <div className="absolute right-0 w-4 h-[1px] bg-white/10" />
    </div>
  );
}
