import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { 
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { getBills, createBill, updateBill, deleteBill, type Bill, type BillFilters, type UpdateBillData, type CreateBillData } from '@/services/billService';
import { getActiveFeeTypes, type FeeType } from '@/services/feeTypeService';
import { getAllHouseholds, type Household } from '@/services/householdService';
import { getAllAdmins, type Admin } from '@/services/adminService';
import { useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { MoreVertical, Pencil, Trash2, Plus } from 'lucide-react';

const BillManagementPage = () => {
    const navigate = useNavigate();
    const [bills, setBills] = useState<Bill[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // Fee types state
    const [feeTypes, setFeeTypes] = useState<FeeType[]>([]);
    const [households, setHouseholds] = useState<Household[]>([]);
    const [admins, setAdmins] = useState<Admin[]>([]);
    const [selectedFeeType, setSelectedFeeType] = useState<string>('other');
    const [selectedFeeTypeCreate, setSelectedFeeTypeCreate] = useState<string>('other');
    
    // Dialog states
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Filters state
    const [filters, setFilters] = useState<BillFilters>({
        billId: '',
        householdName: '',
        paymentPeriod: '',
        status: '',
        collectorName: '',
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
    const { register, handleSubmit, reset, formState: { errors } } = useForm<UpdateBillData>();
    
    // Form for creating
    const { register: registerCreate, handleSubmit: handleSubmitCreate, reset: resetCreate, formState: { errors: errorsCreate }, setValue: setValueCreate } = useForm<CreateBillData>();

    const fetchBills = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await getBills(filters);
            setBills(response.bills);
            setPagination(response.pagination);
        } catch (err) {
            const error = err as { message: string; response?: { status: number } };
            console.error('Error fetching bills:', error);
            console.error('Error details:', {
                message: error.message,
                response: error.response,
                status: error.response?.status
            });
            setError('Không thể tải danh sách hóa đơn. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchBills();
    }, [fetchBills]);

    useEffect(() => {
        const loadFeeTypes = async () => {
            try {
                const types = await getActiveFeeTypes();
                setFeeTypes(types);
            } catch (err) {
                console.error('Error loading fee types:', err);
            }
        };
        const loadHouseholds = async () => {
            try {
                const households = await getAllHouseholds();
                setHouseholds(households);
            } catch (err) {
                console.error('Error loading households:', err);
            }
        };
        const loadAdmins = async () => {
            try {
                const admins = await getAllAdmins();
                setAdmins(admins);
            } catch (err) {
                console.error('Error loading admins:', err);
            }
        };
        loadFeeTypes();
        loadHouseholds();
        loadAdmins();
    }, []);

    const handleSearch = () => {
        // Filters are updated in real-time, so fetchBills will be called via useEffect
        // This function is kept for potential future enhancements
    };

    const handlePageChange = (newPage: number) => {
        setFilters(prev => ({ ...prev, page: newPage }));
    };

    const handleEdit = (bill: Bill) => {
        setSelectedBill(bill);
        setSelectedFeeType('other'); // Default to "Khác"
        
        // Find household by name
        const household = households.find(h => h.ownerName === bill.householdName);
        
        reset({
            householdId: household?.householdId,
            title: bill.title,
            totalAmount: Number(bill.totalAmount),
            paidAmount: Number(bill.paidAmount),
            paymentPeriod: bill.paymentPeriod,
            collectorName: bill.collectorName || '',
        });
        setIsEditDialogOpen(true);
    };

    const handleFeeTypeChange = (feeTypeId: string) => {
        setSelectedFeeType(feeTypeId);
        
        if (feeTypeId === 'other') {
            // Allow editing when "Khác" is selected
            return;
        }
        
        // Auto-fill from selected fee type
        const feeType = feeTypes.find(ft => ft.feeTypeId.toString() === feeTypeId);
        if (feeType) {
            const household = households.find(h => h.ownerName === selectedBill?.householdName);
            reset({
                householdId: household?.householdId,
                title: feeType.feeName,
                totalAmount: Number(feeType.unitPrice),
                paidAmount: Number(selectedBill?.paidAmount || 0),
                paymentPeriod: selectedBill?.paymentPeriod || '',
                collectorName: selectedBill?.collectorName || '',
                feeTypeId: feeType.feeTypeId,
            });
        }
    };

    const handleFeeTypeChangeCreate = (feeTypeId: string) => {
        setSelectedFeeTypeCreate(feeTypeId);
        
        if (feeTypeId === 'other') {
            // Allow editing when "Khác" is selected
            return;
        }
        
        // Auto-fill from selected fee type
        const feeType = feeTypes.find(ft => ft.feeTypeId.toString() === feeTypeId);
        if (feeType) {
            setValueCreate('title', feeType.feeName);
            setValueCreate('totalAmount', Number(feeType.unitPrice));
            setValueCreate('feeTypeId', feeType.feeTypeId);
        }
    };

    const handleCreate = () => {
        setSelectedFeeTypeCreate('other');
        resetCreate({
            householdId: undefined,
            title: '',
            totalAmount: 0,
            paidAmount: 0,
            paymentPeriod: '',
            collectorName: '',
        });
        setIsCreateDialogOpen(true);
    };

    const onSubmitCreate = async (data: CreateBillData) => {
        try {
            setIsSubmitting(true);
            const newBill = await createBill(data);
            setIsCreateDialogOpen(false);
            
            // Add new bill to the list
            setBills(prevBills => [newBill, ...prevBills]);
        } catch (err) {
            console.error('Error creating bill:', err);
            setError('Không thể tạo khoản thu. Vui lòng thử lại.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = (bill: Bill) => {
        setSelectedBill(bill);
        setIsDeleteDialogOpen(true);
    };

    const onSubmitEdit = async (data: UpdateBillData) => {
        if (!selectedBill) return;
        
        try {
            setIsSubmitting(true);
            const updatedBill = await updateBill(selectedBill.billId, data);
            setIsEditDialogOpen(false);
            
            // Update the bill in local state instead of refetching
            setBills(prevBills => 
                prevBills.map(bill => 
                    bill.billId === selectedBill.billId ? updatedBill : bill
                )
            );
        } catch (err) {
            console.error('Error updating bill:', err);
            setError('Không thể cập nhật hóa đơn. Vui lòng thử lại.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const confirmDelete = async () => {
        if (!selectedBill) return;
        
        try {
            setIsSubmitting(true);
            await deleteBill(selectedBill.billId);
            setIsDeleteDialogOpen(false);
            fetchBills();
        } catch (err) {
            console.error('Error deleting bill:', err);
            setError('Không thể xóa hóa đơn. Vui lòng thử lại.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch(status) {
            case 'Đã thanh toán': return 'bg-green-100 text-green-800';
            case 'Chưa thanh toán': return 'bg-red-100 text-red-800';
            case 'Quá hạn': return 'bg-gray-100 text-gray-800';
            case 'Thanh toán một phần': return 'bg-orange-100 text-orange-800';
            default: return 'bg-gray-100 text-gray-800';
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
                                    <h1 className="text-3xl font-bold">Quản lý các khoản thu</h1>
                                    <p className="text-muted-foreground">
                                        Theo dõi và quản lý các khoản thu phí của hộ gia đình
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <Button style={{ color: 'red' }} variant="outline" onClick={() => navigate('/fee-types')}>
                                        Danh mục khoản thu
                                    </Button>
                                    <Button onClick={handleCreate}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Thêm khoản thu
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
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="billId">ID hóa đơn</Label>
                                    <Input
                                        id="billId"
                                        type="number"
                                        placeholder="Nhập ID..."
                                        value={filters.billId || ''}
                                        onChange={(e) => setFilters({ ...filters, billId: e.target.value })}
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="householdName">Tên hộ</Label>
                                    <Input
                                        id="householdName"
                                        type="text"
                                        placeholder="Nhập tên hộ..."
                                        value={filters.householdName || ''}
                                        onChange={(e) => setFilters({ ...filters, householdName: e.target.value })}
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="paymentPeriod">Kỳ thanh toán</Label>
                                    <Input
                                        id="paymentPeriod"
                                        type="text"
                                        placeholder="VD: 2025-12"
                                        value={filters.paymentPeriod || ''}
                                        onChange={(e) => setFilters({ ...filters, paymentPeriod: e.target.value })}
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="status">Trạng thái</Label>
                                    <select
                                        id="status"
                                        title="Trạng thái"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        value={filters.status || ''}
                                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                                    >
                                        <option value="">Tất cả</option>
                                        <option value="Đã thanh toán">Đã thanh toán</option>
                                        <option value="Thanh toán một phần">Thanh toán một phần</option>
                                        <option value="Chưa thanh toán">Chưa thanh toán</option>
                                        <option value="Quá hạn">Quá hạn</option>
                                    </select>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="collectorName">Người thu</Label>
                                    <Input
                                        id="collectorName"
                                        type="text"
                                        placeholder="Nhập tên người thu..."
                                        value={filters.collectorName || ''}
                                        onChange={(e) => setFilters({ ...filters, collectorName: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Button onClick={handleSearch} disabled={loading}>
                                    {loading ? 'Đang tải...' : 'Tìm kiếm'}
                                </Button>
                                <Button 
                                    variant="outline" 
                                    onClick={() => {
                                        setFilters({ billId: '', householdName: '', paymentPeriod: '', status: '', collectorName: '', page: 1, limit: 10 });
                                        fetchBills();
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
                                                <th className="px-4 py-3 text-left text-sm font-semibold">Tên hộ</th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold">Kỳ thanh toán</th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold">Tiêu đề</th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold">Tổng tiền</th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold">Đã trả</th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold">Trạng thái</th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold">Người thu</th>
                                                <th className="px-4 py-3 text-right text-sm font-semibold">Thao tác</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {loading ? (
                                                <tr>
                                                    <td colSpan={9} className="px-4 py-8 text-center text-muted-foreground">
                                                        Đang tải...
                                                    </td>
                                                </tr>
                                            ) : bills.length === 0 ? (
                                                <tr>
                                                    <td colSpan={9} className="px-4 py-8 text-center text-muted-foreground">
                                                        Không tìm thấy hóa đơn nào
                                                    </td>
                                                </tr>
                                            ) : (
                                                bills.map((bill) => (
                                                    <tr key={bill.billId} className="hover:bg-muted/50 transition-colors">
                                                        <td className="px-4 py-4 text-sm font-medium">#{bill.billId}</td>
                                                        <td className="px-4 py-4 text-sm">{bill.householdName}</td>
                                                        <td className="px-4 py-4 text-sm">{bill.paymentPeriod}</td>
                                                        <td className="px-4 py-4 text-sm">{bill.title}</td>
                                                        <td className="px-4 py-4 text-sm font-medium">
                                                            {Number(bill.totalAmount).toLocaleString('vi-VN')} đ
                                                        </td>
                                                        <td className="px-4 py-4 text-sm font-medium text-blue-600">
                                                            {Number(bill.paidAmount).toLocaleString('vi-VN')} đ
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(bill.status)}`}>
                                                                {bill.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-4 text-sm">
                                                            {bill.collectorName || '-'}
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
                                                                        onClick={() => handleEdit(bill)}
                                                                        className="cursor-pointer"
                                                                    >
                                                                        <Pencil className="mr-2 h-4 w-4" />
                                                                        Chỉnh sửa
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem 
                                                                        onClick={() => handleDelete(bill)}
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
                                    <div className="text-sm text-muted-foreground">
                                        Hiển thị {bills.length} trong tổng số {pagination.totalItems} hóa đơn
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
                                                    // Show all pages if total <= 7
                                                    for (let i = 1; i <= total; i++) {
                                                        pages.push(i);
                                                    }
                                                } else {
                                                    // Always show first page
                                                    pages.push(1);
                                                    
                                                    if (current > 3) {
                                                        pages.push('...');
                                                    }
                                                    
                                                    // Show pages around current
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
                                                    
                                                    // Always show last page
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
                                            <span className="text-sm text-muted-foreground">Đến trang:</span>
                                            <input
                                                type="number"
                                                min="1"
                                                max={pagination.totalPages}
                                                placeholder={pagination.currentPage.toString()}
                                                className="w-16 px-2 py-1 text-sm border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
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
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Card className="border-border">
                                    <CardContent className="p-4">
                                        <p className="text-sm text-muted-foreground">Tổng số hóa đơn</p>
                                        <p className="text-2xl font-bold">{pagination.totalItems}</p>
                                    </CardContent>
                                </Card>
                                <Card className="border-border">
                                    <CardContent className="p-4">
                                        <p className="text-sm text-muted-foreground">Tổng tiền hóa đơn (trang hiện tại)</p>
                                        <p className="text-2xl font-bold">
                                            {bills.reduce((sum, bill) => sum + Number(bill.totalAmount), 0).toLocaleString('vi-VN')} đ
                                        </p>
                                    </CardContent>
                                </Card>
                                <Card className="border-border">
                                    <CardContent className="p-4">
                                        <p className="text-sm text-muted-foreground">Đã thanh toán</p>
                                        <p className="text-2xl font-bold text-green-600">
                                            {bills.filter(b => b.status === 'Đã thanh toán').length}
                                        </p>
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
                        <DialogTitle>Chỉnh sửa khoản thu</DialogTitle>
                        <DialogDescription>
                            Cập nhật thông tin khoản thu cho hộ gia đình
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit(onSubmitEdit)}>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-household">Hộ gia đình</Label>
                                <select
                                    id="edit-household"
                                    title="Hộ gia đình"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    {...register('householdId', { 
                                        required: 'Vui lòng chọn hộ gia đình',
                                        valueAsNumber: true 
                                    })}
                                >
                                    <option value="">-- Chọn hộ gia đình --</option>
                                    {households.map(h => (
                                        <option key={h.householdId} value={h.householdId}>
                                            {h.ownerName} - {h.householdCode}
                                        </option>
                                    ))}
                                </select>
                                {errors.householdId && (
                                    <p className="text-sm text-red-500">{errors.householdId.message}</p>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="edit-feeType">Danh mục khoản thu</Label>
                                <select
                                    id="edit-feeType"
                                    title="Danh mục khoản thu"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    value={selectedFeeType}
                                    onChange={(e) => handleFeeTypeChange(e.target.value)}
                                >
                                    <option value="other">Khác</option>
                                    {feeTypes.map(ft => (
                                        <option key={ft.feeTypeId} value={ft.feeTypeId.toString()}>
                                            {ft.feeName} - {ft.unitPrice.toLocaleString()} VNĐ/{ft.unit}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="edit-title">Tiêu đề</Label>
                                <Input
                                    id="edit-title"
                                    {...register('title', { required: 'Tiêu đề là bắt buộc' })}
                                    placeholder="Nhập tiêu đề..."
                                    disabled={selectedFeeType !== 'other'}
                                    className={selectedFeeType !== 'other' ? 'bg-muted cursor-not-allowed' : ''}
                                />
                                {errors.title && (
                                    <p className="text-sm text-red-500">{errors.title.message}</p>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="edit-totalAmount">Tổng tiền (VNĐ)</Label>
                                <Input
                                    id="edit-totalAmount"
                                    type="number"
                                    {...register('totalAmount', { 
                                        required: 'Tổng tiền là bắt buộc',
                                        min: { value: 0, message: 'Tổng tiền phải lớn hơn hoặc bằng 0' }
                                    })}
                                    placeholder="Nhập tổng tiền..."
                                    disabled={selectedFeeType !== 'other'}
                                    className={selectedFeeType !== 'other' ? 'bg-muted cursor-not-allowed' : ''}
                                />
                                {errors.totalAmount && (
                                    <p className="text-sm text-red-500">{errors.totalAmount.message}</p>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="edit-paidAmount">Số tiền đã trả (VNĐ)</Label>
                                <Input
                                    id="edit-paidAmount"
                                    type="number"
                                    {...register('paidAmount', { 
                                        required: 'Số tiền đã trả là bắt buộc',
                                        min: { value: 0, message: 'Số tiền đã trả phải lớn hơn hoặc bằng 0' },
                                        validate: (value, formValues) => {
                                            const totalAmount = formValues.totalAmount || 0;
                                            return Number(value) <= Number(totalAmount) || 'Số tiền đã trả không được lớn hơn tổng tiền';
                                        }
                                    })}
                                    placeholder="Nhập số tiền đã trả..."
                                />
                                {errors.paidAmount && (
                                    <p className="text-sm text-red-500">{errors.paidAmount.message}</p>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="edit-paymentPeriod">Kỳ thanh toán</Label>
                                <Input
                                    id="edit-paymentPeriod"
                                    {...register('paymentPeriod', { required: 'Kỳ thanh toán là bắt buộc' })}
                                    placeholder="VD: 2025-12"
                                />
                                {errors.paymentPeriod && (
                                    <p className="text-sm text-red-500">{errors.paymentPeriod.message}</p>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="edit-collectorName">Người thu</Label>
                                <select
                                    id="edit-collectorName"
                                    title="Người thu"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    {...register('collectorName')}
                                >
                                    <option value="">-- Không chọn --</option>
                                    {admins.map(admin => (
                                        <option key={admin.userId} value={admin.fullName}>
                                            {admin.fullName} ({admin.username})
                                        </option>
                                    ))}
                                </select>
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
                        <DialogTitle>Thêm khoản thu mới</DialogTitle>
                        <DialogDescription>
                            Tạo khoản thu cho hộ gia đình
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmitCreate(onSubmitCreate)}>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="create-household">Hộ gia đình</Label>
                                <select
                                    id="create-household"
                                    title="Hộ gia đình"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    {...registerCreate('householdId', { 
                                        required: 'Vui lòng chọn hộ gia đình',
                                        valueAsNumber: true 
                                    })}
                                >
                                    <option value="">-- Chọn hộ gia đình --</option>
                                    {households.map(h => (
                                        <option key={h.householdId} value={h.householdId}>
                                            {h.ownerName} - {h.householdCode}
                                        </option>
                                    ))}
                                </select>
                                {errorsCreate.householdId && (
                                    <p className="text-sm text-red-500">{errorsCreate.householdId.message}</p>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="create-feeType">Danh mục khoản thu</Label>
                                <select
                                    id="create-feeType"
                                    title="Danh mục khoản thu"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    value={selectedFeeTypeCreate}
                                    onChange={(e) => handleFeeTypeChangeCreate(e.target.value)}
                                >
                                    <option value="other">Khác</option>
                                    {feeTypes.map(ft => (
                                        <option key={ft.feeTypeId} value={ft.feeTypeId.toString()}>
                                            {ft.feeName} - {ft.unitPrice.toLocaleString()} VNĐ/{ft.unit}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="create-title">Tiêu đề</Label>
                                <Input
                                    id="create-title"
                                    {...registerCreate('title', { required: 'Tiêu đề là bắt buộc' })}
                                    placeholder="Nhập tiêu đề..."
                                    disabled={selectedFeeTypeCreate !== 'other'}
                                    className={selectedFeeTypeCreate !== 'other' ? 'bg-muted cursor-not-allowed' : ''}
                                />
                                {errorsCreate.title && (
                                    <p className="text-sm text-red-500">{errorsCreate.title.message}</p>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="create-totalAmount">Tổng tiền (VNĐ)</Label>
                                <Input
                                    id="create-totalAmount"
                                    type="number"
                                    {...registerCreate('totalAmount', { 
                                        required: 'Tổng tiền là bắt buộc',
                                        min: { value: 0, message: 'Tổng tiền phải lớn hơn hoặc bằng 0' },
                                        valueAsNumber: true
                                    })}
                                    placeholder="Nhập tổng tiền..."
                                    disabled={selectedFeeTypeCreate !== 'other'}
                                    className={selectedFeeTypeCreate !== 'other' ? 'bg-muted cursor-not-allowed' : ''}
                                />
                                {errorsCreate.totalAmount && (
                                    <p className="text-sm text-red-500">{errorsCreate.totalAmount.message}</p>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="create-paidAmount">Số tiền đã trả (VNĐ)</Label>
                                <Input
                                    id="create-paidAmount"
                                    type="number"
                                    {...registerCreate('paidAmount', { 
                                        required: 'Số tiền đã trả là bắt buộc',
                                        min: { value: 0, message: 'Số tiền đã trả phải lớn hơn hoặc bằng 0' },
                                        valueAsNumber: true,
                                        validate: (value, formValues) => {
                                            const totalAmount = formValues.totalAmount || 0;
                                            return Number(value) <= Number(totalAmount) || 'Số tiền đã trả không được lớn hơn tổng tiền';
                                        }
                                    })}
                                    placeholder="Nhập số tiền đã trả..."
                                />
                                {errorsCreate.paidAmount && (
                                    <p className="text-sm text-red-500">{errorsCreate.paidAmount.message}</p>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="create-paymentPeriod">Kỳ thanh toán</Label>
                                <Input
                                    id="create-paymentPeriod"
                                    {...registerCreate('paymentPeriod', { required: 'Kỳ thanh toán là bắt buộc' })}
                                    placeholder="VD: 2025-12"
                                />
                                {errorsCreate.paymentPeriod && (
                                    <p className="text-sm text-red-500">{errorsCreate.paymentPeriod.message}</p>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="create-collectorName">Người thu</Label>
                                <select
                                    id="create-collectorName"
                                    title="Người thu"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    {...registerCreate('collectorName')}
                                >
                                    <option value="">-- Không chọn --</option>
                                    {admins.map(admin => (
                                        <option key={admin.userId} value={admin.fullName}>
                                            {admin.fullName} ({admin.username})
                                        </option>
                                    ))}
                                </select>
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
                                {isSubmitting ? 'Đang tạo...' : 'Tạo khoản thu'}
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
                            Bạn có chắc chắn muốn xóa khoản thu <strong>"{selectedBill?.title}"</strong> của hộ{' '}
                            <strong>{selectedBill?.householdName}</strong>? Hành động này không thể hoàn tác.
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

export default BillManagementPage;