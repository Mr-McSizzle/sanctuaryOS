import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSystem } from "../context/SystemContext";
import { cn } from "../utils/cn";
import { X, DoorOpen, DoorClosed, Thermometer, Droplets, Fan, Wifi, Camera, Lock, Unlock, Lightbulb, AlertTriangle } from "lucide-react";

const ROOMS = [
  { id: "living", label: "Living Room", x: 15, y: 20, w: 30, h: 25, sensors: ["motion", "temp", "camera"] },
  { id: "kitchen", label: "Kitchen", x: 48, y: 20, w: 22, h: 25, sensors: ["motion", "smoke", "water"] },
  { id: "bedroom", label: "Master Bedroom", x: 15, y: 50, w: 25, h: 25, sensors: ["motion", "temp"] },
  { id: "bathroom", label: "Bathroom", x: 43, y: 50, w: 15, h: 25, sensors: ["water", "humidity"] },
  { id: "garage", label: "Garage", x: 62, y: 50, w: 20, h: 25, sensors: ["motion", "door", "camera"] },
  { id: "office", label: "Office", x: 73, y: 20, w: 15, h: 25, sensors: ["motion", "temp", "camera"] },
];

const DOORS = [
  { id: "front", label: "Front Door", x: 15, y: 45, angle: 0 },
  { id: "back", label: "Back Door", x: 70, y: 45, angle: 0 },
  { id: "garage_door", label: "Garage Door", x: 82, y: 75, angle: 90 },
  { id: "bedroom_door", label: "Bedroom Door", x: 40, y: 62, angle: 0 },
];

const CAMERAS_POS = [
  { id: "cam1", label: "Front Porch", x: 10, y: 15 },
  { id: "cam2", label: "Backyard", x: 88, y: 40 },
  { id: "cam3", label: "Garage", x: 72, y: 72 },
  { id: "cam4", label: "Living Room", x: 25, y: 25 },
];

