import { apiFetch } from './api';

export const usersService = {
    async getAllUsers() {
        return await apiFetch('/api/v1/users');
    },

    async getUserById(id) {
        return await apiFetch(`/api/v1/users/${id}`);
    },

    async updatePreferences(preferences) {
        return await apiFetch('/api/v1/users/me/preferences', {
            method: 'PUT',
            body: preferences,
        });
    },
};
