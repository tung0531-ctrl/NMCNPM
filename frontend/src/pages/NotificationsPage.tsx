import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getMyNotifications, markAsRead, type Notification } from '@/services/notificationService';
import { toast } from 'sonner';
import { formatUTCToLocal } from '@/lib/formatDate';

const NotificationsPage = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await getMyNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Lỗi tải thông báo:', error);
      toast.error('Không thể tải thông báo');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id: number) => {
    try {
      await markAsRead(id);
      setNotifications(prev =>
        prev.map(n => (n.notificationId === id ? { ...n, isRead: true } : n))
      );
      toast.success('Đã đánh dấu đã đọc');
    } catch (error) {
      console.error('Lỗi đánh dấu thông báo:', error);
      toast.error('Không thể đánh dấu thông báo');
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 -z-10 bg-gradient-purple" />
      <div className="min-h-screen p-6 md:p-10">
        <div className="max-w-5xl mx-auto">
          <Card className="border-border">
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-col gap-6">
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold">Thông báo của tôi</h1>
                    <p className="text-base text-muted-foreground">
                      {unreadCount > 0 ? `Bạn có ${unreadCount} thông báo chưa đọc` : 'Tất cả thông báo đã được đọc'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={fetchNotifications} variant="outline" className="h-10 text-base px-4">
                      Làm mới
                    </Button>
                    <Button variant="outline" onClick={() => navigate('/')} className="h-10 text-base px-4">
                      ← Về trang chủ
                    </Button>
                  </div>
                </div>

                {/* Notifications List */}
                {loading ? (
                  <div className="text-center py-16 text-base text-muted-foreground">Đang tải...</div>
                ) : notifications.length === 0 ? (
                  <div className="text-center py-16 text-base text-muted-foreground">
                    Chưa có thông báo nào.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {notifications.map((notification) => (
                      <Card
                        key={notification.notificationId}
                        className={`${!notification.isRead ? 'border-blue-500 bg-blue-50/50' : 'border-border'}`}
                      >
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex-1">
                              <div className="flex items-start gap-2">
                                <h3 className="text-lg font-semibold">{notification.title}</h3>
                                {!notification.isRead && (
                                  <span className="px-2 py-1 text-xs bg-blue-500 text-white rounded-full">
                                    Mới
                                  </span>
                                )}
                              </div>
                              <p className="text-base text-muted-foreground mt-2">
                                {notification.message}
                              </p>
                              <p className="text-sm text-muted-foreground mt-3">
                                {formatUTCToLocal(notification.createdAt, 'vi-VN', { month: 'long' })}
                              </p>
                            </div>
                            {!notification.isRead && (
                              <Button
                                onClick={() => handleMarkAsRead(notification.notificationId)}
                                variant="outline"
                                className="h-9 text-sm"
                              >
                                Đánh dấu đã đọc
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
