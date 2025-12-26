import Logout from '@/components/auth/Logout'
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuthStore } from '@/stores/useAuthStore';
import { useNavigate } from 'react-router';
import { 
  LayoutDashboard, 
  Receipt, 
  Home, 
  Users, 
  UserCog, 
  BarChart3, 
  FileText,
  DollarSign,
  User
} from 'lucide-react';


const ChatAppPage = () => {

const user = useAuthStore((s) => s.user);
const navigate = useNavigate();
const isAdmin = user?.role === 'ADMIN';

  const adminMenuItems = [
    {
      title: 'Danh mục Khoản Thu',
      description: 'Quản lý các loại phí và danh mục thu',
      icon: DollarSign,
      path: '/fee-types',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Quản Lý Khoản Thu',
      description: 'Xem và quản lý các hóa đơn thu phí',
      icon: Receipt,
      path: '/bills',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Quản Lý Hộ Gia Đình',
      description: 'Quản lý thông tin các hộ gia đình',
      icon: Home,
      path: '/households',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Quản Lý Cư Dân',
      description: 'Quản lý thông tin cư dân trong khu vực',
      icon: Users,
      path: '/residents',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Quản Lý Người Dùng',
      description: 'Quản lý tài khoản người dùng hệ thống',
      icon: UserCog,
      path: '/users',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
    {
      title: 'Thống Kê Doanh Thu',
      description: 'Xem báo cáo và biểu đồ thống kê',
      icon: BarChart3,
      path: '/statistics',
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50',
    },
    {
      title: 'Nhật Ký Hoạt Động',
      description: 'Xem lịch sử thao tác hệ thống',
      icon: FileText,
      path: '/logs',
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
    },
  ];

  const residentMenuItems = [
    {
      title: 'Thông Tin Cá Nhân',
      description: 'Xem và cập nhật thông tin tài khoản',
      icon: User,
      path: '/profile',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Khoản Thu Của Tôi',
      description: 'Xem hóa đơn và trạng thái thanh toán của hộ',
      icon: Receipt,
      path: '/my/bills',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Hộ Gia Đình Của Tôi',
      description: 'Xem thông tin hộ gia đình được gán',
      icon: Home,
      path: '/my/household',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Nhân Khẩu Trong Hộ',
      description: 'Xem danh sách cư dân thuộc hộ của bạn',
      icon: Users,
      path: '/my/residents',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  const menuItems = isAdmin ? adminMenuItems : residentMenuItems;

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 -z-10 bg-gradient-purple" />
      <div className="min-h-screen p-6 md:p-10">
        <div className="max-w-7xl mx-auto">
          <Card className="border-border">
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-col gap-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <LayoutDashboard className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h1 className="text-3xl font-bold">Trang Quản Trị</h1>
                        <p className="text-base text-muted-foreground">
                          Xin chào, <span className="font-semibold text-foreground">{user?.fullName || user?.username}</span>
                        </p>
                      </div>
                    </div>
                    {isAdmin && (
                      <div className="flex items-center gap-2 ml-15 mt-2">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                          Quản trị viên
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline"
                      onClick={() => navigate('/profile')} 
                      className="h-10 text-base px-4"
                    >
                      <User className="h-4 w-4 mr-2" />
                      Hồ sơ
                    </Button>
                    <Logout/>
                  </div>
                </div>

                {/* Quick Access Cards for Admin */}
                {isAdmin && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="border-border bg-gradient-to-br from-blue-50 to-blue-100/50 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/fee-types')}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-muted-foreground font-medium mb-1">Truy cập nhanh</p>
                            <p className="text-base font-bold text-blue-700">Danh mục phí</p>
                            <p className="text-xs text-blue-600 mt-1">Click để quản lý</p>
                          </div>
                          <div className="h-12 w-12 rounded-full bg-blue-600/10 flex items-center justify-center">
                            <DollarSign className="h-6 w-6 text-blue-600" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-border bg-gradient-to-br from-green-50 to-green-100/50 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/bills')}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-muted-foreground font-medium mb-1">Truy cập nhanh</p>
                            <p className="text-base font-bold text-green-700">Khoản thu</p>
                            <p className="text-xs text-green-600 mt-1">Click để quản lý</p>
                          </div>
                          <div className="h-12 w-12 rounded-full bg-green-600/10 flex items-center justify-center">
                            <Receipt className="h-6 w-6 text-green-600" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-border bg-gradient-to-br from-orange-50 to-orange-100/50 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/households')}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-muted-foreground font-medium mb-1">Truy cập nhanh</p>
                            <p className="text-base font-bold text-orange-700">Hộ gia đình</p>
                            <p className="text-xs text-orange-600 mt-1">Click để quản lý</p>
                          </div>
                          <div className="h-12 w-12 rounded-full bg-orange-600/10 flex items-center justify-center">
                            <Home className="h-6 w-6 text-orange-600" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-border bg-gradient-to-br from-purple-50 to-purple-100/50 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/residents')}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-muted-foreground font-medium mb-1">Truy cập nhanh</p>
                            <p className="text-base font-bold text-purple-700">Cư dân</p>
                            <p className="text-xs text-purple-600 mt-1">Click để quản lý</p>
                          </div>
                          <div className="h-12 w-12 rounded-full bg-purple-600/10 flex items-center justify-center">
                            <Users className="h-6 w-6 text-purple-600" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Menu Grid */}
                <div>
                  <h2 className="text-xl font-semibold mb-4">
                    {isAdmin ? 'Chức Năng Quản Trị' : 'Chức Năng'}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {menuItems.map((item, index) => {
                      const Icon = item.icon;
                      return (
                        <Card 
                          key={index}
                          className="border-border hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer group"
                          onClick={() => navigate(item.path)}
                        >
                          <CardContent className="p-6">
                            <div className="flex flex-col gap-4">
                              <div className="flex items-start justify-between">
                                <div className={`h-14 w-14 rounded-lg ${item.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                  <Icon className={`h-7 w-7 ${item.color}`} />
                                </div>
                              </div>
                              <div className="flex flex-col gap-2">
                                <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                                  {item.title}
                                </h3>
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {item.description}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>

                {/* Footer Info */}
                <div className="mt-4 pt-6 border-t border-border">
                  <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
                    <p>
                      © {new Date().getFullYear()} Bluemoon. Phiên bản 1.0
                    </p>
                    <p>
                      Đăng nhập với vai trò: <span className="font-semibold text-foreground">
                        {isAdmin ? 'Quản trị viên' : 'Cư dân'}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ChatAppPage