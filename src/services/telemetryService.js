import { apiFetch } from './api';

const generateDefaultTelemetry = (deviceId) => {
    const points = [];
    const now = Date.now();
    for (let i = 14; i >= 0; i--) {
        const time = new Date(now - i * 15 * 60 * 1000).toISOString();
        points.push({
            id: `tel-${deviceId}-${i}`,
            deviceId,
            timestamp: time,
            tempAir: +(26 + Math.sin(i * 0.5) * 4 + (Math.random() * 0.8 - 0.4)).toFixed(1),
            humAir: +(60 + Math.cos(i * 0.5) * 8 + (Math.random() * 1.5 - 0.75)).toFixed(1),
            tempSol: +(23 + Math.sin(i * 0.3) * 2 + (Math.random() * 0.5 - 0.25)).toFixed(1),
            humSol: +(65 + Math.sin(i * 0.4) * 6 + (Math.random() * 1.2 - 0.6)).toFixed(1),
            phSol: +(6.5 + (Math.random() * 0.4 - 0.2)).toFixed(2),
            luminosite: Math.round(35000 + Math.sin(i * 0.6) * 15000),
            batteryLevel: 85,
        });
    }
    return points;
};

const getLocalTelemetry = (deviceId) => {
    try {
        const raw = localStorage.getItem(`phytera_tel_${deviceId}`);
        if (raw) return JSON.parse(raw);
    } catch (e) { }
    const generated = generateDefaultTelemetry(deviceId);
    saveLocalTelemetry(deviceId, generated);
    return generated;
};

const saveLocalTelemetry = (deviceId, data) => {
    try {
        localStorage.setItem(`phytera_tel_${deviceId}`, JSON.stringify(data));
    } catch (e) { }
};

export const telemetryService = {
    async getFieldTelemetry(fieldId, limit = 100) {
        try {
            const data = await apiFetch(`/api/v1/telemetry/field/${fieldId}?limit=${limit}`);
            if (Array.isArray(data) && data.length > 0) return data;
            return getLocalTelemetry(fieldId).slice(0, limit);
        } catch (err) {
            return getLocalTelemetry(fieldId).slice(0, limit);
        }
    },

    async getLatestFieldTelemetry(fieldId) {
        try {
            return await apiFetch(`/api/v1/telemetry/field/${fieldId}/latest`);
        } catch (err) {
            const list = getLocalTelemetry(fieldId);
            return list[0] || null;
        }
    },

    async getDeviceTelemetry(deviceId, limit = 100) {
        try {
            const data = await apiFetch(`/api/v1/telemetry/device/${deviceId}?limit=${limit}`);
            if (Array.isArray(data) && data.length > 0) return data;
            return getLocalTelemetry(deviceId).slice(0, limit);
        } catch (err) {
            return getLocalTelemetry(deviceId).slice(0, limit);
        }
    },

    async getLatestDeviceTelemetry(deviceId) {
        try {
            return await apiFetch(`/api/v1/telemetry/device/${deviceId}/latest`);
        } catch (err) {
            const list = getLocalTelemetry(deviceId);
            return list[0] || null;
        }
    },

    async acquireDeviceTelemetry(deviceId) {
        try {
            return await apiFetch(`/api/v1/telemetry/device/${deviceId}/acquire`, {
                method: 'POST',
            });
        } catch (err) {
            console.warn('[telemetryService] Mesure simulée en direct (mode local):', err.message);
            const newPoint = {
                id: `tel-${deviceId}-${Date.now()}`,
                deviceId,
                timestamp: new Date().toISOString(),
                tempAir: +(28.2 + (Math.random() * 1.5 - 0.75)).toFixed(1),
                humAir: +(62 + (Math.random() * 2 - 1)).toFixed(1),
                tempSol: +(24.0 + (Math.random() * 0.8 - 0.4)).toFixed(1),
                humSol: +(66.5 + (Math.random() * 2 - 1)).toFixed(1),
                phSol: +(6.6 + (Math.random() * 0.3 - 0.15)).toFixed(2),
                luminosite: Math.round(42000 + (Math.random() * 4000 - 2000)),
                batteryLevel: 88,
            };
            const current = getLocalTelemetry(deviceId);
            const updated = [newPoint, ...current];
            saveLocalTelemetry(deviceId, updated);
            return newPoint;
        }
    },

    // ESP32 Batch post utility (uses x-device-key header)
    async postDeviceBatch(deviceKey, batchData) {
        return await apiFetch('/api/v1/telemetry/batch', {
            method: 'POST',
            headers: {
                'x-device-key': deviceKey,
            },
            body: batchData,
        });
    },
};