export default function FloorPlan({ onClose }) {
  const { isCrisisMode, isLocked, garageOpen, temperature, lights } = useSystem();
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [hoveredRoom, setHoveredRoom] = useState(null);

  // Simulated sensor data
  const sensorData = {
    living: { temp: temperature, motion: false, humidity: 45 },
    kitchen: { temp: temperature + 3, motion: false, smoke: false, water: false },
    bedroom: { temp: temperature - 2, motion: false },
    bathroom: { temp: temperature + 1, humidity: 68, water: false },
    garage: { temp: temperature - 8, motion: isCrisisMode, door: garageOpen },
    office: { temp: temperature, motion: true },
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[160] flex items-center justify-center bg-black/85 backdrop-blur-xl"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}
        className="w-[900px] h-[600px] glass-panel rounded-2xl border border-cyan-500/20 overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="px-6 py-3 border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className={cn("w-3 h-3 rounded-full", isCrisisMode ? "bg-red-500 animate-pulse" : "bg-emerald-500")} />
            <span className="font-mono text-sm tracking-[0.2em] uppercase font-bold">Interactive Floor Plan</span>
            <span className="font-mono text-[9px] text-white/30 uppercase tracking-widest">// Live Sensor Overlay</span>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white cursor-pointer"><X size={18} /></button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Blueprint area */}
          <div className="flex-1 relative p-6">
            {/* Property border */}
            <div className={cn("absolute inset-6 border-2 border-dashed rounded-xl transition-colors",
              isCrisisMode ? "border-red-500/30" : "border-cyan-500/15"
            )} />

            {/* Grid */}
            <div className="absolute inset-6 opacity-5" style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }} />

            {/* Rooms */}
            {ROOMS.map(room => {
              const isHovered = hoveredRoom === room.id;
              const isSelected = selectedRoom === room.id;
              const data = sensorData[room.id];
              return (
                <div
                  key={room.id}
                  onClick={() => setSelectedRoom(isSelected ? null : room.id)}
                  onMouseEnter={() => setHoveredRoom(room.id)}
                  onMouseLeave={() => setHoveredRoom(null)}
                  className={cn(
                    "absolute rounded-xl border-2 cursor-pointer transition-all duration-300 flex flex-col items-center justify-center gap-1",
                    isSelected ? (isCrisisMode ? "border-red-500 bg-red-500/10 shadow-[0_0_20px_rgba(220,38,38,0.3)]" : "border-cyan-400 bg-cyan-500/10 shadow-[0_0_20px_rgba(34,211,238,0.3)]")
                      : isHovered ? "border-white/30 bg-white/5"
                      : (isCrisisMode ? "border-red-500/20 bg-red-950/10" : "border-white/10 bg-white/[0.02]"),
                    data?.motion && "ring-2 ring-yellow-500/30"
                  )}
                  style={{ left: `${room.x}%`, top: `${room.y}%`, width: `${room.w}%`, height: `${room.h}%` }}
                >
                  <span className={cn("font-mono text-[10px] font-bold uppercase tracking-wider transition-colors",
                    isSelected ? (isCrisisMode ? "text-red-300" : "text-cyan-300") : "text-white/40"
                  )}>{room.label}</span>
                  
                  {/* Sensor icons */}
                  <div className="flex gap-2 mt-1">
                    {room.sensors.includes("temp") && (
                      <div className="flex items-center gap-1">
                        <Thermometer size={9} className="text-white/20" />
                        <span className="font-mono text-[8px] text-white/30">{data?.temp || "--"}°</span>
                      </div>
                    )}
                    {room.sensors.includes("motion") && data?.motion && (
                      <div className="flex items-center gap-1">
                        <AlertTriangle size={9} className="text-yellow-400 animate-pulse" />
                        <span className="font-mono text-[8px] text-yellow-400">MOTION</span>
                      </div>
                    )}
                  </div>

                  {/* Lights indicator */}
                  {lights.main.on && (
                    <div className="absolute top-2 right-2">
                      <Lightbulb size={10} className="text-yellow-400/40" />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Doors */}
            {DOORS.map(door => (
              <div key={door.id} className="absolute" style={{ left: `${door.x}%`, top: `${door.y}%` }}>
                <div className={cn("p-1 rounded-md", isLocked ? "bg-red-500/20" : "bg-emerald-500/20")}>
                  {isLocked ? <Lock size={10} className="text-red-400" /> : <Unlock size={10} className="text-emerald-400" />}
                </div>
              </div>
            ))}

            {/* Camera positions */}
            {CAMERAS_POS.map(cam => (
              <div key={cam.id} className="absolute" style={{ left: `${cam.x}%`, top: `${cam.y}%` }}>
                <div className="relative">
                  <Camera size={12} className={cn(isCrisisMode ? "text-red-400" : "text-cyan-400")} />
                  <div className={cn("absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full", isCrisisMode ? "bg-red-500 animate-pulse" : "bg-emerald-400")} />
                </div>
              </div>
            ))}

            {/* Property label */}
            <div className="absolute bottom-2 left-8 font-mono text-[8px] text-white/15 uppercase tracking-[0.3em]">
              Sanctuary.OS // Property Blueprint v4.0
            </div>
          </div>

          {/* Right panel — room detail */}
          <div className="w-[240px] bg-black/40 border-l border-white/10 p-4 flex flex-col overflow-y-auto custom-scrollbar">
            <div className="font-mono text-[9px] uppercase tracking-widest text-white/30 mb-3">
              {selectedRoom ? "Room Detail" : "System Overview"}
            </div>
            
            {selectedRoom ? (
              <div className="space-y-3">
                <div className="font-mono text-sm font-bold text-white/80 uppercase tracking-wider">
                  {ROOMS.find(r => r.id === selectedRoom)?.label}
                </div>
                {Object.entries(sensorData[selectedRoom] || {}).map(([key, val]) => (
                  <div key={key} className="flex justify-between items-center bg-black/30 rounded-lg px-3 py-2 border border-white/5">
                    <span className="font-mono text-[9px] text-white/40 uppercase tracking-widest">{key}</span>
                    <span className={cn("font-mono text-[10px] font-bold",
                      typeof val === "boolean" ? (val ? "text-yellow-400" : "text-emerald-400") : "text-white/80"
                    )}>
                      {typeof val === "boolean" ? (val ? "ACTIVE" : "CLEAR") : `${val}${key === "temp" ? "°F" : key.includes("humid") ? "%" : ""}`}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {[
                  { label: "Doors", value: isLocked ? "LOCKED" : "UNLOCKED", color: isLocked ? "text-red-400" : "text-emerald-400" },
                  { label: "Cameras", value: "4 ONLINE", color: "text-emerald-400" },
                  { label: "Sensors", value: "12 ACTIVE", color: "text-cyan-400" },
                  { label: "Garage", value: garageOpen ? "OPEN" : "CLOSED", color: garageOpen ? "text-yellow-400" : "text-emerald-400" },
                  { label: "Mode", value: isCrisisMode ? "CRISIS" : "NORMAL", color: isCrisisMode ? "text-red-400" : "text-emerald-400" },
                  { label: "Lights", value: lights.main.on ? "ON" : "OFF", color: lights.main.on ? "text-yellow-400" : "text-white/40" },
                ].map(item => (
                  <div key={item.label} className="flex justify-between items-center bg-black/30 rounded-lg px-3 py-2 border border-white/5">
                    <span className="font-mono text-[9px] text-white/40 uppercase tracking-widest">{item.label}</span>
                    <span className={cn("font-mono text-[10px] font-bold", item.color)}>{item.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
