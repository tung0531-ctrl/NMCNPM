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
    DialogTitle
} from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    getAllHouseholdsForAdmin,
    createHousehold,
    updateHousehold,
    deleteHousehold,
    type Household,
    type HouseholdFilters,
    type HouseholdResponse,
    type UpdateHouseholdData
} from '@/services/householdService';
import { useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { MoreVertical, Pencil, Plus, Trash2 } from 'lucide-react';

const HouseholdManagementPage = () => {
    const navigate = useNavigate();
    const [households, setHouseholds] = useState<Household[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedHousehold, setSelectedHousehold] = useState<Household | null>(null);
    
    // Dialog states
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Form for editing
    const { register, handleSubmit, reset, formState: { errors } } = useForm<UpdateHouseholdData>();

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

    const fetchHouseholds = useCallback(async () => {
        try {
            setLoading(true);
            const response: HouseholdResponse = await getAllHouseholdsForAdmin(filters);
            setHouseholds(response.households);
            setPagination(response.pagination);
        } catch (err) {
            const error = err as { message: string };
            console.error('Error fetching households:', error);
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
    reset({
        householdCode: '',
        ownerName: '',
        address: '',
        areaSqm: 0,
        userId: undefined
    });
    setIsCreateDialogOpen(true);
    };

    const onSubmitCreate = async (data: UpdateHouseholdData) => {
        try {
            setIsSubmitting(true);
            await createHousehold(data);
            setIsCreateDialogOpen(false);
            fetchHouseholds(); // reload list
        } catch (err) {
            console.error('Error creating household:', err);
        } finally {
            setIsSubmitting(false);
        }
    };


    const handleEdit = (household: Household) => {
        setSelectedHousehold(household);
        reset({
            householdCode: household.householdCode,
            ownerName: household.ownerName,
            address: household.address,
            areaSqm: household.areaSqm || 0,
            userId: household.userId,
        });
        setIsEditDialogOpen(true);
    };

    const handleDelete = (household: Household) => {
        setSelectedHousehold(household);
        setIsDeleteDialogOpen(true);
    };

    const onSubmitEdit = async (data: UpdateHouseholdData) => {
        if (!selectedHousehold) return;
        
        try {
            setIsSubmitting(true);
            const updatedHousehold = await updateHousehold(selectedHousehold.householdId, data);
            setIsEditDialogOpen(false);
            
            // Update the household in local state
            setHouseholds(prevHouseholds => 
                prevHouseholds.map(h => 
                    h.householdId === selectedHousehold.householdId ? updatedHousehold : h
                )
            );
        } catch (err) {
            console.error('Error updating household:', err);
            // TODO: Add error handling, maybe show a toast
        } finally {
            setIsSubmitting(false);
        }
    };

    const confirmDelete = async () => {
        if (!selectedHousehold) return;
        
        try {
            setIsSubmitting(true);
            await deleteHousehold(selectedHousehold.householdId);
            setIsDeleteDialogOpen(false);
            fetchHouseholds();
        } catch (err) {
            console.error('Error deleting household:', err);
            // TODO: Add error handling
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-muted min-h-screen p-6 md:p-10 fixed inset-0 z-0 bg-gradient-purple">
            <div className="max-w-7xl mx-auto">
                <Card className="border-border">
                    <CardContent className="p-6 md:p-8">
                        <div className="flex flex-col gap-6">
                            {/* Header */}
                            <div className="flex justify-between items-start">
                                <div className="flex flex-col gap-2">
                                    <h1 className="text-3xl font-bold">Quản lý hộ gia đình</h1>
                                    <p className="text-muted-foreground">
                                        Quản lý thông tin các hộ gia đình trong hệ thống
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <Button style={{color: 'red' }} variant="outline" onClick={() => navigate('/residents')}>Danh sách cư dân</Button>
                                    <Button onClick={handleCreate}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Thêm hộ gia đình
                                    </Button>
                                    <Button onClick={() => navigate('/')} variant="outline">
                                        ← Về trang chủ
                                    </Button>
                                </div>
                            </div>

                            {/* Filters */}
                            <Card className="border-border">
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
                            <div className="text-sm text-muted-foreground">
                                Tổng số hộ gia đình: {pagination.totalItems}
                            </div>

                            {/* Households Table */}
                            <div className="rounded-lg border border-border overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-muted">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-sm font-semibold">Mã hộ</th>
                                                <th className="px-6 py-3 text-left text-sm font-semibold">Tên chủ hộ</th>
                                                <th className="px-6 py-3 text-left text-sm font-semibold">Địa chỉ</th>
                                                <th className="px-6 py-3 text-left text-sm font-semibold">Diện tích (m²)</th>
                                                <th className="px-6 py-3 text-left text-sm font-semibold">Ngày tạo</th>
                                                <th className="px-6 py-3 text-right text-sm font-semibold">Thao tác</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {loading ? (
                                                <tr>
                                                    <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                                                        Đang tải...
                                                    </td>
                                                </tr>
                                            ) : households.length === 0 ? (
                                                <tr>
                                                    <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                                                        Không tìm thấy hộ gia đình nào
                                                    </td>
                                                </tr>
                                            ) : (
                                                households.map((household) => (
                                                    <tr key={household.householdId} className="hover:bg-muted/50">
                                                        <td className="px-6 py-4 text-sm font-medium">
                                                            {household.householdCode}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm">
                                                            {household.ownerName}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm max-w-xs truncate">
                                                            {household.address}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm">
                                                            {household.areaSqm || 'N/A'}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm">
                                                            {household.createdAt ? new Date(household.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                                        <span className="sr-only">Mở menu</span>
                                                                        <MoreVertical className="h-4 w-4" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuItem onClick={() => handleEdit(household)}>
                                                                        <Pencil className="mr-2 h-4 w-4" />
                                                                        Chỉnh sửa
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem 
                                                                        onClick={() => handleDelete(household)}
                                                                        className="text-red-600 focus:text-red-600"
                                                                    >
                                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                                        Xóa
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                {pagination.totalPages > 1 && (
                                    <div className="px-6 py-4 bg-gray-50 border-t">
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
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Edit Dialog */}
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogContent className="sm:max-w-[425px] border-border">
                        <DialogHeader>
                            <DialogTitle>Chỉnh sửa hộ gia đình</DialogTitle>
                            <DialogDescription>
                                Cập nhật thông tin của hộ gia đình.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit(onSubmitEdit)} className="space-y-4">
                            <div>
                                <Label htmlFor="edit-householdCode">Mã hộ</Label>
                                <Input
                                    id="edit-householdCode"
                                    {...register('householdCode', { required: 'Mã hộ là bắt buộc' })}
                                    placeholder="Nhập mã hộ"
                                />
                                {errors.householdCode && (
                                    <p className="text-sm text-red-600 mt-1">{errors.householdCode.message}</p>
                                )}
                            </div>
                            <div>
                                <Label htmlFor="edit-ownerName">Tên chủ hộ</Label>
                                <Input
                                    id="edit-ownerName"
                                    {...register('ownerName', { required: 'Tên chủ hộ là bắt buộc' })}
                                    placeholder="Nhập tên chủ hộ"
                                />
                                {errors.ownerName && (
                                    <p className="text-sm text-red-600 mt-1">{errors.ownerName.message}</p>
                                )}
                            </div>
                            <div>
                                <Label htmlFor="edit-address">Địa chỉ</Label>
                                <Input
                                    id="edit-address"
                                    {...register('address', { required: 'Địa chỉ là bắt buộc' })}
                                    placeholder="Nhập địa chỉ"
                                />
                                {errors.address && (
                                    <p className="text-sm text-red-600 mt-1">{errors.address.message}</p>
                                )}
                            </div>
                            <div>
                                <Label htmlFor="edit-areaSqm">Diện tích (m²)</Label>
                                <Input
                                    id="edit-areaSqm"
                                    type="number"
                                    {...register('areaSqm', { 
                                        valueAsNumber: true,
                                        min: { value: 0, message: 'Diện tích phải lớn hơn 0' }
                                    })}
                                    placeholder="Nhập diện tích"
                                />
                                {errors.areaSqm && (
                                    <p className="text-sm text-red-600 mt-1">{errors.areaSqm.message}</p>
                                )}
                            </div>
                            <DialogFooter>
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    onClick={() => setIsEditDialogOpen(false)}
                                    disabled={isSubmitting}
                                >
                                    Hủy
                                </Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogContent className="sm:max-w-[525px] border-border">
                        <DialogHeader>
                            <DialogTitle>Thêm hộ gia đình</DialogTitle>
                            <DialogDescription>
                                Nhập thông tin hộ gia đình mới.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleSubmit(onSubmitCreate)} className="space-y-4">
                            <div className='grid gap-2'>
                                <Label>Mã hộ</Label>
                                <Input {...register('householdCode', { required: true })} />
                            </div>

                            <div className='grid gap-2'>
                                <Label>Tên chủ hộ</Label>
                                <Input {...register('ownerName', { required: true })} />
                            </div>

                            <div>
                                <Label>Địa chỉ</Label>
                                <Input {...register('address', { required: true })} />
                            </div>

                            <div className='grid gap-2'>
                                <Label>Diện tích (m²)</Label>
                                <Input type="number" {...register('areaSqm', { valueAsNumber: true })} />
                            </div>

                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                                    Hủy
                                </Button>
                                <Button type="submit">
                                    Thêm mới
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>


                {/* Delete Confirmation Dialog */}
                <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <AlertDialogContent className="border-border">
                        <AlertDialogHeader>
                            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                            <AlertDialogDescription>
                                Bạn có chắc chắn muốn xóa hộ gia đình "{selectedHousehold?.ownerName}"? 
                                Hành động này không thể hoàn tác.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel disabled={isSubmitting}>Hủy</AlertDialogCancel>
                            <AlertDialogAction 
                                onClick={confirmDelete}
                                disabled={isSubmitting}
                                className="bg-red-600 hover:bg-red-700"
                            >
                                {isSubmitting ? 'Đang xóa...' : 'Xóa'}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
    );
};

export default HouseholdManagementPage;