import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSystem } from "../../context/SystemContext";
import { cn } from "../../utils/cn";
import { Lock, Unlock, ShieldCheck, Key, FileText, Download, Eye } from "lucide-react";

// Simulated crypto operations
const generateHex = (len) => Array.from({ length: len }, () => Math.floor(Math.random() * 16).toString(16)).join('');
const generateKeyPair = () => ({
  publicKey: `-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8A\n${generateHex(64)}\n-----END PUBLIC KEY-----`,
  privateKey: `-----BEGIN EC PRIVATE KEY-----\n${generateHex(48)}\n-----END EC PRIVATE KEY-----`
});

const VAULT_FILES = [
  { name: "estate_deed_2024.enc", size: "2.4 MB", type: "Legal", icon: FileText },
  { name: "master_key_backup.gpg", size: "128 KB", type: "Keys", icon: Key },
  { name: "insurance_policy.enc", size: "4.1 MB", type: "Legal", icon: FileText },
  { name: "surveillance_archive.enc", size: "18.7 MB", type: "Media", icon: Eye },
  { name: "emergency_contacts.enc", size: "12 KB", type: "Personal", icon: FileText },
];

export default function SecureVault() {
  const { isCrisisMode } = useSystem();
  const [showModal, setShowModal] = useState(false);
  const [handshakePhase, setHandshakePhase] = useState("idle"); // idle -> generating -> challenge -> signing -> verifying -> unlocked
  const [handshakeLog, setHandshakeLog] = useState([]);
  const [challenge, setChallenge] = useState("");
  const [signature, setSignature] = useState("");
  const [keyPair, setKeyPair] = useState(null);
  const [progress, setProgress] = useState(0);

  const addLog = (msg) => setHandshakeLog(prev => [...prev, msg]);

  const startHandshake = () => {
    if (isCrisisMode) return;
    setShowModal(true);
    setHandshakePhase("generating");
    setHandshakeLog([]);
    setProgress(0);

    // Phase 1: Key generation
    setTimeout(() => {
      const kp = generateKeyPair();
      setKeyPair(kp);
      addLog("✓ ECDSA-P256 keypair generated");
      addLog(`  PUB: ${kp.publicKey.split('\n')[2].slice(0, 32)}...`);
      setProgress(20);

      // Phase 2: Challenge
      setTimeout(() => {
        setHandshakePhase("challenge");
        const ch = generateHex(32);
        setChallenge(ch);
        addLog(`✓ Challenge received: ${ch.slice(0, 16)}...`);
        setProgress(40);

        // Phase 3: Signing
        setTimeout(() => {
          setHandshakePhase("signing");
          const sig = generateHex(64);
          setSignature(sig);
          addLog(`✓ Challenge signed: ${sig.slice(0, 20)}...`);
          setProgress(65);

          // Phase 4: Verifying
          setTimeout(() => {
            setHandshakePhase("verifying");
            addLog("⟳ Verifying ECDSA signature against server...");
            setProgress(80);

            // Phase 5: Unlocked
            setTimeout(() => {
              addLog("✓ Signature VALID — identity confirmed");
              addLog("✓ TLS 1.3 tunnel established (AES-256-GCM)");
              addLog("═══ VAULT ACCESS GRANTED ═══");
              setHandshakePhase("unlocked");
              setProgress(100);
            }, 1500);
          }, 1200);
        }, 1000);
      }, 800);
    }, 1200);
  };

  return (
    <>
      {/* Tile */}
      <div className="w-full h-full flex flex-col justify-between">
        <div className="flex items-center gap-2 text-white/70">
          <Lock size={18} className={isCrisisMode ? "text-red-400" : "text-amber-400"} />
          <span className="font-mono text-[11px] tracking-[0.2em] uppercase font-bold">Secure_Vault</span>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <div className="relative">
            {/* Vault icon with animated rings */}
            <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center border-2 transition-all",
              isCrisisMode ? "border-red-500/50 bg-red-950/30" : "border-amber-500/30 bg-amber-950/20"
            )}>
              <Lock size={28} className={cn(isCrisisMode ? "text-red-400" : "text-amber-400")} />
            </div>
            <div className={cn("absolute inset-[-8px] rounded-2xl border border-dashed animate-[spin_8s_linear_infinite]",
              isCrisisMode ? "border-red-500/20" : "border-amber-500/20"
            )} />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between font-mono text-[9px] text-white/40 uppercase tracking-widest">
            <span>AES-256-GCM</span>
            <span>{VAULT_FILES.length} files</span>
          </div>
          <button 
            onClick={startHandshake}
            disabled={isCrisisMode}
            className={cn(
              "w-full py-2 rounded-lg font-mono text-[10px] tracking-widest uppercase font-bold transition-all cursor-pointer",
              isCrisisMode 
                ? "bg-red-950/50 border border-red-500/30 text-red-500 cursor-not-allowed"
                : "bg-amber-500/15 border border-amber-500/40 text-amber-400 hover:bg-amber-500/25 hover:shadow-[0_0_15px_rgba(245,158,11,0.2)]"
            )}
          >
            Initiate Handshake
          </button>
        </div>
      </div>

      {/* Handshake + Vault Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-[600px] max-h-[80vh] glass-panel rounded-2xl border border-amber-500/20 overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {handshakePhase === "unlocked" 
                    ? <ShieldCheck size={20} className="text-emerald-400" /> 
                    : <Key size={20} className="text-amber-400 animate-pulse" />
                  }
                  <span className="font-mono text-sm tracking-[0.2em] uppercase font-bold">
                    {handshakePhase === "unlocked" ? "Vault Unlocked" : "Cryptographic Handshake"}
                  </span>
                </div>
                <button onClick={() => { setShowModal(false); setHandshakePhase("idle"); }} className="text-white/40 hover:text-white cursor-pointer">✕</button>
              </div>

              {/* Progress bar */}
              <div className="h-1 bg-white/5 relative">
                <motion.div 
                  animate={{ width: `${progress}%` }}
                  className={cn("h-full transition-all", handshakePhase === "unlocked" ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" : "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]")}
                />
              </div>

              {handshakePhase !== "unlocked" ? (
                /* Handshake Process View */
                <div className="p-6 flex-1 overflow-y-auto custom-scrollbar space-y-3">
                  {handshakeLog.map((log, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={cn("font-mono text-[11px] py-1", 
                        log.startsWith("✓") ? "text-emerald-400" : log.startsWith("⟳") ? "text-amber-300 animate-pulse" : "text-white/60"
                      )}
                    >
                      {log}
                    </motion.div>
                  ))}

                  {/* Spinning animation while waiting */}
                  {handshakePhase !== "idle" && handshakePhase !== "unlocked" && (
                    <div className="flex items-center gap-3 mt-4">
                      <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                      <span className="font-mono text-[10px] text-amber-400/70 uppercase tracking-widest">
                        {handshakePhase === "generating" ? "Generating ECDSA keypair..." :
                         handshakePhase === "challenge" ? "Processing challenge..." :
                         handshakePhase === "signing" ? "Signing with private key..." :
                         "Verifying signature..."}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                /* Unlocked Vault File Browser */
                <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                    <div className="font-mono text-[9px] text-emerald-400/60 uppercase tracking-widest mb-4">Decrypted file listing — {VAULT_FILES.length} items</div>
                    <div className="space-y-2">
                      {VAULT_FILES.map((file, i) => (
                        <motion.div
                          key={file.name}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 + i * 0.1 }}
                          className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/5 hover:border-emerald-500/30 transition-colors group"
                        >
                          <div className="flex items-center gap-3">
                            <file.icon size={16} className="text-white/30 group-hover:text-emerald-400 transition-colors" />
                            <div>
                              <div className="font-mono text-[11px] text-white/80">{file.name}</div>
                              <div className="font-mono text-[9px] text-white/30">{file.type} • {file.size}</div>
                            </div>
                          </div>
                          <button className="p-2 rounded-lg bg-white/5 hover:bg-emerald-500/20 transition-colors cursor-pointer">
                            <Download size={14} className="text-white/30 group-hover:text-emerald-400" />
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
