import apiClient from '@/lib/axios';

export interface FeeType {
    feeTypeId: number;
    feeName: string;
    unitPrice: number;
    unit: string;
    description?: string;
}

export const getActiveFeeTypes = async (): Promise<FeeType[]> => {
    const response = await apiClient.get('/fee-types');
    return response.data.feeTypes;
};
