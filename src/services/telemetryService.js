import { apiFetch } from './api';

export const telemetryService = {
    async getFieldTelemetry(fieldId, limit = 100) {
        return await apiFetch(`/api/v1/telemetry/field/${fieldId}?limit=${limit}`);
    },

    async getLatestFieldTelemetry(fieldId) {
        return await apiFetch(`/api/v1/telemetry/field/${fieldId}/latest`);
    },

    async getDeviceTelemetry(deviceId, limit = 100) {
        return await apiFetch(`/api/v1/telemetry/device/${deviceId}?limit=${limit}`);
    },

    async getLatestDeviceTelemetry(deviceId) {
        return await apiFetch(`/api/v1/telemetry/device/${deviceId}/latest`);
    },

    async acquireDeviceTelemetry(deviceId) {
        return await apiFetch(`/api/v1/telemetry/device/${deviceId}/acquire`, {
            method: 'POST',
        });
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
