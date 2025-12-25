import { useEffect, useState } from "react";
import { userService } from "../services/userService";
import type { User, CreateUserData, UpdateUserData } from "../services/userService";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
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
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
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
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await userService.getAllUsers();
      setUsers(data);
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
      fetchUsers();
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

    try {
      await userService.updateUser(selectedUser.userId, updateData);
      toast.success("Cập nhật người dùng thành công");
      setIsEditDialogOpen(false);
      resetForm();
      fetchUsers();
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
      fetchUsers();
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
    });
    setSelectedUser(null);
  };

  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Quản lý người dùng</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4 gap-4">
            <Input
              placeholder="Tìm kiếm người dùng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              Thêm người dùng mới
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-8">Đang tải...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-2 text-left">ID</th>
                    <th className="border p-2 text-left">Tên đăng nhập</th>
                    <th className="border p-2 text-left">Email</th>
                    <th className="border p-2 text-left">Họ tên</th>
                    <th className="border p-2 text-left">Vai trò</th>
                    <th className="border p-2 text-left">Trạng thái</th>
                    <th className="border p-2 text-center">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.userId} className="hover:bg-gray-50">
                      <td className="border p-2">{user.userId}</td>
                      <td className="border p-2">{user.username}</td>
                      <td className="border p-2">{user.email}</td>
                      <td className="border p-2">{user.fullName}</td>
                      <td className="border p-2">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            user.role === "ADMIN"
                              ? "bg-purple-200 text-purple-800"
                              : "bg-blue-200 text-blue-800"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="border p-2">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            user.status === "ACTIVE"
                              ? "bg-green-200 text-green-800"
                              : "bg-red-200 text-red-800"
                          }`}
                        >
                          {user.status}
                        </span>
                      </td>
                      <td className="border p-2 text-center">
                        <div className="flex gap-2 justify-center">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditDialog(user)}
                          >
                            Sửa
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => openDeleteDialog(user)}
                          >
                            Xóa
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={7} className="border p-4 text-center text-gray-500">
                        Không tìm thấy người dùng nào
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create User Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thêm người dùng mới</DialogTitle>
            <DialogDescription>
              Nhập thông tin người dùng mới
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="create-username">Tên đăng nhập</Label>
              <Input
                id="create-username"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="create-email">Email</Label>
              <Input
                id="create-email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="create-fullname">Họ tên</Label>
              <Input
                id="create-fullname"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="create-password">Mật khẩu</Label>
              <Input
                id="create-password"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="create-role">Vai trò</Label>
              <select
                id="create-role"
                className="w-full border rounded p-2"
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value as "ADMIN" | "RESIDENT" })
                }
              >
                <option value="RESIDENT">RESIDENT</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>
            <div>
              <Label htmlFor="create-status">Trạng thái</Label>
              <select
                id="create-status"
                className="w-full border rounded p-2"
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as "ACTIVE" | "LOCKED" })
                }
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="LOCKED">LOCKED</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsCreateDialogOpen(false);
              resetForm();
            }}>
              Hủy
            </Button>
            <Button onClick={handleCreateUser}>Tạo</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sửa thông tin người dùng</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin người dùng
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-username">Tên đăng nhập</Label>
              <Input
                id="edit-username"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="edit-fullname">Họ tên</Label>
              <Input
                id="edit-fullname"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="edit-password">Mật khẩu mới (để trống nếu không đổi)</Label>
              <Input
                id="edit-password"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="edit-role">Vai trò</Label>
              <select
                id="edit-role"
                className="w-full border rounded p-2"
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value as "ADMIN" | "RESIDENT" })
                }
              >
                <option value="RESIDENT">RESIDENT</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>
            <div>
              <Label htmlFor="edit-status">Trạng thái</Label>
              <select
                id="edit-status"
                className="w-full border rounded p-2"
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as "ACTIVE" | "LOCKED" })
                }
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="LOCKED">LOCKED</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsEditDialogOpen(false);
              resetForm();
            }}>
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
