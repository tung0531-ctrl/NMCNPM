import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/useAuthStore';
import { getResidentsForCurrentUser, type Resident } from '@/services/residentService';
import { toast } from 'sonner';
import { formatUTCToLocal } from '@/lib/formatDate';

const MyResidentsPage = () => {
    const navigate = useNavigate();
    const user = useAuthStore((s) => s.user);
    const [residents, setResidents] = useState<Resident[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user?.role === 'ADMIN') {
            navigate('/residents', { replace: true });
            return;
        }

        const fetchResidents = async () => {
            try {
                setLoading(true);
                const data = await getResidentsForCurrentUser();
                setResidents(data);
            } catch (error: any) {
                console.error('Error fetching residents:', error);
                const message = error.response?.data?.message || 'Không thể tải danh sách cư dân.';
                toast.error(message);
            } finally {
                setLoading(false);
            }
        };

        fetchResidents();
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
                                        <h1 className="text-3xl font-bold">Nhân khẩu trong hộ</h1>
                                        <p className="text-base text-muted-foreground">
                                            Danh sách cư dân thuộc mã hộ của bạn
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
                                ) : residents.length === 0 ? (
                                    <div className="text-center py-16 text-base text-muted-foreground">Chưa có dữ liệu cư dân.</div>
                                ) : (
                                    <div className="rounded-lg border border-border overflow-hidden">
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead className="bg-muted">
                                                    <tr>
                                                        <th className="px-4 py-3 text-left text-base font-semibold">Họ và tên</th>
                                                        <th className="px-4 py-3 text-left text-base font-semibold">Số CCCD</th>
                                                        <th className="px-4 py-3 text-left text-base font-semibold">Ngày sinh</th>
                                                        <th className="px-4 py-3 text-left text-base font-semibold">Quan hệ với chủ hộ</th>
                                                        <th className="px-4 py-3 text-left text-base font-semibold">Nghề nghiệp</th>
                                                        <th className="px-4 py-3 text-left text-base font-semibold">Số điện thoại</th>
                                                        <th className="px-4 py-3 text-left text-base font-semibold">Trạng thái</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-border">
                                                    {residents.map((resident) => (
                                                        <tr key={resident.residentId} className="hover:bg-muted/50 transition-colors">
                                                            <td className="px-4 py-4 text-base font-medium">
                                                                {resident.fullName}
                                                            </td>
                                                            <td className="px-4 py-4 text-base">
                                                                {resident.indentityCardNumber || 'N/A'}
                                                            </td>
                                                            <td className="px-4 py-4 text-base">
                                                                {resident.dateOfBirth ? new Date(resident.dateOfBirth).toLocaleDateString('vi-VN', {
                                                                    day: '2-digit',
                                                                    month: '2-digit',
                                                                    year: 'numeric'
                                                                }) : 'N/A'}
                                                            </td>
                                                            <td className="px-4 py-4 text-base">
                                                                {resident.relationToOwner || 'N/A'}
                                                            </td>
                                                            <td className="px-4 py-4 text-base">
                                                                {resident.job || 'N/A'}
                                                            </td>
                                                            <td className="px-4 py-4 text-base">
                                                                {resident.phone_number || 'N/A'}
                                                            </td>
                                                            <td className="px-4 py-4 text-base">
                                                                <span className={`px-2 py-1 rounded-full text-sm ${resident.isStaying ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-800'}`}>
                                                                    {resident.isStaying ? 'Đang ở' : 'Đã chuyển đi'}
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

export default MyResidentsPage;
