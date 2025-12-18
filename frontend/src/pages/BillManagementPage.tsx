import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { getBills, type Bill, type BillFilters } from '@/services/billService';
import { useNavigate } from 'react-router';

const BillManagementPage = () => {
    const navigate = useNavigate();
    const [bills, setBills] = useState<Bill[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // Filters state
    const [filters, setFilters] = useState<BillFilters>({
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

    const fetchBills = useCallback(async () => {
        console.log('fetchBills called with filters:', filters);
        try {
            setLoading(true);
            setError(null);
            console.log('Calling getBills...');
            const response = await getBills(filters);
            console.log('getBills returned:', response);
            setBills(response.bills);
            setPagination(response.pagination);
            console.log('Bills set successfully:', response.bills.length);
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
        console.log('BillManagementPage mounted, calling fetchBills');
        fetchBills();
    }, [fetchBills]);

    const handleSearch = () => {
        setFilters(prev => ({ ...prev, page: 1 }));
        fetchBills();
    };

    const handlePageChange = (newPage: number) => {
        setFilters(prev => ({ ...prev, page: newPage }));
    };

    const getStatusColor = (status: string) => {
        switch(status) {
            case 'Đã thanh toán': return 'bg-green-100 text-green-800';
            case 'Chưa thanh toán': return 'bg-red-100 text-red-800';
            case 'Quá hạn': return 'bg-yellow-100 text-yellow-800';
            case 'Thanh toán một phần': return 'bg-orange-100 text-orange-800';
            default: return 'bg-gray-100 text-gray-800';
        }
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
                                    <h1 className="text-3xl font-bold">Quản lý các khoản thu</h1>
                                    <p className="text-muted-foreground">
                                        Theo dõi và quản lý các khoản thu phí của hộ gia đình
                                    </p>
                                </div>
                                <Button
                                    variant="outline"
                                    onClick={() => navigate('/')}
                                >
                                    ← Về trang chủ
                                </Button>
                            </div>

                            {/* Filters */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                                        <option value="Chưa thanh toán">Chưa thanh toán</option>
                                        <option value="Thanh toán một phần">Thanh toán một phần</option>
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
                                        setFilters({ householdName: '', paymentPeriod: '', status: '', collectorName: '', page: 1, limit: 10 });
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
                                                <th className="px-4 py-3 text-left text-sm font-semibold">Trạng thái</th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold">Người thu</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {loading ? (
                                                <tr>
                                                    <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                                                        Đang tải...
                                                    </td>
                                                </tr>
                                            ) : bills.length === 0 ? (
                                                <tr>
                                                    <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
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
                                                        <td className="px-4 py-4">
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(bill.status)}`}>
                                                                {bill.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-4 text-sm">
                                                            {bill.collectorName || '-'}
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
                                        <p className="text-sm text-muted-foreground">Tổng doanh thu (trang hiện tại)</p>
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
        </div>
    );
};

export default BillManagementPage;