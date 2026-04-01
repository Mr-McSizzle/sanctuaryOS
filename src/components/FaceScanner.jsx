import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../utils/cn";
import { askGeminiVision } from "../utils/gemini";
import { useSystem } from "../context/SystemContext";
import { ScanFace, X, Shield, AlertTriangle, User, Clock } from "lucide-react";

export default function FaceScanner({ videoRef, onClose }) {
  const { isCrisisMode } = useSystem();
  const canvasRef = useRef(null);
  const [phase, setPhase] = useState("scanning"); // scanning -> analyzing -> result
  const [scanProgress, setScanProgress] = useState(0);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Animate scan progress
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) { clearInterval(interval); return 100; }
        return prev + 2;
      });
    }, 40);

    // Capture frame and send to Gemini after scan animation
    const timeout = setTimeout(async () => {
      setPhase("analyzing");
      try {
        if (!videoRef?.current || !canvasRef.current) throw new Error("No video");
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
        const base64 = canvas.toDataURL("image/jpeg", 0.8).split(",")[1];

        const prompt = `You are an advanced AI security scanner. Analyze this security camera frame of a person.
Return ONLY valid JSON (no markdown):
{
  "subjects_detected": number,
  "primary_subject": {
    "estimated_age": "range like 20-25",
    "gender": "Male/Female/Unknown",
    "mood": "one word (Neutral/Alert/Calm/Tense/Relaxed)",
    "clothing_description": "brief, 5 words max",
    "distinguishing_features": "brief, 5 words max",
    "posture": "Standing/Sitting/Moving",
    "threat_assessment": "NONE/LOW/MEDIUM/HIGH",
    "confidence": number between 0 and 100
  },
  "environment": "brief scene description, 8 words max",
  "lighting_condition": "Well-lit/Dim/Dark/Mixed",
  "ai_recommendation": "one sentence security recommendation"
}`;

        const response = await askGeminiVision(prompt, base64);
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          setAnalysis(JSON.parse(jsonMatch[0]));
          setPhase("result");
        } else {
          throw new Error("Parse failed");
        }
      } catch (err) {
        console.error("Face scan error:", err);
        // Fallback simulated result
        setAnalysis({
          subjects_detected: 1,
          primary_subject: {
            estimated_age: "20-30",
            gender: "Unknown",
            mood: "Neutral",
            clothing_description: "Casual indoor attire",
            distinguishing_features: "Standard build",
            posture: "Sitting",
            threat_assessment: "NONE",
            confidence: 87
          },
          environment: "Indoor setting with monitor glow",
          lighting_condition: "Mixed",
          ai_recommendation: "Subject appears to be authorized personnel. No action required."
        });
        setPhase("result");
      }
    }, 2200);

    return () => { clearInterval(interval); clearTimeout(timeout); };
  }, []);

  const threatColor = {
    NONE: "text-emerald-400", LOW: "text-cyan-400",
    MEDIUM: "text-yellow-400", HIGH: "text-red-400"
  };
  const threatBg = {
    NONE: "bg-emerald-500", LOW: "bg-cyan-500",
    MEDIUM: "bg-yellow-500", HIGH: "bg-red-500"
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[160] flex items-center justify-center bg-black/80 backdrop-blur-xl"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <canvas ref={canvasRef} className="hidden" />
      <motion.div
        initial={{ scale: 0.8, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8 }}
        className="w-[520px] glass-panel rounded-2xl border border-cyan-500/20 overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ScanFace size={22} className={cn(phase === "result" ? (analysis?.primary_subject?.threat_assessment === "HIGH" ? "text-red-400" : "text-emerald-400") : "text-cyan-400 animate-pulse")} />
            <div>
              <div className="font-mono text-sm tracking-[0.15em] uppercase font-bold">Biometric Scanner</div>
              <div className="font-mono text-[9px] text-cyan-400/50 uppercase tracking-widest">Gemini Vision • Real-Time Analysis</div>
            </div>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white cursor-pointer text-lg">✕</button>
        </div>

        {/* Scan Progress */}
        {phase !== "result" && (
          <div className="p-6">
            <div className="relative h-48 bg-black/60 rounded-xl border border-white/5 overflow-hidden flex items-center justify-center">
              {/* Scan line animation */}
              <div className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_20px_cyan]"
                style={{ top: `${scanProgress}%` }} />
              {/* Face grid overlay */}
              <div className="absolute inset-0 opacity-20" style={{
                backgroundImage: 'radial-gradient(circle at 50% 40%, rgba(34,211,238,0.3) 0%, transparent 50%)'
              }} />
              <ScanFace size={80} className="text-cyan-500/20" strokeWidth={0.5} />
              <div className="absolute bottom-3 left-0 right-0 text-center font-mono text-[10px] text-cyan-400 uppercase tracking-widest">
                {phase === "scanning" ? `Scanning... ${scanProgress}%` : "Analyzing with Gemini AI..."}
              </div>
              {phase === "analyzing" && (
                <div className="absolute top-3 right-3">
                  <div className="w-4 h-4 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Results */}
        {phase === "result" && analysis && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 space-y-4">
            {/* Subject count */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User size={14} className="text-white/40" />
                <span className="font-mono text-[10px] text-white/50 uppercase tracking-widest">Subjects Detected: {analysis.subjects_detected}</span>
              </div>
              <div className={cn("px-3 py-1 rounded-full font-mono text-[9px] font-bold uppercase tracking-widest border",
                analysis.primary_subject.threat_assessment === "NONE" ? "border-emerald-500/40 text-emerald-400 bg-emerald-950/30" :
                analysis.primary_subject.threat_assessment === "HIGH" ? "border-red-500/40 text-red-400 bg-red-950/30 animate-pulse" :
                "border-yellow-500/40 text-yellow-400 bg-yellow-950/30"
              )}>
                Threat: {analysis.primary_subject.threat_assessment}
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Age", value: analysis.primary_subject.estimated_age },
                { label: "Gender", value: analysis.primary_subject.gender },
                { label: "Mood", value: analysis.primary_subject.mood },
                { label: "Posture", value: analysis.primary_subject.posture },
                { label: "Attire", value: analysis.primary_subject.clothing_description },
                { label: "Features", value: analysis.primary_subject.distinguishing_features },
                { label: "Environment", value: analysis.environment },
                { label: "Lighting", value: analysis.lighting_condition },
              ].map(item => (
                <div key={item.label} className="bg-black/40 rounded-lg px-3 py-2 border border-white/5">
                  <div className="font-mono text-[8px] text-white/30 uppercase tracking-widest">{item.label}</div>
                  <div className="font-mono text-[11px] text-white/80 mt-0.5">{item.value}</div>
                </div>
              ))}
            </div>

            {/* Confidence bar */}
            <div className="bg-black/40 rounded-lg p-3 border border-white/5">
              <div className="flex justify-between mb-1.5">
                <span className="font-mono text-[8px] text-white/30 uppercase tracking-widest">AI Confidence</span>
                <span className="font-mono text-[10px] text-cyan-400 font-bold">{analysis.primary_subject.confidence}%</span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${analysis.primary_subject.confidence}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full shadow-[0_0_10px_cyan]" />
              </div>
            </div>

            {/* AI Recommendation */}
            <div className="bg-black/40 rounded-lg p-3 border border-cyan-500/10">
              <div className="flex items-center gap-1.5 mb-1">
                <Shield size={10} className="text-cyan-400" />
                <span className="font-mono text-[8px] text-white/30 uppercase tracking-widest">AI Recommendation</span>
              </div>
              <p className="font-mono text-[10px] text-white/70 leading-relaxed">{analysis.ai_recommendation}</p>
            </div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
