// server/index.js
// Real-Time Subterranean Telemetry & Multi-Device Synchronization Server for MINO MINE

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const {
  WORKERS,
  generateWorkerUpdate,
  updateServerWorkerSensor,
  applyServerHazard,
  resetServerWorker,
  clearEmergency,
} = require("./dataGenerator");

const PORT = process.env.PORT || 3001;

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
  transports: ["websocket", "polling"],
});

app.use(cors({ origin: "*" }));
app.use(express.json());

// Health check endpoint
app.get("/health", (_req, res) => res.json({ status: "ok", workers: WORKERS.length }));

// ─── Socket.io Event & Real-Time Sync Hub ─────────────────────────────────────

let emergencyActive = false;
let activeBroadcasts = [];

io.on("connection", (socket) => {
  console.log(`[MinoMine Sync] Device connected: ${socket.id}`);

  // Push initial snapshot of all 12 workers & active broadcasts to newly connected client
  const snapshot = WORKERS.map((w) => generateWorkerUpdate(w));
  socket.emit("initial_state", snapshot);
  socket.emit("initial_broadcasts", activeBroadcasts);
  io.emit("system_status", { connected: io.engine.clientsCount, emergencyActive });

  // Real-time Control Room Emergency Broadcast Sync
  socket.on("client_broadcast_command", (data) => {
    if (data && data.broadcastId) {
      activeBroadcasts = [data, ...activeBroadcasts.filter((b) => b.broadcastId !== data.broadcastId)];
    }
    io.emit("control_room_broadcast_synced", data);
  });

  // Real-time Worker Broadcast Acknowledgment Sync
  socket.on("client_acknowledge_broadcast", (data) => {
    if (data && data.broadcastId && data.workerId) {
      activeBroadcasts = activeBroadcasts.map((bc) => {
        if (bc.broadcastId === data.broadcastId) {
          const acked = (bc.acknowledgedWorkerIds || []).includes(data.workerId)
            ? bc.acknowledgedWorkerIds
            : [...(bc.acknowledgedWorkerIds || []), data.workerId];
          return { ...bc, acknowledgedWorkerIds: acked };
        }
        return bc;
      });
    }
    io.emit("broadcast_acknowledged_synced", data);
  });

  // Real-time Sensor Override Sync from any client (Laptop / Simulator / Phone)
  socket.on("client_update_sensor", (data) => {
    if (data && data.workerId && data.sensorKey !== undefined) {
      updateServerWorkerSensor(data.workerId, data.sensorKey, data.value);
    }
    io.emit("worker_sensor_synced", data);
  });

  // Real-time Emergency Hazard Trigger Sync
  socket.on("client_trigger_hazard", (data) => {
    emergencyActive = true;
    if (data && data.workerId && data.emergencyType) {
      applyServerHazard(data.workerId, data.emergencyType);
    }
    io.emit("hazard_event_synced", data);
    io.emit("system_status", { connected: io.engine.clientsCount, emergencyActive: true });
  });

  // Real-time Incident Resolution Sync
  socket.on("client_resolve_incident", (data) => {
    if (data && data.workerId) {
      resetServerWorker(data.workerId);
    }
    io.emit("incident_resolved_synced", data);
  });

  // Manual SOS trigger from Emergency Button
  socket.on("trigger_emergency", (data) => {
    emergencyActive = true;
    const targetId = (data && data.workerId) || "W004";
    applyServerHazard(targetId, "FALL");
    const affectedWorker = WORKERS.find((w) => w.id === targetId) || WORKERS[3];
    const payload = generateWorkerUpdate(affectedWorker);

    io.emit("emergency_alert", {
      worker: payload,
      message: `⚠ EMERGENCY: ${affectedWorker.name} | ${affectedWorker.zone}`,
      severity: "critical",
      timestamp: Date.now(),
    });
    io.emit("worker_update", payload);
    io.emit("system_status", { connected: io.engine.clientsCount, emergencyActive: true });
  });

  socket.on("clear_emergency", () => {
    emergencyActive = false;
    activeBroadcasts = [];
    clearEmergency();
    io.emit("emergency_cleared", { timestamp: Date.now() });
    io.emit("system_status", { connected: io.engine.clientsCount, emergencyActive: false });
  });

  socket.on("disconnect", () => {
    console.log(`[MinoMine Sync] Device disconnected: ${socket.id}`);
    io.emit("system_status", { connected: io.engine.clientsCount, emergencyActive });
  });
});

// Staggered continuous telemetry emission loop
WORKERS.forEach((worker, idx) => {
  const emitWorker = () => {
    const update = generateWorkerUpdate(worker);
    if (update) io.emit("worker_update", update);
    const nextMs = 3500 + Math.random() * 2000;
    setTimeout(emitWorker, nextMs);
  };
  setTimeout(emitWorker, idx * 400);
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`[MinoMine] Real-time Sync Server listening on 0.0.0.0:${PORT}`);
});

