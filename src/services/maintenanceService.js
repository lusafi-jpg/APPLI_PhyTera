import { apiFetch } from './api';
import { mockStorage } from './mockStorage';

export const maintenanceService = {
    async createTicket(data) {
        // dto: { deviceId, title, issueDescription, interventionDate }
        try {
            const res = await apiFetch('/api/v1/maintenance/tickets', {
                method: 'POST',
                body: data,
            });
            if (res && res.id) {
                mockStorage.addTicket(res);
                return res;
            }
        } catch (err) {
            console.warn('[maintenanceService] API non joignable, enregistrement local du ticket:', err.message);
        }
        return mockStorage.addTicket(data);
    },

    async updateTicket(id, data) {
        // dto: { status, resolutionNote, interventionDate }
        try {
            return await apiFetch(`/api/v1/maintenance/tickets/${id}`, {
                method: 'PATCH',
                body: data,
            });
        } catch (err) {
            return { id, ...data };
        }
    },

    async getMyInterventions() {
        try {
            const data = await apiFetch('/api/v1/maintenance/my-interventions');
            if (Array.isArray(data) && data.length > 0) {
                return data;
            }
            const local = mockStorage.getTickets();
            return local.length > 0 ? local : (data || []);
        } catch (err) {
            console.warn('[maintenanceService] API non joignable, tickets locaux:', err.message);
            return mockStorage.getTickets();
        }
    },

    async getDeviceTickets(deviceId) {
        try {
            return await apiFetch(`/api/v1/maintenance/device/${deviceId}`);
        } catch (err) {
            const tickets = mockStorage.getTickets();
            return tickets.filter((t) => t.deviceId === deviceId);
        }
    },
};
