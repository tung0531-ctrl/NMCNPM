import api from '../lib/axios';

export interface Notification {
  notificationId: number;
  userId: number;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SendNotificationPayload {
  userIds: number[];
  title: string;
  message: string;
}

export interface SentNotification {
  title: string;
  message: string;
  createdAt: string;
  totalRecipients: number;
  readCount: number;
}

export interface NotificationRecipient {
  notificationId: number;
  userId: number;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  User: {
    userId: number;
    username: string;
    fullName: string;
    email: string;
  };
}

export const getMyNotifications = async () => {
  const response = await api.get('/notifications');
  return response.data;
};

export const getUnreadCount = async () => {
  const response = await api.get('/notifications/unread-count');
  return response.data;
};

export const markAsRead = async (id: number) => {
  const response = await api.put(`/notifications/${id}/read`);
  return response.data;
};

export const sendNotificationToUsers = async (payload: SendNotificationPayload) => {
  const response = await api.post('/notifications/send', payload);
  return response.data;
};

export const getSentNotifications = async (): Promise<SentNotification[]> => {
  const response = await api.get('/notifications/sent');
  return response.data;
};

export const getNotificationRecipients = async (
  title: string,
  message: string,
  createdAt: string
): Promise<NotificationRecipient[]> => {
  const response = await api.get('/notifications/recipients', {
    params: { title, message, createdAt }
  });
  return response.data;
};
