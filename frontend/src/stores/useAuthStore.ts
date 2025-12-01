import {create} from 'zustand'
import {toast} from 'sonner'
import type { AuthState } from '@/types/store';
import { authService } from '@/services/authService';

export const useAuthStore = create<AuthState>((set, get) => ({
    accessToken: null,
    user: null,
    loading: false,

    signUp: async (username, password, email, firstName, lastName) => {
        try {
            set ({
                loading: true
            });
            //gọi api
            await authService.signUp(username, password, email, firstName, lastName);
            toast.success('Đăng ký thành công! Bạn sẽ được chuyển sang trang đăng nhập');
        } catch (error){
            // Try to show server-provided message when available
            // `error` may be an Axios error with `response.data`
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const anyErr = error as any;
            console.error('Signup error:', anyErr?.response ?? anyErr);
            const serverMessage = anyErr?.response?.data?.message || anyErr?.message;
            toast.error(serverMessage || 'Đăng ký không thành công');
        } finally {
            set ({
                loading: false
            });
        }
    },
    signIn: async (username, password) => {
        try {
            set ({
                loading: true
            });

            const {accessToken} = await authService.signIn(username, password);
            set ({
                accessToken
            });
            toast.success('Đăng nhập thành công!');
        } catch (error){
            console.error('Signin error:', error);
            toast.error('Đăng nhập không thành công');
        }}
}));