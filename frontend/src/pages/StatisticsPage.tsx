import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  getOverallStatistics,
  getStatisticsByFeeType,
  getStatisticsByHousehold,
  getStatisticsByCollector,
  getStatisticsByPaymentStatus,
  getStatisticsByPeriod,
  type OverallStatistics,
  type FeeTypeStatistics,
  type HouseholdStatistics,
  type CollectorStatistics,
  type PaymentStatusStatistics,
  type PeriodStatistics,
} from '../services/statisticsService';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const StatisticsPage = () => {
  const navigate = useNavigate();
  const [overall, setOverall] = useState<OverallStatistics | null>(null);
  const [byFeeType, setByFeeType] = useState<FeeTypeStatistics[]>([]);
  const [byHousehold, setByHousehold] = useState<HouseholdStatistics[]>([]);
  const [byCollector, setByCollector] = useState<CollectorStatistics[]>([]);
  const [byPaymentStatus, setByPaymentStatus] = useState<PaymentStatusStatistics[]>([]);
  const [byPeriod, setByPeriod] = useState<PeriodStatistics[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    const loadStatistics = async () => {
      await fetchStatistics();
    };
    loadStatistics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const params = dateRange.startDate && dateRange.endDate ? dateRange : undefined;

      const [overallData, feeTypeData, householdData, collectorData, paymentStatusData, periodData] =
        await Promise.all([
          getOverallStatistics(params),
          getStatisticsByFeeType(params),
          getStatisticsByHousehold({ ...params, limit: 10 }),
          getStatisticsByCollector(params),
          getStatisticsByPaymentStatus(params),
          getStatisticsByPeriod({ ...params, groupBy: 'month' }),
        ]);

      setOverall(overallData.data);
      setByFeeType(feeTypeData.data);
      setByHousehold(householdData.data);
      setByCollector(collectorData.data);
      setByPaymentStatus(paymentStatusData.data);
      setByPeriod(periodData.data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilter = () => {
    fetchStatistics();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  if (loading) {
    return (
      <div className="relative min-h-screen">
        <div className="fixed inset-0 -z-10 bg-gradient-purple" />
        <div className="flex items-center justify-center h-screen">
          <div className="text-xl">Đang tải dữ liệu thống kê...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 -z-10 bg-gradient-purple" />
      <div className="min-h-screen p-6 md:p-10">
        <div className="max-w-7xl mx-auto">
          <Card className="border-border">
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-col gap-6">
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold">Thống Kê Doanh Thu</h1>
                    <p className="text-base text-muted-foreground">
                      Theo dõi và phân tích doanh thu từ các khoản thu phí
                    </p>
                    <p className="text-base text-red-600">
                      Nếu không chọn khoảng thời gian, hệ thống sẽ hiển thị dữ liệu của 12 tháng gần nhất
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => navigate('/')}
                      className="h-10 text-base px-4"
                    >
                      ← Về trang chủ
                    </Button>
                  </div>
                </div>

                {/* Date Range Filter */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="startDate" className="text-base">Từ ngày</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={dateRange.startDate}
                      onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                      className="h-10 text-base"
                      placeholder="Để trống = 12 tháng gần nhất"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="endDate" className="text-base">Đến ngày</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={dateRange.endDate}
                      onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                      className="h-10 text-base"
                      placeholder="Để trống = hôm nay"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleApplyFilter} disabled={loading} className="h-10 text-base px-6">
                      Áp dụng
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setDateRange({ startDate: '', endDate: '' });
                        setTimeout(() => fetchStatistics(), 100);
                      }}
                      disabled={loading}
                      className="h-10 text-base px-6"
                    >
                      Đặt lại
                    </Button>
                  </div>
                </div>

                {/* Overall Statistics Cards */}
                {overall && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="border-border">
                      <CardContent className="p-4">
                        <div className="flex flex-col gap-2">
                          <p className="text-sm text-muted-foreground font-medium">Tổng hóa đơn</p>
                          <p className="text-2xl font-bold text-blue-600">{overall.totalBills}</p>
                          <p className="text-xs text-muted-foreground">
                            Đã thanh toán: {overall.paidBills} | Chưa thanh toán: {overall.unpaidBills}
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-border">
                      <CardContent className="p-4">
                        <div className="flex flex-col gap-2">
                          <p className="text-sm text-muted-foreground font-medium">Tổng doanh thu</p>
                          <p className="text-2xl font-bold text-purple-600">{formatCurrency(overall.totalRevenue)}</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-border">
                      <CardContent className="p-4">
                        <div className="flex flex-col gap-2">
                          <p className="text-sm text-muted-foreground font-medium">Đã thu</p>
                          <p className="text-2xl font-bold text-green-600">{formatCurrency(overall.totalPaid)}</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-border">
                      <CardContent className="p-4">
                        <div className="flex flex-col gap-2">
                          <p className="text-sm text-muted-foreground font-medium">Chưa thu</p>
                          <p className="text-2xl font-bold text-orange-600">{formatCurrency(overall.unpaidAmount)}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Fee Type Statistics */}
                  <Card className="border-border">
                    <CardContent className="p-6">
                      <div className="flex flex-col gap-4">
                        <div>
                          <h3 className="text-lg font-semibold">Thống kê theo loại phí</h3>
                          <p className="text-sm text-muted-foreground">Doanh thu từ các loại phí khác nhau</p>
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={byFeeType}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="feeTypeName" angle={-45} textAnchor="end" height={100} style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '12px' }} />
                            <YAxis style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '12px' }} />
                            <Tooltip formatter={(value: number | undefined) => value ? formatCurrency(Number(value)) : '0'} contentStyle={{ fontFamily: 'Inter, system-ui, sans-serif' }} />
                            <Legend wrapperStyle={{ fontFamily: 'Inter, system-ui, sans-serif' }} />
                            <Bar dataKey="totalPaid" fill="#82ca9d" name="Đã thu" />
                            <Bar dataKey="unpaidAmount" fill="#ff8042" name="Chưa thu" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Payment Status Statistics */}
                  <Card className="border-border">
                    <CardContent className="p-6">
                      <div className="flex flex-col gap-4">
                        <div>
                          <h3 className="text-lg font-semibold">Thống kê trạng thái thanh toán</h3>
                          <p className="text-sm text-muted-foreground">Số tiền đã thu và chưa thu theo trạng thái</p>
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={byPaymentStatus}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="paymentStatus" style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '12px' }} />
                            <YAxis style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '12px' }} />
                            <Tooltip formatter={(value: number | undefined) => value ? formatCurrency(Number(value)) : '0'} contentStyle={{ fontFamily: 'Inter, system-ui, sans-serif' }} />
                            <Legend wrapperStyle={{ fontFamily: 'Inter, system-ui, sans-serif' }} />
                            <Bar dataKey="totalPaid" fill="#82ca9d" name="Đã thu" />
                            <Bar dataKey="unpaidAmount" fill="#ff8042" name="Chưa thu" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Household Statistics */}
                  <Card className="border-border">
                    <CardContent className="p-6">
                      <div className="flex flex-col gap-4">
                        <div>
                          <h3 className="text-lg font-semibold">Top 10 hộ gia đình</h3>
                          <p className="text-sm text-muted-foreground">Các hộ gia đình có doanh thu cao nhất</p>
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={byHousehold} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '12px' }} />
                            <YAxis dataKey="householdName" type="category" width={100} style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '12px' }} />
                            <Tooltip formatter={(value: number | undefined) => value ? formatCurrency(Number(value)) : '0'} contentStyle={{ fontFamily: 'Inter, system-ui, sans-serif' }} />
                            <Legend wrapperStyle={{ fontFamily: 'Inter, system-ui, sans-serif' }} />
                            <Bar dataKey="totalPaid" fill="#82ca9d" name="Đã thu" />
                            <Bar dataKey="unpaidAmount" fill="#ff8042" name="Chưa thu" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Collector Statistics */}
                  <Card className="border-border">
                    <CardContent className="p-6">
                      <div className="flex flex-col gap-4">
                        <div>
                          <h3 className="text-lg font-semibold">Thống kê theo người thu</h3>
                          <p className="text-sm text-muted-foreground">Doanh thu theo từng người thu</p>
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={byCollector}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="collectorName" style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '12px' }} />
                            <YAxis style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '12px' }} />
                            <Tooltip formatter={(value: number | undefined) => value ? formatCurrency(Number(value)) : '0'} contentStyle={{ fontFamily: 'Inter, system-ui, sans-serif' }} />
                            <Legend wrapperStyle={{ fontFamily: 'Inter, system-ui, sans-serif' }} />
                            <Bar dataKey="totalPaid" fill="#82ca9d" name="Đã thu" />
                            <Bar dataKey="unpaidAmount" fill="#ff8042" name="Chưa thu" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Period Statistics */}
                  <Card className="lg:col-span-2 border-border">
                    <CardContent className="p-6">
                      <div className="flex flex-col gap-4">
                        <div>
                          <h3 className="text-lg font-semibold">Xu hướng doanh thu theo tháng (12 tháng gần nhất)</h3>
                          <p className="text-sm text-muted-foreground">Xu hướng doanh thu theo thời gian</p>
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart data={byPeriod}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="period" style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '12px' }} />
                            <YAxis style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '12px' }} />
                            <Tooltip formatter={(value: number | undefined) => value ? formatCurrency(Number(value)) : '0'} contentStyle={{ fontFamily: 'Inter, system-ui, sans-serif' }} />
                            <Legend wrapperStyle={{ fontFamily: 'Inter, system-ui, sans-serif' }} />
                            <Line type="monotone" dataKey="totalRevenue" stroke="#8884d8" name="Tổng doanh thu" />
                            <Line type="monotone" dataKey="totalPaid" stroke="#82ca9d" name="Đã thu" />
                            <Line type="monotone" dataKey="unpaidAmount" stroke="#ff8042" name="Chưa thu" />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StatisticsPage;
