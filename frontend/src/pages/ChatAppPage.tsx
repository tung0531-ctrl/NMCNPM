import Logout from '@/components/auth/Logout'
import { Button } from '@/components/ui/button';
import api from '@/lib/axios';
import { useAuthStore } from '@/stores/useAuthStore';
import { toast } from 'sonner';
import { useNavigate } from 'react-router';


const ChatAppPage = () => {

const user = useAuthStore((s) => s.user);
const navigate = useNavigate();
const isAdmin = user?.role === 'ADMIN';

const handleOnClick = async () => {
  try {
    await api.get("/users/test", {withCredentials: true});
    toast.success("Test thành công. Hãy kiểm tra console để biết chi tiết");
  } catch (error) {
    toast.error("thất bại");
    console.error(error);
  }
}
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-card rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Trang Chủ</h1>
              <p className="text-muted-foreground">Xin chào, {user?.username || 'User'}</p>
            </div>
            <Logout/>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
            {isAdmin && (
              <div className="border border-border rounded-lg p-6 hover:shadow-lg transition-shadow">
                <h2 className="text-xl font-semibold mb-2">Quản Lý Khoản Thu</h2>
                <p className="text-muted-foreground mb-4">Xem và quản lý các hóa đơn thu phí</p>
                <Button 
                  onClick={() => navigate('/bills')} 
                  className="w-full"
                >
                  Truy cập Quản Lý Khoản Thu
                </Button>
              </div>
            )}

            <div className="border border-border rounded-lg p-6 hover:shadow-lg transition-shadow">
              <h2 className="text-xl font-semibold mb-2">Test API</h2>
              <p className="text-muted-foreground mb-4">Kiểm tra kết nối API</p>
              <Button 
                onClick={handleOnClick} 
                variant="outline"
                className="w-full"
              >
                Test
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatAppPage