import apiClient from '@/lib/axios';

export interface Resident {
    residentId: number;
    householdId: number;
    fullName: string;
    dateOfBirth?: string;
    indentityCardNumber?: string;
    relationToOwner?: string;
    job?: string;
    phone_number?: string;
    isStaying: boolean;
    household_resident?: {
        householdId: number;
        householdCode: string;
        ownerName: string;
        address: string;
    };
}

export interface ResidentFilters {
    fullName?: string;
    householdId?: number;
    isStaying?: boolean;
    page?: number;
    limit?: number;
}

export interface ResidentResponse {
    residents: Resident[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
        itemsPerPage: number;
    };
}

export interface CreateResidentData {
    householdId: number;
    fullName: string;
    dateOfBirth?: string;
    indentityCardNumber?: string;
    relationToOwner?: string;
    job?: string;
    phone_number?: string;
    isStaying?: boolean;
}

export interface UpdateResidentData {
    householdId: number;
    fullName: string;
    dateOfBirth?: string;
    indentityCardNumber?: string;
    relationToOwner?: string;
    job?: string;
    phone_number?: string;
    isStaying?: boolean;
}

export const getAllResidentsForAdmin = async (filters: ResidentFilters = {}): Promise<ResidentResponse> => {
    const params = new URLSearchParams();

    if (filters.fullName) params.append('fullName', filters.fullName);
    if (filters.householdId) params.append('householdId', filters.householdId.toString());
    if (filters.isStaying !== undefined) params.append('isStaying', filters.isStaying.toString());
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    const response = await apiClient.get(`/residents?${params.toString()}`);
    return response.data;
};

export const getResidentById = async (id: number): Promise<Resident> => {
    const response = await apiClient.get(`/residents/${id}`);
    return response.data;
};

export const createResident = async (data: CreateResidentData): Promise<Resident> => {
    const response = await apiClient.post('/residents', data);
    return response.data;
};

export const updateResident = async (id: number, data: UpdateResidentData): Promise<Resident> => {
    const response = await apiClient.put(`/residents/${id}`, data);
    return response.data;
};

export const deleteResident = async (id: number): Promise<void> => {
    await apiClient.delete(`/residents/${id}`);
};