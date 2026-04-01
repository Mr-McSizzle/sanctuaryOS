import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSystem } from "../../context/SystemContext";
import { cn } from "../../utils/cn";
import { askGemini } from "../../utils/gemini";
import { Brain, MessageSquare, Sparkles, Send, Loader2 } from "lucide-react";

const AI_OBSERVATIONS = [
  "Solar output trending 12% above seasonal average. Recommend battery reserve cap adjustment.",
  "Unusual network probe pattern from 192.168.1.0/24 subnet detected at 03:42 AM. Low threat.",
  "Climate system efficiency nominal. Predicted HVAC cycle reduction: 8% this week.",
  "Motion sensor Sector B2 triggered 3x in past hour — wind debris confirmed via camera.",
  "Perimeter lighting pattern optimized for lunar phase. Energy savings: ~240Wh/night.",
  "Biometric log shows 2 unique entries today. All authorized personnel.",
  "Water usage anomaly: 15% increase in Zone 3. Possible irrigation leak detected.",
  "Firewall intercepted 847 probes in past 24h. Attack vector: SSH brute-force. Origin: distributed.",
];

const SYSTEM_PROMPT = `You are Sanctuary AI — the central intelligence of Sanctuary.OS, a cutting-edge smart home security and automation system. You speak in a calm, authoritative, slightly military tone. Keep responses concise (2-4 sentences max). You monitor:
- 47 sensors across the property (motion, thermal, pressure, acoustic)
- Solar array (4.2 kW peak), battery bank (88%), and grid connection
- Network firewall (1,400+ threats neutralized today)
- 3 perimeter drones, biometric locks, climate systems
- Water, gas, and electrical subsystems
Always stay in character. If asked about anything outside the house systems, redirect back to your domain. Reference specific sensor data and subsystem names when answering.`;

