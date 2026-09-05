import { apiFetch } from './api';

export const notificationsService = {
    async getMyNotifications() {
        return await apiFetch('/api/v1/notifications');
    },

    async markAsRead(id) {
        return await apiFetch(`/api/v1/notifications/${id}/read`, {
            method: 'PATCH',
        });
    },
};
