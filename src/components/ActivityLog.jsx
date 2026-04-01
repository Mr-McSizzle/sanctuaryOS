import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSystem } from "../context/SystemContext";
import { cn } from "../utils/cn";
import { X, Clock, Shield, Lock, Unlock, Lightbulb, Crosshair, AlertTriangle, Thermometer, Wifi, Camera, Activity } from "lucide-react";

const EVENT_ICONS = {
  security: Shield,
  lock: Lock,
  unlock: Unlock,
  light: Lightbulb,
  drone: Crosshair,
  alert: AlertTriangle,
  climate: Thermometer,
  network: Wifi,
  camera: Camera,
  system: Activity,
};

export default function ActivityLog({ onClose }) {
  const { isCrisisMode } = useSystem();
  const [events, setEvents] = useState([]);
  const logRef = useRef(null);

  // Generate initial events and keep adding
  useEffect(() => {
    const initial = [
      { time: -3600, type: "system", msg: "Sanctuary.OS v4.0 boot sequence complete", severity: "info" },
      { time: -3200, type: "network", msg: "Firewall core initialized — 47 rules loaded", severity: "info" },
      { time: -2800, type: "camera", msg: "SEC_CAM_01 through SEC_CAM_04 online", severity: "info" },
      { time: -2400, type: "security", msg: "Biometric scanner calibrated — 3 profiles loaded", severity: "info" },
      { time: -2000, type: "climate", msg: "HVAC system nominal — target: 72°F", severity: "info" },
      { time: -1500, type: "lock", msg: "All entry points verified LOCKED", severity: "info" },
      { time: -1200, type: "network", msg: "SSH probe blocked from 185.220.101.xx [TOR exit]", severity: "warning" },
      { time: -900, type: "light", msg: "Exterior lights auto-dimmed — lunar phase compensation", severity: "info" },
      { time: -600, type: "drone", msg: "Drone-01 firmware updated to v2.8.1", severity: "info" },
      { time: -300, type: "camera", msg: "Motion detected: Sector B2 — wind debris (auto-cleared)", severity: "warning" },
      { time: -120, type: "network", msg: "Firewall blocked 23 probes in last hour — SSH brute-force", severity: "warning" },
      { time: -60, type: "security", msg: "Perimeter sweep complete — all sectors clear", severity: "info" },
      { time: 0, type: "system", msg: "Dashboard session initiated — user authenticated", severity: "info" },
    ].map(e => ({
      ...e,
      timestamp: new Date(Date.now() + e.time * 1000).toLocaleTimeString("en-US", { hour12: false }),
      id: Math.random().toString(36).slice(2),
    }));

    setEvents(initial);

    // Add live events
    const liveEvents = [
      { type: "network", msg: "Blocked probe from 45.133.1.xx [RU/Moscow]", severity: "warning" },
      { type: "climate", msg: "Zone 3 humidity spike: 72% → activating dehumidifier", severity: "info" },
      { type: "camera", msg: "SEC_CAM_02 night vision auto-engaged", severity: "info" },
      { type: "security", msg: "Acoustic sensor triggered — Sector A1 (animal, auto-cleared)", severity: "info" },
      { type: "network", msg: "Certificate rotation complete — TLS 1.3", severity: "info" },
      { type: "system", msg: "Memory optimization: freed 128MB from cache", severity: "info" },
      { type: "drone", msg: "Drone-01 battery check: 100% — dock charging complete", severity: "info" },
      { type: "light", msg: "Ambient lighting shifted to warm (circadian sync)", severity: "info" },
      { type: "network", msg: "Blocked port scan from 103.75.xx.xx [CN/Shanghai]", severity: "warning" },
      { type: "camera", msg: "AI frame analysis: no anomalies in last 50 scans", severity: "info" },
    ];

    let idx = 0;
    const interval = setInterval(() => {
      const evt = liveEvents[idx % liveEvents.length];
      const newEvent = {
        ...evt,
        timestamp: new Date().toLocaleTimeString("en-US", { hour12: false }),
        id: Math.random().toString(36).slice(2),
      };
      setEvents(prev => [...prev, newEvent]);
      idx++;
    }, 4000 + Math.random() * 3000);

    return () => clearInterval(interval);
  }, []);

  // Auto scroll
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [events]);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[160] flex items-center justify-center bg-black/85 backdrop-blur-xl"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}
        className="w-[600px] h-[75vh] glass-panel rounded-2xl border border-cyan-500/20 overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="px-6 py-3 border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <Clock size={18} className={cn(isCrisisMode ? "text-red-400" : "text-cyan-400")} />
            <span className="font-mono text-sm tracking-[0.2em] uppercase font-bold">Activity Timeline</span>
            <span className="font-mono text-[9px] text-white/30 bg-white/5 px-2 py-0.5 rounded-full">{events.length} events</span>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white cursor-pointer"><X size={18} /></button>
        </div>

        {/* Event List */}
        <div ref={logRef} className="flex-1 overflow-y-auto custom-scrollbar px-6 py-4">
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-[18px] top-0 bottom-0 w-px bg-white/10" />

            {events.map((event, i) => {
              const Icon = EVENT_ICONS[event.type] || Activity;
              const isWarning = event.severity === "warning";
              const isLast = i === events.length - 1;
              return (
                <motion.div
                  key={event.id}
                  initial={i >= 13 ? { opacity: 0, x: -10 } : false}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex gap-4 mb-3 relative"
                >
                  {/* Icon dot */}
                  <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border z-10",
                    isWarning ? "bg-yellow-950/40 border-yellow-500/30" 
                      : (isCrisisMode ? "bg-red-950/30 border-red-500/20" : "bg-black/60 border-white/10")
                  )}>
                    <Icon size={14} className={cn(isWarning ? "text-yellow-400" : isCrisisMode ? "text-red-400" : "text-cyan-400")} />
                  </div>

                  {/* Content */}
                  <div className={cn("flex-1 bg-black/30 rounded-xl px-4 py-2.5 border transition-colors",
                    isLast ? (isCrisisMode ? "border-red-500/20" : "border-cyan-500/20") : "border-white/5",
                    isWarning && "border-l-2 border-l-yellow-500/50"
                  )}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={cn("font-mono text-[8px] uppercase tracking-widest font-bold",
                        isWarning ? "text-yellow-400" : "text-white/30"
                      )}>
                        {event.type}
                      </span>
                      <span className="font-mono text-[8px] text-white/20">{event.timestamp}</span>
                    </div>
                    <p className={cn("font-mono text-[10px] leading-relaxed", isWarning ? "text-yellow-200/80" : "text-white/60")}>
                      {event.msg}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
