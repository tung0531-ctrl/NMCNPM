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
    getAllFeeTypes, 
    createFeeType, 
    updateFeeType, 
    deleteFeeType, 
    type FeeType, 
    type FeeTypeFilters, 
    type UpdateFeeTypeData, 
    type CreateFeeTypeData 
} from '@/services/feeTypeService';
import { useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { MoreVertical, Pencil, Trash2, Plus } from 'lucide-react';

const FeeTypeManagementPage = () => {
    const navigate = useNavigate();
    const [feeTypes, setFeeTypes] = useState<FeeType[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // Dialog states
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedFeeType, setSelectedFeeType] = useState<FeeType | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Filters state
    const [filters, setFilters] = useState<FeeTypeFilters>({
        feeName: '',
        isActive: '',
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

    // Form for editing
    const { register, handleSubmit, reset, formState: { errors } } = useForm<UpdateFeeTypeData>();
    
    // Form for creating
    const { 
        register: registerCreate, 
        handleSubmit: handleSubmitCreate, 
        reset: resetCreate, 
        formState: { errors: errorsCreate } 
    } = useForm<CreateFeeTypeData>();

    const fetchFeeTypes = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await getAllFeeTypes(filters);
            setFeeTypes(response.feeTypes);
            setPagination(response.pagination);
        } catch (err) {
            const error = err as { message: string };
            console.error('Error fetching fee types:', error);
            setError('Không thể tải danh sách loại khoản thu. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchFeeTypes();
    }, [fetchFeeTypes]);

    const handleSearch = () => {
        setFilters(prev => ({ ...prev, page: 1 }));
        fetchFeeTypes();
    };

    const handlePageChange = (newPage: number) => {
        setFilters(prev => ({ ...prev, page: newPage }));
    };

    const handleEdit = (feeType: FeeType) => {
        setSelectedFeeType(feeType);
        reset({
            feeName: feeType.feeName,
            unitPrice: Number(feeType.unitPrice),
            unit: feeType.unit || '',
            description: feeType.description || '',
            isActive: feeType.isActive !== false,
        });
        setIsEditDialogOpen(true);
    };

    const handleCreate = () => {
        resetCreate({
            feeName: '',
            unitPrice: 0,
            unit: '',
            description: '',
            isActive: true,
        });
        setIsCreateDialogOpen(true);
    };

    const onSubmitCreate = async (data: CreateFeeTypeData) => {
        try {
            setIsSubmitting(true);
            const newFeeType = await createFeeType(data);
            setIsCreateDialogOpen(false);
            
            // Add new fee type to the list
            setFeeTypes(prevFeeTypes => [newFeeType, ...prevFeeTypes]);
        } catch (err) {
            console.error('Error creating fee type:', err);
            setError('Không thể tạo loại khoản thu. Vui lòng thử lại.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = (feeType: FeeType) => {
        setSelectedFeeType(feeType);
        setIsDeleteDialogOpen(true);
    };

    const onSubmitEdit = async (data: UpdateFeeTypeData) => {
        if (!selectedFeeType) return;
        
        try {
            setIsSubmitting(true);
            const updatedFeeType = await updateFeeType(selectedFeeType.feeTypeId, data);
            setIsEditDialogOpen(false);
            
            // Update the fee type in local state
            setFeeTypes(prevFeeTypes => 
                prevFeeTypes.map(ft => 
                    ft.feeTypeId === selectedFeeType.feeTypeId ? updatedFeeType : ft
                )
            );
        } catch (err) {
            console.error('Error updating fee type:', err);
            setError('Không thể cập nhật loại khoản thu. Vui lòng thử lại.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const confirmDelete = async () => {
        if (!selectedFeeType) return;
        
        try {
            setIsSubmitting(true);
            await deleteFeeType(selectedFeeType.feeTypeId);
            setIsDeleteDialogOpen(false);
            fetchFeeTypes();
        } catch (err) {
            console.error('Error deleting fee type:', err);
            setError('Không thể xóa loại khoản thu. Vui lòng thử lại.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const renderPagination = () => {
        const { currentPage, totalPages } = pagination;
        const pages: (number | string)[] = [];
        
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 4) {
                for (let i = 1; i <= 5; i++) pages.push(i);
                pages.push('...');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 3) {
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
            } else {
                pages.push(1);
                pages.push('...');
                for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
                pages.push('...');
                pages.push(totalPages);
            }
        }
        
        return pages.map((page, index) => {
            if (page === '...') {
                return (
                    <span key={`ellipsis-${index}`} className="px-3 py-2">
                        ...
                    </span>
                );
            }
            
            return (
                <Button
                    key={page}
                    variant={currentPage === page ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handlePageChange(page as number)}
                    disabled={loading}
                >
                    {page}
                </Button>
            );
        });
    };

    return (
        <div className="bg-muted min-h-screen p-6 md:p-10 absolute inset-0 z-0 bg-gradient-purple">
            <div className="max-w-7xl mx-auto">
                <Card className="border-border">
                    <CardContent className="p-6 md:p-8">
                        <div className="flex flex-col gap-6">
                            {/* Header */}
                            <div className="flex justify-between items-start">
                                <div className="flex flex-col gap-2">
                                    <h1 className="text-3xl font-bold">Quản lý danh mục khoản thu</h1>
                                    <p className="text-muted-foreground">
                                        Quản lý các danh mục khoản thu trong hệ thống
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <Button style={{ color: 'red' }} variant="outline" onClick={() => navigate('/bills')}>
                                        Quản lý khoản thu
                                    </Button>
                                    <Button onClick={handleCreate}>
                                        <Plus className="w-4 h-4 mr-2" />
                                        Thêm loại khoản thu
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => navigate('/')}
                                    >
                                        ← Về trang chủ
                                    </Button>
                                </div>
                            </div>

                            {/* Filters */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="feeName">Tên loại khoản thu</Label>
                                    <Input
                                        id="feeName"
                                        type="text"
                                        placeholder="Nhập tên loại khoản thu..."
                                        value={filters.feeName || ''}
                                        onChange={(e) => setFilters({ ...filters, feeName: e.target.value })}
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="isActive">Trạng thái hoạt động</Label>
                                    <select
                                        id="isActive"
                                        title="Trạng thái hoạt động"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        value={filters.isActive || ''}
                                        onChange={(e) => setFilters({ ...filters, isActive: e.target.value })}
                                    >
                                        <option value="">Tất cả</option>
                                        <option value="true">Đang hoạt động</option>
                                        <option value="false">Ngừng hoạt động</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Button onClick={handleSearch} disabled={loading}>
                                    {loading ? 'Đang tìm...' : 'Tìm kiếm'}
                                </Button>
                                <Button 
                                    variant="outline" 
                                    onClick={() => {
                                        setFilters({ feeName: '', isActive: '', page: 1, limit: 10 });
                                    }}
                                >
                                    Xóa bộ lọc
                                </Button>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                                    {error}
                                </div>
                            )}

                            {/* Table */}
                            <div className="rounded-lg border border-border overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-muted">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-sm font-semibold">ID</th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold">Tên khoản thu</th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold">Đơn giá</th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold">Đơn vị</th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold">Mô tả</th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold">Trạng thái</th>
                                                <th className="px-4 py-3 text-right text-sm font-semibold">Thao tác</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {loading ? (
                                                <tr>
                                                    <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                                                        Đang tải...
                                                    </td>
                                                </tr>
                                            ) : feeTypes.length === 0 ? (
                                                <tr>
                                                    <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                                                        Không tìm thấy loại khoản thu nào
                                                    </td>
                                                </tr>
                                            ) : (
                                                feeTypes.map((feeType) => (
                                                    <tr key={feeType.feeTypeId} className="hover:bg-muted/50">
                                                        <td className="px-4 py-3 text-sm">{feeType.feeTypeId}</td>
                                                        <td className="px-4 py-3 text-sm font-medium">{feeType.feeName}</td>
                                                        <td className="px-4 py-3 text-sm">{formatCurrency(feeType.unitPrice)}</td>
                                                        <td className="px-4 py-3 text-sm">{feeType.unit || '-'}</td>
                                                        <td className="px-4 py-3 text-sm max-w-xs truncate">{feeType.description || '-'}</td>
                                                        <td className="px-4 py-3 text-sm">
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                                feeType.isActive !== false 
                                                                    ? 'bg-green-100 text-green-800' 
                                                                    : 'bg-gray-100 text-gray-800'
                                                            }`}>
                                                                {feeType.isActive !== false ? 'Hoạt động' : 'Ngừng'}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-right">
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button variant="ghost" size="sm">
                                                                        <MoreVertical className="w-4 h-4" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuItem onClick={() => handleEdit(feeType)}>
                                                                        <Pencil className="w-4 h-4 mr-2" />
                                                                        Chỉnh sửa
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem 
                                                                        onClick={() => handleDelete(feeType)}
                                                                        className="text-red-600"
                                                                    >
                                                                        <Trash2 className="w-4 h-4 mr-2" />
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
                                    <div className="text-sm text-muted-foreground">
                                        Hiển thị {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} đến{' '}
                                        {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} của{' '}
                                        {pagination.totalItems} loại khoản thu
                                    </div>
                                    <div className="flex gap-2 flex-wrap">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handlePageChange(pagination.currentPage - 1)}
                                            disabled={pagination.currentPage === 1 || loading}
                                        >
                                            Trước
                                        </Button>
                                        {renderPagination()}
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handlePageChange(pagination.currentPage + 1)}
                                            disabled={pagination.currentPage === pagination.totalPages || loading}
                                        >
                                            Sau
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Summary */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Card className="border-border">
                                    <CardContent className="p-6">
                                        <div className="text-sm text-muted-foreground mb-1">Tổng số loại khoản thu</div>
                                        <div className="text-2xl font-bold">{pagination.totalItems}</div>
                                    </CardContent>
                                </Card>
                                <Card className="border-border">
                                    <CardContent className="p-6">
                                        <div className="text-sm text-muted-foreground mb-1">Đang hoạt động</div>
                                        <div className="text-2xl font-bold text-green-600">
                                            {feeTypes.filter(ft => ft.isActive !== false).length}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-[525px]">
                    <DialogHeader>
                        <DialogTitle>Chỉnh sửa loại khoản thu</DialogTitle>
                        <DialogDescription>
                            Cập nhật thông tin loại khoản thu
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit(onSubmitEdit)}>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-feeName">Tên loại khoản thu</Label>
                                <Input
                                    id="edit-feeName"
                                    {...register('feeName', { required: 'Tên loại khoản thu là bắt buộc' })}
                                    placeholder="Nhập tên loại khoản thu..."
                                />
                                {errors.feeName && (
                                    <p className="text-sm text-red-600">{errors.feeName.message}</p>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="edit-unitPrice">Đơn giá (VNĐ)</Label>
                                <Input
                                    id="edit-unitPrice"
                                    type="number"
                                    {...register('unitPrice', { 
                                        required: 'Đơn giá là bắt buộc',
                                        min: { value: 0, message: 'Đơn giá phải lớn hơn hoặc bằng 0' }
                                    })}
                                    placeholder="Nhập đơn giá..."
                                />
                                {errors.unitPrice && (
                                    <p className="text-sm text-red-600">{errors.unitPrice.message}</p>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="edit-unit">Đơn vị</Label>
                                <Input
                                    id="edit-unit"
                                    {...register('unit')}
                                    placeholder="VD: tháng, người, m²..."
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="edit-description">Mô tả</Label>
                                <textarea
                                    id="edit-description"
                                    {...register('description')}
                                    placeholder="Nhập mô tả..."
                                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="edit-isActive"
                                    {...register('isActive')}
                                    className="w-4 h-4 rounded border-gray-300"
                                />
                                <Label htmlFor="edit-isActive" className="cursor-pointer">
                                    Đang hoạt động
                                </Label>
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

            {/* Create Dialog */}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogContent className="sm:max-w-[525px]">
                    <DialogHeader>
                        <DialogTitle>Thêm loại khoản thu mới</DialogTitle>
                        <DialogDescription>
                            Tạo loại khoản thu mới trong hệ thống
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmitCreate(onSubmitCreate)}>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="create-feeName">Tên loại khoản thu</Label>
                                <Input
                                    id="create-feeName"
                                    {...registerCreate('feeName', { required: 'Tên loại khoản thu là bắt buộc' })}
                                    placeholder="Nhập tên loại khoản thu..."
                                />
                                {errorsCreate.feeName && (
                                    <p className="text-sm text-red-600">{errorsCreate.feeName.message}</p>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="create-unitPrice">Đơn giá (VNĐ)</Label>
                                <Input
                                    id="create-unitPrice"
                                    type="number"
                                    {...registerCreate('unitPrice', { 
                                        required: 'Đơn giá là bắt buộc',
                                        min: { value: 0, message: 'Đơn giá phải lớn hơn hoặc bằng 0' }
                                    })}
                                    placeholder="Nhập đơn giá..."
                                />
                                {errorsCreate.unitPrice && (
                                    <p className="text-sm text-red-600">{errorsCreate.unitPrice.message}</p>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="create-unit">Đơn vị</Label>
                                <Input
                                    id="create-unit"
                                    {...registerCreate('unit')}
                                    placeholder="VD: tháng, người, m²..."
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="create-description">Mô tả</Label>
                                <textarea
                                    id="create-description"
                                    {...registerCreate('description')}
                                    placeholder="Nhập mô tả..."
                                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="create-isActive"
                                    {...registerCreate('isActive')}
                                    defaultChecked
                                    className="w-4 h-4 rounded border-gray-300"
                                />
                                <Label htmlFor="create-isActive" className="cursor-pointer">
                                    Đang hoạt động
                                </Label>
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
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn xóa loại khoản thu <strong>"{selectedFeeType?.feeName}"</strong>? 
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
    );
};

export default FeeTypeManagementPage;
