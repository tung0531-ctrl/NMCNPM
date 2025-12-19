import apiClient from '@/lib/axios';

export interface Admin {
    userId: number;
    fullName: string;
    username: string;
}

export const getAllAdmins = async (): Promise<Admin[]> => {
    const response = await apiClient.get('/admins');
    return response.data.admins;
};
