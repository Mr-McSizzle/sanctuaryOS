import React from "react";
import { useSystem } from "../../context/SystemContext";
import { Lightbulb, Power } from "lucide-react";
import { cn } from "../../utils/cn";

export default function LightingOps() {
  const { isCrisisMode, lights, setLights } = useSystem();

  const handleToggle = (room) => {
    if (isCrisisMode) return;
    setLights(prev => ({
      ...prev,
      [room]: { ...prev[room], on: !prev[room].on }
    }));
  };

  const handleIntensity = (room, val) => {
    if (isCrisisMode) return;
    setLights(prev => ({
      ...prev,
      [room]: { ...prev[room], intensity: val }
    }));
  };

  // Safe fallback if the context hasn't updated yet.
  const safeLights = lights || {
    main: { on: true, intensity: 80, color: "#ffffff" },
    ambient: { on: true, intensity: 40, color: "#22d3ee" },
    exterior: { on: false, intensity: 100, color: "#ffffff" }
  };

  return (
    <div className="w-full h-full flex flex-col pt-1 relative">
      <div className="flex items-center gap-2 mb-4 text-white/70">
        <Lightbulb size={18} className={isCrisisMode ? "text-red-400" : "text-yellow-400"} />
        <span className="font-mono text-[11px] tracking-[0.2em] uppercase font-bold">Lighting_Ops</span>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
        {Object.entries(safeLights).map(([room, data]) => (
          <div key={room} className="bg-black/30 p-3 rounded-xl border border-white/5 relative group">
            <div className="flex justify-between items-center mb-2">
              <span className="font-mono text-[10px] tracking-widest uppercase opacity-80">{room}</span>
              <button 
                onClick={() => handleToggle(room)}
                className={cn(
                  "w-8 h-4 rounded-full transition-colors relative",
                  data.on ? (isCrisisMode ? "bg-red-500" : "bg-cyan-500") : "bg-white/10"
                )}
              >
                <div className={cn(
                  "w-3 h-3 bg-white rounded-full absolute top-0.5 transition-all shadow-md",
                  data.on ? "left-[18px]" : "left-0.5"
                )} />
              </button>
            </div>
            
            <div className="flex items-center gap-3">
              <Power size={12} className={cn("opacity-50", data.on ? "text-white" : "text-white/30")} />
              <input 
                type="range" 
                min="0" max="100" 
                value={data.intensity} 
                onChange={(e) => handleIntensity(room, Number(e.target.value))}
                disabled={!data.on || isCrisisMode}
                className="w-full h-1 bg-white/10 rounded-full appearance-none outline-none overflow-hidden" 
                style={{
                  boxShadow: `inset ${(data.intensity/100) * 100}px 0 0 ${data.on ? data.color : 'transparent'}`
                }}
              />
              <span className="font-mono text-[9px] w-6 opacity-50">{data.intensity}%</span>
            </div>
          </div>
        ))}
      </div>
      
      {isCrisisMode && (
        <div className="absolute inset-0 bg-red-900/20 backdrop-blur-[1px] flex items-center justify-center z-10 rounded-xl">
          <span className="font-mono text-xs text-red-400 font-bold bg-black/80 px-4 py-1 rounded shadow-[0_0_20px_rgba(220,38,38,0.5)] border border-red-500/50 uppercase tracking-[0.2em]">Locked by Override</span>
        </div>
      )}
    </div>
  );
}
