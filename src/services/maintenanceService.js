import { apiFetch } from './api';

export const maintenanceService = {
    async createTicket(data) {
        // dto: { deviceId, title, issueDescription, interventionDate }
        return await apiFetch('/api/v1/maintenance/tickets', {
            method: 'POST',
            body: data,
        });
    },

    async updateTicket(id, data) {
        // dto: { status, resolutionNote, interventionDate }
        return await apiFetch(`/api/v1/maintenance/tickets/${id}`, {
            method: 'PATCH',
            body: data,
        });
    },

    async getMyInterventions() {
        return await apiFetch('/api/v1/maintenance/my-interventions');
    },

    async getDeviceTickets(deviceId) {
        return await apiFetch(`/api/v1/maintenance/device/${deviceId}`);
    },
};
