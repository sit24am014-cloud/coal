# Mino Mine – Smart Mining Safety Helmet

> Full-stack web application combining an Apple-style scroll-driven 3D product story with a live industrial worker monitoring dashboard.

---

## Quick Start

### Prerequisites
- Node.js 18+
- npm 9+

### 1. Start the Backend

```bash
cd server
npm install
npm start
# → Server running on http://localhost:3001
```

For development with auto-reload:
```bash
npm run dev   # requires nodemon (installed as devDependency)
```

### 2. Start the Frontend

```bash
cd client
npm install
npm run dev
# → Frontend at http://localhost:5173
```

Open **http://localhost:5173** in Chrome, Firefox, or Edge.

---

## Environment Variables

### Server (`server/.env`)
```
PORT=3001
CLIENT=http://localhost:5173
```

### Client (`client/.env`)
```
VITE_SOCKET_URL=http://localhost:3001
```

Both files are optional — defaults are hardcoded as fallbacks.

---

## Project Structure

```
minomine/
├── server/
│   ├── package.json         – Node.js dependencies
│   ├── index.js             – Express + Socket.io server
│   └── dataGenerator.js     – Realistic worker vitals simulation
│
└── client/
    ├── package.json
    ├── vite.config.js        – Path aliases, optimizeDeps
    ├── tailwind.config.js    – Custom neon palette + keyframes
    ├── postcss.config.js
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx           – Root layout, nav, socket provider
        ├── index.css         – Global styles + CSS variables
        ├── hooks/
        │   └── useSocket.js  – Socket.io connection + state management
        ├── components/
        │   ├── three/
        │   │   ├── HelmetScene.jsx    – Three.js canvas + controls + raycaster
        │   │   └── HelmetGeometry.js  – Primitive-based helmet + lights builder
        │   └── ui/
        │       ├── DataPanel.jsx       – Slide-in component info panel
        │       ├── WorkerCard.jsx      – Live vitals worker card
        │       ├── VitalsChart.jsx     – HR trend sparkline (Recharts)
        │       ├── AlertBanner.jsx     – Emergency alert banner
        │       ├── EmergencyButton.jsx – Emergency simulation trigger
        │       ├── NoiseToggle.jsx     – Noise cancellation toggle
        │       └── StatusIndicator.jsx – System health dots
        └── sections/
            ├── HeroSection.jsx       – 3D hero + scroll story panels
            └── DashboardSection.jsx  – Worker monitoring grid
```

---

## Architecture Overview

### Data Flow

```
dataGenerator.js
  └─► per-worker interval (3–5 s)
        └─► generateWorkerUpdate()
              └─► io.emit("worker_update", payload)
                    └─► useSocket.js (React)
                          └─► workers state
                                └─► WorkerCard re-renders
```

### Emergency Flow

```
EmergencyButton click
  └─► socket.emit("trigger_emergency")
        └─► server: broadcasts "emergency_alert"
              ├─► AlertBanner appears (React state)
              ├─► Helmet glow activates (Three.js ref)
              ├─► Affected WorkerCard flashes red
              └─► Auto-clears after 8 seconds
```

### 3D Interaction Flow

```
User clicks internal component
  └─► Three.js Raycaster detects hit
        └─► onComponentClick(componentId) callback
              └─► HeroSection state: clickedComponent
                    └─► DataPanel renders component specs
```

---

## Features

### 3D Hero Section
- **Auto-rotate** with OrbitControls (drag pauses, resumes after 2 s idle)
- **Scroll-based explosion** — helmet dome lifts, 7 internal components scale in
- **Component labels** projected from 3D → 2D screen coordinates
- **Hover glow** — emissive intensity spikes on hovered component
- **Click interaction** — opens DataPanel with specs for that component
- **Noise cancellation toggle** — visor color/opacity changes in real time
- **Story panels** — appear at scroll thresholds (Detect / Connect / Protect)

### Dashboard
- **8 worker cards** with live heart rate, BP, SpO₂, temperature, noise dB, battery
- **Status color coding**: normal (green) → elevated (amber) → critical/emergency (red)
- **HR trend chart** (collapsible sparkline, last 30 readings)
- **Zone + status filters**
- **Aggregate stats bar** (avg HR, range, battery, critical count)
- **Emergency simulation** — coordinated socket event, banner, card flash, 3D glow
- **Alert log** — timestamped history of last 10 alerts

---

## Helmet Components

| Component ID | Label                  | Sensor Type           |
|-------------|------------------------|-----------------------|
| `hr_sensor` | Heart Rate Sensor      | PPG Optical           |
| `lora`      | LoRa Module            | Semtech SX1276        |
| `mic`       | Noise Cancellation Mic | MEMS Dual-Array       |
| `speaker`   | Alert Speaker          | Piezo + Driver IC     |
| `pcb`       | Main PCB               | ARM Cortex-M7         |
| `gas`       | Gas Sensor Array       | Electrochemical + NDIR|
| `battery`   | Li-Ion Battery Pack    | 4400 mAh BMS          |

---

## Socket.io Events

| Event (Server → Client) | Payload                          |
|--------------------------|----------------------------------|
| `initial_state`          | `WorkerSnapshot[]`               |
| `worker_update`          | `WorkerSnapshot`                 |
| `emergency_alert`        | `{ worker, message, severity }`  |
| `emergency_cleared`      | `{ timestamp }`                  |
| `noise_cancel_update`    | `{ workerId, active }`           |
| `system_status`          | `{ connected, emergencyActive }` |

| Event (Client → Server)  | Payload                |
|--------------------------|------------------------|
| `trigger_emergency`      | _(none)_               |
| `clear_emergency`        | _(none)_               |
| `toggle_noise_cancel`    | `{ workerId }`         |

---

## Performance Notes

- Three.js geometries are disposed on component unmount (no memory leaks)
- `PixelRatio` clamped to 2× — prevents overdraw on high-DPI displays
- `isAnimationActive={false}` on Recharts — prevents chart re-animation on data update
- `layout` prop on Framer Motion grid — smooth card reordering during filter changes
- Socket interval is randomized per-worker (3–5 s) — avoids thundering herd

---

## Known Limitations & Extensions

- **No GLTF model** — helmet is Three.js primitives. Drop a `.glb` into `HelmetScene` and replace `buildHelmet()` with a GLTF loader for production.
- **No auth** — this is a demo build. Add JWT middleware to the Socket.io handshake for production.
- **Simulated data** — replace `dataGenerator.js` with your real IoT gateway (MQTT → Socket.io bridge pattern recommended).
- **No offline persistence** — add IndexedDB or a time-series DB (InfluxDB) to retain historical readings.

---

## Dependencies

### Server
| Package     | Version | Purpose                  |
|-------------|---------|--------------------------|
| express     | 4.x     | HTTP server              |
| socket.io   | 4.x     | Real-time events         |
| cors        | 2.x     | Cross-origin requests    |

### Client
| Package        | Version | Purpose                    |
|----------------|---------|----------------------------|
| react          | 18.x    | UI framework               |
| three          | 0.161   | 3D rendering               |
| gsap           | 3.x     | Scroll animation           |
| framer-motion  | 11.x    | UI animations              |
| recharts       | 2.x     | HR trend charts            |
| socket.io-client | 4.x   | Real-time client           |
| tailwindcss    | 3.x     | Utility CSS                |

---

*Built for Mino Mine Safety Systems. All worker data is simulated.*
