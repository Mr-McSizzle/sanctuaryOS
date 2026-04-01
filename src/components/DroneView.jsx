import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSystem } from "../context/SystemContext";
import { cn } from "../utils/cn";
import { askGemini } from "../utils/gemini";
import { X, Crosshair, Radio, MapPin, Gauge, Battery, Wind, Eye, Target, ShieldAlert, Thermometer, Camera, Volume2, Zap, Navigation } from "lucide-react";

const DETECTION_DELAY = 8000;
const LOCK_DELAY = 12000;
const CLASSIFY_DELAY = 16000;

const CAMERAS = [
  { id: "CAM-01", label: "North Perimeter", sector: "A1" },
  { id: "CAM-02", label: "East Fence Line", sector: "B2" },
  { id: "CAM-03", label: "Rooftop Wide", sector: "C3" },
  { id: "CAM-04", label: "Garage Entry", sector: "D4" },
];

export default function DroneView({ onClose }) {
  const { isCrisisMode, toggleCrisisMode, droneBattery } = useSystem();

  const [phase, setPhase] = useState("scanning");
  const [scanAngle, setScanAngle] = useState(0);
  const [altitude, setAltitude] = useState(42);
  const [speed, setSpeed] = useState(12.4);
  const [coords, setCoords] = useState({ lat: 37.7749, lng: -122.4194 });
  const [telemetryLogs, setTelemetryLogs] = useState([]);
  const [targetPos, setTargetPos] = useState({ x: 65, y: 55 });
  const [thermalMode, setThermalMode] = useState(false);
  const [activeCamera, setActiveCamera] = useState(0);
  const [aiNarration, setAiNarration] = useState("");
  const [isNarrating, setIsNarrating] = useState(false);
  const [dronePathPoints, setDronePathPoints] = useState([{ x: 30, y: 50 }]);
  const [nightVisionIntensity, setNightVisionIntensity] = useState(0.7);
  const logRef = useRef(null);
  const crisisRef = useRef(toggleCrisisMode);
  crisisRef.current = toggleCrisisMode;

  // Scan rotation
  useEffect(() => {
    const interval = setInterval(() => setScanAngle(prev => (prev + 1.5) % 360), 50);
    return () => clearInterval(interval);
  }, []);

  // Telemetry jitter + drone path
  useEffect(() => {
    const interval = setInterval(() => {
      setAltitude(prev => Math.max(20, Math.min(80, prev + (Math.random() - 0.5) * 3)));
      setSpeed(prev => Math.max(0, Math.min(30, prev + (Math.random() - 0.5) * 2)));
      setCoords(prev => ({
        lat: prev.lat + (Math.random() - 0.5) * 0.0001,
        lng: prev.lng + (Math.random() - 0.5) * 0.0001
      }));
      // Add path point for mini-map trail
      setDronePathPoints(prev => {
        const last = prev[prev.length - 1];
        const next = {
          x: Math.max(10, Math.min(90, last.x + (Math.random() - 0.5) * 8)),
          y: Math.max(10, Math.min(90, last.y + (Math.random() - 0.5) * 8))
        };
        return [...prev.slice(-20), next];
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Detection scenario
  useEffect(() => {
    const addLog = (msg) => setTelemetryLogs(prev => [...prev.slice(-30), `[${new Date().toLocaleTimeString('en-US', { hour12: false })}] ${msg}`]);

    addLog("DRONE-01 uplink established — encrypted channel AES-256");
    addLog("Boot sequence: LIDAR ✓ | IR ✓ | NV-GEN-III ✓ | GPS ✓");
    addLog("Scanning perimeter sectors A1-D4...");
    addLog("Altitude hold: 42m | Wind: 3.2 m/s NW");

    const t0 = setTimeout(() => addLog("Sector A1 sweep complete — clear"), 3000);
    const t0b = setTimeout(() => addLog("Sector B2 sweep complete — clear"), 5000);

    const t1 = setTimeout(() => {
      addLog("⚠ ACOUSTIC ANOMALY — Sector C3 perimeter fence");
      addLog("Redirecting primary sensor array to bearing 247°");
      setTimeout(() => {
        addLog("⚠ THERMAL SIGNATURE ACQUIRED — 1 humanoid entity");
        addLog("Height estimate: 1.78m | Velocity: 1.2 m/s NE");
        setPhase("detected");
        setTargetPos({ x: 55 + Math.random() * 20, y: 40 + Math.random() * 20 });
        setThermalMode(true);
        triggerAINarration("detected");
      }, 1500);
    }, DETECTION_DELAY);

    const t2 = setTimeout(() => {
      addLog("TRACKING: Entity approaching structure — 47m out");
      addLog("Facial recognition: SCANNING...");
      addLog("Gait analysis: NO DATABASE MATCH");
      addLog("═══ TARGET LOCK ACQUIRED ═══");
      setPhase("locked");
      triggerAINarration("locked");
    }, LOCK_DELAY);

    const t3 = setTimeout(() => {
      addLog("FACIAL MATCH: 0.00% — UNKNOWN INDIVIDUAL");
      addLog("CLASSIFICATION: ██████ HOSTILE INTRUDER ██████");
      addLog(">>> INITIATING CRISIS PROTOCOL — ALL SYSTEMS <<<");
      addLog("COUNTERMEASURES: ARMED | SPOTLIGHT: ENGAGED");
      setPhase("classified");
      triggerAINarration("classified");
    }, CLASSIFY_DELAY);

    return () => { clearTimeout(t0); clearTimeout(t0b); clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  // AI narration via Gemini
  const triggerAINarration = async (currentPhase) => {
    setIsNarrating(true);
    try {
      const prompts = {
        detected: "You are a drone AI giving a brief tactical assessment. A thermal signature (1 humanoid) was just detected at the perimeter fence of a secure property at night. Give a 2-sentence tactical report in military radio style. Be terse.",
        locked: "You are a drone AI. Target lock has been acquired on an unknown individual approaching a secure building. The person does not match any facial recognition database. Give a 2-sentence tactical update in military radio style.",
        classified: "You are a drone AI. An unknown intruder has been classified as hostile. Crisis protocol is now active across all building systems. Give a 2-sentence urgent tactical status in military radio style. Mention countermeasures."
      };
      const response = await askGemini(prompts[currentPhase]);
      setAiNarration(response.trim());
    } catch {
      const fallbacks = {
        detected: "DRONE-01: Thermal contact bearing 247. Single entity, unknown classification. Maintaining overwatch.",
        locked: "DRONE-01: Target lock confirmed. Subject does not match authorized personnel database. Recommend escalation.",
        classified: "DRONE-01: Hostile classification confirmed. All countermeasures armed. Perimeter lockdown in effect."
      };
      setAiNarration(fallbacks[currentPhase]);
    }
    setIsNarrating(false);
  };

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [telemetryLogs]);

  const isAlert = phase === "detected" || phase === "locked" || phase === "classified";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-black flex flex-col overflow-hidden"
    >
      {/* Top Bar */}
      <div className={cn("flex items-center justify-between px-6 py-2.5 border-b shrink-0", isAlert ? "border-red-500/50 bg-red-950/30" : "border-white/10 bg-black/80")}>
        <div className="flex items-center gap-4">
          <Crosshair size={18} className={cn(isAlert ? "text-red-400 animate-pulse" : "text-cyan-400")} />
          <span className="font-mono text-xs tracking-[0.3em] uppercase font-bold text-white/90">DRONE-01 // {CAMERAS[activeCamera].label}</span>
          <div className={cn("px-3 py-1 rounded-full text-[9px] font-mono font-bold uppercase tracking-widest", 
            phase === "scanning" ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30" :
            phase === "classified" ? "bg-red-500/30 text-red-300 border border-red-500/50 animate-pulse" : 
            "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
          )}>
            {phase === "scanning" ? "SCANNING" : phase === "detected" ? "MOVEMENT DETECTED" : phase === "locked" ? "TARGET LOCKED" : "⚠ INTRUDER"}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* View Mode Toggles */}
          <button onClick={() => setThermalMode(!thermalMode)} className={cn("p-1.5 rounded-lg border transition-all cursor-pointer text-[9px] font-mono flex items-center gap-1.5",
            thermalMode ? "bg-orange-500/20 border-orange-500/40 text-orange-400" : "bg-white/5 border-white/10 text-white/40 hover:text-white/70"
          )}>
            <Thermometer size={12} /> THERMAL
          </button>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/50 hover:text-white cursor-pointer">
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Camera Feed */}
        <div className="flex-1 relative overflow-hidden bg-black">
          
          {/* Background gradient based on mode */}
          <div className={cn("absolute inset-0 transition-all duration-1000",
            thermalMode 
              ? "bg-gradient-to-br from-purple-950/60 via-black to-orange-950/40"
              : isAlert ? "bg-gradient-to-br from-red-950/40 to-black" : "bg-gradient-to-br from-green-950/30 to-black"
          )} />

          {/* Grid overlay */}
          <div className="absolute inset-0 pointer-events-none opacity-10" style={{ 
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)', 
            backgroundSize: '40px 40px' 
          }} />

          {/* Scanlines */}
          <div className={cn("absolute inset-0 pointer-events-none opacity-10",
            thermalMode 
              ? "bg-[repeating-linear-gradient(0deg,transparent,transparent_3px,rgba(255,120,0,0.04)_3px,rgba(255,120,0,0.04)_6px)]"
              : "bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(255,255,255,0.03)_2px,rgba(255,255,255,0.03)_4px)]"
          )} />

          {/* Thermal noise overlay */}
          {thermalMode && (
            <div className="absolute inset-0 pointer-events-none opacity-20 mix-blend-color-dodge"
              style={{ background: `radial-gradient(ellipse at ${targetPos.x}% ${targetPos.y}%, rgba(255,100,0,0.4) 0%, transparent 40%)` }}
            />
          )}

          {/* Rotating sweep */}
          <div className="absolute top-1/2 left-1/2 w-[300px] h-[1px] origin-left pointer-events-none"
            style={{ transform: `rotate(${scanAngle}deg)` }}
          >
            <div className={cn("w-full h-full", 
              thermalMode ? "bg-gradient-to-r from-orange-500/40 to-transparent"
              : isAlert ? "bg-gradient-to-r from-red-500/60 to-transparent" : "bg-gradient-to-r from-green-500/40 to-transparent"
            )} />
          </div>

          {/* Center reticle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <svg width="100" height="100" viewBox="0 0 120 120" className={cn("opacity-30", thermalMode ? "text-orange-500" : isAlert ? "text-red-500" : "text-green-500")}>
              <circle cx="60" cy="60" r="55" fill="none" stroke="currentColor" strokeWidth="0.5" />
              <circle cx="60" cy="60" r="35" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 8" />
              <line x1="60" y1="0" x2="60" y2="25" stroke="currentColor" strokeWidth="1" />
              <line x1="60" y1="95" x2="60" y2="120" stroke="currentColor" strokeWidth="1" />
              <line x1="0" y1="60" x2="25" y2="60" stroke="currentColor" strokeWidth="1" />
              <line x1="95" y1="60" x2="120" y2="60" stroke="currentColor" strokeWidth="1" />
            </svg>
          </div>

          {/* TARGET */}
          <AnimatePresence>
            {isAlert && (
              <motion.div
                initial={{ opacity: 0, scale: 2 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute pointer-events-none"
                style={{ left: `${targetPos.x}%`, top: `${targetPos.y}%`, transform: 'translate(-50%, -50%)' }}
              >
                <div className={cn("relative w-24 h-24 border-2", 
                  phase === "classified" ? "border-red-500 shadow-[0_0_40px_rgba(220,38,38,0.6)]" : "border-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.4)]",
                  phase === "detected" ? "animate-pulse" : ""
                )}>
                  <div className="absolute -top-1 -left-1 w-5 h-5 border-t-2 border-l-2 border-current" />
                  <div className="absolute -top-1 -right-1 w-5 h-5 border-t-2 border-r-2 border-current" />
                  <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-2 border-l-2 border-current" />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-2 border-r-2 border-current" />
                  <div className={cn("absolute top-1/2 left-1/2 w-2 h-2 rounded-full -translate-x-1/2 -translate-y-1/2",
                    phase === "classified" ? "bg-red-500 shadow-[0_0_15px_red]" : "bg-yellow-500"
                  )} />

                  {/* Thermal halo */}
                  {thermalMode && (
                    <div className="absolute inset-[-15px] rounded-full bg-orange-500/10 blur-xl animate-pulse" />
                  )}
                </div>

                {/* Info card */}
                <div className={cn("absolute -bottom-12 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[9px] tracking-widest px-3 py-1 rounded flex items-center gap-2",
                  phase === "classified" ? "bg-red-900/90 text-red-200 border border-red-500/50" : "bg-yellow-900/80 text-yellow-200 border border-yellow-500/40"
                )}>
                  <Target size={10} />
                  {phase === "classified" ? "HOSTILE — 0% MATCH" : phase === "locked" ? "TARGET LOCKED" : "THERMAL SIG 37.2°C"}
                </div>

                {(phase === "locked" || phase === "classified") && (
                  <div className={cn("absolute inset-[-25px] border border-dashed rounded-full animate-[spin_3s_linear_infinite]",
                    phase === "classified" ? "border-red-500/40" : "border-yellow-500/30"
                  )} />
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* HUD Corners */}
          <div className="absolute top-4 left-4 font-mono text-[10px] text-green-400/70 space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span>REC {new Date().toLocaleTimeString('en-US', { hour12: false })}</span>
            </div>
            <div>IR: {thermalMode ? "THERMAL" : "ACTIVE"} | NV: GEN-III</div>
            <div>DRONE-01 // AUTONOMOUS</div>
          </div>

          <div className="absolute top-4 right-4 font-mono text-[10px] text-green-400/70 text-right space-y-1">
            <div>FPS: 30 | LAT: {coords.lat.toFixed(4)}</div>
            <div>LNG: {coords.lng.toFixed(4)}</div>
            <div>HDG: {(scanAngle % 360).toFixed(0)}° | ELEV: {altitude.toFixed(0)}m</div>
          </div>

          {/* AI Narration Overlay */}
          <AnimatePresence>
            {aiNarration && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute bottom-16 left-4 right-4 z-20"
              >
                <div className={cn("bg-black/80 backdrop-blur-md border rounded-xl px-4 py-3",
                  phase === "classified" ? "border-red-500/40" : "border-violet-500/30"
                )}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <Volume2 size={10} className={cn(isNarrating ? "animate-pulse" : "", phase === "classified" ? "text-red-400" : "text-violet-400")} />
                    <span className="font-mono text-[8px] uppercase tracking-widest text-white/40">AI Tactical Narration // Gemini</span>
                  </div>
                  <p className={cn("font-mono text-[10px] leading-relaxed", phase === "classified" ? "text-red-200" : "text-white/70")}>
                    {aiNarration}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom telemetry strip */}
          <div className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-md border-t border-white/10 px-6 py-2.5 flex items-center gap-6 z-10">
            <TelemetryItem icon={Gauge} label="Alt" value={`${altitude.toFixed(0)}m`} />
            <TelemetryItem icon={Wind} label="Speed" value={`${speed.toFixed(1)} m/s`} />
            <TelemetryItem icon={Battery} label="Batt" value={`${droneBattery}%`} />
            <TelemetryItem icon={MapPin} label="Sector" value={CAMERAS[activeCamera].sector} />
            <TelemetryItem icon={Navigation} label="Hdg" value={`${(scanAngle % 360).toFixed(0)}°`} />
            <div className="flex items-center gap-2 ml-auto">
              <Eye size={14} className={isAlert ? "text-red-400" : "text-green-400"} />
              <span className={cn("font-mono text-[10px] font-bold uppercase", isAlert ? "text-red-400" : "text-green-400")}>
                {phase === "classified" ? "HOSTILE" : isAlert ? "ALERT" : "CLEAR"}
              </span>
            </div>
          </div>

          {/* Mini-Map */}
          <div className="absolute bottom-14 right-4 w-[140px] h-[100px] bg-black/70 border border-white/10 rounded-lg overflow-hidden z-10 backdrop-blur-sm">
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: 'linear-gradient(rgba(34,211,238,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.3) 1px, transparent 1px)',
              backgroundSize: '14px 14px'
            }} />
            {/* Property outline */}
            <div className="absolute inset-3 border border-cyan-500/30 rounded-sm" />
            <div className="absolute top-1 left-1 font-mono text-[6px] text-cyan-400/60 uppercase">Sector Map</div>
            {/* Drone trail */}
            <svg className="absolute inset-0 w-full h-full">
              {dronePathPoints.map((p, i) => {
                if (i === 0) return null;
                const prev = dronePathPoints[i - 1];
                return (
                  <line key={i}
                    x1={`${prev.x}%`} y1={`${prev.y}%`}
                    x2={`${p.x}%`} y2={`${p.y}%`}
                    stroke="rgba(34,211,238,0.3)" strokeWidth="1"
                  />
                );
              })}
            </svg>
            {/* Current drone position */}
            {dronePathPoints.length > 0 && (
              <div
                className="absolute w-2.5 h-2.5 bg-cyan-400 rounded-full shadow-[0_0_8px_cyan] -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${dronePathPoints[dronePathPoints.length - 1].x}%`, top: `${dronePathPoints[dronePathPoints.length - 1].y}%` }}
              />
            )}
            {/* Target blip */}
            {isAlert && (
              <div
                className="absolute w-2 h-2 bg-red-500 rounded-full animate-ping shadow-[0_0_6px_red] -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${targetPos.x * 0.8 + 10}%`, top: `${targetPos.y * 0.8 + 5}%` }}
              />
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-[320px] bg-black/95 border-l border-white/10 flex flex-col shrink-0">
          
          {/* Camera Selector */}
          <div className="px-3 py-2 border-b border-white/10 flex gap-1.5 shrink-0">
            {CAMERAS.map((cam, i) => (
              <button key={cam.id} onClick={() => setActiveCamera(i)}
                className={cn("flex-1 py-1.5 rounded-lg font-mono text-[8px] uppercase tracking-wider cursor-pointer transition-all border",
                  i === activeCamera 
                    ? (isAlert ? "bg-red-500/20 border-red-500/40 text-red-300" : "bg-cyan-500/20 border-cyan-500/40 text-cyan-300")
                    : "bg-white/5 border-white/5 text-white/30 hover:text-white/60"
                )}
              >
                {cam.id}
              </button>
            ))}
          </div>

          {/* Telemetry Feed Header */}
          <div className="px-4 py-2.5 border-b border-white/10 flex items-center gap-2 shrink-0">
            <Radio size={12} className={cn(isAlert ? "text-red-400 animate-pulse" : "text-cyan-400")} />
            <span className="font-mono text-[10px] tracking-[0.2em] uppercase font-bold text-white/70">Telemetry Feed</span>
          </div>

          {/* Logs */}
          <div ref={logRef} className="flex-1 overflow-y-auto custom-scrollbar px-3 py-2 space-y-1">
            {telemetryLogs.map((log, i) => {
              const isWarning = log.includes("⚠") || log.includes("INTRUDER") || log.includes("CRISIS") || log.includes("═══") || log.includes("HOSTILE") || log.includes("██");
              return (
                <div key={i} className={cn(
                  "font-mono text-[9px] py-1 px-2 rounded leading-relaxed",
                  isWarning ? "text-red-300 bg-red-950/50 border-l-2 border-red-500" : "text-green-300/60"
                )}>
                  {log}
                </div>
              );
            })}
          </div>

          {/* Action Buttons */}
          {phase === "classified" && (
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="p-3 border-t border-red-500/30 space-y-1.5 shrink-0"
            >
              <button className="w-full py-2 bg-red-600/30 border border-red-500/50 rounded-lg font-mono text-[9px] tracking-widest uppercase text-red-300 hover:bg-red-600/50 transition-colors cursor-pointer flex items-center justify-center gap-2">
                <Zap size={12} />
                Deploy Countermeasures
              </button>
              <button className="w-full py-2 bg-yellow-600/20 border border-yellow-500/40 rounded-lg font-mono text-[9px] tracking-widest uppercase text-yellow-300 hover:bg-yellow-600/30 transition-colors cursor-pointer flex items-center justify-center gap-2">
                <Target size={12} />
                Mark & Continue Tracking
              </button>
              <button className="w-full py-2 bg-violet-600/20 border border-violet-500/30 rounded-lg font-mono text-[9px] tracking-widest uppercase text-violet-300 hover:bg-violet-600/30 transition-colors cursor-pointer flex items-center justify-center gap-2">
                <Volume2 size={12} />
                Broadcast Warning
              </button>
              <button onClick={onClose} className="w-full py-2 bg-white/5 border border-white/10 rounded-lg font-mono text-[9px] tracking-widest uppercase text-white/50 hover:bg-white/10 transition-colors cursor-pointer">
                Return to Dashboard
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function TelemetryItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-1.5">
      <Icon size={12} className="text-cyan-400/70" />
      <div className="font-mono text-[9px]">
        <span className="text-white/30 uppercase tracking-widest">{label}</span>
        <span className="text-white ml-1.5">{value}</span>
      </div>
    </div>
  );
}
