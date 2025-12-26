import axios from '../lib/axios';

export interface Bill {
    billId: number;
    householdName: string;
    title: string;
    totalAmount: string | number;
    paidAmount: string | number;
    paymentPeriod: string;
    status: 'Đã thanh toán' | 'Chưa thanh toán' | 'Quá hạn' | 'Thanh toán một phần';
    collectorName: string | null;
    createdAt: string;
}

export interface BillFilters {
    billId?: string;
    householdName?: string;
    paymentPeriod?: string;
    status?: string;
    collectorName?: string;
    page?: number;
    limit?: number;
}

export interface BillsResponse {
    bills: Bill[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
        itemsPerPage: number;
    };
}

export const getMyBills = async (): Promise<Bill[]> => {
    const response = await axios.get('/bills/my');
    return response.data.bills;
};

export const getBills = async (filters?: BillFilters): Promise<BillsResponse> => {
    console.log('getBills called with filters:', filters);
    console.log('axios baseURL:', axios.defaults.baseURL);
    
    try {
        // Build query string
        const queryParams = new URLSearchParams();
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    queryParams.append(key, String(value));
                }
            });
        }
        const queryString = queryParams.toString();
        const url = `/bills${queryString ? '?' + queryString : ''}`;
        
        console.log('Calling URL:', url);
        console.log('Full URL:', 'http://localhost:5001' + url);
        
        const response = await axios.get(url);
        console.log('getBills response status:', response.status);
        console.log('getBills response data:', response.data);
        return response.data;
    } catch (error: any) {
        console.error('getBills error:', error);
        console.error('Error response:', error.response);
        console.error('Error message:', error.message);
        throw error;
    }
};

export interface UpdateBillData {
    householdId?: number;
    title?: string;
    totalAmount?: number;
    paidAmount?: number;
    paymentPeriod?: string;
    collectorName?: string;
    feeTypeId?: number;
}

export const updateBill = async (billId: number, data: UpdateBillData): Promise<Bill> => {
    try {
        const response = await axios.put(`/bills/${billId}`, data);
        return response.data;
    } catch (error: any) {
        console.error('updateBill error:', error);
        throw error;
    }
};

export interface CreateBillData {
    householdId: number;
    title: string;
    totalAmount: number;
    paidAmount: number;
    paymentPeriod: string;
    collectorName?: string;
    feeTypeId?: number;
}

export const createBill = async (data: CreateBillData): Promise<Bill> => {
    try {
        const response = await axios.post('/bills', data);
        return response.data;
    } catch (error: any) {
        console.error('createBill error:', error);
        throw error;
    }
};

export const deleteBill = async (billId: number): Promise<void> => {
    try {
        await axios.delete(`/bills/${billId}`);
    } catch (error: any) {
        console.error('deleteBill error:', error);
        throw error;
    }
};