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

export interface UpdateHouseholdData {
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

export const getMyHousehold = async (): Promise<Household | null> => {
    const households = await getAllHouseholds();
    return households[0] || null;
};

export const getAllHouseholdsForAdmin = async (filters: HouseholdFilters): Promise<HouseholdResponse> => {
    const response = await apiClient.get('/households/admin', { params: filters });
    return response.data;
};

export const createHousehold = async (data: CreateHouseholdData): Promise<Household> => {
    const response = await apiClient.post('/households/admin', data);
    return response.data;
};

export const updateHousehold = async (householdId: number, data: UpdateHouseholdData): Promise<Household> => {
    const response = await apiClient.put(`/households/admin/${householdId}`, data);
    return response.data;
};

export const deleteHousehold = async (householdId: number): Promise<void> => {
    await apiClient.delete(`/households/admin/${householdId}`);
};
