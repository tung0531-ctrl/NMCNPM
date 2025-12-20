export interface User {
    _id: string; 
    username: string;
    email: string;
    fullName: string;
    role: 'USER' | 'ADMIN';
    phone?: string;
    createdAt?: string;
    updatedAt?: string;

}