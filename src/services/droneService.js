import { apiFetch } from './api';
import { mockStorage } from './mockStorage';

export const droneService = {
    async createDroneMission(data) {
        // dto: { fieldId, flightDate, pilotName, ndviMapUrl, thermalMapUrl, metadataJson }
        try {
            const res = await apiFetch('/api/v1/drone/missions', {
                method: 'POST',
                body: data,
            });
            if (res && res.id) {
                mockStorage.addMission(res);
                return res;
            }
        } catch (err) {
            console.warn('[droneService] API non joignable, enregistrement local de la mission:', err.message);
        }
        return mockStorage.addMission(data);
    },

    async getFieldDroneMissions(fieldId) {
        try {
            const data = await apiFetch(`/api/v1/drone/field/${fieldId}`);
            if (Array.isArray(data) && data.length > 0) {
                return data;
            }
            const local = mockStorage.getMissions(fieldId);
            return local.length > 0 ? local : (data || []);
        } catch (err) {
            console.warn('[droneService] API non joignable, missions locales:', err.message);
            return mockStorage.getMissions(fieldId);
        }
    },
};
