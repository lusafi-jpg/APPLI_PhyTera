import { apiFetch } from './api';

export const droneService = {
    async createDroneMission(data) {
        // dto: { fieldId, flightDate, pilotName, ndviMapUrl, thermalMapUrl, metadataJson }
        return await apiFetch('/api/v1/drone/missions', {
            method: 'POST',
            body: data,
        });
    },

    async getFieldDroneMissions(fieldId) {
        return await apiFetch(`/api/v1/drone/field/${fieldId}`);
    },
};
