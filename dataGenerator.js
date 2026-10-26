// server/dataGenerator.js
// Backend Telemetry Generator for 12 Underground Mining Workers (SIH 2026)

const WORKERS = [
  { id: "W001", name: "Arjun Mehta", zone: "Zone A – Main Shaft", shift: "Alpha", depthMeters: 450 },
  { id: "W002", name: "Carlos Vega", zone: "Zone B – East Tunnel", shift: "Alpha", depthMeters: 520 },
  { id: "W003", name: "Liu Wei", zone: "Zone C – Blast Chamber", shift: "Beta", depthMeters: 610 },
  { id: "W004", name: "Samuel Okafor", zone: "Zone A – Ventilation", shift: "Beta", depthMeters: 410 },
  { id: "W005", name: "Priya Nair", zone: "Zone D – Control Substation", shift: "Alpha", depthMeters: 350 },
  { id: "W006", name: "Rajan Pillai", zone: "Zone B – Deep Shaft", shift: "Gamma", depthMeters: 720 },
  { id: "W007", name: "Tom Eriksen", zone: "Zone C – Loading Bay", shift: "Gamma", depthMeters: 580 },
  { id: "W008", name: "Ana Souza", zone: "Zone D – Ore Processing", shift: "Alpha", depthMeters: 390 },
  { id: "W009", name: "Vikram Singh", zone: "Zone A – Drill Face", shift: "Beta", depthMeters: 480 },
  { id: "W010", name: "Marcus Vance", zone: "Zone B – South Drift", shift: "Gamma", depthMeters: 640 },
  { id: "W011", name: "Chen Chao", zone: "Zone C – Explosives Store", shift: "Alpha", depthMeters: 590 },
  { id: "W012", name: "David Miller", zone: "Zone D – Refuge Chamber", shift: "Beta", depthMeters: 320 },
];

const INITIAL_WORKER_STATES = {
  W001: { heartRate: 74, temperature: 36.6, systolicBP: 118, diastolicBP: 76, respiration: 16, gasLevel: 14, fallDetected: false, fireDetected: false, battery: 88, communicationStatus: "ONLINE" },
  W002: { heartRate: 82, temperature: 36.8, systolicBP: 122, diastolicBP: 78, respiration: 18, gasLevel: 28, fallDetected: false, fireDetected: false, battery: 79, communicationStatus: "ONLINE" },
  W003: { heartRate: 98, temperature: 37.3, systolicBP: 134, diastolicBP: 84, respiration: 22, gasLevel: 95, fallDetected: false, fireDetected: false, battery: 64, communicationStatus: "ONLINE" },
  W004: { heartRate: 68, temperature: 36.4, systolicBP: 114, diastolicBP: 74, respiration: 14, gasLevel: 10, fallDetected: false, fireDetected: false, battery: 92, communicationStatus: "ONLINE" },
  W005: { heartRate: 71, temperature: 36.5, systolicBP: 116, diastolicBP: 75, respiration: 15, gasLevel: 8, fallDetected: false, fireDetected: false, battery: 95, communicationStatus: "ONLINE" },
  W006: { heartRate: 112, temperature: 37.8, systolicBP: 142, diastolicBP: 88, respiration: 24, gasLevel: 115, fallDetected: false, fireDetected: false, battery: 42, communicationStatus: "ONLINE" },
  W007: { heartRate: 76, temperature: 36.7, systolicBP: 120, diastolicBP: 78, respiration: 17, gasLevel: 18, fallDetected: false, fireDetected: false, battery: 68, communicationStatus: "ONLINE" },
  W008: { heartRate: 79, temperature: 36.6, systolicBP: 119, diastolicBP: 77, respiration: 16, gasLevel: 12, fallDetected: false, fireDetected: false, battery: 84, communicationStatus: "ONLINE" },
  W009: { heartRate: 88, temperature: 37.0, systolicBP: 126, diastolicBP: 80, respiration: 19, gasLevel: 32, fallDetected: false, fireDetected: false, battery: 73, communicationStatus: "ONLINE" },
  W010: { heartRate: 0, temperature: 36.2, systolicBP: 0, diastolicBP: 0, respiration: 0, gasLevel: 0, fallDetected: false, fireDetected: false, battery: 12, communicationStatus: "OFFLINE" },
  W011: { heartRate: 75, temperature: 36.5, systolicBP: 117, diastolicBP: 75, respiration: 15, gasLevel: 15, fallDetected: false, fireDetected: false, battery: 90, communicationStatus: "ONLINE" },
  W012: { heartRate: 72, temperature: 36.4, systolicBP: 115, diastolicBP: 74, respiration: 15, gasLevel: 6, fallDetected: false, fireDetected: false, battery: 98, communicationStatus: "ONLINE" },
};

