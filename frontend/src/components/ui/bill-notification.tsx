import { useEffect, useState } from 'react';
import { Wallet } from 'lucide-react';
import { Button } from './button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from './dropdown-menu';
import { getMyBills, type Bill } from '@/services/billService';
import { useNavigate } from 'react-router';

export const BillNotification = () => {
    const navigate = useNavigate();
    const [unpaidBills, setUnpaidBills] = useState<Bill[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchUnpaidBills = async () => {
            try {
                setLoading(true);
                const bills = await getMyBills();
                // Lọc các bill chưa thanh toán, quá hạn, thanh toán một phần
                const filtered = bills.filter(bill => 
                    bill.status === 'Chưa thanh toán' || 
                    bill.status === 'Quá hạn' || 
                    bill.status === 'Thanh toán một phần'
                );
                setUnpaidBills(filtered);
            } catch (error) {
                console.error('Error fetching unpaid bills:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUnpaidBills();
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Quá hạn':
                return 'text-red-600';
            case 'Thanh toán một phần':
                return 'text-yellow-600';
            case 'Chưa thanh toán':
                return 'text-orange-600';
            default:
                return 'text-gray-600';
        }
    };

    if (loading) return null;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Wallet className="h-10 w-10" />
                    {unpaidBills.length > 0 && (
                        <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-semibold">
                            {unpaidBills.length}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
                <div className="p-4">
                    <h3 className="font-semibold text-base mb-2">Thông báo khoản thu</h3>
                    {unpaidBills.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-4 text-center">
                            Bạn không có khoản thu nào cần thanh toán
                        </p>
                    ) : (
                        <>
                            <p className="text-sm text-muted-foreground mb-3">
                                Bạn còn <span className="font-semibold text-red-600">{unpaidBills.length}</span> khoản thu chưa thanh toán
                            </p>
                            <div className="space-y-2">
                                {unpaidBills.map((bill) => (
                                    <div 
                                        key={bill.billId} 
                                        className="border rounded-lg p-3 hover:bg-muted/50 cursor-pointer transition-colors"
                                        onClick={() => navigate('/my/bills')}
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <p className="font-medium text-sm">{bill.title || 'Khoản thu'}</p>
                                            {bill.status === 'Thanh toán một phần' ? (
                                                <span className="text-xs font-medium text-yellow-600 leading-tight text-right">
                                                    <span className="block">Thanh toán</span>
                                                    <span className="block">một phần</span>
                                                </span>
                                            ) : (
                                                <span className={`text-xs font-medium ${getStatusColor(bill.status)}`}>
                                                    {bill.status}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-muted-foreground mb-1">
                                            Kỳ: {bill.paymentPeriod}
                                        </p>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-semibold text-blue-600">
                                                {Number(bill.totalAmount).toLocaleString('vi-VN')} đ
                                            </span>
                                            {Number(bill.paidAmount) > 0 && (
                                                <span className="text-xs text-muted-foreground">
                                                    Đã trả: {Number(bill.paidAmount).toLocaleString('vi-VN')} đ
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <Button 
                                variant="link" 
                                className="w-full mt-3 text-sm"
                                onClick={() => navigate('/my/bills')}
                            >
                                Xem tất cả khoản thu →
                            </Button>
                        </>
                    )}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
