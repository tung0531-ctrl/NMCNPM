import api from '../lib/axios';

export interface StatisticsData {
  totalBills: number;
  totalRevenue: number;
  totalPaid: number;
  unpaidAmount: number;
}

export interface FeeTypeStatistics extends StatisticsData {
  feeTypeId: number;
  feeTypeName: string;
}

export interface HouseholdStatistics extends StatisticsData {
  householdId: number;
  householdName: string;
}

export interface CollectorStatistics extends StatisticsData {
  collectorId: number;
  collectorName: string;
}

export interface PaymentStatusStatistics extends StatisticsData {
  paymentStatus: string;
}

export interface PeriodStatistics extends StatisticsData {
  period: string;
}

export interface OverallStatistics extends StatisticsData {
  paidBills: number;
  unpaidBills: number;
  partialBills: number;
}

export interface DateRangeParams {
  startDate?: string;
  endDate?: string;
}

export interface PeriodParams extends DateRangeParams {
  groupBy?: 'day' | 'month' | 'year';
}

export interface HouseholdParams extends DateRangeParams {
  limit?: number;
}

// Lấy thống kê tổng quan
export const getOverallStatistics = async (params?: DateRangeParams) => {
  const response = await api.get('/statistics/overall', { params });
  return response.data;
};

// Lấy thống kê theo loại phí
export const getStatisticsByFeeType = async (params?: DateRangeParams) => {
  const response = await api.get('/statistics/by-fee-type', { params });
  return response.data;
};

// Lấy thống kê theo hộ gia đình
export const getStatisticsByHousehold = async (params?: HouseholdParams) => {
  const response = await api.get('/statistics/by-household', { params });
  return response.data;
};

// Lấy thống kê theo người thu
export const getStatisticsByCollector = async (params?: DateRangeParams) => {
  const response = await api.get('/statistics/by-collector', { params });
  return response.data;
};

// Lấy thống kê theo trạng thái thanh toán
export const getStatisticsByPaymentStatus = async (params?: DateRangeParams) => {
  const response = await api.get('/statistics/by-payment-status', { params });
  return response.data;
};

// Lấy thống kê theo kỳ thu
export const getStatisticsByPeriod = async (params?: PeriodParams) => {
  const response = await api.get('/statistics/by-period', { params });
  return response.data;
};
