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
import { toast } from 'sonner';

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
        } catch (err: any) {
            const error = err as { response?: { status: number, data?: { message: string } }, message: string };
            console.error('Error fetching residents:', error);
            
            if (error.response?.status === 401) {
                toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
                navigate('/signin');
            } else if (error.response?.status === 403) {
                toast.error('Bạn không có quyền truy cập trang này. Chỉ admin mới có thể xem danh sách cư dân.');
                navigate('/');
            } else {
                const errorMessage = error.response?.data?.message || error.message || 'Không thể tải danh sách cư dân. Vui lòng thử lại.';
                toast.error(errorMessage);
            }
        } finally {
            setLoading(false);
        }
    }, [filters, navigate]);

    const fetchHouseholds = useCallback(async () => {
        try {
            const response = await getAllHouseholds();
            setHouseholds(response);
        } catch (err: any) {
            console.error('Error fetching households:', err);
            const error = err as { response?: { status: number, data?: { message: string } }, message: string };
            
            if (error.response?.status === 401) {
                toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
                navigate('/signin');
            } else {
                const errorMessage = error.response?.data?.message || error.message || 'Không thể tải danh sách hộ khẩu. Vui lòng thử lại.';
                toast.error(errorMessage);
            }
        }
    }, [navigate]);

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
                                        <h1 className="text-3xl font-bold">Quản lý cư dân</h1>
                                        <p className="text-base text-muted-foreground">
                                            Quản lý thông tin các cư dân trong hệ thống
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button style={{color: 'red'}} variant="outline" onClick={() => navigate('/households')} className="h-10 text-base px-4">
                                            Quản lý Hộ gia đình
                                        </Button>
                                        <Button onClick={() => setIsCreateDialogOpen(true)} className="h-10 text-base px-4">
                                            <Plus className="mr-2 h-4 w-4" />
                                            Thêm cư dân
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
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div className='flex flex-col gap-2'>
                                        <Label htmlFor="fullName" className="text-base">Họ tên</Label>
                                        <Input
                                            id="fullName"
                                            placeholder="Tìm theo họ tên..."
                                            value={filters.fullName || ''}
                                            onChange={(e) => handleFilterChange('fullName', e.target.value)}
                                            className="h-10 text-base"
                                        />
                                    </div>
                                    <div className='flex flex-col gap-2'>
                                        <Label htmlFor="household" className="text-base">Hộ khẩu</Label>
                                        <select
                                            id="household"
                                            title="Hộ khẩu"
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                                        <Label htmlFor="isStaying" className="text-base">Trạng thái</Label>
                                        <select
                                            id="isStaying"
                                            title="Trạng thái"
                                            className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            value={filters.isStaying?.toString() || ''}
                                            onChange={(e) => handleFilterChange('isStaying', e.target.value === 'true' ? true : e.target.value === 'false' ? false : undefined)}
                                        >
                                            <option value="">Tất cả</option>
                                            <option value="true">Đang ở</option>
                                            <option value="false">Đã chuyển đi</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <Button onClick={() => fetchResidents()} disabled={loading} className="h-10 text-base px-4">
                                        {loading ? 'Đang tải...' : 'Tìm kiếm'}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => setFilters({
                                            fullName: '',
                                            householdId: undefined,
                                            isStaying: undefined,
                                            page: 1,
                                            limit: 10
                                        })}
                                        disabled={loading}
                                        className="h-10 text-base px-4"
                                    >
                                        Xóa bộ lọc
                                    </Button>
                                </div>
                                    

                                {/* Residents List */}
                                <div className="rounded-lg border border-border overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                        <thead className="bg-muted">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-base font-semibold">
                                                    Họ tên
                                                </th>
                                                <th className="px-4 py-3 text-left text-base font-semibold">
                                                    Hộ khẩu
                                                </th>
                                                <th className="px-4 py-3 text-left text-base font-semibold">
                                                    Quan hệ
                                                </th>
                                                <th className="px-4 py-3 text-left text-base font-semibold">
                                                    SĐT
                                                </th>
                                                <th className="px-4 py-3 text-left text-base font-semibold">
                                                    Trạng thái
                                                </th>
                                                <th className="px-4 py-3 text-right text-base font-semibold">
                                                    Thao tác
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
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
                                                    <tr key={resident.residentId} className="hover:bg-muted/50 transition-colors">
                                                        <td className="px-4 py-4 text-base font-medium">
                                                            <div>
                                                                {resident.fullName}
                                                            </div>
                                                            {resident.dateOfBirth && (
                                                                <div className="text-muted-foreground text-sm">
                                                                    {new Date(resident.dateOfBirth).toLocaleDateString('vi-VN')}
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-4 text-base">
                                                            <div className="font-medium">
                                                                {resident.household_resident?.householdCode}
                                                            </div>
                                                            <div className="text-muted-foreground text-sm">
                                                                {resident.household_resident?.ownerName}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-4 text-base text-muted-foreground">
                                                            {resident.relationToOwner}
                                                        </td>
                                                        <td className="px-4 py-4 text-base text-muted-foreground">
                                                            {resident.phone_number}
                                                        </td>
                                                        <td className="px-4 py-4 text-base">
                                                            <span className={`inline-flex px-2 py-1 text-sm font-semibold rounded-full ${
                                                                resident.isStaying
                                                                    ? 'bg-green-100 text-green-800'
                                                                    : 'bg-red-100 text-red-800'
                                                            }`}>
                                                                {resident.isStaying ? 'Đang ở' : 'Đã chuyển đi'}
                                                            </span>
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
                                                                        onClick={() => openEditDialog(resident)}
                                                                        className="cursor-pointer"
                                                                    >
                                                                        <Pencil className="mr-2 h-4 w-4" />
                                                                        Sửa
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem
                                                                        onClick={() => openDeleteDialog(resident)}
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
                                            Hiển thị {residents.length} trong tổng số {pagination.totalItems} cư dân
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
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Card className="border-border">
                                        <CardContent className="p-4">
                                            <p className="text-base text-muted-foreground">Tổng số cư dân</p>
                                            <p className="text-2xl font-bold">{pagination.totalItems}</p>
                                        </CardContent>
                                    </Card>
                                    <Card className="border-border">
                                        <CardContent className="p-4">
                                            <p className="text-base text-muted-foreground">Đang cư trú (Trong trang hiện tại)</p>
                                            <p className="text-2xl font-bold text-green-600">
                                                {residents.filter(r => r.isStaying).length}
                                            </p>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Create Dialog */}
                                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                                    <DialogContent className="sm:max-w-[525px]">
                                        <DialogHeader>
                                            <DialogTitle>Thêm cư dân mới</DialogTitle>
                                            <DialogDescription>
                                                Nhập thông tin cho cư dân mới
                                            </DialogDescription>
                                        </DialogHeader>
                                        <form onSubmit={createForm.handleSubmit(handleCreate)}>
                                            <div className="grid gap-4 py-4">
                                                <div className="grid gap-2">
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
                                                        <p className="text-sm text-red-600">{createForm.formState.errors.householdId.message}</p>
                                                    )}
                                                </div>

                                                <div className="grid gap-2">
                                                    <Label htmlFor="create-fullName">Họ tên</Label>
                                                    <Input
                                                        id="create-fullName"
                                                        {...createForm.register('fullName', { required: 'Họ tên là bắt buộc' })}
                                                        placeholder="Nhập họ tên..."
                                                    />
                                                    {createForm.formState.errors.fullName && (
                                                        <p className="text-sm text-red-600">{createForm.formState.errors.fullName.message}</p>
                                                    )}
                                                </div>

                                                <div className="grid gap-2">
                                                    <Label htmlFor="create-dateOfBirth">Ngày sinh</Label>
                                                    <Input
                                                        id="create-dateOfBirth"
                                                        type="date"
                                                        {...createForm.register('dateOfBirth')}
                                                    />
                                                </div>

                                                <div className="grid gap-2">
                                                    <Label htmlFor="create-indentityCardNumber">CMND/CCCD</Label>
                                                    <Input
                                                        id="create-indentityCardNumber"
                                                        {...createForm.register('indentityCardNumber')}
                                                        placeholder="Nhập số CMND/CCCD..."
                                                    />
                                                </div>

                                                <div className="grid gap-2">
                                                    <Label htmlFor="create-relationToOwner">Quan hệ với chủ hộ</Label>
                                                    <Input
                                                        id="create-relationToOwner"
                                                        {...createForm.register('relationToOwner')}
                                                        placeholder="VD: Chủ hộ, Vợ, Con..."
                                                    />
                                                </div>

                                                <div className="grid gap-2">
                                                    <Label htmlFor="create-job">Nghề nghiệp</Label>
                                                    <Input
                                                        id="create-job"
                                                        {...createForm.register('job')}
                                                        placeholder="Nhập nghề nghiệp..."
                                                    />
                                                </div>

                                                <div className="grid gap-2">
                                                    <Label htmlFor="create-phone_number">Số điện thoại</Label>
                                                    <Input
                                                        id="create-phone_number"
                                                        {...createForm.register('phone_number')}
                                                        placeholder="Nhập số điện thoại..."
                                                    />
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        id="create-isStaying"
                                                        {...createForm.register('isStaying')}
                                                        defaultChecked
                                                        className="w-4 h-4 rounded border-gray-300"
                                                    />
                                                    <Label htmlFor="create-isStaying" className="cursor-pointer">
                                                        Đang ở tại hộ khẩu
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

                                {/* Edit Dialog */}
                                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                                    <DialogContent className="sm:max-w-[525px]">
                                        <DialogHeader>
                                            <DialogTitle>Chỉnh sửa thông tin cư dân</DialogTitle>
                                            <DialogDescription>
                                                Cập nhật thông tin cư dân
                                            </DialogDescription>
                                        </DialogHeader>
                                        <form onSubmit={editForm.handleSubmit(handleEdit)}>
                                            <div className="grid gap-4 py-4">
                                                <div className="grid gap-2">
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
                                                        <p className="text-sm text-red-600">{editForm.formState.errors.householdId.message}</p>
                                                    )}
                                                </div>

                                                <div className="grid gap-2">
                                                    <Label htmlFor="edit-fullName">Họ tên</Label>
                                                    <Input
                                                        id="edit-fullName"
                                                        {...editForm.register('fullName', { required: 'Họ tên là bắt buộc' })}
                                                        placeholder="Nhập họ tên..."
                                                    />
                                                    {editForm.formState.errors.fullName && (
                                                        <p className="text-sm text-red-600">{editForm.formState.errors.fullName.message}</p>
                                                    )}
                                                </div>

                                                <div className="grid gap-2">
                                                    <Label htmlFor="edit-dateOfBirth">Ngày sinh</Label>
                                                    <Input
                                                        id="edit-dateOfBirth"
                                                        type="date"
                                                        {...editForm.register('dateOfBirth')}
                                                    />
                                                </div>

                                                <div className="grid gap-2">
                                                    <Label htmlFor="edit-indentityCardNumber">CMND/CCCD</Label>
                                                    <Input
                                                        id="edit-indentityCardNumber"
                                                        {...editForm.register('indentityCardNumber')}
                                                        placeholder="Nhập số CMND/CCCD..."
                                                    />
                                                </div>

                                                <div className="grid gap-2">
                                                    <Label htmlFor="edit-relationToOwner">Quan hệ với chủ hộ</Label>
                                                    <Input
                                                        id="edit-relationToOwner"
                                                        {...editForm.register('relationToOwner')}
                                                        placeholder="VD: Chủ hộ, Vợ, Con..."
                                                    />
                                                </div>

                                                <div className="grid gap-2">
                                                    <Label htmlFor="edit-job">Nghề nghiệp</Label>
                                                    <Input
                                                        id="edit-job"
                                                        {...editForm.register('job')}
                                                        placeholder="Nhập nghề nghiệp..."
                                                    />
                                                </div>

                                                <div className="grid gap-2">
                                                    <Label htmlFor="edit-phone_number">Số điện thoại</Label>
                                                    <Input
                                                        id="edit-phone_number"
                                                        {...editForm.register('phone_number')}
                                                        placeholder="Nhập số điện thoại..."
                                                    />
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        id="edit-isStaying"
                                                        {...editForm.register('isStaying')}
                                                        className="w-4 h-4 rounded border-gray-300"
                                                    />
                                                    <Label htmlFor="edit-isStaying" className="cursor-pointer">
                                                        Đang ở tại hộ khẩu
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
        </div>
    );
};

export default ResidentManagementPage;