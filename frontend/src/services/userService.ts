import axios from '../lib/axios';

export interface User {
    userId: number;
    username: string;
    email: string;
    fullName: string;
    role: 'ADMIN' | 'RESIDENT';
    status: 'ACTIVE' | 'LOCKED';
    createdAt: string;
    updatedAt: string;
}

export interface CreateUserData {
    username: string;
    email: string;
    fullName: string;
    password: string;
    role?: 'ADMIN' | 'RESIDENT';
    status?: 'ACTIVE' | 'LOCKED';
}

export interface UpdateUserData {
    username?: string;
    email?: string;
    fullName?: string;
    password?: string;
    role?: 'ADMIN' | 'RESIDENT';
    status?: 'ACTIVE' | 'LOCKED';
}

export const userService = {
    // Get all users
    getAllUsers: async (): Promise<User[]> => {
        const response = await axios.get('/users');
        return response.data;
    },

    // Get user by ID
    getUserById: async (id: number): Promise<User> => {
        const response = await axios.get(`/users/${id}`);
        return response.data;
    },

    // Create new user
    createUser: async (data: CreateUserData): Promise<{ message: string; user: User }> => {
        const response = await axios.post('/users', data);
        return response.data;
    },

    // Update user
    updateUser: async (id: number, data: UpdateUserData): Promise<{ message: string; user: User }> => {
        const response = await axios.put(`/users/${id}`, data);
        return response.data;
    },

    // Delete user
    deleteUser: async (id: number): Promise<{ message: string }> => {
        const response = await axios.delete(`/users/${id}`);
        return response.data;
    }
};
