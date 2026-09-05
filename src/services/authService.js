import { apiFetch } from './api';

export const authService = {
    async register(data) {
        // dto: { email, password, nom, role }
        const res = await apiFetch('/api/v1/auth/register', {
            method: 'POST',
            body: data,
        });
        if (res?.accessToken) {
            localStorage.setItem('token', res.accessToken);
            localStorage.setItem('isAuthenticated', 'true');
            if (res.user) localStorage.setItem('user', JSON.stringify(res.user));
        }
        return res;
    },

    async login(credentials) {
        // dto: { email, password }
        const res = await apiFetch('/api/v1/auth/login', {
            method: 'POST',
            body: credentials,
        });
        if (res?.accessToken) {
            localStorage.setItem('token', res.accessToken);
            localStorage.setItem('isAuthenticated', 'true');
            if (res.user) localStorage.setItem('user', JSON.stringify(res.user));
        }
        return res;
    },

    async refreshToken(refreshToken) {
        return await apiFetch('/api/v1/auth/refresh', {
            method: 'POST',
            body: { refreshToken },
        });
    },

    async getProfile() {
        return await apiFetch('/api/v1/auth/me');
    },

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.setItem('isAuthenticated', 'false');
    },
};
