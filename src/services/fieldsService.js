import { apiFetch } from './api';

export const fieldsService = {
    async getFields(farmId) {
        const query = farmId ? `?farmId=${encodeURIComponent(farmId)}` : '';
        return await apiFetch(`/api/v1/fields${query}`);
    },

    async getFieldById(id) {
        return await apiFetch(`/api/v1/fields/${id}`);
    },

    async createField(data) {
        // dto: { name, description, farmId, locationPolygon, surfaceArea, cultureType, variety, timezone, configLocal }
        return await apiFetch('/api/v1/fields', {
            method: 'POST',
            body: data,
        });
    },

    async updateField(id, data) {
        return await apiFetch(`/api/v1/fields/${id}`, {
            method: 'PUT',
            body: data,
        });
    },

    async deleteField(id) {
        return await apiFetch(`/api/v1/fields/${id}`, {
            method: 'DELETE',
        });
    },

    // Field Agronomic Rules
    async getFieldRules(fieldId) {
        return await apiFetch(`/api/v1/fields/${fieldId}/rules`);
    },

    async createFieldRule(fieldId, ruleData) {
        return await apiFetch(`/api/v1/fields/${fieldId}/rules`, {
            method: 'POST',
            body: ruleData,
        });
    },

    async deleteFieldRule(fieldId, ruleId) {
        return await apiFetch(`/api/v1/fields/${fieldId}/rules/${ruleId}`, {
            method: 'DELETE',
        });
    },
};
