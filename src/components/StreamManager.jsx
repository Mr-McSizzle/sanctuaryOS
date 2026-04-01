import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../utils/cn";
import { useSystem } from "../context/SystemContext";
import { generateRoomCode, createHost, connectAsViewer } from "../utils/streaming";
import { Wifi, WifiOff, Monitor, Smartphone, Copy, Check, X, Users, Radio } from "lucide-react";

export default function StreamManager({ onRemoteStream, onClose }) {
  const { isCrisisMode } = useSystem();
  const [mode, setMode] = useState(null); // null | "host" | "viewer"
  const [roomCode, setRoomCode] = useState("");
  const [inputCode, setInputCode] = useState("");
  const [status, setStatus] = useState("idle"); // idle, ready, connecting, connected, error, disconnected
  const [viewers, setViewers] = useState(0);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const hostRef = useRef(null);

  // Auto-detect: if mobile, suggest viewer mode
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  const startHost = () => {
    const code = generateRoomCode();
    setRoomCode(code);
    setMode("host");
    setStatus("starting");

    const host = createHost(code, (update) => {
      if (update.status === "ready") setStatus("ready");
      if (update.status === "connected") { setStatus("connected"); setViewers(update.viewers); }
      if (update.status === "error") { setStatus("error"); setError(update.error); }
      if (update.viewers !== undefined) setViewers(update.viewers);
    });

    hostRef.current = host;

    // Get webcam and feed it to the host
    navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } }
    }).then(stream => {
      host.setStream(stream);
    }).catch(err => {
      setStatus("error");
      setError("Camera access denied");
    });
  };

  const startViewer = async () => {
    if (inputCode.length < 4) return;
    setMode("viewer");
    setStatus("connecting");
    setError("");

    try {
      const result = await connectAsViewer(inputCode.toUpperCase(), (update) => {
        setStatus(update.status);
        if (update.error) setError(update.error);
      });

      if (result?.stream) {
        onRemoteStream?.(result.stream);
        setStatus("connected");
      }
    } catch (err) {
      setStatus("error");
      setError(err.message || "Connection failed");
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (hostRef.current) hostRef.current.destroy();
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[170] flex items-center justify-center bg-black/85 backdrop-blur-xl"
      onClick={(e) => { if (e.target === e.currentTarget && status !== "connected") onClose(); }}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}
        className="w-[440px] glass-panel rounded-2xl border border-cyan-500/20 overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Radio size={20} className={cn(status === "connected" ? "text-emerald-400" : "text-cyan-400 animate-pulse")} />
            <div>
              <div className="font-mono text-sm tracking-[0.15em] uppercase font-bold">Remote Access</div>
              <div className="font-mono text-[9px] text-white/40 uppercase tracking-widest">WebRTC P2P • End-to-End Encrypted</div>
            </div>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white cursor-pointer"><X size={18} /></button>
        </div>

        <div className="p-6">
          {/* Mode Selection */}
          {!mode && (
            <div className="space-y-4">
              <p className="font-mono text-[11px] text-white/50 text-center mb-6">
                {isMobile ? "You're on mobile. Connect to your laptop's camera:" : "Choose how this device participates:"}
              </p>
              
              <button onClick={startHost}
                className="w-full p-4 bg-black/40 border border-white/10 rounded-xl hover:border-cyan-500/40 transition-all cursor-pointer group flex items-center gap-4"
              >
                <div className="p-3 bg-cyan-500/10 rounded-xl border border-cyan-500/20 group-hover:bg-cyan-500/20 transition-colors">
                  <Monitor size={24} className="text-cyan-400" />
                </div>
                <div className="text-left">
                  <div className="font-mono text-sm font-bold text-white/80 uppercase tracking-wider">Host (This PC)</div>
                  <div className="font-mono text-[10px] text-white/40 mt-0.5">Broadcast this device's camera to viewers</div>
                </div>
              </button>

              <button onClick={() => setMode("viewer_input")}
                className="w-full p-4 bg-black/40 border border-white/10 rounded-xl hover:border-violet-500/40 transition-all cursor-pointer group flex items-center gap-4"
              >
                <div className="p-3 bg-violet-500/10 rounded-xl border border-violet-500/20 group-hover:bg-violet-500/20 transition-colors">
                  <Smartphone size={24} className="text-violet-400" />
                </div>
                <div className="text-left">
                  <div className="font-mono text-sm font-bold text-white/80 uppercase tracking-wider">Viewer (Remote)</div>
                  <div className="font-mono text-[10px] text-white/40 mt-0.5">Connect to a host and view their camera</div>
                </div>
              </button>
            </div>
          )}

          {/* Host mode — show code */}
          {mode === "host" && (
            <div className="text-center space-y-5">
              <div className="font-mono text-[10px] text-white/40 uppercase tracking-widest">
                {status === "ready" ? "Share this code with your phone:" : status === "connected" ? "Streaming to viewers" : "Setting up..."}
              </div>

              {/* Room Code Display */}
              <div className="flex items-center justify-center gap-3">
                <div className="flex gap-1.5">
                  {roomCode.split("").map((char, i) => (
                    <div key={i} className={cn(
                      "w-12 h-14 rounded-xl border-2 flex items-center justify-center font-mono text-2xl font-bold transition-all",
                      status === "connected" ? "border-emerald-500/40 text-emerald-300 bg-emerald-950/20" : "border-cyan-500/30 text-cyan-300 bg-black/40"
                    )}>
                      {char}
                    </div>
                  ))}
                </div>
                <button onClick={copyCode}
                  className="p-2.5 rounded-xl border border-white/10 hover:border-cyan-500/30 bg-black/40 cursor-pointer transition-colors"
                >
                  {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} className="text-white/40" />}
                </button>
              </div>

              {/* Status */}
              <div className="flex items-center justify-center gap-2">
                {status === "connected" ? (
                  <>
                    <Wifi size={14} className="text-emerald-400" />
                    <span className="font-mono text-[10px] text-emerald-400 uppercase tracking-widest">{viewers} viewer(s) connected</span>
                  </>
                ) : status === "ready" ? (
                  <>
                    <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    <span className="font-mono text-[10px] text-cyan-400/60 uppercase tracking-widest">Waiting for connection...</span>
                  </>
                ) : (
                  <>
                    <div className="w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                    <span className="font-mono text-[10px] text-white/40 uppercase tracking-widest">Initializing...</span>
                  </>
                )}
              </div>

              {status === "connected" && (
                <button onClick={onClose}
                  className="px-6 py-2 bg-emerald-600/20 border border-emerald-500/30 rounded-xl font-mono text-[10px] uppercase tracking-widest text-emerald-300 hover:bg-emerald-600/30 cursor-pointer transition-colors"
                >
                  Minimize — Streaming continues
                </button>
              )}
            </div>
          )}

          {/* Viewer mode — enter code */}
          {mode === "viewer_input" && (
            <div className="text-center space-y-5">
              <div className="font-mono text-[10px] text-white/40 uppercase tracking-widest">Enter the code from your laptop:</div>
              
              <div className="flex gap-2 justify-center">
                <input
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value.toUpperCase().slice(0, 6))}
                  placeholder="XXXXXX"
                  maxLength={6}
                  className="w-[200px] text-center bg-black/40 border border-white/10 rounded-xl px-4 py-3 font-mono text-xl tracking-[0.3em] text-white/80 placeholder:text-white/15 outline-none focus:border-violet-500/40 uppercase"
                  autoFocus
                />
              </div>

              <button onClick={startViewer}
                disabled={inputCode.length < 4}
                className="px-8 py-2.5 bg-violet-600/30 border border-violet-500/40 rounded-xl font-mono text-[10px] uppercase tracking-widest text-violet-300 hover:bg-violet-600/50 cursor-pointer transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Connect
              </button>
            </div>
          )}

          {/* Viewer connecting */}
          {mode === "viewer" && (
            <div className="text-center space-y-4">
              {status === "connecting" && (
                <>
                  <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  <div className="font-mono text-[10px] text-violet-400 uppercase tracking-widest">Connecting to host...</div>
                </>
              )}
              {status === "connected" && (
                <>
                  <Wifi size={24} className="text-emerald-400 mx-auto" />
                  <div className="font-mono text-[10px] text-emerald-400 uppercase tracking-widest">Connected! Receiving video stream.</div>
                  <button onClick={onClose}
                    className="px-6 py-2 bg-emerald-600/20 border border-emerald-500/30 rounded-xl font-mono text-[10px] uppercase tracking-widest text-emerald-300 hover:bg-emerald-600/30 cursor-pointer transition-colors"
                  >
                    Close — Viewing live feed
                  </button>
                </>
              )}
              {status === "error" && (
                <>
                  <WifiOff size={24} className="text-red-400 mx-auto" />
                  <div className="font-mono text-[10px] text-red-400 uppercase tracking-widest">{error}</div>
                  <button onClick={() => { setMode(null); setStatus("idle"); setError(""); }}
                    className="px-6 py-2 bg-white/5 border border-white/10 rounded-xl font-mono text-[10px] uppercase tracking-widest text-white/50 hover:bg-white/10 cursor-pointer transition-colors"
                  >
                    Try Again
                  </button>
                </>
              )}
            </div>
          )}

          {/* Error state for host */}
          {status === "error" && mode === "host" && (
            <div className="text-center mt-4">
              <div className="font-mono text-[10px] text-red-400">{error}</div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
