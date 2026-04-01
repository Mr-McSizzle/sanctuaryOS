import React, { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "./Sidebar";
import DroneView from "./DroneView";
import FaceScanner from "./FaceScanner";
import FloorPlan from "./FloorPlan";
import SystemDiagnostics from "./SystemDiagnostics";
import ActivityLog from "./ActivityLog";
import StreamManager from "./StreamManager";
import { useSystem } from "../context/SystemContext";
import { cn } from "../utils/cn";
import { askGemini } from "../utils/gemini";
import { Radio } from "lucide-react";

import LiveFeed from "./tiles/LiveFeed";
import Climate from "./tiles/Climate";
import SmartLock from "./tiles/SmartLock";
import Terminal from "./tiles/Terminal";
import PowerMatrix from "./tiles/PowerMatrix";
import NetShield from "./tiles/NetShield";
import DroneControl from "./tiles/DroneControl";
import SecureVault from "./tiles/SecureVault";
import AINexus from "./tiles/AINexus";
import LightingOps from "./tiles/LightingOps";

const VOICE_SYSTEM_PROMPT = `You are the voice command parser for Sanctuary.OS smart home system. 
Given a voice command, return ONLY a JSON object (no markdown) with the action to take.
Available actions:
- {"action":"crisis_on"} — activate crisis/lockdown mode
- {"action":"crisis_off"} — deactivate crisis mode
- {"action":"lock"} / {"action":"unlock"}
- {"action":"lights_on"} / {"action":"lights_off"}
- {"action":"deploy_drone"} / {"action":"recall_drone"}
- {"action":"set_temp","value":NUMBER}
- {"action":"shield_on"} / {"action":"shield_off"}
- {"action":"garage_open"} / {"action":"garage_close"}
- {"action":"scan_face"} / {"action":"floor_plan"} / {"action":"diagnostics"} / {"action":"stream"}
- {"action":"unknown","message":"brief response"} — if not recognized
Parse the user's natural language. Always respond with valid JSON only.`;

export default function Dashboard() {
  const { 
    isCrisisMode, toggleCrisisMode,
    setIsLocked, setTemperature,
    setLights, setDroneDeployed,
    setShieldActive, setGarageOpen
  } = useSystem();

  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [voiceText, setVoiceText] = useState("");
  const [voiceStatus, setVoiceStatus] = useState("idle");
  const [voiceResponse, setVoiceResponse] = useState("");
  const [showDroneView, setShowDroneView] = useState(false);
  const [showFaceScanner, setShowFaceScanner] = useState(false);
  const [showFloorPlan, setShowFloorPlan] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [showActivityLog, setShowActivityLog] = useState(false);
  const [showStreamManager, setShowStreamManager] = useState(false);
  const [remoteStream, setRemoteStream] = useState(null);
  const recognitionRef = useRef(null);
  const liveFeedRef = useRef(null);

  useEffect(() => {
    if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) setShowStreamManager(true);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (e.ctrlKey && e.shiftKey) {
        switch (e.key.toUpperCase()) {
          case "F": e.preventDefault(); setShowFloorPlan(p => !p); break;
          case "D": e.preventDefault(); setShowDiagnostics(p => !p); break;
          case "A": e.preventDefault(); setShowActivityLog(p => !p); break;
          case "S": e.preventDefault(); setShowFaceScanner(p => !p); break;
          case "L": e.preventDefault(); toggleCrisisMode(); break;
          case "R": e.preventDefault(); setShowStreamManager(p => !p); break;
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [toggleCrisisMode]);

  const executeCommand = useCallback((parsed) => {
    const { action, value, message } = parsed;
    switch (action) {
      case "crisis_on": if (!isCrisisMode) toggleCrisisMode(); return "Crisis mode ACTIVATED.";
      case "crisis_off": if (isCrisisMode) toggleCrisisMode(); return "Crisis mode DEACTIVATED.";
      case "lock": setIsLocked(true); return "LOCKED.";
      case "unlock": setIsLocked(false); return "UNLOCKED.";
      case "lights_on": setLights(l => ({ ...l, main: { on: true, intensity: 80, color: '#ffffff' } })); return "Lights ON.";
      case "lights_off": setLights(l => ({ ...l, main: { on: false, intensity: 0, color: '#ffffff' } })); return "Lights OFF.";
      case "deploy_drone": setDroneDeployed(true); return "Drone DEPLOYED.";
      case "recall_drone": setDroneDeployed(false); return "Drone RECALLED.";
      case "set_temp": setTemperature(Number(value) || 72); return `Temp set to ${value}°F.`;
      case "shield_on": setShieldActive(true); return "Firewall ON.";
      case "shield_off": setShieldActive(false); return "Firewall OFF.";
      case "garage_open": setGarageOpen(true); return "Garage OPENING.";
      case "garage_close": setGarageOpen(false); return "Garage CLOSING.";
      case "scan_face": setShowFaceScanner(true); return "Face scanner activated.";
      case "floor_plan": setShowFloorPlan(true); return "Floor plan opened.";
      case "diagnostics": setShowDiagnostics(true); return "Diagnostics opened.";
      case "stream": setShowStreamManager(true); return "Stream manager opened.";
      case "unknown": return message || "Not recognized.";
      default: return "Processed.";
    }
  }, [isCrisisMode, toggleCrisisMode, setIsLocked, setLights, setDroneDeployed, setTemperature, setShieldActive, setGarageOpen]);

  const handleMicClick = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert("Speech Recognition not supported. Use Chrome."); return; }
    setShowVoiceModal(true); setVoiceText(""); setVoiceResponse(""); setVoiceStatus("listening");
    const recognition = new SR();
    recognition.lang = "en-US"; recognition.interimResults = true; recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results).map(r => r[0].transcript).join("");
      setVoiceText(transcript);
      if (event.results[event.results.length - 1].isFinal) processVoiceCommand(transcript);
    };
    recognition.onerror = () => { setVoiceStatus("error"); setVoiceResponse("No speech detected."); setTimeout(() => setShowVoiceModal(false), 2000); };
    recognition.start();
  }, []);

  const processVoiceCommand = async (transcript) => {
    setVoiceStatus("processing");
    try {
      const resp = await askGemini(`Voice command: "${transcript}"`, VOICE_SYSTEM_PROMPT);
      const m = resp.match(/\{[\s\S]*\}/);
      if (m) { setVoiceResponse(executeCommand(JSON.parse(m[0]))); setVoiceStatus("executed"); }
      else { setVoiceResponse("Parse failed."); setVoiceStatus("error"); }
    } catch {
      const lower = transcript.toLowerCase();
      let result = "Not recognized.";
      if (lower.includes("crisis") || lower.includes("lockdown")) {
        if (lower.includes("off") || lower.includes("stop") || lower.includes("cancel")) { if (isCrisisMode) toggleCrisisMode(); result = "Crisis OFF."; }
        else { if (!isCrisisMode) toggleCrisisMode(); result = "Crisis ON."; }
      } else if (lower.includes("lock")) { lower.includes("un") ? setIsLocked(false) : setIsLocked(true); result = lower.includes("un") ? "Unlocked." : "Locked."; }
      else if (lower.includes("light")) { 
        if (lower.includes("off")) { setLights(l => ({ ...l, main: { on: false, intensity: 0, color: '#ffffff' } })); result = "Lights off."; }
        else { setLights(l => ({ ...l, main: { on: true, intensity: 80, color: '#ffffff' } })); result = "Lights on."; }
      } else if (lower.includes("drone")) { lower.includes("recall") ? setDroneDeployed(false) : setDroneDeployed(true); result = lower.includes("recall") ? "Drone recalled." : "Drone deployed."; }
      setVoiceResponse(result); setVoiceStatus("executed");
    }
    setTimeout(() => setShowVoiceModal(false), 2500);
  };

  const getVideoRef = () => liveFeedRef.current?.getVideo ? { current: liveFeedRef.current.getVideo() } : null;
  const tileClass = (extra = "") => cn("rounded-2xl overflow-hidden transition-all duration-700", isCrisisMode ? "glass-panel-crisis" : "glass-panel", extra);

  return (
    <div className="flex h-screen w-screen relative overflow-hidden max-md:flex-col max-md:h-auto max-md:min-h-screen max-md:overflow-y-auto">
      {/* Sidebar — desktop only */}
      <div className="hidden md:block shrink-0">
        <Sidebar onMicClick={handleMicClick} onFloorPlan={() => setShowFloorPlan(true)} onDiagnostics={() => setShowDiagnostics(true)} onActivityLog={() => setShowActivityLog(true)} />
      </div>
      
      {/* MAIN GRID — uses CSS classes from index.css */}
      <div className="flex-1 overflow-hidden h-full p-4 max-md:overflow-visible max-md:p-2 max-md:h-auto">
        <div className="dashboard-grid">
          <div className={tileClass("tile-livefeed p-3")}><LiveFeed ref={liveFeedRef} onScanFace={() => setShowFaceScanner(true)} remoteStream={remoteStream} /></div>
          <div className={tileClass("tile-climate p-4")}><Climate /></div>
          <div className={tileClass("tile-smartlock p-4 flex flex-col relative")}><SmartLock /></div>
          <div className={tileClass("tile-terminal p-4")}><Terminal /></div>
          <div className={tileClass("tile-power p-4")}><PowerMatrix /></div>
          <div className={tileClass("tile-netshield p-4")}><NetShield /></div>
          <div className={tileClass("tile-drone p-4")}><DroneControl onOpenDroneView={() => setShowDroneView(true)} /></div>
          <div className={tileClass("tile-vault p-4")}><SecureVault /></div>
          <div className={tileClass("tile-ainexus p-4")}><AINexus /></div>
          <div className={tileClass("tile-lighting p-4")}><LightingOps /></div>
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-xl border-t border-white/10 flex items-center justify-around py-2 px-4 safe-bottom">
        <button onClick={handleMicClick} className="p-3 rounded-full bg-cyan-500/20 border border-cyan-500/30 cursor-pointer">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-cyan-400"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
        </button>
        <button onClick={() => setShowFloorPlan(true)} className="p-3 rounded-xl bg-white/5 border border-white/10 cursor-pointer">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/50"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
        </button>
        <button onClick={() => setShowDiagnostics(true)} className="p-3 rounded-xl bg-white/5 border border-white/10 cursor-pointer">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/50"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
        </button>
        <button onClick={() => setShowStreamManager(true)} className="p-3 rounded-xl bg-white/5 border border-white/10 cursor-pointer">
          <Radio size={18} className={cn(remoteStream ? "text-emerald-400" : "text-white/50")} />
        </button>
      </div>

      {/* Stream indicator (desktop) */}
      <button onClick={() => setShowStreamManager(true)}
        className={cn("hidden md:flex fixed bottom-4 left-4 z-50 items-center gap-2 px-3 py-2 rounded-xl border backdrop-blur-md cursor-pointer transition-all",
          remoteStream ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-400" : "bg-black/40 border-white/10 text-white/30 hover:text-white/60"
        )}>
        <Radio size={14} />
        <span className="font-mono text-[9px] uppercase tracking-widest">{remoteStream ? "Connected" : "Stream"}</span>
      </button>

      {/* OVERLAYS */}
      <AnimatePresence>{showDroneView && <DroneView onClose={() => setShowDroneView(false)} />}</AnimatePresence>
      <AnimatePresence>{showFaceScanner && <FaceScanner videoRef={getVideoRef()} onClose={() => setShowFaceScanner(false)} />}</AnimatePresence>
      <AnimatePresence>{showFloorPlan && <FloorPlan onClose={() => setShowFloorPlan(false)} />}</AnimatePresence>
      <AnimatePresence>{showDiagnostics && <SystemDiagnostics onClose={() => setShowDiagnostics(false)} />}</AnimatePresence>
      <AnimatePresence>{showActivityLog && <ActivityLog onClose={() => setShowActivityLog(false)} />}</AnimatePresence>
      <AnimatePresence>{showStreamManager && <StreamManager onRemoteStream={setRemoteStream} onClose={() => setShowStreamManager(false)} />}</AnimatePresence>

      {/* Crisis Banner */}
      <AnimatePresence>
        {isCrisisMode && (
          <motion.div initial={{ y: -100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -100, opacity: 0 }}
            onClick={toggleCrisisMode}
            className="fixed top-4 left-1/2 -translate-x-1/2 bg-red-600/90 backdrop-blur-md border border-red-400 text-white px-4 sm:px-8 py-2 sm:py-3 rounded-full font-bold tracking-[0.15em] shadow-[0_0_40px_rgba(220,38,38,0.5)] flex items-center gap-2 sm:gap-4 text-xs sm:text-sm z-[100] cursor-pointer hover:bg-red-500/90 transition-colors"
          >
            <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-white animate-pulse" />
            <span className="hidden sm:inline">CRITICAL — CLICK TO DEACTIVATE</span>
            <span className="sm:hidden">⚠ TAP TO STAND DOWN</span>
            <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-white animate-pulse" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Voice Modal */}
      <AnimatePresence>
        {showVoiceModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
            onClick={(e) => { if (e.target === e.currentTarget) { recognitionRef.current?.stop(); setShowVoiceModal(false); }}}
          >
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="glass-panel rounded-[2rem] px-6 sm:px-10 py-6 sm:py-8 flex flex-col items-center gap-4 sm:gap-6 w-full max-w-[440px]"
            >
              <div className="flex items-center gap-3">
                {voiceStatus === "listening" && (
                  <><div className="flex gap-1 items-center h-8">{[...Array(5)].map((_, i) => (
                    <motion.div key={i} animate={{ height: ["20%", "100%", "20%"] }} transition={{ duration: 0.5 + Math.random() * 0.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.1 }}
                      className="w-1.5 bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
                  ))}</div><span className="font-mono text-[10px] uppercase tracking-widest text-cyan-400 animate-pulse">Listening...</span></>
                )}
                {voiceStatus === "processing" && <><div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" /><span className="font-mono text-[10px] uppercase tracking-widest text-violet-400">Processing...</span></>}
                {voiceStatus === "executed" && <span className="font-mono text-[10px] uppercase tracking-widest text-emerald-400">✓ Executed</span>}
                {voiceStatus === "error" && <span className="font-mono text-[10px] uppercase tracking-widest text-red-400">✕ Error</span>}
              </div>
              <div className="font-mono text-lg sm:text-xl tracking-wider text-cyan-50 min-h-[32px] flex items-center justify-center text-center">
                {voiceText || (voiceStatus === "listening" ? "Speak now..." : "")}
                {voiceStatus === "listening" && <motion.span animate={{ opacity: [1, 0, 1] }} transition={{ duration: 0.8, repeat: Infinity }} className="w-3 h-6 bg-cyan-400 ml-1 rounded-sm" />}
              </div>
              {voiceResponse && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className={cn("font-mono text-sm px-4 py-2 rounded-xl border text-center",
                    voiceStatus === "executed" ? "border-emerald-500/30 bg-emerald-950/30 text-emerald-300" : "border-red-500/30 bg-red-950/30 text-red-300"
                  )}>{voiceResponse}</motion.div>
              )}
              <div className="font-mono text-[8px] sm:text-[9px] text-white/30 text-center">"crisis mode" • "lights off" • "deploy drone" • "scan face"</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Crisis 911 — desktop */}
      <AnimatePresence>
        {isCrisisMode && (
          <motion.div initial={{ x: "120%", opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: "120%", opacity: 0 }}
            className="hidden sm:flex fixed bottom-8 right-8 z-[60] glass-panel-crisis border-l-4 border-l-red-500/80 p-6 flex-col shadow-[0_10px_40px_rgba(220,38,38,0.4)] rounded-2xl"
          >
            <span className="text-red-400/80 font-mono text-xs uppercase tracking-[0.3em] mb-3 font-bold">Emergency override</span>
            <div className="flex items-center gap-5">
              <div className="relative"><div className="absolute inset-0 border-[3px] border-red-500/30 rounded-full animate-ping" />
                <div className="w-12 h-12 border-t-[3px] border-b-[3px] border-red-500 rounded-full animate-[spin_1.5s_linear_infinite]" /></div>
              <span className="text-red-100 font-bold text-3xl tracking-widest uppercase">Dialing 911</span>
            </div>
            <button onClick={toggleCrisisMode} className="mt-4 py-2 px-4 bg-white/10 border border-white/20 rounded-lg font-mono text-[10px] uppercase tracking-widest text-white/60 hover:bg-white/20 hover:text-white transition-colors cursor-pointer">
              Override — Stand Down
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
