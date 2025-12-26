import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/useAuthStore';
import { getMyHousehold, type Household } from '@/services/householdService';
import { toast } from 'sonner';

const MyHouseholdPage = () => {
    const navigate = useNavigate();
    const user = useAuthStore((s) => s.user);
    const [household, setHousehold] = useState<Household | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user?.role === 'ADMIN') {
            navigate('/households', { replace: true });
            return;
        }

        const fetchHousehold = async () => {
            try {
                setLoading(true);
                const data = await getMyHousehold();
                setHousehold(data);
            } catch (error: any) {
                console.error('Error fetching household:', error);
                const message = error.response?.data?.message || 'Không thể tải thông tin hộ gia đình.';
                toast.error(message);
            } finally {
                setLoading(false);
            }
        };

        fetchHousehold();
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
                                        <h1 className="text-3xl font-bold">Hộ gia đình của tôi</h1>
                                        <p className="text-base text-muted-foreground">
                                            Thông tin hộ gia đình được gán cho tài khoản
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
                                ) : !household ? (
                                    <div className="text-center py-16 text-base text-muted-foreground">Chưa có thông tin hộ gia đình.</div>
                                ) : (
                                    <div className="rounded-lg border border-border overflow-hidden">
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead className="bg-muted">
                                                    <tr>
                                                        <th className="px-4 py-3 text-left text-base font-semibold">Mã hộ</th>
                                                        <th className="px-4 py-3 text-left text-base font-semibold">Tên chủ hộ</th>
                                                        <th className="px-4 py-3 text-left text-base font-semibold">Địa chỉ</th>
                                                        <th className="px-4 py-3 text-left text-base font-semibold">Diện tích (m²)</th>
                                                        <th className="px-4 py-3 text-left text-base font-semibold">Ngày tạo</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-border">
                                                    <tr className="hover:bg-muted/50 transition-colors">
                                                        <td className="px-4 py-4 text-base font-medium">
                                                            {household.householdCode}
                                                        </td>
                                                        <td className="px-4 py-4 text-base">
                                                            {household.ownerName}
                                                        </td>
                                                        <td className="px-4 py-4 text-base">
                                                            {household.address}
                                                        </td>
                                                        <td className="px-4 py-4 text-base">
                                                            {household.areaSqm || 'N/A'}
                                                        </td>
                                                        <td className="px-4 py-4 text-base">
                                                            {household.createdAt ? new Date(household.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                                                        </td>
                                                    </tr>
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

export default MyHouseholdPage;
