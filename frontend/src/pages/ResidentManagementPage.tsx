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
    getAllResidentsForAdmin,
    createResident,
    updateResident,
    deleteResident,
    type Resident,
    type ResidentFilters,
    type ResidentResponse,
    type CreateResidentData,
    type UpdateResidentData
} from '@/services/residentService';
import { getAllHouseholds, type Household } from '@/services/householdService';
import { useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { MoreVertical, Pencil, Trash2, Plus } from 'lucide-react';
import { useSearchParams } from 'react-router';

const ResidentManagementPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const householdIdFromQuery = searchParams.get('householdId');
    const [residents, setResidents] = useState<Resident[]>([]);
    const [households, setHouseholds] = useState<Household[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedResident, setSelectedResident] = useState<Resident | null>(null);

    // Dialog states
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Forms
    const createForm = useForm<CreateResidentData>();
    const editForm = useForm<UpdateResidentData>();

    // Filters state
    const [filters, setFilters] = useState<ResidentFilters>({
        fullName: '',
        householdId: householdIdFromQuery ? Number(householdIdFromQuery) : undefined,
        isStaying: undefined,
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

    const fetchResidents = useCallback(async () => {
        try {
            setLoading(true);
            const response: ResidentResponse = await getAllResidentsForAdmin(filters);
            setResidents(response.residents);
            setPagination(response.pagination);
        } catch (err) {
            const error = err as { message: string };
            console.error('Error fetching residents:', error);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    const fetchHouseholds = useCallback(async () => {
        try {
            const response = await getAllHouseholds();
            setHouseholds(response);
        } catch (err) {
            console.error('Error fetching households:', err);
        }
    }, []);

    useEffect(() => {
        fetchResidents();
        fetchHouseholds();
    }, [fetchResidents, fetchHouseholds]);

    const handleFilterChange = (key: keyof ResidentFilters, value: string | number | boolean | undefined) => {
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

    const handleCreate = async (data: CreateResidentData) => {
        try {
            setIsSubmitting(true);
            await createResident(data);
            setIsCreateDialogOpen(false);
            createForm.reset();
            fetchResidents();
        } catch (err) {
            console.error('Error creating resident:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = async (data: UpdateResidentData) => {
        if (!selectedResident) return;

        try {
            setIsSubmitting(true);
            await updateResident(selectedResident.residentId, data);
            setIsEditDialogOpen(false);
            editForm.reset();
            setSelectedResident(null);
            fetchResidents();
        } catch (err) {
            console.error('Error updating resident:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedResident) return;

        try {
            setIsSubmitting(true);
            await deleteResident(selectedResident.residentId);
            setIsDeleteDialogOpen(false);
            setSelectedResident(null);
            fetchResidents();
        } catch (err) {
            console.error('Error deleting resident:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const openEditDialog = (resident: Resident) => {
        setSelectedResident(resident);
        editForm.reset({
            householdId: resident.householdId,
            fullName: resident.fullName,
            dateOfBirth: resident.dateOfBirth,
            indentityCardNumber: resident.indentityCardNumber,
            relationToOwner: resident.relationToOwner,
            job: resident.job,
            phone_number: resident.phone_number,
            isStaying: resident.isStaying
        });
        setIsEditDialogOpen(true);
    };

    const openDeleteDialog = (resident: Resident) => {
        setSelectedResident(resident);
        setIsDeleteDialogOpen(true);
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
                                    <h1 className="text-3xl font-bold">Quản lý cư dân</h1>
                                    <p className="text-muted-foreground">
                                        Quản lý thông tin các cư dân trong hệ thống
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <Button style={{color: 'red'}} onClick={() => navigate('/households')} variant="outline">
                                        Quản lý Hộ gia đình
                                    </Button>
                                    <Button onClick={() => setIsCreateDialogOpen(true)}>
                                        <Plus className="w-4 h-4 mr-2" />
                                        Thêm cư dân
                                    </Button>
                                    <Button onClick={() => navigate('/')} variant="outline">
                                        ← Về trang chủ
                                    </Button>
                                </div>
                            </div>

                            {/* Filters */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className='flex flex-col gap-2'>
                                    <Label htmlFor="fullName">Họ tên</Label>
                                    <Input
                                        id="fullName"
                                        placeholder="Tìm theo họ tên..."
                                        value={filters.fullName || ''}
                                        onChange={(e) => handleFilterChange('fullName', e.target.value)}
                                    />
                                </div>
                                <div className='flex flex-col gap-2'>
                                    <Label htmlFor="household">Hộ khẩu</Label>
                                    <select
                                        id="household"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={filters.householdId?.toString() || ''}
                                        onChange={(e) => handleFilterChange('householdId', e.target.value ? parseInt(e.target.value) : undefined)}
                                    >
                                        <option value="">Tất cả</option>
                                        {households.map((household) => (
                                            <option key={household.householdId} value={household.householdId.toString()}>
                                                {household.householdCode} - {household.ownerName}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className='flex flex-col gap-2'>
                                    <Label htmlFor="isStaying">Trạng thái</Label>
                                    <select
                                        id="isStaying"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={filters.isStaying?.toString() || ''}
                                        onChange={(e) => handleFilterChange('isStaying', e.target.value === 'true' ? true : e.target.value === 'false' ? false : undefined)}
                                    >
                                        <option value="">Tất cả</option>
                                        <option value="true">Đang ở</option>
                                        <option value="false">Đã chuyển đi</option>
                                    </select>
                                </div>
                                <div className="flex items-end">
                                    <Button
                                        variant="outline"
                                        onClick={() => setFilters({
                                            fullName: '',
                                            householdId: undefined,
                                            isStaying: undefined,
                                            page: 1,
                                            limit: 10
                                        })}
                                    >
                                        Xóa bộ lọc
                                    </Button>
                                </div>
                            </div>
                                

                            {/* Residents List */}
                            <div className="rounded-lg border border-border overflow-hidden">
                                <table className="w-full">
                                    <thead className="bg-muted">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-sm font-semibold">
                                                Họ tên
                                            </th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold">
                                                Hộ khẩu
                                            </th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold">
                                                Quan hệ
                                            </th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold">
                                                SĐT
                                            </th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold">
                                                Trạng thái
                                            </th>
                                            <th className="px-4 py-3 text-right text-sm font-semibold">
                                                Thao tác
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {loading ? (
                                            <tr>
                                                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                                                    Đang tải...
                                                </td>
                                            </tr>
                                        ) : residents.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                                                    Không tìm thấy cư dân nào
                                                </td>
                                            </tr>
                                        ) : (
                                            residents.map((resident) => (
                                                <tr key={resident.residentId} className="hover:bg-muted/50">
                                                    <td className="px-4 py-3 text-sm font-medium">
                                                        <div>
                                                            {resident.fullName}
                                                        </div>
                                                        {resident.dateOfBirth && (
                                                            <div className="text-muted-foreground text-xs">
                                                                {new Date(resident.dateOfBirth).toLocaleDateString('vi-VN')}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm">
                                                        <div className="font-medium">
                                                            {resident.household_resident?.householdCode}
                                                        </div>
                                                        <div className="text-muted-foreground text-xs">
                                                            {resident.household_resident?.ownerName}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-muted-foreground">
                                                        {resident.relationToOwner}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-muted-foreground">
                                                        {resident.phone_number}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm">
                                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                            resident.isStaying
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-red-100 text-red-800'
                                                        }`}>
                                                            {resident.isStaying ? 'Đang ở' : 'Đã chuyển đi'}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                                    <span className="sr-only">Mở menu</span>
                                                                    <MoreVertical className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem onClick={() => openEditDialog(resident)}>
                                                                    <Pencil className="mr-2 h-4 w-4" />
                                                                    Sửa
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    onClick={() => openDeleteDialog(resident)}
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
                                <div className="px-6 py-4 bg-gray-50 border-t border-border sm:px-6">
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm text-gray-700">
                                            Hiển thị {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} đến {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} của {pagination.totalItems} kết quả
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handlePageChange(pagination.currentPage - 1)}
                                                disabled={pagination.currentPage === 1}
                                            >
                                                Trước
                                            </Button>
                                            <span className="px-3 py-2 text-sm text-gray-700">
                                                Trang {pagination.currentPage} / {pagination.totalPages}
                                            </span>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handlePageChange(pagination.currentPage + 1)}
                                                disabled={pagination.currentPage === pagination.totalPages}
                                            >
                                                Sau
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}

            {/* Create Dialog */}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogContent className="sm:max-w-[425px] border-border">
                    <DialogHeader>
                        <DialogTitle>Thêm cư dân mới</DialogTitle>
                        <DialogDescription>
                            Nhập thông tin cho cư dân mới.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={createForm.handleSubmit(handleCreate)} className="space-y-4">
                        <div>
                            <Label htmlFor="create-householdId">Hộ khẩu</Label>
                            <select
                                id="create-householdId"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                {...createForm.register('householdId', { required: 'Hộ khẩu là bắt buộc', valueAsNumber: true })}
                            >
                                <option value="">Chọn hộ khẩu</option>
                                {households.map((household) => (
                                    <option key={household.householdId} value={household.householdId}>
                                        {household.householdCode} - {household.ownerName}
                                    </option>
                                ))}
                            </select>
                            {createForm.formState.errors.householdId && (
                                <p className="text-sm text-red-600 mt-1">{createForm.formState.errors.householdId.message}</p>
                            )}
                        </div>
                        <div>
                            <Label htmlFor="create-fullName">Họ tên *</Label>
                            <Input
                                id="create-fullName"
                                {...createForm.register('fullName', { required: 'Họ tên là bắt buộc' })}
                                placeholder="Nhập họ tên"
                            />
                            {createForm.formState.errors.fullName && (
                                <p className="text-sm text-red-600 mt-1">{createForm.formState.errors.fullName.message}</p>
                            )}
                        </div>
                        <div>
                            <Label htmlFor="create-dateOfBirth">Ngày sinh</Label>
                            <Input
                                id="create-dateOfBirth"
                                type="date"
                                {...createForm.register('dateOfBirth')}
                            />
                        </div>
                        <div>
                            <Label htmlFor="create-indentityCardNumber">CMND/CCCD</Label>
                            <Input
                                id="create-indentityCardNumber"
                                {...createForm.register('indentityCardNumber')}
                                placeholder="Nhập số CMND/CCCD"
                            />
                        </div>
                        <div>
                            <Label htmlFor="create-relationToOwner">Quan hệ với chủ hộ</Label>
                            <Input
                                id="create-relationToOwner"
                                {...createForm.register('relationToOwner')}
                                placeholder="Ví dụ: Chủ hộ, Vợ, Con..."
                            />
                        </div>
                        <div>
                            <Label htmlFor="create-job">Nghề nghiệp</Label>
                            <Input
                                id="create-job"
                                {...createForm.register('job')}
                                placeholder="Nhập nghề nghiệp"
                            />
                        </div>
                        <div>
                            <Label htmlFor="create-phone_number">Số điện thoại</Label>
                            <Input
                                id="create-phone_number"
                                {...createForm.register('phone_number')}
                                placeholder="Nhập số điện thoại"
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="create-isStaying"
                                {...createForm.register('isStaying')}
                                defaultChecked
                            />
                            <Label htmlFor="create-isStaying">Đang ở tại hộ khẩu</Label>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)} disabled={isSubmitting}>
                                Hủy
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Đang tạo...' : 'Tạo cư dân'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-[425px] border-border">
                    <DialogHeader>
                        <DialogTitle>Sửa thông tin cư dân</DialogTitle>
                        <DialogDescription>
                            Cập nhật thông tin cư dân.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={editForm.handleSubmit(handleEdit)} className="space-y-4">
                        <div>
                            <Label htmlFor="edit-householdId">Hộ khẩu</Label>
                            <select
                                id="edit-householdId"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                {...editForm.register('householdId', { required: 'Hộ khẩu là bắt buộc', valueAsNumber: true })}
                            >
                                <option value="">Chọn hộ khẩu</option>
                                {households.map((household) => (
                                    <option key={household.householdId} value={household.householdId}>
                                        {household.householdCode} - {household.ownerName}
                                    </option>
                                ))}
                            </select>
                            {editForm.formState.errors.householdId && (
                                <p className="text-sm text-red-600 mt-1">{editForm.formState.errors.householdId.message}</p>
                            )}
                        </div>
                        <div>
                            <Label htmlFor="edit-fullName">Họ tên *</Label>
                            <Input
                                id="edit-fullName"
                                {...editForm.register('fullName', { required: 'Họ tên là bắt buộc' })}
                                placeholder="Nhập họ tên"
                            />
                            {editForm.formState.errors.fullName && (
                                <p className="text-sm text-red-600 mt-1">{editForm.formState.errors.fullName.message}</p>
                            )}
                        </div>
                        <div>
                            <Label htmlFor="edit-dateOfBirth">Ngày sinh</Label>
                            <Input
                                id="edit-dateOfBirth"
                                type="date"
                                {...editForm.register('dateOfBirth')}
                            />
                        </div>
                        <div>
                            <Label htmlFor="edit-indentityCardNumber">CMND/CCCD</Label>
                            <Input
                                id="edit-indentityCardNumber"
                                {...editForm.register('indentityCardNumber')}
                                placeholder="Nhập số CMND/CCCD"
                            />
                        </div>
                        <div>
                            <Label htmlFor="edit-relationToOwner">Quan hệ với chủ hộ</Label>
                            <Input
                                id="edit-relationToOwner"
                                {...editForm.register('relationToOwner')}
                                placeholder="Ví dụ: Chủ hộ, Vợ, Con..."
                            />
                        </div>
                        <div>
                            <Label htmlFor="edit-job">Nghề nghiệp</Label>
                            <Input
                                id="edit-job"
                                {...editForm.register('job')}
                                placeholder="Nhập nghề nghiệp"
                            />
                        </div>
                        <div>
                            <Label htmlFor="edit-phone_number">Số điện thoại</Label>
                            <Input
                                id="edit-phone_number"
                                {...editForm.register('phone_number')}
                                placeholder="Nhập số điện thoại"
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="edit-isStaying"
                                {...editForm.register('isStaying')}
                            />
                            <Label htmlFor="edit-isStaying">Đang ở tại hộ khẩu</Label>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={isSubmitting}>
                                Hủy
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Đang cập nhật...' : 'Lưu thay đổi'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent className="border-border">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn xóa cư dân "{selectedResident?.fullName}"? Hành động này không thể hoàn tác.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isSubmitting}>Hủy</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} disabled={isSubmitting} className="bg-red-600 hover:bg-red-700">
                            {isSubmitting ? 'Đang xóa...' : 'Xóa'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default ResidentManagementPage;