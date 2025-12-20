import apiClient from '@/lib/axios';

export interface Household {
    householdId: number;
    ownerName: string;
    householdCode: string;
    address: string;
    areaSqm?: number;
    userId?: number;
    createdAt?: string;
}

export interface HouseholdFilters {
    ownerName?: string;
    householdCode?: string;
    address?: string;
    page?: number;
    limit?: number;
}

export interface HouseholdResponse {
    households: Household[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
        itemsPerPage: number;
    };
}

export interface CreateHouseholdData {
    householdCode: string;
    ownerName: string;
    address: string;
    areaSqm?: number;
    userId?: number;
}

export const getAllHouseholds = async (): Promise<Household[]> => {
    const response = await apiClient.get('/households');
    return response.data.households;
};

export const getAllHouseholdsForAdmin = async (filters: HouseholdFilters): Promise<HouseholdResponse> => {
    const response = await apiClient.get('/admins/households', { params: filters });
    return response.data;
};

export const createHousehold = async (data: CreateHouseholdData): Promise<Household> => {
    const response = await apiClient.post('/admins/households', data);
    return response.data;
};
