import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSystem } from "../context/SystemContext";
import { cn } from "../utils/cn";
import { X, Activity, Cpu, HardDrive, Wifi, ThermometerSun, MemoryStick, Clock, Zap, Shield } from "lucide-react";

function useAnimatedValue(target, speed = 0.1) {
  const [value, setValue] = useState(target);
  useEffect(() => {
    const interval = setInterval(() => {
      setValue(prev => prev + (target - prev) * speed);
    }, 50);
    return () => clearInterval(interval);
  }, [target, speed]);
  return value;
}

export default function SystemDiagnostics({ onClose }) {
  const { isCrisisMode, droneBattery } = useSystem();
  const [cpuUsage, setCpuUsage] = useState(23);
  const [memUsage, setMemUsage] = useState(41);
  const [netThroughput, setNetThroughput] = useState(12.4);
  const [diskIO, setDiskIO] = useState(3.2);
  const [uptime, setUptime] = useState(0);
  const [heartbeatData, setHeartbeatData] = useState(Array(60).fill(50));
  const [cpuHistory, setCpuHistory] = useState(Array(40).fill(23));
  const canvasRef = useRef(null);

  // Simulated jitter
  useEffect(() => {
    const interval = setInterval(() => {
      setCpuUsage(prev => Math.max(5, Math.min(95, prev + (Math.random() - 0.5) * (isCrisisMode ? 20 : 8))));
      setMemUsage(prev => Math.max(20, Math.min(90, prev + (Math.random() - 0.5) * 4)));
      setNetThroughput(prev => Math.max(0.1, Math.min(100, prev + (Math.random() - 0.5) * (isCrisisMode ? 15 : 5))));
      setDiskIO(prev => Math.max(0, Math.min(50, prev + (Math.random() - 0.5) * 3)));
      setUptime(prev => prev + 1);

      setHeartbeatData(prev => {
        const next = [...prev.slice(1)];
        const spike = Math.random() > 0.85;
        next.push(spike ? 20 + Math.random() * 60 : 45 + Math.random() * 10);
        return next;
      });

      setCpuHistory(prev => [...prev.slice(1), cpuUsage]);
    }, 1000);
    return () => clearInterval(interval);
  }, [isCrisisMode, cpuUsage]);

  // Draw heartbeat canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const w = canvas.width = canvas.offsetWidth * 2;
    const h = canvas.height = canvas.offsetHeight * 2;
    ctx.clearRect(0, 0, w, h);

    // Heartbeat line  
    ctx.beginPath();
    ctx.strokeStyle = isCrisisMode ? "rgba(239,68,68,0.8)" : "rgba(34,211,238,0.8)";
    ctx.lineWidth = 2;
    ctx.shadowBlur = 8;
    ctx.shadowColor = isCrisisMode ? "rgba(239,68,68,0.5)" : "rgba(34,211,238,0.5)";

    heartbeatData.forEach((val, i) => {
      const x = (i / heartbeatData.length) * w;
      const y = h - (val / 100) * h;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Fill under
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fillStyle = isCrisisMode ? "rgba(239,68,68,0.05)" : "rgba(34,211,238,0.05)";
    ctx.fill();
  }, [heartbeatData, isCrisisMode]);

  const formatUptime = (s) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[160] flex items-center justify-center bg-black/85 backdrop-blur-xl"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}
        className="w-[700px] glass-panel rounded-2xl border border-cyan-500/20 overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="px-6 py-3 border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <Activity size={18} className={cn(isCrisisMode ? "text-red-400 animate-pulse" : "text-cyan-400")} />
            <span className="font-mono text-sm tracking-[0.2em] uppercase font-bold">System Diagnostics</span>
            <div className="flex items-center gap-1.5 ml-3">
              <Clock size={10} className="text-white/30" />
              <span className="font-mono text-[9px] text-white/30 tracking-widest">UPTIME {formatUptime(uptime)}</span>
            </div>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white cursor-pointer"><X size={18} /></button>
        </div>

        {/* Heartbeat */}
        <div className="px-6 pt-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity size={12} className={cn(isCrisisMode ? "text-red-400" : "text-cyan-400")} />
            <span className="font-mono text-[9px] uppercase tracking-widest text-white/30">System Heartbeat</span>
          </div>
          <div className="h-20 bg-black/40 rounded-xl border border-white/5 overflow-hidden relative">
            <canvas ref={canvasRef} className="w-full h-full" />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="p-6 grid grid-cols-4 gap-3">
          <MetricCard icon={Cpu} label="CPU" value={`${cpuUsage.toFixed(0)}%`} bar={cpuUsage} isCrisis={isCrisisMode} warn={cpuUsage > 70} />
          <MetricCard icon={MemoryStick} label="Memory" value={`${memUsage.toFixed(0)}%`} bar={memUsage} isCrisis={isCrisisMode} warn={memUsage > 75} />
          <MetricCard icon={Wifi} label="Net I/O" value={`${netThroughput.toFixed(1)} MB/s`} bar={netThroughput} isCrisis={isCrisisMode} warn={netThroughput > 80} />
          <MetricCard icon={HardDrive} label="Disk I/O" value={`${diskIO.toFixed(1)} MB/s`} bar={diskIO * 2} isCrisis={isCrisisMode} />
        </div>

        {/* Subsystem status */}
        <div className="px-6 pb-6">
          <div className="font-mono text-[9px] uppercase tracking-widest text-white/30 mb-2">Subsystem Status</div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { name: "LIDAR Array", status: "ONLINE", healthy: true },
              { name: "Thermal Imager", status: "ONLINE", healthy: true },
              { name: "Facial Recognition", status: "STANDBY", healthy: true },
              { name: "Drone Uplink", status: droneBattery > 10 ? "LINKED" : "LOW BATT", healthy: droneBattery > 10 },
              { name: "Firewall Core", status: "ACTIVE", healthy: true },
              { name: "Backup Generator", status: isCrisisMode ? "ENGAGED" : "STANDBY", healthy: true },
              { name: "Biometric Scanner", status: "READY", healthy: true },
              { name: "Perimeter Sensors", status: isCrisisMode ? "ALERT" : "NOMINAL", healthy: !isCrisisMode },
              { name: "Comm Encryption", status: "AES-256", healthy: true },
            ].map(sub => (
              <div key={sub.name} className="flex items-center justify-between bg-black/30 rounded-lg px-3 py-1.5 border border-white/5">
                <span className="font-mono text-[9px] text-white/50">{sub.name}</span>
                <span className={cn("font-mono text-[8px] font-bold uppercase tracking-wider",
                  sub.healthy ? "text-emerald-400" : "text-yellow-400 animate-pulse"
                )}>{sub.status}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function MetricCard({ icon: Icon, label, value, bar, isCrisis, warn }) {
  return (
    <div className={cn("bg-black/40 rounded-xl p-3 border transition-colors",
      warn ? (isCrisis ? "border-red-500/30" : "border-yellow-500/30") : "border-white/5"
    )}>
      <div className="flex items-center gap-2 mb-2">
        <Icon size={12} className={cn(isCrisis ? "text-red-400" : "text-cyan-400")} />
        <span className="font-mono text-[8px] uppercase tracking-widest text-white/30">{label}</span>
      </div>
      <div className={cn("font-mono text-lg font-bold", warn ? (isCrisis ? "text-red-400" : "text-yellow-400") : "text-white/80")}>{value}</div>
      <div className="h-1 bg-white/5 rounded-full mt-2 overflow-hidden">
        <div className={cn("h-full rounded-full transition-all duration-500",
          warn ? (isCrisis ? "bg-red-500 shadow-[0_0_8px_red]" : "bg-yellow-500") : (isCrisis ? "bg-red-500/60" : "bg-cyan-500")
        )} style={{ width: `${Math.min(100, bar)}%` }} />
      </div>
    </div>
  );
}