const workerState = WORKERS.reduce((acc, w) => {
  const init = INITIAL_WORKER_STATES[w.id] || {};
  acc[w.id] = {
    heartRate: init.heartRate ?? 74,
    systolicBP: init.systolicBP ?? 118,
    diastolicBP: init.diastolicBP ?? 76,
    respiration: init.respiration ?? 16,
    temperature: init.temperature ?? 36.6,
    o2: 98,
    gasLevel: init.gasLevel ?? 14,
    fallDetected: init.fallDetected ?? false,
    fireDetected: init.fireDetected ?? false,
    noiseDb: 58,
    battery: init.battery ?? 85,
    noiseCancel: true,
    hapticActive: false,
    headlightOn: true,
    ldrLux: 40,
    communicationStatus: init.communicationStatus || "ONLINE",
    safetyStatus: init.communicationStatus === "OFFLINE" ? "OFFLINE" : "SAFE",
    latitude: 23.795,
    longitude: 86.430,
    hrHistory: Array.from({ length: 10 }, () => init.heartRate || 74),
    isOverridden: false,
  };
  return acc;
}, {});

function drift(value, min, max, step) {
  const delta = (Math.random() - 0.5) * step;
  return Math.min(max, Math.max(min, value + delta));
}

function evaluateSafetyStatus(s) {
  if (s.communicationStatus === "OFFLINE") return "OFFLINE";
  if (
    s.fallDetected ||
    s.fireDetected ||
    s.gasLevel >= 180 ||
    s.temperature >= 38.5 ||
    s.heartRate > 130 ||
    s.heartRate < 45 ||
    s.o2 < 90
  ) {
    return "CRITICAL";
  }
  if (
    s.gasLevel >= 80 ||
    s.temperature >= 37.5 ||
    s.heartRate > 105 ||
    s.heartRate < 55 ||
    s.o2 < 94 ||
    s.battery < 15
  ) {
    return "WARNING";
  }
  return "SAFE";
}

function generateWorkerUpdate(worker) {
  const s = workerState[worker.id];
  if (!s) return null;

  if (s.communicationStatus === "OFFLINE") {
    return {
      id: worker.id,
      name: worker.name,
      zone: worker.zone,
      shift: worker.shift,
      depthMeters: worker.depthMeters,
      heartRate: 0,
      systolic: 0,
      diastolic: 0,
      systolicBP: 0,
      diastolicBP: 0,
      respiration: 0,
      temperature: "36.0",
      o2: "0.0",
      gasLevel: 0,
      fallDetected: false,
      fireDetected: false,
      noiseDb: 0,
      battery: Math.round(s.battery),
      noiseCancel: false,
      communicationStatus: "OFFLINE",
      safetyStatus: "OFFLINE",
      latitude: s.latitude,
      longitude: s.longitude,
      hrHistory: [...s.hrHistory],
      timestamp: Date.now(),
    };
  }

  // Mild drift only if not in hazard state and not explicitly overridden
  if (!s.fallDetected && !s.fireDetected && s.gasLevel < 180 && s.heartRate <= 130 && s.heartRate >= 45 && !s.isOverridden) {
    s.heartRate = drift(s.heartRate, 60, 100, 1.5);
    s.systolicBP = drift(s.systolicBP, 110, 130, 1);
    s.diastolicBP = drift(s.diastolicBP, 70, 85, 1);
    s.respiration = Math.floor(drift(s.respiration, 14, 20, 0.5));
    s.temperature = drift(s.temperature, 36.4, 37.2, 0.02);
    s.gasLevel = Math.floor(drift(s.gasLevel, 5, 45, 1));
  }

  s.hrHistory.push(Math.round(s.heartRate));
  if (s.hrHistory.length > 20) s.hrHistory.shift();

  s.safetyStatus = evaluateSafetyStatus(s);

  return {
    id: worker.id,
    name: worker.name,
    zone: worker.zone,
    shift: worker.shift,
    depthMeters: worker.depthMeters,
    heartRate: Math.round(s.heartRate),
    systolic: Math.round(s.systolicBP),
    diastolic: Math.round(s.diastolicBP),
    systolicBP: Math.round(s.systolicBP),
    diastolicBP: Math.round(s.diastolicBP),
    respiration: s.respiration,
    temperature: typeof s.temperature === "number" ? s.temperature.toFixed(1) : s.temperature,
    o2: typeof s.o2 === "number" ? s.o2.toFixed(1) : s.o2,
    gasLevel: s.gasLevel,
    fallDetected: s.fallDetected,
    fireDetected: s.fireDetected,
    noiseDb: Math.round(s.noiseDb),
    battery: Math.round(s.battery),
    noiseCancel: s.noiseCancel,
    hapticActive: s.hapticActive,
    headlightOn: s.headlightOn,
    ldrLux: s.ldrLux,
    communicationStatus: s.communicationStatus,
    safetyStatus: s.safetyStatus,
    latitude: s.latitude,
    longitude: s.longitude,
    hrHistory: [...s.hrHistory],
    timestamp: Date.now(),
  };
}

