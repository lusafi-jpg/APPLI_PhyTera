import { apiFetch } from './api';

export const farmsService = {
    async getAllFarms() {
        return await apiFetch('/api/v1/farms');
    },

    async getFarmById(id) {
        return await apiFetch(`/api/v1/farms/${id}`);
    },

    async createFarm(data) {
        // dto: { name, description, location }
        return await apiFetch('/api/v1/farms', {
            method: 'POST',
            body: data,
        });
    },

    async updateFarm(id, data) {
        return await apiFetch(`/api/v1/farms/${id}`, {
            method: 'PUT',
            body: data,
        });
    },

    async deleteFarm(id) {
        return await apiFetch(`/api/v1/farms/${id}`, {
            method: 'DELETE',
        });
    },
};
