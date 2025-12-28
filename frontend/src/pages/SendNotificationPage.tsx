import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { userService, type User } from '@/services/userService';
import { sendNotificationToUsers } from '@/services/notificationService';
import { toast } from 'sonner';

const SendNotificationPage = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const data = await userService.getAllUsers();
        // Filter only RESIDENT users
        setUsers(data.filter((u: User) => u.role === 'RESIDENT'));
      } catch (error) {
        console.error('Lỗi tải người dùng:', error);
        toast.error('Không thể tải danh sách người dùng');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleToggleUser = (userId: number) => {
    setSelectedUserIds(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUserIds.length === users.length) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(users.map(u => u.userId));
    }
  };

  const handleSend = async () => {
    if (selectedUserIds.length === 0) {
      toast.error('Vui lòng chọn ít nhất một người dùng');
      return;
    }
    if (!title.trim() || !message.trim()) {
      toast.error('Vui lòng nhập đầy đủ tiêu đề và nội dung');
      return;
    }

    try {
      setSending(true);
      await sendNotificationToUsers({ userIds: selectedUserIds, title, message });
      toast.success(`Đã gửi thông báo đến ${selectedUserIds.length} người dùng`);
      setTitle('');
      setMessage('');
      setSelectedUserIds([]);
    } catch (error) {
      console.error('Lỗi gửi thông báo:', error);
      toast.error('Không thể gửi thông báo');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 -z-10 bg-gradient-purple" />
      <div className="min-h-screen p-6 md:p-10">
        <div className="max-w-6xl mx-auto">
          <Card className="border-border">
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-col gap-6">
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold">Gửi thông báo</h1>
                    <p className="text-base text-muted-foreground">
                      Gửi thông báo đến nhiều người dùng cùng lúc
                    </p>
                  </div>
                  <Button variant="outline" onClick={() => navigate('/')} className="h-10 text-base px-4">
                    ← Về trang chủ
                  </Button>
                </div>

                {/* Form */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left: User Selection */}
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">
                          Chọn người nhận ({selectedUserIds.length}/{users.length})
                        </h3>
                        <Button onClick={handleSelectAll} variant="outline" size="sm">
                          {selectedUserIds.length === users.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                        </Button>
                      </div>
                      {loading ? (
                        <p className="text-muted-foreground">Đang tải...</p>
                      ) : (
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                          {users.map((user) => (
                            <label
                              key={user.userId}
                              className="flex items-center gap-3 p-3 border rounded cursor-pointer hover:bg-muted/50"
                            >
                              <input
                                type="checkbox"
                                checked={selectedUserIds.includes(user.userId)}
                                onChange={() => handleToggleUser(user.userId)}
                                className="w-4 h-4"
                              />
                              <div className="flex-1">
                                <p className="font-medium">{user.fullName}</p>
                                <p className="text-sm text-muted-foreground">{user.username}</p>
                              </div>
                            </label>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Right: Message Form */}
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold mb-4">Nội dung thông báo</h3>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="title">Tiêu đề</Label>
                          <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Nhập tiêu đề thông báo"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="message">Nội dung</Label>
                          <textarea
                            id="message"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Nhập nội dung thông báo"
                            rows={8}
                            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          />
                        </div>
                        <Button
                          onClick={handleSend}
                          disabled={sending || selectedUserIds.length === 0 || !title.trim() || !message.trim()}
                          className="w-full h-11"
                        >
                          {sending ? 'Đang gửi...' : `Gửi thông báo đến ${selectedUserIds.length} người dùng`}
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
    </div>
  );
};

export default SendNotificationPage;
