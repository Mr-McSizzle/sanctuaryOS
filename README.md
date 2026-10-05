# Sanctuary.OS

**Experimental smart-home command center for security, environment control, live feeds, and AI-assisted voice commands.**

Sanctuary.OS is a React prototype for a unified residential control surface. The interface brings together security state, lighting, climate, camera / stream views, network status, drone controls, diagnostics, and a crisis-mode workflow in one dashboard.

> Prototype only. The current repository primarily demonstrates interface, orchestration, and simulated control logic; it should not be interpreted as a production physical-security system.

## What the interface includes

- Authentication screen and system dashboard
- Smart-lock state and crisis / lockdown mode
- Lighting and climate controls
- Live-feed and stream-management views
- Face-scanner interface
- Floor-plan and activity-log views
- Network / firewall status
- Drone-control interface
- Power and system diagnostics
- Secure-vault and AI-assistant panels

## AI-assisted command layer

The dashboard includes a natural-language command path that maps user requests to a small set of structured actions such as:

- lock / unlock
- lights on / off
- set temperature
- deploy / recall drone
- enable / disable network shield
- open / close garage
- activate / deactivate crisis mode

The current implementation can use Google's Generative AI SDK for command parsing and also contains local fallback parsing for several command types.

## System flow

```text
user command / dashboard interaction
              ↓
       UI orchestration
              ↓
      shared system state
       ↙      ↓       ↘
 security   environment   auxiliary views
```

## Technology

- React 19 + Vite
- Framer Motion
- Firebase
- Google Generative AI SDK
- PeerJS
- Tailwind-based styling utilities

## Local development

```bash
npm install
npm run dev
```

## Current boundary

Many controls in this repository represent application state and prototype workflows rather than verified integrations with real locks, drones, HVAC hardware, or security infrastructure.

Turning this into a real control system would require authenticated device APIs, hardware-specific adapters, secure key management, authorization boundaries, audit logging, fault handling, and extensive security testing.

## Status

Interface / systems-orchestration prototype exploring what a single high-context control surface for a connected environment could look like.