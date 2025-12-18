import { useEffect } from 'react';
import { Navigate } from 'react-router';
import { useAuthStore } from '@/stores/useAuthStore';
import { toast } from 'sonner';

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
    const user = useAuthStore((s) => s.user);
    const loading = useAuthStore((s) => s.loading);

    useEffect(() => {
        if (!loading && user && user.role !== 'ADMIN') {
            toast.error('Bạn không có quyền truy cập trang này');
        }
    }, [loading, user]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-lg">Đang tải...</div>
            </div>
        );
    }

    if (!user || user.role !== 'ADMIN') {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};

export default AdminRoute;
