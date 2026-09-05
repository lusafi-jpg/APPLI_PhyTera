import { apiFetch } from './api';

export const cropImagesService = {
    async uploadImage(data) {
        // dto: { fieldId, imageUrl, source, gpsLat, gpsLng, aiDiagnosis, confidenceScore }
        return await apiFetch('/api/v1/crop-images', {
            method: 'POST',
            body: data,
        });
    },

    async getFieldImages(fieldId) {
        return await apiFetch(`/api/v1/crop-images/field/${fieldId}`);
    },

    async updateDiagnosis(id, diagnosisData) {
        // dto: { aiDiagnosis, confidenceScore, status }
        return await apiFetch(`/api/v1/crop-images/${id}/diagnosis`, {
            method: 'PATCH',
            body: diagnosisData,
        });
    },
};
