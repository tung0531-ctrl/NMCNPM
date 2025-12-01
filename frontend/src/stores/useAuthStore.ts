import {create} from 'zustand'
import {toast} from 'sonner'
import type { AuthState } from '@/types/stores';
import { authService } from '@/services/authService';

export const useAuthStore = create<AuthState>((set, get) => ({
    accessToken: null,
    user: null,
    loading: false,

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
        } catch (error){
            console.error(error);
            toast.error('Đăng ký không thành công');
        }
    },


    signIn: async (username, password) =>{
        try {
            set ({loading: true});

            const {accessToken} = await authService.signIn(username, password);
            set ({accessToken});
            toast.success('Đăng nhập thành công');


        } catch (error) {
            console.error(error);
            toast.error('Đăng nhập không thành công');
        }
    },

    
    signOut: async () => {
        try {
            get ().clearState();
            await authService.signOut()
            toast.success ("Đăng xuất thành công")
        } catch (error){
            console.error(error);
            toast.error("Lỗi xảy ra khi logout. Hãy thử lại");

        }
    },
}));