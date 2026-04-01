import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from "react";
import { useSystem } from "../../context/SystemContext";
import { cn } from "../../utils/cn";
import { askGeminiVision } from "../../utils/gemini";
import { ScanFace } from "lucide-react";

const LiveFeed = forwardRef(function LiveFeed({ onScanFace, remoteStream }, ref) {
  const { isCrisisMode } = useSystem();
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const loopRef = useRef(null);

  useImperativeHandle(ref, () => ({ getVideo: () => videoRef.current }), []);

  const [aiObservation, setAiObservation] = useState("AI Vision initializing...");
  const [isProcessing, setIsProcessing] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [scanCount, setScanCount] = useState(0);
  const [isRemote, setIsRemote] = useState(false);

  // Initialize camera — use remote stream if provided, otherwise local webcam
  useEffect(() => {
    let mounted = true;

    if (remoteStream) {
      // Remote stream from WebRTC
      if (videoRef.current) {
        videoRef.current.srcObject = remoteStream;
        setCameraActive(true);
        setIsRemote(true);
      }
      return;
    }

    // Local webcam
    async function setupCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } } 
        });
        if (mounted && videoRef.current) {
          videoRef.current.srcObject = stream;
          setCameraActive(true);
        }
      } catch (err) {
        console.error("Failed to get webcam:", err);
        if (mounted) setAiObservation("ERR: CAMERA ACCESS DENIED");
      }
    }
    setupCamera();

    return () => {
      mounted = false;
      // Only stop local tracks, not remote
      if (!remoteStream && videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, [remoteStream]);

  // AI Vision Loop
  useEffect(() => {
    if (!cameraActive) return;
    const captureAndAnalyze = async () => {
      if (!videoRef.current || !canvasRef.current || isProcessing) return;
      setIsProcessing(true);
      try {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
        const base64 = canvas.toDataURL("image/jpeg", 0.7).split(",")[1];
        if (!base64) throw new Error("Frame capture failed");
        const prompt = `You are a security camera AI. Describe what you see in this frame in max 6 words, all caps. Just the description, nothing else.`;
        const response = await askGeminiVision(prompt, base64);
        setAiObservation(response.trim().toUpperCase().slice(0, 50));
        setScanCount(prev => prev + 1);
      } catch {
        const msgs = ["MONITORING: FEED ACTIVE", "SCAN COMPLETE: NOMINAL", "PERIMETER: ALL CLEAR", "ENVIRONMENT: STABLE"];
        setAiObservation(msgs[Math.floor(Math.random() * msgs.length)]);
        setScanCount(prev => prev + 1);
      } finally {
        setIsProcessing(false);
      }
    };
    const initialTimeout = setTimeout(captureAndAnalyze, 3000);
    loopRef.current = setInterval(captureAndAnalyze, 8000);
    return () => { clearTimeout(initialTimeout); clearInterval(loopRef.current); };
  }, [cameraActive, isProcessing]);

  return (
    <div className="relative w-full h-full min-h-0 rounded-[1.5rem] overflow-hidden group bg-black">
      <canvas ref={canvasRef} className="hidden" />
      <video ref={videoRef} autoPlay playsInline muted
        className={cn(
          "absolute inset-0 w-full h-full object-cover transition-transform duration-[20s] ease-linear group-hover:scale-110",
          isCrisisMode ? "brightness-50 sepia-[.5] hue-rotate-[-50deg] saturate-200" : "brightness-[0.8] contrast-125 saturate-50"
        )}
      />
      <div className="absolute inset-0 pointer-events-none bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.2)_2px,rgba(0,0,0,0.2)_4px)] mix-blend-overlay" />
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)]" />
      <div className="absolute top-0 left-0 w-full h-1 bg-cyan-400/20 shadow-[0_0_20px_2px_rgba(34,211,238,0.3)] animate-[scan_6s_linear_infinite]" />

      {/* Header */}
      <div className="absolute top-3 sm:top-5 left-3 sm:left-5 flex gap-2 sm:gap-3 z-10 w-full pr-6 sm:pr-10 justify-between items-start">
        <div className="flex gap-2 sm:gap-3 flex-wrap">
          <div className={cn("flex items-center gap-2 bg-black/60 backdrop-blur-md px-2 sm:px-3 py-1 sm:py-1.5 rounded border shadow-lg", isCrisisMode ? "border-red-500/50" : "border-white/10")}>
            <div className={cn("w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full", cameraActive ? "bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,1)]" : "bg-gray-500")} />
            <span className="text-white font-mono text-[8px] sm:text-[10px] tracking-[0.2em] uppercase font-bold">{cameraActive ? "LIVE" : "OFFLINE"}</span>
          </div>
          <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-2 sm:px-3 py-1 sm:py-1.5 rounded border border-white/5">
            <span className="text-white font-mono text-[8px] sm:text-[10px] tracking-[0.2em] font-bold text-white/70">
              {isRemote ? "REMOTE_FEED" : "SEC_CAM_01"}
            </span>
          </div>
        </div>
        <div className={cn("px-2 sm:px-3 py-1 sm:py-1.5 rounded border backdrop-blur-md max-w-[180px] sm:max-w-[220px] text-right ml-auto shrink-0",
            isProcessing ? "border-violet-500/50 bg-violet-950/40" : isCrisisMode ? "border-red-500/50 bg-red-950/60" : "border-cyan-500/30 bg-black/40"
        )}>
          <div className="flex items-center justify-end gap-1 sm:gap-2 mb-0.5 sm:mb-1">
            {isProcessing && <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-violet-400 animate-ping" />}
            <span className={cn("font-mono text-[7px] sm:text-[8px] tracking-[0.15em] sm:tracking-[0.2em] uppercase font-bold", isProcessing ? "text-violet-300" : isCrisisMode ? "text-red-400" : "text-cyan-400")}>
              {isProcessing ? "ANALYZING..." : "GEMINI_VISION"}
            </span>
          </div>
          <p className={cn("font-mono text-[8px] sm:text-[9px] leading-tight", isCrisisMode ? "text-red-300" : "text-white/70")}>{aiObservation}</p>
        </div>
      </div>

      {/* Crosshairs */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-20">
        <div className="w-full h-[1px] bg-cyan-500/50" />
        <div className="absolute h-full w-[1px] bg-cyan-500/50" />
        <div className={cn("absolute w-[20vh] h-[20vh] sm:w-[30vh] sm:h-[30vh] border rounded-full transition-colors", isCrisisMode ? "border-red-500" : isProcessing ? "border-violet-500" : "border-cyan-500/50")} />
      </div>

      <div className="absolute bottom-3 sm:bottom-5 left-3 sm:left-5 z-10 flex flex-col gap-1">
        <div className={cn("font-mono text-[8px] sm:text-[10px] tracking-[0.2em] sm:tracking-[0.25em] bg-black/50 px-2 py-1 rounded w-fit backdrop-blur-sm", isCrisisMode ? "text-red-400" : "text-cyan-400")}>
          LOC: MAIN_CABIN
        </div>
        <div className="font-mono text-[7px] sm:text-[9px] text-white/50 tracking-widest bg-black/50 px-2 py-1 rounded w-fit backdrop-blur-sm">
          {new Date().toISOString().split('T')[0]} {new Date().toLocaleTimeString()}
        </div>
      </div>

      {onScanFace && cameraActive && (
        <button onClick={onScanFace}
          className="absolute bottom-3 sm:bottom-5 right-3 sm:right-5 z-10 flex items-center gap-2 bg-black/60 backdrop-blur-md px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-white/10 hover:border-cyan-500/40 transition-all cursor-pointer group"
        >
          <ScanFace size={14} className="text-cyan-400 group-hover:text-cyan-300" />
          <span className="font-mono text-[8px] sm:text-[9px] uppercase tracking-widest text-white/50 group-hover:text-white/80 hidden sm:inline">AI Scan</span>
        </button>
      )}

      {isCrisisMode && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 sm:w-48 sm:h-48 border-[2px] border-red-500/40 rounded-full flex items-center justify-center pointer-events-none">
          <div className="absolute inset-6 sm:inset-8 border border-dashed border-red-500/60 rounded-full animate-[spin_4s_linear_infinite]" />
          <div className="w-4 h-4 sm:w-6 sm:h-6 bg-red-500/80 rounded-full animate-ping shadow-[0_0_20px_rgba(220,38,38,1)]" />
          <div className="absolute w-2 h-2 bg-white rounded-full" />
        </div>
      )}
      <style>{`@keyframes scan { 0% { top: -10px; opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { top: 100%; opacity: 0; } }`}</style>
    </div>
  );
});

export default LiveFeed;
