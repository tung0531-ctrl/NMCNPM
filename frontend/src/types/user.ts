export interface User {
    _id: string; 
    username: string;
    email: string;
    fullName: string;
    role: 'RESIDENT' | 'ADMIN';  // Updated to match backend enum
    phone?: string;
    createdAt?: string;
    updatedAt?: string;

}