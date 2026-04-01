import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Fingerprint, ShieldCheck } from "lucide-react";
import { cn } from "../utils/cn";

export default function AuthScreen({ onAuthenticated }) {
  const [step, setStep] = useState("idle"); // idle, scanning, verifying, granted

  const handleStartAuth = () => {
    setStep("scanning");
    
    // Simulate auth sequence
    setTimeout(() => {
      setStep("verifying");
      setTimeout(() => {
        setStep("granted");
        setTimeout(() => {
          onAuthenticated();
        }, 1200);
      }, 1500);
    }, 2000);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 1.1, opacity: 0 }}
        className="relative glass-panel p-12 rounded-[2rem] flex flex-col items-center max-w-sm w-full mx-4"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent rounded-[2rem] pointer-events-none" />

        {/* Decorative Corner Accents */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-500/30 rounded-tl-[2rem] pointer-events-none" />
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-500/30 rounded-tr-[2rem] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyan-500/30 rounded-bl-[2rem] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-500/30 rounded-br-[2rem] pointer-events-none" />

        {/* System Title */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold tracking-[0.2em] text-cyan-50 uppercase mb-2">Sanctuary</h1>
          <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
          <p className="text-cyan-400/60 font-mono text-[10px] tracking-widest mt-2 uppercase">Operating System v4.0</p>
        </div>

        <div className="relative w-48 h-48 flex items-center justify-center mb-10">
          {/* Subtle Outer Glow */}
          <div className={cn(
            "absolute inset-[-20%] rounded-full blur-2xl transition-opacity duration-1000",
            step === "idle" ? "bg-cyan-900/0" : step === "granted" ? "bg-emerald-500/20" : "bg-cyan-500/20"
          )} />

          {/* Outer Scanner Ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className={cn(
              "absolute inset-0 border-2 rounded-full border-dashed transition-colors duration-500",
              step === "idle" ? "border-cyan-500/20" : step === "granted" ? "border-emerald-500 border-solid" : "border-cyan-400"
            )}
          />
          
          {/* Inner Scanner Ring */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className={cn(
              "absolute inset-6 border rounded-full transition-colors duration-500",
              step === "idle" ? "border-cyan-500/10" : step === "granted" ? "border-emerald-400/50" : "border-cyan-300/50 border-dotted border-2"
            )}
          />

          {/* Core Circle */}
          <div className={cn(
            "absolute inset-10 rounded-full border transition-colors duration-700 bg-black/40 backdrop-blur-md flex items-center justify-center",
            step === "idle" ? "border-cyan-500/20" : step === "granted" ? "border-emerald-500/80 shadow-[0_0_30px_rgba(16,185,129,0.4)]" : "border-cyan-400/80 shadow-[0_0_30px_rgba(34,211,238,0.3)]"
          )}>
            {/* Central Icon */}
            <AnimatePresence mode="wait">
              {step === "granted" ? (
                <motion.div
                  key="granted"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.8)]"
                >
                  <ShieldCheck size={48} strokeWidth={1.5} />
                </motion.div>
              ) : (
                <motion.div
                  key="fingerprint"
                  className={cn(
                    "text-cyan-500 transition-colors duration-500 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]",
                    step !== "idle" && "text-cyan-300 drop-shadow-[0_0_15px_rgba(34,211,238,0.8)]"
                  )}
                >
                  <Fingerprint size={56} strokeWidth={1} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Scanning Line overlay */}
          {step === "scanning" && (
            <motion.div
              initial={{ top: "10%" }}
              animate={{ top: "90%" }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear", repeatType: "reverse" }}
              className="absolute left-10 right-10 h-[2px] bg-cyan-300 shadow-[0_0_15px_3px_rgba(34,211,238,0.6)] z-10"
            />
          )}
        </div>

        <div className="h-12 flex items-center justify-center font-mono text-sm tracking-widest text-cyan-300 mb-8 w-full bg-black/20 rounded-lg border border-white/5 relative overflow-hidden">
          {/* Subtle moving background in text box */}
          {step === "scanning" && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
          )}

          <AnimatePresence mode="wait">
            {step === "idle" && (
              <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="opacity-70">
                AWAITING BIOMETRICS
              </motion.span>
            )}
            {step === "scanning" && (
              <motion.span key="scanning" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-cyan-200 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]">
                SCANNING...
              </motion.span>
            )}
            {step === "verifying" && (
              <motion.span key="verifying" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-cyan-200">
                VERIFYING ENCRYPTION
              </motion.span>
            )}
            {step === "granted" && (
              <motion.span key="granted" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-emerald-400 font-bold drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]">
                ACCESS GRANTED
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {step === "idle" && (
          <button
            onClick={handleStartAuth}
            className="w-full px-8 py-4 bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/30 hover:border-cyan-400 transition-all duration-300 rounded-xl font-semibold tracking-widest text-xs text-cyan-100 hover:text-white hover:shadow-[0_0_20px_rgba(34,211,238,0.3)] flex items-center justify-center gap-3 group"
          >
            <span className="w-2 h-2 rounded-full bg-cyan-500 group-hover:bg-cyan-300 group-hover:shadow-[0_0_8px_rgba(34,211,238,1)] transition-all" />
            INITIALIZE SYSTEM
          </button>
        )}
      </motion.div>
      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
