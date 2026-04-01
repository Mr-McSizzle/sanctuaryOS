import React, { useState, useEffect, useRef } from "react";
import { useSystem } from "../../context/SystemContext";
import { Terminal as TerminalIcon } from "lucide-react";
import { cn } from "../../utils/cn";

const normalLogs = [
  "Packet trace: 0x48A F0...",
  "Ping: 4ms to SecureServer",
  "Updating firewall rule [6-A]",
  "Climate sync: Success",
  "Node 1a: Offline -> Online",
  "Memory dump cleared.",
  "Background task #04 ran",
];

const alertLogs = [
  "WARNING: Intruder detected in Sector 4",
  "FIREWALL BREACH DETECTED",
  "System Lock overridden?",
  "ATTEMPTING TRACE... FAILED",
  "ROUTING EMERGENCY PROTOCOL",
  "Access request denied [IP: 192.168.1.99]",
  "Encryption key mismatch!",
];

export default function Terminal() {
  const { isCrisisMode } = useSystem();
  const [logs, setLogs] = useState(["[SYSTEM INITIALIZED] Welcome to Sanctuary.OS v4.0", "Core routines operational..."]);
  const logContainerRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const source = isCrisisMode ? alertLogs : normalLogs;
      const r = Math.floor(Math.random() * source.length);
      const newLog = `[${new Date().toLocaleTimeString('en-US', { hour12: false, hour: "numeric", minute: "numeric", second: "numeric" })}] ${source[r]}`;
      
      setLogs((prev) => [...prev.slice(-40), newLog]);
    }, isCrisisMode ? 600 : 2000);

    return () => clearInterval(interval);
  }, [isCrisisMode]);

  // Scroll only within the log container — NOT the page
  useEffect(() => {
    const el = logContainerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [logs]);

  return (
    <div className="w-full h-full flex flex-col relative">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10 relative">
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-2 rounded-lg",
            isCrisisMode ? "bg-red-500/20 text-red-400" : "bg-cyan-500/20 text-cyan-400"
          )}>
            <TerminalIcon size={18} />
          </div>
          <div className="flex flex-col">
            <span className="font-mono text-xs tracking-[0.2em] uppercase text-white/90">Sys_Log</span>
            <span className={cn("font-mono text-[10px] tracking-wider uppercase mt-0.5", isCrisisMode ? "text-red-400/70" : "text-cyan-400/50")}>Status: {isCrisisMode ? "CRITICAL" : "MONITORING"}</span>
          </div>
        </div>
        
        {/* Blinking cursor decorative element */}
        <div className="flex gap-1.5 items-center opacity-60">
          <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
          <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
          <div className="w-1.5 h-1.5 rounded-full bg-white/80 animate-pulse" />
        </div>
      </div>

      <div ref={logContainerRef} className="flex-1 overflow-y-auto font-mono text-[11px] leading-relaxed space-y-1 pr-3 custom-scrollbar">
        {logs.map((log, i) => {
          const isBreach = log.includes("BREACH") || log.includes("WARNING");
          return (
            <div
              key={i}
              className={cn(
                "py-1.5 px-2 rounded-md transition-all duration-300 break-words flex gap-3",
                isCrisisMode ? "text-red-300" : "text-cyan-200/80",
                isBreach ? "bg-red-900/40 border-l-[3px] border-red-500 shadow-[inset_10px_0_20px_rgba(220,38,38,0.2)] font-bold text-red-200" : "hover:bg-white/5",
                i === logs.length - 1 && "animate-pulse brightness-150"
              )}
            >
              <span className="opacity-50 shrink-0 select-none">›</span>
              {log}
            </div>
          );
        })}
        <div className="h-2" />
      </div>
      
      {/* Decorative gradient overlay at bottom for smooth fade */}
      <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-black/40 to-transparent pointer-events-none rounded-b-[2rem]" />
    </div>
  );
}
