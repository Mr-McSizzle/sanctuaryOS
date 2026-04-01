import React, { createContext, useContext, useState } from "react";

const SystemContext = createContext();

export const useSystem = () => {
  return useContext(SystemContext);
};

export const SystemProvider = ({ children }) => {
  // Core Security & Environment
  const [isCrisisMode, setIsCrisisMode] = useState(false);
  const [isLocked, setIsLocked] = useState(true);
  const [temperature, setTemperature] = useState(72);

  // Lighting Ops
  const [lights, setLights] = useState({
    main: { on: true, intensity: 80, color: "#ffffff" },
    ambient: { on: true, intensity: 40, color: "#22d3ee" }, // cyan default
    exterior: { on: false, intensity: 100, color: "#ffffff" }
  });

  // Drone Defenses
  const [droneDeployed, setDroneDeployed] = useState(false);
  const [droneBattery, setDroneBattery] = useState(100);

  // Bio / Life Support
  const [airPurificationOn, setAirPurificationOn] = useState(true);
  
  // Subsystems (valves, doors)
  const [waterMainOpen, setWaterMainOpen] = useState(true);
  const [garageOpen, setGarageOpen] = useState(false);

  // Network Firewall
  const [shieldActive, setShieldActive] = useState(true);
  const [blockedIPs, setBlockedIPs] = useState(1403);

  const toggleCrisisMode = () => {
    setIsCrisisMode((prev) => {
      const next = !prev;
      if (next) {
        setIsLocked(true);
        setLights(l => ({ ...l, main: {on: true, intensity: 100, color: '#ff0000'} }));
        setDroneDeployed(true);
        setShieldActive(true);
      } else {
        // Fully restore normal operations
        setIsLocked(false);
        setLights(l => ({
          ...l,
          main: {on: true, intensity: 80, color: '#ffffff'},
          ambient: {on: true, intensity: 40, color: '#22d3ee'},
          exterior: {on: false, intensity: 100, color: '#ffffff'}
        }));
        setDroneDeployed(false);
      }
      return next;
    });
  };

  const toggleLock = () => {
    setIsLocked((prev) => !prev);
  };

  return (
    <SystemContext.Provider
      value={{
        // Core
        isCrisisMode, setIsCrisisMode, toggleCrisisMode,
        isLocked, setIsLocked, toggleLock,
        temperature, setTemperature,
        
        // Expansion
        lights, setLights,
        droneDeployed, setDroneDeployed, droneBattery, setDroneBattery,
        airPurificationOn, setAirPurificationOn,
        waterMainOpen, setWaterMainOpen,
        garageOpen, setGarageOpen,
        shieldActive, setShieldActive,
        blockedIPs, setBlockedIPs
      }}
    >
      {children}
    </SystemContext.Provider>
  );
};