export default function AINexus() {
  const { isCrisisMode } = useSystem();
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [threatScore, setThreatScore] = useState(14);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { role: "ai", text: "Sanctuary AI online. All subsystems nominal. Awaiting directives, Commander." }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isAiThinking, setIsAiThinking] = useState(false);
  const chatRef = useRef(null);

  // Cycle AI observations with typewriter effect
  useEffect(() => {
    let obsIndex = 0;
    const cycleObservation = () => {
      const obs = AI_OBSERVATIONS[obsIndex % AI_OBSERVATIONS.length];
      setDisplayedText("");
      setIsTyping(true);
      let charIdx = 0;
      const typeInterval = setInterval(() => {
        setDisplayedText(obs.slice(0, charIdx + 1));
        charIdx++;
        if (charIdx >= obs.length) {
          clearInterval(typeInterval);
          setIsTyping(false);
        }
      }, 25);
      obsIndex++;
    };
    cycleObservation();
    const mainInterval = setInterval(cycleObservation, 10000);
    return () => clearInterval(mainInterval);
  }, []);

  // Threat score jitter
  useEffect(() => {
    const interval = setInterval(() => {
      setThreatScore(prev => {
        if (isCrisisMode) return Math.min(95, prev + Math.random() * 5);
        return Math.max(5, Math.min(40, prev + (Math.random() - 0.5) * 6));
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [isCrisisMode]);

  // Scroll chat
  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [chatMessages]);

  // Real Gemini-powered chat
  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || isAiThinking) return;

    const userMsg = chatInput.trim();
    setChatMessages(prev => [...prev, { role: "user", text: userMsg }]);
    setChatInput("");
    setIsAiThinking(true);

    try {
      // Build conversation context for Gemini
      const conversationHistory = chatMessages
        .slice(-8) // Keep last 8 messages for context window
        .map(m => `${m.role === "user" ? "Commander" : "Sanctuary AI"}: ${m.text}`)
        .join("\n");

      const fullPrompt = `${conversationHistory}\nCommander: ${userMsg}\nSanctuary AI:`;
      const response = await askGemini(fullPrompt, SYSTEM_PROMPT);
      
      setChatMessages(prev => [...prev, { role: "ai", text: response.trim() }]);
    } catch (err) {
      console.error("Gemini Chat Error:", err);
      setChatMessages(prev => [...prev, { 
        role: "ai", 
        text: "⚠ Neural link disrupted. Attempting reconnection to Gemini backbone... Please retry." 
      }]);
    } finally {
      setIsAiThinking(false);
    }
  };

  const threatColor = isCrisisMode ? "text-red-400" : threatScore > 50 ? "text-yellow-400" : "text-emerald-400";
  const threatBg = isCrisisMode ? "bg-red-500" : threatScore > 50 ? "bg-yellow-500" : "bg-emerald-500";

  return (
    <>
      <div className="w-full h-full flex flex-col justify-between overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white/70">
            <Brain size={18} className={cn(isCrisisMode ? "text-red-400" : "text-violet-400")} />
            <span className="font-mono text-[11px] tracking-[0.2em] uppercase font-bold">AI_Nexus</span>
          </div>
          <button 
            onClick={() => setShowChat(true)}
            className={cn("p-1.5 rounded-lg transition-colors cursor-pointer", isCrisisMode ? "hover:bg-red-500/20 text-red-400" : "hover:bg-violet-500/20 text-violet-400")}
          >
            <MessageSquare size={14} />
          </button>
        </div>

        {/* Threat Score Arc */}
        <div className="flex items-center gap-4 mt-2">
          <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="4" className="text-white/5" />
              <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="4" 
                strokeDasharray="264" strokeDashoffset={264 - (264 * threatScore / 100)} 
                className={cn("transition-all duration-1000", threatBg)} 
              />
            </svg>
            <span className={cn("absolute font-mono text-sm font-bold", threatColor)}>{Math.round(threatScore)}</span>
          </div>
          <div className="flex flex-col gap-0.5 flex-1 min-w-0">
            <span className="font-mono text-[8px] tracking-widest uppercase text-white/40">Composite Threat</span>
            <span className={cn("font-mono text-[10px] font-bold uppercase tracking-widest", threatColor)}>
              {isCrisisMode ? "CRITICAL" : threatScore > 50 ? "ELEVATED" : "LOW"}
            </span>
          </div>
        </div>

        {/* AI Observation Typewriter */}
        <div className="mt-2 bg-black/40 rounded-lg p-2.5 border border-white/5 flex-1 min-h-0 overflow-hidden">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Sparkles size={10} className={cn(isCrisisMode ? "text-red-400" : "text-violet-400")} />
            <span className="font-mono text-[8px] uppercase tracking-widest text-white/30">AI Insight</span>
          </div>
          <div className="font-mono text-[10px] text-white/60 leading-relaxed">
            {displayedText}
            {isTyping && <span className="inline-block w-1.5 h-3 bg-violet-400 ml-0.5 animate-pulse align-middle" />}
          </div>
        </div>
      </div>

      {/* AI Chat Modal — Powered by Gemini */}
      <AnimatePresence>
        {showChat && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 backdrop-blur-md"
            onClick={(e) => { if (e.target === e.currentTarget) setShowChat(false); }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-[560px] h-[75vh] glass-panel rounded-2xl border border-violet-500/20 overflow-hidden flex flex-col"
            >
              {/* Chat Header */}
              <div className="px-5 py-3 border-b border-white/10 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Brain size={22} className="text-violet-400" />
                    <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-black animate-pulse" />
                  </div>
                  <div>
                    <div className="font-mono text-sm tracking-[0.15em] uppercase font-bold">Sanctuary AI</div>
                    <div className="font-mono text-[9px] text-violet-400/60 uppercase tracking-widest">Gemini 2.0 Flash • Live Neural Link</div>
                  </div>
                </div>
                <button onClick={() => setShowChat(false)} className="text-white/40 hover:text-white cursor-pointer text-lg">✕</button>
              </div>

              {/* Messages */}
              <div ref={chatRef} className="flex-1 overflow-y-auto custom-scrollbar px-5 py-4 space-y-3">
                {chatMessages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}
                  >
                    <div className={cn("max-w-[85%] px-4 py-2.5 rounded-2xl font-mono text-[11px] leading-relaxed",
                      msg.role === "user" 
                        ? "bg-violet-600/30 border border-violet-500/30 text-white/90 rounded-br-md"
                        : "bg-black/50 border border-white/5 text-white/70 rounded-bl-md"
                    )}>
                      {msg.role === "ai" && <Sparkles size={10} className="text-violet-400 inline mr-1.5 -mt-0.5" />}
                      {msg.text}
                    </div>
                  </motion.div>
                ))}

                {/* Thinking indicator */}
                {isAiThinking && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                    <div className="bg-black/50 border border-white/5 text-white/40 rounded-2xl rounded-bl-md px-4 py-2.5 font-mono text-[11px] flex items-center gap-2">
                      <Loader2 size={12} className="text-violet-400 animate-spin" />
                      Sanctuary AI is processing...
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Suggestions */}
              <div className="px-5 py-2 flex gap-2 flex-wrap shrink-0">
                {["System status report", "Threat analysis", "Energy forecast", "Drone fleet status"].map(s => (
                  <button 
                    key={s}
                    onClick={() => { setChatInput(s); }}
                    className="px-3 py-1 bg-white/5 border border-white/10 rounded-full font-mono text-[9px] text-white/40 hover:text-white/70 hover:border-violet-500/30 transition-colors cursor-pointer"
                  >
                    {s}
                  </button>
                ))}
              </div>

              {/* Input */}
              <form onSubmit={handleChatSubmit} className="px-5 py-3 border-t border-white/10 flex gap-3 shrink-0">
                <input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask Sanctuary AI anything..."
                  disabled={isAiThinking}
                  className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 font-mono text-[11px] text-white/80 placeholder:text-white/20 outline-none focus:border-violet-500/40 transition-colors disabled:opacity-50"
                />
                <button 
                  type="submit" 
                  disabled={isAiThinking}
                  className="px-4 py-2 bg-violet-600/30 border border-violet-500/40 rounded-xl font-mono text-[10px] uppercase tracking-widest text-violet-300 hover:bg-violet-600/50 transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  <Send size={12} />
                  Send
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
