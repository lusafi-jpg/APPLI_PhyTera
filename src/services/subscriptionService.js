import { apiFetch } from './api';

export const subscriptionService = {
    async getSubscription() {
        return await apiFetch('/api/v1/subscription');
    },

    async upgradePlan(plan) {
        // plan: 'STANDARD' | 'PRO' | 'PREMIUM'
        return await apiFetch('/api/v1/subscription/upgrade', {
            method: 'POST',
            body: { plan },
        });
    },
};
