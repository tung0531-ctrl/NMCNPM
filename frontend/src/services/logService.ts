import axios from '../lib/axios';

export interface Log {
    logId: number;
    userId: number | null;
    action: string;
    entityType: string | null;
    entityId: number | null;
    details: string | null;
    ipAddress: string | null;
    userAgent: string | null;
    createdAt: string; // Should be ISO 8601 string from backend
    user?: {
        userId: number;
        username: string;
        fullName: string;
        role: string;
    };
}

export interface LogsResponse {
    logs: Log[];
    total: number;
    page: number;
    totalPages: number;
}

export interface LogStatsResponse {
    actionCounts: Array<{ action: string; count: number }>;
    entityTypeCounts: Array<{ entityType: string; count: number }>;
}

export interface GetLogsParams {
    page?: number;
    limit?: number;
    action?: string;
    entityType?: string;
    userId?: number;
    startDate?: string;
    endDate?: string;
}

export const logService = {
    // Get logs with pagination and filters
    getLogs: async (params: GetLogsParams = {}): Promise<LogsResponse> => {
        const response = await axios.get('/logs', { params });
        return response.data;
    },

    // Get log statistics
    getLogStats: async (startDate?: string, endDate?: string): Promise<LogStatsResponse> => {
        const params: Record<string, string> = {};
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
        
        const response = await axios.get('/logs/stats', { params });
        return response.data;
    }
};
