import { apiFetch } from './api';
import { mockStorage } from './mockStorage';

export const fieldsService = {
    async getFields(farmId) {
        try {
            const query = farmId ? `?farmId=${encodeURIComponent(farmId)}` : '';
            const data = await apiFetch(`/api/v1/fields${query}`);
            if (Array.isArray(data) && data.length > 0) {
                return data;
            }
            const local = mockStorage.getFields(farmId);
            return local.length > 0 ? local : (data || []);
        } catch (err) {
            console.warn('[fieldsService] API non joignable, chargement local des champs/parcelles:', err.message);
            return mockStorage.getFields(farmId);
        }
    },

    async getFieldById(id) {
        try {
            return await apiFetch(`/api/v1/fields/${id}`);
        } catch (err) {
            return mockStorage.getFieldById(id);
        }
    },

    async createField(data) {
        // dto: { name, description, farmId, locationPolygon, surfaceArea, cultureType, variety, timezone, configLocal }
        try {
            const res = await apiFetch('/api/v1/fields', {
                method: 'POST',
                body: data,
            });
            if (res && res.id) {
                mockStorage.addField(res);
                return res;
            }
        } catch (err) {
            console.warn('[fieldsService] API non joignable, enregistrement local du champ/parcelle:', err.message);
        }

        // Fallback: create locally
        return mockStorage.addField(data);
    },

    async updateField(id, data) {
        try {
            return await apiFetch(`/api/v1/fields/${id}`, {
                method: 'PUT',
                body: data,
            });
        } catch (err) {
            return { id, ...data };
        }
    },

    async deleteField(id) {
        try {
            await apiFetch(`/api/v1/fields/${id}`, {
                method: 'DELETE',
            });
        } catch (err) {
            console.warn('[fieldsService] Suppression distante échouée, suppression locale:', err.message);
        }
        return mockStorage.deleteField(id);
    },

    // Field Agronomic Rules
    async getFieldRules(fieldId) {
        try {
            return await apiFetch(`/api/v1/fields/${fieldId}/rules`);
        } catch (err) {
            return [];
        }
    },

    async createFieldRule(fieldId, ruleData) {
        try {
            return await apiFetch(`/api/v1/fields/${fieldId}/rules`, {
                method: 'POST',
                body: ruleData,
            });
        } catch (err) {
            return { id: 'rule-' + Date.now(), fieldId, ...ruleData };
        }
    },

    async deleteFieldRule(fieldId, ruleId) {
        try {
            return await apiFetch(`/api/v1/fields/${fieldId}/rules/${ruleId}`, {
                method: 'DELETE',
            });
        } catch (err) {
            return { success: true };
        }
    },
};
