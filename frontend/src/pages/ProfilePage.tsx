import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuthStore } from '../stores/useAuthStore';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import api from '../lib/axios';
import { toast } from 'sonner';

const ProfilePage = () => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Mật khẩu mới không khớp');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }

    try {
      setLoading(true);
      await api.put('/users/me/password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success('Đổi mật khẩu thành công');
      setShowPasswordDialog(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Lỗi đổi mật khẩu');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="relative min-h-screen">
        <div className="fixed inset-0 -z-10 bg-gradient-purple" />
        <div className="flex items-center justify-center h-screen">
          <div className="text-xl">Đang tải thông tin...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 -z-10 bg-gradient-purple" />
      <div className="min-h-screen p-6 md:p-10">
        <div className="max-w-4xl mx-auto">
          <Card className="border-border">
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-col gap-6">
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold">Thông Tin Cá Nhân</h1>
                    <p className="text-base text-muted-foreground">
                      Xem và quản lý thông tin tài khoản của bạn
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => navigate('/')}
                      className="h-10 text-base px-4"
                    >
                      ← Về trang chủ
                    </Button>
                  </div>
                </div>

                {/* Profile Information */}
                <div className="grid gap-6">
                  <Card className="border-border">
                    <CardContent className="p-6">
                      <h2 className="text-xl font-semibold mb-4">Thông tin tài khoản</h2>
                      <div className="grid gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="username" className="text-base">Tên đăng nhập</Label>
                          <Input
                            id="username"
                            value={user.username}
                            disabled
                            className="h-10 text-base bg-muted"
                          />
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="email" className="text-base">Email</Label>
                          <Input
                            id="email"
                            value={user.email || ''}
                            disabled
                            className="h-10 text-base bg-muted"
                          />
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="fullName" className="text-base">Họ và tên</Label>
                          <Input
                            id="fullName"
                            value={user.fullName}
                            disabled
                            className="h-10 text-base bg-muted"
                          />
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="role" className="text-base">Vai trò</Label>
                          <Input
                            id="role"
                            value={user.role === 'ADMIN' ? 'Quản trị viên' : 'Cư dân'}
                            disabled
                            className="h-10 text-base bg-muted"
                          />
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="status" className="text-base">Trạng thái</Label>
                          <Input
                            id="status"
                            value={(user as { status?: string })?.status === 'ACTIVE' ? 'Hoạt động' : 'Bị khóa'}
                            disabled
                            className="h-10 text-base bg-muted"
                          />
                        </div>

                        {user.role === 'RESIDENT' && (
                          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-sm text-blue-800">
                              <strong>Lưu ý:</strong> Các thông tin cá nhân chỉ được quản trị viên chỉnh sửa.
                              Vui lòng liên hệ admin nếu cần thay đổi thông tin.
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Password Section */}
                  <Card className="border-border">
                    <CardContent className="p-6">
                      <h2 className="text-xl font-semibold mb-4">Bảo mật</h2>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-base font-medium">Mật khẩu</p>
                          <p className="text-sm text-muted-foreground">
                            Thay đổi mật khẩu của bạn để bảo vệ tài khoản
                          </p>
                        </div>
                        <Button
                          onClick={() => setShowPasswordDialog(true)}
                          className="h-10 text-base px-6"
                        >
                          Đổi mật khẩu
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Change Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-2xl">Đổi mật khẩu</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="currentPassword" className="text-base">Mật khẩu hiện tại</Label>
              <Input
                id="currentPassword"
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                className="h-10 text-base"
                placeholder="Nhập mật khẩu hiện tại"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="newPassword" className="text-base">Mật khẩu mới</Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                className="h-10 text-base"
                placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirmPassword" className="text-base">Xác nhận mật khẩu mới</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                className="h-10 text-base"
                placeholder="Nhập lại mật khẩu mới"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowPasswordDialog(false);
                setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
              }}
              className="h-10 text-base"
            >
              Hủy
            </Button>
            <Button
              onClick={handleChangePassword}
              disabled={loading}
              className="h-10 text-base"
            >
              {loading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfilePage;
