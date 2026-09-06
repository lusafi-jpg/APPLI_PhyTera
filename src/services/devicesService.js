import { apiFetch } from './api';
import { mockStorage } from './mockStorage';

export const devicesService = {
    async getAllDevices() {
        try {
            const data = await apiFetch('/api/v1/devices');
            if (Array.isArray(data) && data.length > 0) {
                mockStorage.setDevices(data);
                return data;
            }
            const local = mockStorage.getDevices();
            return local.length > 0 ? local : (data || []);
        } catch (err) {
            console.warn('[devicesService] API non joignable, utilisation des boîtiers locaux:', err.message);
            return mockStorage.getDevices();
        }
    },

    async getDeviceById(id) {
        try {
            return await apiFetch(`/api/v1/devices/${id}`);
        } catch (err) {
            const devices = mockStorage.getDevices();
            return devices.find((d) => d.id === id) || null;
        }
    },

    async registerDevice(data) {
        // dto: { serialNumber, fieldId, deviceType, firmwareVersion }
        try {
            const res = await apiFetch('/api/v1/devices/register', {
                method: 'POST',
                body: data,
            });
            if (res && res.id) {
                mockStorage.addDevice(res);
                return res;
            }
        } catch (err) {
            console.warn('[devicesService] API non joignable, enregistrement local du boîtier:', err.message);
        }

        return mockStorage.addDevice(data);
    },

    async rotateDeviceKey(id) {
        try {
            return await apiFetch(`/api/v1/devices/${id}/rotate-key`, {
                method: 'POST',
            });
        } catch (err) {
            const newKey = 'dk_live_' + Math.random().toString(36).substring(2, 11);
            mockStorage.updateDevice(id, { deviceKey: newKey });
            return { deviceKey: newKey };
        }
    },

    async configureWifi(id, data) {
        // dto: { ssid, password, ipAddress, signalQuality }
        try {
            return await apiFetch(`/api/v1/devices/${id}/wifi`, {
                method: 'PUT',
                body: data,
            });
        } catch (err) {
            mockStorage.updateDevice(id, {
                metadata: {
                    wifiSsid: data.ssid,
                    wifiIp: data.ipAddress || '192.168.1.105',
                    wifiSignal: data.signalQuality || -58,
                },
            });
            return { success: true, metadata: { wifiSsid: data.ssid, wifiIp: data.ipAddress, wifiSignal: data.signalQuality } };
        }
    },

    async removeDevice(id) {
        try {
            await apiFetch(`/api/v1/devices/${id}`, {
                method: 'DELETE',
            });
        } catch (err) {
            console.warn('[devicesService] Suppression distante échouée, suppression locale:', err.message);
        }
        return mockStorage.deleteDevice(id);
    },
};
