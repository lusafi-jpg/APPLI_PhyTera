import { apiFetch } from './api';

export const alertsService = {
    async getAlerts(filters = {}) {
        const params = new URLSearchParams();
        if (filters.fieldId) params.append('fieldId', filters.fieldId);
        if (filters.resolved !== undefined) params.append('resolved', filters.resolved);
        const query = params.toString() ? `?${params.toString()}` : '';
        return await apiFetch(`/api/v1/alerts${query}`);
    },

    async resolveAlert(id, resolutionNote = '') {
        return await apiFetch(`/api/v1/alerts/${id}/resolve`, {
            method: 'POST',
            body: { resolutionNote },
        });
    },
};
