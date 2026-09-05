import { apiFetch } from './api';

export const auditService = {
    async getAuditLogs(page = 1, limit = 50) {
        return await apiFetch(`/api/v1/audit-logs?page=${page}&limit=${limit}`);
    },
};
