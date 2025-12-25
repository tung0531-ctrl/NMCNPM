import {create} from 'zustand'
import {toast} from 'sonner'
import type { AuthState } from '@/types/stores';
import { authService } from '@/services/authService';

export const useAuthStore = create<AuthState>((set, get) => ({
    accessToken: null,
    user: null,
    loading: false,

    setAccessToken: (accessToken) => {
        set({accessToken});
    },

    clearState: () => {
        set({accessToken: null, user: null, loading: false})
    },

    signUp: async (username, password, email, firstName, lastName) => {
        try {
            set ({
                loading: true
            });
            //gọi api
            await authService.signUp(username, password, email, firstName, lastName);
            toast.success('Đăng ký thành công! Bạn sẽ được chuyển sang trang đăng nhập');
        } catch (error: any){
            console.error(error);
            const errorMessage = error.response?.data?.message || 'Đăng ký không thành công';
            toast.error(errorMessage);
            throw error; // Throw để component có thể handle navigation
        } finally {
            set({loading: false});
        }
    },


    signIn: async (username, password) =>{
        try {
            set ({loading: true});

            const {accessToken} = await authService.signIn(username, password);
            get().setAccessToken(accessToken);

            await get().fetchMe();
            toast.success('Đăng nhập thành công');

        } catch (error: any) {
            console.error(error);
            if (error.response?.status === 401) {
                toast.error('Tên đăng nhập hoặc mật khẩu không đúng');
            } else if (error.response?.status === 403) {
                // Hiển thị message từ server khi tài khoản bị khóa
                toast.error(error.response?.data?.message || 'Tài khoản của bạn đang bị khóa. Vui lòng liên hệ quản trị viên.');
            } else {
                toast.error('Đăng nhập không thành công');
            }
            throw error; // Throw để không tiếp tục navigate
        } finally {
            set ({loading: false});
        }

    },

    
    signOut: async () => {
        try {
            await authService.signOut();
            get().clearState();
            toast.success("Đăng xuất thành công");
        } catch (error){
            console.error(error);
            // Vẫn clear state ngay cả khi có lỗi từ server
            get().clearState();
            toast.error("Lỗi xảy ra khi logout. Hãy thử lại");
        }
    },

    fetchMe : async () => {
        try {
            set ({loading: true});
            const user = await authService.fetchMe();
            set({user});

        } catch (error) {
            console.error(error);
            set({user: null, accessToken: null});
            toast. error ("Lỗi xảy ra khi lấy dữ liệu người dùng. Hãy thử lại !");
        } finally {
        set ({loading: false});
         }
    },
        
    refresh: async () => {
        try {
            set({loading: true});
            const {user, fetchMe, setAccessToken} = get();
            const accessToken = await authService.refresh();

            setAccessToken(accessToken);

            if (!user){
                await fetchMe();
            }
        } catch (error) {
            console.error(error);
            toast.error(" Phiên đăng nhập đã hết. Vui lòng đăng nhập lại ");
            get().clearState();
        } finally { 
            set({loading: false});
        }
    },
}));