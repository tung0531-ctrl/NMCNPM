import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/useAuthStore';
import { getMyBills, type Bill } from '@/services/billService';
import { toast } from 'sonner';

const MyBillsPage = () => {
    const navigate = useNavigate();
    const user = useAuthStore((s) => s.user);
    const [bills, setBills] = useState<Bill[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Admins should continue to the admin bill page
        if (user?.role === 'ADMIN') {
            navigate('/bills', { replace: true });
            return;
        }

        const fetchBills = async () => {
            try {
                setLoading(true);
                const data = await getMyBills();
                setBills(data);
            } catch (error: any) {
                console.error('Error fetching bills:', error);
                const message = error.response?.data?.message || 'Không thể tải danh sách khoản thu.';
                toast.error(message);
            } finally {
                setLoading(false);
            }
        };

        fetchBills();
    }, [navigate, user?.role]);

    if (!user) return null;

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
                                        <h1 className="text-3xl font-bold">Khoản thu của hộ</h1>
                                        <p className="text-base text-muted-foreground">
                                            Danh sách hóa đơn gắn với mã hộ của bạn
                                        </p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        onClick={() => navigate('/')}
                                        className="h-10 text-base px-4"
                                    >
                                        ← Về trang chủ
                                    </Button>
                                </div>

                                {/* Content */}
                                {loading ? (
                                    <div className="text-center py-16 text-base text-muted-foreground">Đang tải...</div>
                                ) : bills.length === 0 ? (
                                    <div className="text-center py-16 text-base text-muted-foreground">Chưa có hóa đơn nào.</div>
                                ) : (
                                    <div className="rounded-lg border border-border overflow-hidden">
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead className="bg-muted">
                                                    <tr>
                                                        <th className="px-4 py-3 text-left text-base font-semibold">Mã HĐ</th>
                                                        <th className="px-4 py-3 text-left text-base font-semibold">Tiêu đề</th>
                                                        <th className="px-4 py-3 text-left text-base font-semibold">Kỳ thu</th>
                                                        <th className="px-4 py-3 text-left text-base font-semibold">Tổng tiền</th>
                                                        <th className="px-4 py-3 text-left text-base font-semibold">Đã thanh toán</th>
                                                        <th className="px-4 py-3 text-left text-base font-semibold">Người thu</th>
                                                        <th className="px-4 py-3 text-left text-base font-semibold">Trạng thái</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-border">
                                                    {bills.map((bill) => (
                                                        <tr key={bill.billId} className="hover:bg-muted/50 transition-colors">
                                                            <td className="px-4 py-4 text-base font-medium">
                                                                #{bill.billId}
                                                            </td>
                                                            <td className="px-4 py-4 text-base">
                                                                {bill.title || 'Khoản thu'}
                                                            </td>
                                                            <td className="px-4 py-4 text-base">
                                                                {bill.paymentPeriod}
                                                            </td>
                                                            <td className="px-4 py-4 text-base">
                                                                {Number(bill.totalAmount).toLocaleString('vi-VN')} đ
                                                            </td>
                                                            <td className="px-4 py-4 text-base">
                                                                {Number(bill.paidAmount).toLocaleString('vi-VN')} đ
                                                            </td>
                                                            <td className="px-4 py-4 text-base">
                                                                {bill.collectorName || 'N/A'}
                                                            </td>
                                                            <td className="px-4 py-4 text-base">
                                                                <span className={`px-2 py-1 rounded-full text-sm ${
                                                                    bill.status === 'Đã thanh toán' ? 'bg-green-100 text-green-800' :
                                                                    bill.status === 'Thanh toán một phần' ? 'bg-orange-100 text-orange-800' :
                                                                    bill.status === 'Quá hạn' ? 'bg-gray-100 text-gray-800' :
                                                                    'bg-red-100 text-red-800'
                                                                }`}>
                                                                    {bill.status}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default MyBillsPage;
