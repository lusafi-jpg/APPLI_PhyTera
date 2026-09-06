import { apiFetch } from './api';
import { mockStorage } from './mockStorage';

export const farmsService = {
    async getAllFarms() {
        try {
            const data = await apiFetch('/api/v1/farms');
            if (Array.isArray(data) && data.length > 0) {
                mockStorage.setFarms(data);
                return data;
            }
            // If backend returned empty list, check if we have local stored farms
            const local = mockStorage.getFarms();
            return local.length > 0 ? local : (data || []);
        } catch (err) {
            console.warn('[farmsService] API non joignable, utilisation du stockage local:', err.message);
            return mockStorage.getFarms();
        }
    },

    async getFarmById(id) {
        try {
            return await apiFetch(`/api/v1/farms/${id}`);
        } catch (err) {
            return mockStorage.getFarmById(id);
        }
    },

    async createFarm(data) {
        // dto: { name, description, location }
        try {
            const res = await apiFetch('/api/v1/farms', {
                method: 'POST',
                body: data,
            });
            if (res && res.id) {
                mockStorage.addFarm(res);
                return res;
            }
        } catch (err) {
            console.warn('[farmsService] Échec API distante, enregistrement local de l\'exploitation:', err.message);
        }

        // Fallback: create & persist in browser localStorage
        return mockStorage.addFarm({
            name: data.name,
            location: data.location || '',
            description: data.description || '',
            fields: [],
        });
    },

    async updateFarm(id, data) {
        try {
            const res = await apiFetch(`/api/v1/farms/${id}`, {
                method: 'PUT',
                body: data,
            });
            mockStorage.updateFarm(id, data);
            return res;
        } catch (err) {
            return mockStorage.updateFarm(id, data);
        }
    },

    async deleteFarm(id) {
        try {
            await apiFetch(`/api/v1/farms/${id}`, {
                method: 'DELETE',
            });
        } catch (err) {
            console.warn('[farmsService] Échec API distante lors de la suppression, suppression locale:', err.message);
        }
        return mockStorage.deleteFarm(id);
    },
};
