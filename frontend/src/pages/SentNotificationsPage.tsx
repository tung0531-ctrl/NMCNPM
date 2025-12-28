import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getSentNotifications, type SentNotification } from '@/services/notificationService';
import { toast } from 'sonner';
import { ArrowLeft, Eye, RefreshCw } from 'lucide-react';
import { formatUTCToLocal } from '@/lib/formatDate';

const SentNotificationsPage = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<SentNotification[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await getSentNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Lỗi tải thông báo:', error);
      toast.error('Không thể tải danh sách thông báo đã gửi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleViewDetail = (notification: SentNotification) => {
    navigate('/notification-detail', {
      state: {
        title: notification.title,
        message: notification.message,
        createdAt: notification.createdAt
      }
    });
  };

  const formatDate = (dateString: string) => formatUTCToLocal(dateString, 'vi-VN');

  const getReadPercentage = (readCount: number, total: number) => {
    return total > 0 ? Math.round((readCount / total) * 100) : 0;
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
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex items-center gap-4">
                    
                    <div>
                      <h1 className="text-3xl font-bold">Thông báo đã gửi</h1>
                      <p className="text-base text-muted-foreground mt-1">
                        Quản lý và theo dõi các thông báo đã gửi
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={fetchNotifications}
                      disabled={loading}
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                      Làm mới
                    </Button>
                    <Button onClick={() => navigate('/send-notification')}>
                      Gửi thông báo mới
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => navigate('/')}
                        className="inline-flex items-center px-3 py-2"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Về trang chủ
                    </Button>
                  </div>
                </div>

                {/* Notifications List */}
                {loading ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">Đang tải...</p>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground text-lg">
                      Chưa có thông báo nào được gửi
                    </p>
                    <Button
                      className="mt-4"
                      onClick={() => navigate('/send-notification')}
                    >
                      Gửi thông báo đầu tiên
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {notifications.map((notification, index) => {
                      const readPercentage = getReadPercentage(
                        notification.readCount,
                        notification.totalRecipients
                      );
                      
                      return (
                        <Card
                          key={index}
                          className="border-border hover:shadow-md transition-shadow"
                        >
                          <CardContent className="p-6">
                            <div className="flex flex-col gap-4">
                              <div className="flex justify-between items-start gap-4">
                                <div className="flex-1">
                                  <h3 className="text-xl font-semibold mb-2">
                                    {notification.title}
                                  </h3>
                                  <p className="text-muted-foreground mb-3">
                                    {notification.message}
                                  </p>
                                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                    <span>
                                      📅 {formatDate(notification.createdAt)}
                                    </span>
                                    <span>
                                      👥 {notification.totalRecipients} người nhận
                                    </span>
                                    <span className={readPercentage === 100 ? 'text-green-600 font-semibold' : ''}>
                                      ✅ {notification.readCount} đã đọc ({readPercentage}%)
                                    </span>
                                  </div>
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleViewDetail(notification)}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  Chi tiết
                                </Button>
                              </div>

                              {/* Progress Bar */}
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full transition-all ${
                                    readPercentage === 100
                                      ? 'bg-green-500'
                                      : readPercentage >= 50
                                      ? 'bg-blue-500'
                                      : 'bg-yellow-500'
                                  }`}
                                  style={{ width: `${readPercentage}%` }}
                                />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
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

export default SentNotificationsPage;
