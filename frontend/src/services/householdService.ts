import apiClient from '@/lib/axios';

export interface Household {
    householdId: number;
    ownerName: string;
    householdCode: string;
    address: string;
}

export const getAllHouseholds = async (): Promise<Household[]> => {
    const response = await apiClient.get('/households');
    return response.data.households;
};