function updateServerWorkerSensor(workerId, sensorKey, value) {
  if (workerState[workerId]) {
    workerState[workerId][sensorKey] = value;
    workerState[workerId].isOverridden = true;
    workerState[workerId].safetyStatus = evaluateSafetyStatus(workerState[workerId]);
  }
}

function applyServerHazard(workerId, emergencyType) {
  const s = workerState[workerId];
  if (!s) return;
  s.isOverridden = true;
  switch (emergencyType) {
    case "FALL":
      s.fallDetected = true;
      s.heartRate = 96;
      s.temperature = 36.6;
      s.systolicBP = 120;
      s.diastolicBP = 80;
      s.respiration = 20;
      break;
    case "FIRE":
      s.fireDetected = true;
      s.temperature = 40.2;
      s.heartRate = 108;
      s.systolicBP = 120;
      s.diastolicBP = 80;
      break;
    case "GAS_LEAK":
      s.gasLevel = 265;
      s.respiration = 24;
      s.heartRate = 84;
      s.temperature = 36.6;
      s.systolicBP = 120;
      s.diastolicBP = 80;
      break;
    case "MEDICAL":
      s.o2 = 84;
      s.heartRate = 138;
      s.systolicBP = 155;
      s.diastolicBP = 98;
      s.respiration = 28;
      s.temperature = 36.6;
      break;
    case "MANUAL_EMERGENCY":
      s.fallDetected = false;
      s.heartRate = 125;
      s.temperature = 36.6;
      s.systolicBP = 122;
      s.diastolicBP = 78;
      break;
    default:
      break;
  }
  s.safetyStatus = evaluateSafetyStatus(s);
}

function resetServerWorker(workerId) {
  if (workerState[workerId]) {
    const init = INITIAL_WORKER_STATES[workerId] || {};
    workerState[workerId] = {
      ...workerState[workerId],
      heartRate: init.heartRate || 74,
      temperature: init.temperature || 36.6,
      systolicBP: init.systolicBP || 118,
      diastolicBP: init.diastolicBP || 76,
      respiration: init.respiration || 16,
      gasLevel: init.gasLevel || 14,
      fallDetected: false,
      fireDetected: false,
      isOverridden: false,
      safetyStatus: workerState[workerId].communicationStatus === "OFFLINE" ? "OFFLINE" : "SAFE",
    };
  }
}

function clearEmergency() {
  Object.keys(workerState).forEach((id) => {
    resetServerWorker(id);
  });
}

module.exports = {
  WORKERS,
  generateWorkerUpdate,
  updateServerWorkerSensor,
  applyServerHazard,
  resetServerWorker,
  clearEmergency,
};
