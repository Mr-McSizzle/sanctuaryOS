import React, { useState } from "react";
import { SystemProvider, useSystem } from "./context/SystemContext";
import AuthScreen from "./components/AuthScreen";
import Dashboard from "./components/Dashboard";
import { cn } from "./utils/cn";
import { motion } from "framer-motion";

function AppContent() {
  const { isCrisisMode } = useSystem();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <div
      className={cn(
        "h-screen w-screen relative overflow-hidden transition-colors duration-1000",
        isCrisisMode ? "bg-red-950/10" : "bg-slate-950",
        "text-white font-sans"
      )}
    >
      {/* Dynamic Grid Background Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      {/* Ambient Animated Blobs (Optimized) */}
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.15, 0.3, 0.15],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className={cn(
          "absolute -top-[30%] -left-[10%] w-[70vw] h-[70vw] rounded-full blur-[120px] pointer-events-none transition-colors duration-1000 transform-gpu will-change-transform",
          isCrisisMode ? "bg-red-600/30" : "bg-cyan-600/30"
        )}
      />
      
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className={cn(
          "absolute -bottom-[40%] -right-[20%] w-[80vw] h-[80vw] rounded-full blur-[120px] pointer-events-none transition-colors duration-1000 transform-gpu will-change-transform",
          isCrisisMode ? "bg-orange-600/20" : "bg-blue-600/20"
        )}
      />

      {/* Main Content */}
      <div className="relative z-10 w-full h-full">
        {!isAuthenticated ? (
          <AuthScreen onAuthenticated={() => setIsAuthenticated(true)} />
        ) : (
          <Dashboard />
        )}
      </div>
    </div>
  );
}

function App() {
  return (
    <SystemProvider>
      <AppContent />
    </SystemProvider>
  );
}

export default App;
