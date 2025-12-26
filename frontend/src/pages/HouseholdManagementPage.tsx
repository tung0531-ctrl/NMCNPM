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
import { MoreVertical, Pencil, Plus, Trash2, Users } from 'lucide-react';

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
                                        <h1 className="text-3xl font-bold">Quản lý hộ gia đình</h1>
                                        <p className="text-base text-muted-foreground">
                                            Quản lý thông tin các hộ gia đình trong hệ thống
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button style={{color: 'red' }} variant="outline" onClick={() => navigate('/residents')} className="h-10 text-base px-4">
                                            Danh sách cư dân
                                        </Button>
                                        <Button onClick={handleCreate} className="h-10 text-base px-4">
                                            <Plus className="mr-2 h-4 w-4" />
                                            Thêm hộ gia đình
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => navigate('/')}
                                            className="h-10 text-base px-4"
                                        >
                                            ← Về trang chủ
                                        </Button>
                                    </div>
                                </div>

                                {/* Filters */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor="ownerName" className="text-base">Tên chủ hộ</Label>
                                        <Input
                                            id="ownerName"
                                            placeholder="Tìm theo tên chủ hộ..."
                                            value={filters.ownerName}
                                            onChange={(e) => handleFilterChange('ownerName', e.target.value)}
                                            className="h-10 text-base"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor="householdCode" className="text-base">Mã hộ</Label>
                                        <Input
                                            id="householdCode"
                                            placeholder="Tìm theo mã hộ..."
                                            value={filters.householdCode}
                                            onChange={(e) => handleFilterChange('householdCode', e.target.value)}
                                            className="h-10 text-base"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor="address" className="text-base">Địa chỉ</Label>
                                        <Input
                                            id="address"
                                            placeholder="Tìm theo địa chỉ..."
                                            value={filters.address}
                                            onChange={(e) => handleFilterChange('address', e.target.value)}
                                            className="h-10 text-base"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <Button onClick={() => fetchHouseholds()} disabled={loading} className="h-10 text-base px-4">
                                        {loading ? 'Đang tải...' : 'Tìm kiếm'}
                                    </Button>
                                    <Button onClick={clearFilters} variant="outline" disabled={loading} className="h-10 text-base px-4">
                                        Xóa bộ lọc
                                    </Button>
                                </div>

                                {/* Households Table */}
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
                                                    <th className="px-4 py-3 text-right text-base font-semibold">Thao tác</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border">
                                                {loading ? (
                                                    <tr>
                                                        <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                                                            Đang tải...
                                                        </td>
                                                    </tr>
                                                ) : households.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                                                            Không tìm thấy hộ gia đình nào
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    households.map((household) => (
                                                        <tr key={household.householdId} className="hover:bg-muted/50 transition-colors">
                                                            <td className="px-4 py-4 text-base font-medium">
                                                                {household.householdCode}
                                                            </td>
                                                            <td className="px-4 py-4 text-base">
                                                                {household.ownerName}
                                                            </td>
                                                            <td className="px-4 py-4 text-base max-w-xs truncate">
                                                                {household.address}
                                                            </td>
                                                            <td className="px-4 py-4 text-base">
                                                                {household.areaSqm || 'N/A'}
                                                            </td>
                                                            <td className="px-4 py-4 text-base">
                                                                {household.createdAt ? new Date(household.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                                                            </td>
                                                            <td className="px-4 py-4 text-right">
                                                                <DropdownMenu>
                                                                    <DropdownMenuTrigger asChild>
                                                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                                            <MoreVertical className="h-4 w-4" />
                                                                        </Button>
                                                                    </DropdownMenuTrigger>
                                                                    <DropdownMenuContent align="end">
                                                                        <DropdownMenuItem 
                                                                            onClick={() => navigate(`/residents?householdId=${household.householdId}`)}
                                                                            className="cursor-pointer"
                                                                        >
                                                                            <Users className="mr-2 h-4 w-4" />
                                                                            Xem cư dân
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem 
                                                                            onClick={() => handleEdit(household)}
                                                                            className="cursor-pointer"
                                                                        >
                                                                            <Pencil className="mr-2 h-4 w-4" />
                                                                            Chỉnh sửa
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem 
                                                                            onClick={() => handleDelete(household)}
                                                                            className="cursor-pointer text-red-600 focus:text-red-600"
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
                                </div>

                                {/* Pagination */}
                                {pagination.totalPages > 1 && (
                                    <div className="flex justify-between items-center flex-wrap gap-4">
                                        <div className="text-base text-muted-foreground">
                                            Hiển thị {households.length} trong tổng số {pagination.totalItems} hộ gia đình
                                        </div>
                                        <div className="flex gap-2 items-center flex-wrap">
                                            {/* First Page */}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handlePageChange(1)}
                                                disabled={pagination.currentPage === 1 || loading}
                                                title="Trang đầu"
                                            >
                                                ««
                                            </Button>
                                            
                                            {/* Previous Page */}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handlePageChange(pagination.currentPage - 1)}
                                                disabled={pagination.currentPage === 1 || loading}
                                            >
                                                ‹ Trước
                                            </Button>
                                            
                                            {/* Page Numbers with Ellipsis */}
                                            <div className="flex items-center gap-1">
                                                {(() => {
                                                    const current = pagination.currentPage;
                                                    const total = pagination.totalPages;
                                                    const pages = [];
                                                    
                                                    if (total <= 7) {
                                                        for (let i = 1; i <= total; i++) {
                                                            pages.push(i);
                                                        }
                                                    } else {
                                                        pages.push(1);
                                                        
                                                        if (current > 3) {
                                                            pages.push('...');
                                                        }
                                                        
                                                        const start = Math.max(2, current - 1);
                                                        const end = Math.min(total - 1, current + 1);
                                                        
                                                        for (let i = start; i <= end; i++) {
                                                            if (!pages.includes(i)) {
                                                                pages.push(i);
                                                            }
                                                        }
                                                        
                                                        if (current < total - 2) {
                                                            pages.push('...');
                                                        }
                                                        
                                                        if (!pages.includes(total)) {
                                                            pages.push(total);
                                                        }
                                                    }
                                                    
                                                    return pages.map((page, idx) => 
                                                        typeof page === 'number' ? (
                                                            <Button
                                                                key={page}
                                                                variant={page === current ? 'default' : 'outline'}
                                                                size="sm"
                                                                onClick={() => handlePageChange(page)}
                                                                disabled={loading}
                                                                className="min-w-[40px]"
                                                            >
                                                                {page}
                                                            </Button>
                                                        ) : (
                                                            <span key={`ellipsis-${idx}`} className="px-2 text-muted-foreground">
                                                                {page}
                                                            </span>
                                                        )
                                                    );
                                                })()}
                                            </div>
                                            
                                            {/* Next Page */}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handlePageChange(pagination.currentPage + 1)}
                                                disabled={pagination.currentPage === pagination.totalPages || loading}
                                            >
                                                Sau ›
                                            </Button>
                                            
                                            {/* Last Page */}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handlePageChange(pagination.totalPages)}
                                                disabled={pagination.currentPage === pagination.totalPages || loading}
                                                title="Trang cuối"
                                            >
                                                »»
                                            </Button>
                                            
                                            {/* Go to Page Input */}
                                            <div className="flex items-center gap-2 ml-2">
                                                <span className="text-base text-muted-foreground">Đến trang:</span>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max={pagination.totalPages}
                                                    placeholder={pagination.currentPage.toString()}
                                                    className="w-20 px-3 py-2 text-base border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                                                    onKeyPress={(e) => {
                                                        if (e.key === 'Enter') {
                                                            const value = parseInt((e.target as HTMLInputElement).value);
                                                            if (value >= 1 && value <= pagination.totalPages) {
                                                                handlePageChange(value);
                                                                (e.target as HTMLInputElement).value = '';
                                                            }
                                                        }
                                                    }}
                                                    disabled={loading}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Summary */}
                                <div className="grid grid-cols-1 gap-4">
                                    <Card className="border-border">
                                        <CardContent className="p-4">
                                            <p className="text-base text-muted-foreground">Tổng số hộ gia đình</p>
                                            <p className="text-2xl font-bold">{pagination.totalItems}</p>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Edit Dialog */}
                    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                        <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
                            <DialogHeader>
                                <DialogTitle>Chỉnh sửa hộ gia đình</DialogTitle>
                                <DialogDescription>
                                    Cập nhật thông tin hộ gia đình
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSubmit(onSubmitEdit)} className="flex flex-col flex-1 overflow-hidden">
                                <div className="grid gap-4 py-4 px-1 overflow-y-auto max-h-[60vh]">
                                    <div className="grid gap-2">
                                        <Label htmlFor="edit-householdCode">Mã hộ</Label>
                                        <Input
                                            id="edit-householdCode"
                                            {...register('householdCode', { required: 'Mã hộ là bắt buộc' })}
                                            placeholder="Nhập mã hộ"
                                        />
                                        {errors.householdCode && (
                                            <p className="text-sm text-red-600">{errors.householdCode.message}</p>
                                        )}
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="edit-ownerName">Tên chủ hộ</Label>
                                        <Input
                                            id="edit-ownerName"
                                            {...register('ownerName', { required: 'Tên chủ hộ là bắt buộc' })}
                                            placeholder="Nhập tên chủ hộ"
                                        />
                                        {errors.ownerName && (
                                            <p className="text-sm text-red-600">{errors.ownerName.message}</p>
                                        )}
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="edit-address">Địa chỉ</Label>
                                        <Input
                                            id="edit-address"
                                            {...register('address', { required: 'Địa chỉ là bắt buộc' })}
                                            placeholder="Nhập địa chỉ"
                                        />
                                        {errors.address && (
                                            <p className="text-sm text-red-600">{errors.address.message}</p>
                                        )}
                                    </div>

                                    <div className="grid gap-2">
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
                                            <p className="text-sm text-red-600">{errors.areaSqm.message}</p>
                                        )}
                                    </div>
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
                        <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
                            <DialogHeader>
                                <DialogTitle>Thêm hộ gia đình mới</DialogTitle>
                                <DialogDescription>
                                    Nhập thông tin hộ gia đình mới
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSubmit(onSubmitCreate)} className="flex flex-col flex-1 overflow-hidden">
                                <div className="grid gap-4 py-4 px-1 overflow-y-auto max-h-[60vh]">
                                    <div className="grid gap-2">
                                        <Label htmlFor="create-householdCode">Mã hộ</Label>
                                        <Input
                                            id="create-householdCode"
                                            {...register('householdCode', { required: 'Mã hộ là bắt buộc' })}
                                            placeholder="Nhập mã hộ..."
                                        />
                                        {errors.householdCode && (
                                            <p className="text-sm text-red-600">{errors.householdCode.message}</p>
                                        )}
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="create-ownerName">Tên chủ hộ</Label>
                                        <Input
                                            id="create-ownerName"
                                            {...register('ownerName', { required: 'Tên chủ hộ là bắt buộc' })}
                                            placeholder="Nhập tên chủ hộ..."
                                        />
                                        {errors.ownerName && (
                                            <p className="text-sm text-red-600">{errors.ownerName.message}</p>
                                        )}
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="create-address">Địa chỉ</Label>
                                        <Input
                                            id="create-address"
                                            {...register('address', { required: 'Địa chỉ là bắt buộc' })}
                                            placeholder="Nhập địa chỉ..."
                                        />
                                        {errors.address && (
                                            <p className="text-sm text-red-600">{errors.address.message}</p>
                                        )}
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="create-areaSqm">Diện tích (m²)</Label>
                                        <Input
                                            id="create-areaSqm"
                                            type="number"
                                            {...register('areaSqm', { 
                                                valueAsNumber: true,
                                                min: { value: 0, message: 'Diện tích phải lớn hơn 0' }
                                            })}
                                            placeholder="Nhập diện tích..."
                                        />
                                        {errors.areaSqm && (
                                            <p className="text-sm text-red-600">{errors.areaSqm.message}</p>
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
                                        {isSubmitting ? 'Đang tạo...' : 'Tạo mới'}
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
        </div>
    );
};

export default HouseholdManagementPage;