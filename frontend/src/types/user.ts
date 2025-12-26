export interface User {
    _id: string; 
    username: string;
    email: string;
    fullName: string;
    role: 'RESIDENT' | 'ADMIN';
    status?: 'ACTIVE' | 'LOCKED';
    phone?: string;
    createdAt?: string;
    updatedAt?: string;
}