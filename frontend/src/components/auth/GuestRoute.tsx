import { useAuthStore } from '@/stores/useAuthStore';
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router';

interface GuestRouteProps {
    children: React.ReactNode;
}

const GuestRoute = ({ children }: GuestRouteProps) => {
    const { accessToken, user, loading, refresh, fetchMe } = useAuthStore();
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        const init = async () => {
            try {
                // Nếu không có token, thử refresh
                if (!accessToken) {
                    await refresh();
                }
                
                // Sau khi refresh, lấy lại state mới nhất
                const currentState = useAuthStore.getState();
                
                // Nếu có token nhưng chưa có user, fetch user info
                if (currentState.accessToken && !currentState.user) {
                    await fetchMe();
                }
            } catch (error) {
                console.error('GuestRoute init error:', error);
            } finally {
                setChecking(false);
            }
        };

        init();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Đang kiểm tra hoặc đang loading
    if (checking || loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                Đang tải trang...
            </div>
        );
    }

    // Nếu đã đăng nhập (có cả token và user), redirect về trang chủ
    if (accessToken && user) {
        return <Navigate to="/" replace />;
    }

    // Nếu chưa đăng nhập, hiển thị trang guest (signin/signup)
    return <>{children}</>;
};

export default GuestRoute;
