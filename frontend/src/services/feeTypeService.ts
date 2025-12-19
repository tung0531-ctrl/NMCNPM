import apiClient from '@/lib/axios';

export interface FeeType {
    feeTypeId: number;
    feeName: string;
    unitPrice: number;
    unit: string;
    description?: string;
    isActive?: boolean;
}

export interface FeeTypeFilters {
    feeName?: string;
    isActive?: string;
    page?: number;
    limit?: number;
}

export interface FeeTypeResponse {
    feeTypes: FeeType[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
        itemsPerPage: number;
    };
}

export interface CreateFeeTypeData {
    feeName: string;
    unitPrice: number;
    unit?: string;
    description?: string;
    isActive?: boolean;
}

export interface UpdateFeeTypeData {
    feeName: string;
    unitPrice: number;
    unit?: string;
    description?: string;
    isActive?: boolean;
}

export const getActiveFeeTypes = async (): Promise<FeeType[]> => {
    const response = await apiClient.get('/fee-types/active');
    return response.data.feeTypes;
};

export const getAllFeeTypes = async (filters: FeeTypeFilters): Promise<FeeTypeResponse> => {
    const response = await apiClient.get('/fee-types', { params: filters });
    return response.data;
};

export const createFeeType = async (data: CreateFeeTypeData): Promise<FeeType> => {
    const response = await apiClient.post('/fee-types', data);
    return response.data;
};

export const updateFeeType = async (id: number, data: UpdateFeeTypeData): Promise<FeeType> => {
    const response = await apiClient.put(`/fee-types/${id}`, data);
    return response.data;
};

export const deleteFeeType = async (id: number): Promise<void> => {
    await apiClient.delete(`/fee-types/${id}`);
};
