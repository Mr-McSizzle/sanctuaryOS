import React, { useEffect, useState } from "react";
import { useSystem } from "../../context/SystemContext";
import { ShieldAlert, Fingerprint, Activity } from "lucide-react";
import { cn } from "../../utils/cn";
import { motion } from "framer-motion";

export default function NetShield() {
  const { isCrisisMode, shieldActive, blockedIPs, setBlockedIPs } = useSystem();
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > (isCrisisMode ? 0.2 : 0.8)) {
        setBlockedIPs(prev => prev + 1);
        const geo = ["RU/Moscow", "CN/Beijing", "US/Unknown", "NK/Pyongyang"];
        const newLog = `BLOCKED: ${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.XXX [${geo[Math.floor(Math.random()*geo.length)]}]`;
        setLogs(prev => [...prev.slice(-3), newLog]);
      }
    }, 1500);
    return () => clearInterval(interval);
  }, [isCrisisMode]);

  return (
    <div className="w-full h-full flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-white/70">
          <ShieldAlert size={18} className={isCrisisMode ? "text-red-400" : "text-cyan-400"} />
          <span className="font-mono text-[11px] tracking-[0.2em] uppercase font-bold">Firewall_Core</span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="font-mono text-[9px] uppercase tracking-widest text-white/50">{shieldActive ? 'ACTIVE' : 'OFFLINE'}</span>
          <div className={cn("w-2 h-2 rounded-full", shieldActive ? "bg-cyan-500 animate-pulse shadow-[0_0_10px_cyan]" : "bg-red-500")} />
        </div>
      </div>

      <div className="flex-1 flex items-center justify-between gap-6 px-4">
        {/* Shield Graphic */}
        <div className="relative w-24 h-24 flex items-center justify-center">
          {/* Animated concentric hex rings */}
          <svg className="absolute inset-0 w-full h-full animate-[spin_10s_linear_infinite]" viewBox="0 0 100 100">
            <polygon points="50,5 93,25 93,75 50,95 7,75 7,25" fill="none" stroke="currentColor" strokeWidth="1" className={isCrisisMode ? "text-red-500/20" : "text-cyan-500/20"} />
          </svg>
          <svg className="absolute inset-2 w-[calc(100%-16px)] h-[calc(100%-16px)] animate-[spin_15s_linear_infinite_reverse]" viewBox="0 0 100 100">
            <polygon points="50,5 93,25 93,75 50,95 7,75 7,25" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="5 15" className={isCrisisMode ? "text-red-500/50" : "text-cyan-500/50"} />
          </svg>
          
          <Fingerprint size={32} className={cn("opacity-80 drop-shadow-[0_0_15px_currentColor]", isCrisisMode ? "text-red-400 animate-pulse" : "text-cyan-400")} />
        </div>

        {/* Stats */}
        <div className="flex-1 flex flex-col justify-center">
          <div className="font-mono text-[9px] tracking-[0.2em] uppercase text-white/40 mb-1">Threats Neutralized</div>
          <div className={cn("font-mono text-3xl font-bold tracking-tighter drop-shadow-md", isCrisisMode ? "text-red-400" : "text-white")}>
            {blockedIPs.toLocaleString()}
          </div>
          
          {/* Live log feed mini */}
          <div className="mt-4 h-[44px] overflow-hidden flex flex-col gap-1 border-l-2 border-white/10 pl-2">
            {logs.map((log, i) => (
              <motion.div 
                key={log + i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={cn("font-mono text-[8px] whitespace-nowrap overflow-hidden text-ellipsis shadow-sm", isCrisisMode ? "text-red-300" : "text-cyan-100/50")}
              >
                {log}
              </motion.div>
            ))}
            {logs.length === 0 && <span className="font-mono text-[8px] text-white/20 uppercase">Scanning incoming traffic...</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
