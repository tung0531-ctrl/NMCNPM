import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    getAllHouseholdsForAdmin,
    type Household,
    type HouseholdFilters,
    type HouseholdResponse,
    type CreateHouseholdData,
    createHousehold
} from '@/services/householdService';
import { useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { Plus } from 'lucide-react';

const HouseholdManagementPage = () => {
    const navigate = useNavigate();
    const [households, setHouseholds] = useState<Household[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // Dialog states
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Filters state
    const [filters, setFilters] = useState<HouseholdFilters>({
        ownerName: '',
        householdCode: '',
        address: '',
        page: 1,
        limit: 10
    });

    // Pagination state
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 10
    });

    // Form for creating
    const { register: registerCreate, handleSubmit: handleSubmitCreate, reset: resetCreate, formState: { errors: errorsCreate } } = useForm<CreateHouseholdData>();

    const fetchHouseholds = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response: HouseholdResponse = await getAllHouseholdsForAdmin(filters);
            setHouseholds(response.households);
            setPagination(response.pagination);
        } catch (err) {
            const error = err as { message: string };
            console.error('Error fetching households:', error);
            setError('Không thể tải danh sách hộ gia đình. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchHouseholds();
    }, [fetchHouseholds]);

    const handleFilterChange = (key: keyof HouseholdFilters, value: string | number) => {
        setFilters(prev => ({
            ...prev,
            [key]: value,
            page: 1 // Reset to first page when filtering
        }));
    };

    const handlePageChange = (newPage: number) => {
        setFilters(prev => ({
            ...prev,
            page: newPage
        }));
    };

    const clearFilters = () => {
        setFilters({
            ownerName: '',
            householdCode: '',
            address: '',
            page: 1,
            limit: 10
        });
    };

    const handleCreate = () => {
        resetCreate({
            householdCode: '',
            ownerName: '',
            address: '',
            areaSqm: undefined,
            userId: undefined
        });
        setIsCreateDialogOpen(true);
    };

    const onSubmitCreate = async (data: CreateHouseholdData) => {
        try {
            setIsSubmitting(true);
            const newHousehold = await createHousehold(data);
            setIsCreateDialogOpen(false);
            
            // Add new household to the list
            setHouseholds(prevHouseholds => [newHousehold, ...prevHouseholds]);
            setPagination(prev => ({
                ...prev,
                totalItems: prev.totalItems + 1
            }));
        } catch (err) {
            const error = err as { message: string; response?: { data?: { message?: string } } };
            console.error('Error creating household:', error);
            setError(error.response?.data?.message || 'Không thể tạo hộ gia đình. Vui lòng thử lại.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Quản lý hộ gia đình</h1>
                <div className="flex gap-2">
                    <Button onClick={handleCreate}>
                        <Plus className="mr-2 h-4 w-4" />
                        Thêm hộ gia đình
                    </Button>
                    <Button onClick={() => navigate('/')} variant="outline">
                        Quay lại trang chủ
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <Card className="mb-6">
                <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <Label htmlFor="ownerName">Tên chủ hộ</Label>
                            <Input
                                id="ownerName"
                                placeholder="Tìm theo tên chủ hộ..."
                                value={filters.ownerName}
                                onChange={(e) => handleFilterChange('ownerName', e.target.value)}
                            />
                        </div>
                        <div>
                            <Label htmlFor="householdCode">Mã hộ</Label>
                            <Input
                                id="householdCode"
                                placeholder="Tìm theo mã hộ..."
                                value={filters.householdCode}
                                onChange={(e) => handleFilterChange('householdCode', e.target.value)}
                            />
                        </div>
                        <div>
                            <Label htmlFor="address">Địa chỉ</Label>
                            <Input
                                id="address"
                                placeholder="Tìm theo địa chỉ..."
                                value={filters.address}
                                onChange={(e) => handleFilterChange('address', e.target.value)}
                            />
                        </div>
                        <div className="flex items-end">
                            <Button onClick={clearFilters} variant="outline" className="w-full">
                                Xóa bộ lọc
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Results Summary */}
            <div className="mb-4 text-sm text-gray-600">
                Tổng số hộ gia đình: {pagination.totalItems}
            </div>

            {/* Households Table */}
            <Card>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="p-6 text-center">Đang tải...</div>
                    ) : error ? (
                        <div className="p-6 text-center text-red-500">{error}</div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Mã hộ
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Tên chủ hộ
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Địa chỉ
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Diện tích (m²)
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Ngày tạo
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {households.map((household) => (
                                            <tr key={household.householdId} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {household.householdCode}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {household.ownerName}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                                                    {household.address}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {household.areaSqm || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {household.createdAt ? new Date(household.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {pagination.totalPages > 1 && (
                                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm text-gray-700">
                                            Hiển thị {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} đến {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} của {pagination.totalItems} kết quả
                                        </div>
                                        <div className="flex space-x-2">
                                            <Button
                                                onClick={() => handlePageChange(pagination.currentPage - 1)}
                                                disabled={pagination.currentPage === 1}
                                                variant="outline"
                                                size="sm"
                                            >
                                                Trước
                                            </Button>
                                            <span className="px-3 py-2 text-sm text-gray-700">
                                                Trang {pagination.currentPage} / {pagination.totalPages}
                                            </span>
                                            <Button
                                                onClick={() => handlePageChange(pagination.currentPage + 1)}
                                                disabled={pagination.currentPage === pagination.totalPages}
                                                variant="outline"
                                                size="sm"
                                            >
                                                Sau
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Create Dialog */}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogContent className="sm:max-w-[525px]">
                    <DialogHeader>
                        <DialogTitle>Thêm hộ gia đình mới</DialogTitle>
                        <DialogDescription>
                            Tạo hộ gia đình mới trong hệ thống
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmitCreate(onSubmitCreate)}>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="create-householdCode">Mã hộ</Label>
                                <Input
                                    id="create-householdCode"
                                    {...registerCreate('householdCode', { required: 'Mã hộ là bắt buộc' })}
                                    placeholder="Nhập mã hộ..."
                                />
                                {errorsCreate.householdCode && (
                                    <p className="text-sm text-red-500">{errorsCreate.householdCode.message}</p>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="create-ownerName">Tên chủ hộ</Label>
                                <Input
                                    id="create-ownerName"
                                    {...registerCreate('ownerName', { required: 'Tên chủ hộ là bắt buộc' })}
                                    placeholder="Nhập tên chủ hộ..."
                                />
                                {errorsCreate.ownerName && (
                                    <p className="text-sm text-red-500">{errorsCreate.ownerName.message}</p>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="create-address">Địa chỉ</Label>
                                <Input
                                    id="create-address"
                                    {...registerCreate('address', { required: 'Địa chỉ là bắt buộc' })}
                                    placeholder="Nhập địa chỉ..."
                                />
                                {errorsCreate.address && (
                                    <p className="text-sm text-red-500">{errorsCreate.address.message}</p>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="create-areaSqm">Diện tích (m²)</Label>
                                <Input
                                    id="create-areaSqm"
                                    type="number"
                                    step="0.01"
                                    {...registerCreate('areaSqm', { 
                                        min: { value: 0, message: 'Diện tích phải lớn hơn hoặc bằng 0' },
                                        valueAsNumber: true
                                    })}
                                    placeholder="Nhập diện tích..."
                                />
                                {errorsCreate.areaSqm && (
                                    <p className="text-sm text-red-500">{errorsCreate.areaSqm.message}</p>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="create-userId">ID người dùng</Label>
                                <Input
                                    id="create-userId"
                                    type="number"
                                    {...registerCreate('userId', { 
                                        min: { value: 1, message: 'ID người dùng phải lớn hơn 0' },
                                        valueAsNumber: true
                                    })}
                                    placeholder="Nhập ID người dùng (tùy chọn)..."
                                />
                                {errorsCreate.userId && (
                                    <p className="text-sm text-red-500">{errorsCreate.userId.message}</p>
                                )}
                            </div>
                        </div>
                        <DialogFooter>
                            <Button 
                                type="button" 
                                variant="outline" 
                                onClick={() => setIsCreateDialogOpen(false)}
                                disabled={isSubmitting}
                            >
                                Hủy
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Đang tạo...' : 'Tạo hộ gia đình'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default HouseholdManagementPage;