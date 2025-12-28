import { useEffect, useState } from "react";
import { userService } from "../services/userService";
import type { User, CreateUserData, UpdateUserData } from "../services/userService";
import { getAllHouseholds, type Household } from "../services/householdService";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useNavigate } from "react-router";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";

const UserManagementPage = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [households, setHouseholds] = useState<Household[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });
  const [userStats, setUserStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    lockedUsers: 0,
    adminUsers: 0,
    residentUsers: 0
  });
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  const [formData, setFormData] = useState<CreateUserData>({
    username: "",
    email: "",
    fullName: "",
    password: "",
    role: "RESIDENT",
    status: "ACTIVE",
    householdId: null,
  });

  useEffect(() => {
    fetchUsers();
    fetchHouseholds();
  }, []);

  const fetchHouseholds = async () => {
    try {
      const data = await getAllHouseholds();
      setHouseholds(data);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Lỗi khi tải danh sách hộ gia đình");
    }
  };

  const handlePageChange = (newPage: number) => {
    fetchUsers(newPage, pagination.itemsPerPage, searchTerm);
  };

  const handleSearch = () => {
    fetchUsers(1, pagination.itemsPerPage, searchTerm);
  };

  const clearSearch = () => {
    setSearchTerm("");
    fetchUsers(1, pagination.itemsPerPage, "");
  };

  const fetchUsers = async (page = 1, limit = 10, search = "") => {
    setLoading(true);
    try {
      const data = await userService.getAllUsers();
      
      // Filter users based on search term
      const filteredUsers = data.filter((user: User) => {
        const searchLower = search.toLowerCase();
        return (
          user.username.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower) ||
          user.fullName.toLowerCase().includes(searchLower)
        );
      });

      // Calculate pagination
      const totalItems = filteredUsers.length;
      const totalPages = Math.ceil(totalItems / limit);
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

      setUsers(paginatedUsers);
      setPagination({
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit
      });

      // Calculate statistics
      setUserStats({
        totalUsers: data.length,
        activeUsers: data.filter((u: User) => u.status === 'ACTIVE').length,
        lockedUsers: data.filter((u: User) => u.status === 'LOCKED').length,
        adminUsers: data.filter((u: User) => u.role === 'ADMIN').length,
        residentUsers: data.filter((u: User) => u.role === 'RESIDENT').length
      });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Lỗi khi tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    try {
      await userService.createUser(formData);
      toast.success("Tạo người dùng thành công");
      setIsCreateDialogOpen(false);
      resetForm();
      await fetchUsers(pagination.currentPage, pagination.itemsPerPage, searchTerm);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Lỗi khi tạo người dùng");
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    
    const updateData: UpdateUserData = {};
    if (formData.username !== selectedUser.username) updateData.username = formData.username;
    if (formData.email !== selectedUser.email) updateData.email = formData.email;
    if (formData.fullName !== selectedUser.fullName) updateData.fullName = formData.fullName;
    if (formData.password) updateData.password = formData.password;
    if (formData.role !== selectedUser.role) updateData.role = formData.role;
    if (formData.status !== selectedUser.status) updateData.status = formData.status;
    if (formData.householdId !== selectedUser.householdId) updateData.householdId = formData.householdId;

    try {
      await userService.updateUser(selectedUser.userId, updateData);
      toast.success("Cập nhật người dùng thành công");
      setIsEditDialogOpen(false);
      resetForm();
      await fetchUsers(pagination.currentPage, pagination.itemsPerPage, searchTerm);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Lỗi khi cập nhật người dùng");
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      await userService.deleteUser(selectedUser.userId);
      toast.success("Xóa người dùng thành công");
      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
      await fetchUsers(pagination.currentPage, pagination.itemsPerPage, searchTerm);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Lỗi khi xóa người dùng");
    }
  };

  const openEditDialog = (user: User) => {
    setSelectedUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      password: "",
      role: user.role,
      status: user.status,
      householdId: user.householdId || null,
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (user: User) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      username: "",
      email: "",
      fullName: "",
      password: "",
      role: "RESIDENT",
      status: "ACTIVE",
      householdId: null,
    });
    setSelectedUser(null);
  };

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 -z-10 bg-gradient-purple" />
      <div className="min-h-screen p-6 md:p-10">
        <div className="max-w-7xl mx-auto">
          <Card className="border-border">
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-col gap-6">
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold">Quản lý người dùng</h1>
                    <p className="text-base text-muted-foreground">
                      Quản lý thông tin các người dùng trong hệ thống
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setIsCreateDialogOpen(true)}
                      className="h-10 text-base px-4"
                    >
                      Tạo người dùng mới
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => navigate('/')}
                      className="h-10 text-base px-4"
                    >
                      ← Về trang chủ
                    </Button>
                  </div>
                </div>

                {/* Search */}
                <div className="flex gap-4 items-end">
                  <div className="flex-1">
                    <Label htmlFor="search" className="text-base">Tìm kiếm</Label>
                    <Input
                      id="search"
                      placeholder="Tìm theo tên đăng nhập, email hoặc họ tên..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="h-10 text-base"
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                  </div>
                  <Button onClick={handleSearch} disabled={loading} className="h-10 text-base px-4">
                    {loading ? 'Đang tìm...' : 'Tìm kiếm'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={clearSearch}
                    disabled={loading}
                    className="h-10 text-base px-4"
                  >
                    Xóa tìm kiếm
                  </Button>
                </div>

                {/* Users List */}
                <div className="rounded-lg border border-border overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-muted">
                        <tr>
                          <th className="px-4 py-3 text-left text-base font-semibold">ID</th>
                          <th className="px-4 py-3 text-left text-base font-semibold">Tên đăng nhập</th>
                          <th className="px-4 py-3 text-left text-base font-semibold">Email</th>
                          <th className="px-4 py-3 text-left text-base font-semibold">Họ tên</th>
                          <th className="px-4 py-3 text-left text-base font-semibold">Vai trò</th>
                          <th className="px-4 py-3 text-left text-base font-semibold">Hộ gia đình</th>
                          <th className="px-4 py-3 text-left text-base font-semibold">Trạng thái</th>
                          <th className="px-4 py-3 text-center text-base font-semibold">Hành động</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {loading ? (
                          <tr>
                            <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                              Đang tải...
                            </td>
                          </tr>
                        ) : users.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                              Không tìm thấy người dùng nào
                            </td>
                          </tr>
                        ) : (
                          users.map((user) => (
                            <tr key={user.userId} className="hover:bg-muted/50 transition-colors">
                              <td className="px-4 py-3 text-base">{user.userId}</td>
                              <td className="px-4 py-3 text-base font-medium">{user.username}</td>
                              <td className="px-4 py-3 text-base">{user.email}</td>
                              <td className="px-4 py-3 text-base">{user.fullName}</td>
                              <td className="px-4 py-3 text-base">
                                <span
                                  className={`px-2 py-1 rounded text-xs font-semibold ${
                                    user.role === "ADMIN"
                                      ? "bg-purple-100 text-purple-800"
                                      : "bg-blue-100 text-blue-800"
                                  }`}
                                >
                                  {user.role}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-base">
                                {user.household ? (
                                  <div className="flex flex-col">
                                    <span className="font-medium text-sm">{user.household.householdCode}</span>
                                    <span className="text-xs text-muted-foreground">{user.household.ownerName}</span>
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground text-sm italic">Chưa gán</span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-base">
                                <span
                                  className={`px-2 py-1 rounded text-xs font-semibold ${
                                    user.status === "ACTIVE"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {user.status}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <div className="flex gap-2 justify-center">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => openEditDialog(user)}
                                    className="h-9 text-base"
                                  >
                                    Sửa
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => openDeleteDialog(user)}
                                    className="h-9 text-base"
                                  >
                                    Xóa
                                  </Button>
                                </div>
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
                    <div className="text-base text-muted-foreground">
                      Hiển thị {users.length} trong tổng số {pagination.totalItems} người dùng
                    </div>
                    <div className="flex gap-2 items-center flex-wrap">
                      <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(1)}
                          disabled={pagination.currentPage === 1 || loading}
                          title="Trang đầu"
                        >
                          ««
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(pagination.currentPage - 1)}
                          disabled={pagination.currentPage === 1 || loading}
                        >
                          ‹ Trước
                      </Button>
                      
                      <div className="flex items-center gap-1">
                          {(() => {
                            const current = pagination.currentPage;
                            const total = pagination.totalPages;
                            const pages = [];
                            
                            if (total <= 7) {
                              for (let i = 1; i <= total; i++) {
                                pages.push(i);
                              }
                            } else {
                              pages.push(1);
                              
                              if (current > 3) {
                                pages.push('...');
                              }
                              
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
                      
                      <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(pagination.currentPage + 1)}
                          disabled={pagination.currentPage === pagination.totalPages || loading}
                        >
                          Sau ›
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(pagination.totalPages)}
                          disabled={pagination.currentPage === pagination.totalPages || loading}
                          title="Trang cuối"
                        >
                          »»
                      </Button>
                      
                      <div className="flex items-center gap-2 ml-2">
                          <span className="text-base text-muted-foreground">Đến trang:</span>
                          <input
                            type="number"
                            min="1"
                            max={pagination.totalPages}
                            placeholder={pagination.currentPage.toString()}
                            className="w-20 px-3 py-2 text-base border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
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

                {/* Statistics */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <Card className="border-border">
                      <CardContent className="p-4">
                        <p className="text-base text-muted-foreground">Tổng số tài khoản</p>
                        <p className="text-2xl font-bold">{userStats.totalUsers}</p>
                      </CardContent>
                    </Card>
                    <Card className="border-border">
                      <CardContent className="p-4">
                        <p className="text-base text-muted-foreground">Đang hoạt động</p>
                        <p className="text-2xl font-bold text-green-600">{userStats.activeUsers}</p>
                      </CardContent>
                    </Card>
                    <Card className="border-border">
                      <CardContent className="p-4">
                        <p className="text-base text-muted-foreground">Bị khóa</p>
                        <p className="text-2xl font-bold text-red-600">{userStats.lockedUsers}</p>
                      </CardContent>
                    </Card>
                    <Card className="border-border">
                      <CardContent className="p-4">
                        <p className="text-base text-muted-foreground">Quản trị viên</p>
                        <p className="text-2xl font-bold text-purple-600">{userStats.adminUsers}</p>
                      </CardContent>
                    </Card>
                    <Card className="border-border">
                      <CardContent className="p-4">
                        <p className="text-base text-muted-foreground">Cư dân</p>
                        <p className="text-2xl font-bold text-blue-600">{userStats.residentUsers}</p>
                      </CardContent>
                    </Card>
                  </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Create User Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Tạo người dùng mới</DialogTitle>
            <DialogDescription>
              Nhập thông tin để tạo người dùng mới
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 px-1 overflow-y-auto max-h-[60vh]">
            <div className="grid gap-2">
              <Label htmlFor="create-username">Tên đăng nhập</Label>
              <Input
                id="create-username"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                placeholder="Nhập tên đăng nhập..."
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="create-email">Email</Label>
              <Input
                id="create-email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="Nhập email..."
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="create-fullname">Họ tên</Label>
              <Input
                id="create-fullname"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                placeholder="Nhập họ tên..."
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="create-password">Mật khẩu</Label>
              <Input
                id="create-password"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder="Nhập mật khẩu..."
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="create-role">Vai trò</Label>
              <select
                id="create-role"
                aria-label="Chọn vai trò người dùng"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value as "ADMIN" | "RESIDENT" })
                }
              >
                <option value="RESIDENT">RESIDENT</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="create-status">Trạng thái</Label>
              <select
                id="create-status"
                aria-label="Chọn trạng thái tài khoản"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as "ACTIVE" | "LOCKED" })
                }
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="LOCKED">LOCKED</option>
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-household">Hộ gia đình</Label>
              <select
                id="create-household"
                aria-label="Chọn hộ gia đình"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.householdId || ""}
                onChange={(e) =>
                  setFormData({ ...formData, householdId: e.target.value ? Number(e.target.value) : null })
                }
                onFocus={fetchHouseholds}
                >
                <option value="">-- Không gán hộ gia đình --</option>
                {households.map((household) => (
                  <option key={household.householdId} value={household.householdId}>
                    {household.householdCode} - {household.ownerName}
                  </option>
                  ))}
                </select>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsCreateDialogOpen(false);
                resetForm();
              }}
            >
              Hủy
            </Button>
            <Button onClick={handleCreateUser}>Tạo mới</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa thông tin người dùng</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin người dùng
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 px-1 overflow-y-auto max-h-[60vh]">
            <div className="grid gap-2">
              <Label htmlFor="edit-username">Tên đăng nhập</Label>
              <Input
                id="edit-username"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                placeholder="Nhập tên đăng nhập..."
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="Nhập email..."
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-fullname">Họ tên</Label>
              <Input
                id="edit-fullname"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                placeholder="Nhập họ tên..."
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-password">Mật khẩu mới (để trống nếu không đổi)</Label>
              <Input
                id="edit-password"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder="Nhập mật khẩu mới..."
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-role">Vai trò</Label>
              <select
                id="edit-role"
                aria-label="Chọn vai trò người dùng"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value as "ADMIN" | "RESIDENT" })
                }
              >
                <option value="RESIDENT">RESIDENT</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-status">Trạng thái</Label>
              <select
                id="edit-status"
                aria-label="Chọn trạng thái tài khoản"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as "ACTIVE" | "LOCKED" })
                }
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="LOCKED">LOCKED</option>
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-household">Hộ gia đình</Label>
              <select
                id="create-household"
                aria-label="Chọn hộ gia đình"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.householdId || ""}
                onChange={(e) =>
                  setFormData({ ...formData, householdId: e.target.value ? Number(e.target.value) : null })
                }
                onFocus={fetchHouseholds}
                >
                <option value="">-- Không gán hộ gia đình --</option>
                {households.map((household) => (
                  <option key={household.householdId} value={household.householdId}>
                    {household.householdCode} - {household.ownerName}
                  </option>
                  ))}
                </select>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsEditDialogOpen(false);
                resetForm();
              }}
            >
              Hủy
            </Button>
            <Button onClick={handleUpdateUser}>Cập nhật</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa người dùng "{selectedUser?.username}"?
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser}>Xóa</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UserManagementPage;
