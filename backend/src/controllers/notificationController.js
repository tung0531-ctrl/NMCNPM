import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { createLog, LogActions, EntityTypes } from '../utils/logger.js';

// Send notification to multiple users
export const sendNotificationToUsers = async (req, res) => {
  try {
    const { userIds, title, message } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ message: 'Danh sách người dùng không hợp lệ.' });
    }

    if (!title || !message) {
      return res.status(400).json({ message: 'Thiếu tiêu đề hoặc nội dung thông báo.' });
    }

    // Create notifications for all users
    const notifications = userIds.map(userId => ({
      userId,
      title,
      message,
      isRead: false
    }));

    const created = await Notification.bulkCreate(notifications);

    await createLog(
      req.user.userId,
      LogActions.CREATE_NOTIFICATION,
      EntityTypes.NOTIFICATION,
      null,
      { userIds, title, count: created.length },
      req
    );

    return res.status(201).json({
      message: `Đã gửi thông báo đến ${created.length} người dùng.`,
      count: created.length
    });
  } catch (error) {
    console.error('Lỗi gửi thông báo:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ nội bộ.' });
  }
};

// Get notifications for current user
export const getMyNotifications = async (req, res) => {
  try {
    const userId = req.user.userId;

    const notifications = await Notification.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']]
    });

    return res.status(200).json(notifications);
  } catch (error) {
    console.error('Lỗi lấy thông báo:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ nội bộ.' });
  }
};

// Mark notification as read
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const notification = await Notification.findByPk(id);

    if (!notification) {
      return res.status(404).json({ message: 'Không tìm thấy thông báo.' });
    }

    if (notification.userId !== userId) {
      return res.status(403).json({ message: 'Không có quyền truy cập thông báo này.' });
    }

    notification.isRead = true;
    await notification.save();

    await createLog(
      userId,
      LogActions.MARK_NOTIFICATION_READ,
      EntityTypes.NOTIFICATION,
      id,
      { title: notification.title },
      req
    );

    return res.status(200).json({ message: 'Đã đánh dấu đã đọc.', notification });
  } catch (error) {
    console.error('Lỗi đánh dấu thông báo:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ nội bộ.' });
  }
};

// Get unread count for current user
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.userId;

    const count = await Notification.count({
      where: { userId, isRead: false }
    });

    return res.status(200).json({ count });
  } catch (error) {
    console.error('Lỗi đếm thông báo chưa đọc:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ nội bộ.' });
  }
};

// Get all sent notifications with read statistics (Admin only)
export const getSentNotifications = async (req, res) => {
  try {
    const { sequelize } = Notification;

    // Group notifications by title and message with statistics
    const notifications = await sequelize.query(`
      SELECT 
        title,
        message,
        MAX(created_at) as createdAt,
        COUNT(*) as totalRecipients,
        SUM(CASE WHEN is_read = 1 THEN 1 ELSE 0 END) as readCount
      FROM notifications
      GROUP BY title, message
      ORDER BY MAX(created_at) DESC
    `, {
      type: sequelize.QueryTypes.SELECT
    });

    console.log('Notifications found:', notifications.length);
    return res.status(200).json(notifications);
  } catch (error) {
    console.error('Lỗi lấy thông báo đã gửi:', error);
    console.error('Error details:', error.message);
    return res.status(500).json({ message: 'Lỗi máy chủ nội bộ.', error: error.message });
  }
};

// Get recipients and read status for a specific notification (Admin only)
export const getNotificationRecipients = async (req, res) => {
  try {
    const { title, message, createdAt } = req.query;

    if (!title || !message || !createdAt) {
      return res.status(400).json({ message: 'Thiếu thông tin thông báo.' });
    }

    // Find notifications with same title and message created on the same batch
    const notifications = await Notification.findAll({
      where: {
        title,
        message
      },
      include: [
        {
          model: User,
          as: 'User',
          attributes: ['userId', 'username', 'fullName', 'email']
        }
      ],
      order: [['isRead', 'ASC'], ['updatedAt', 'DESC']]
    });

    return res.status(200).json(notifications);
  } catch (error) {
    console.error('Lỗi lấy danh sách người nhận:', error);
    console.error('Error details:', error.message);
    return res.status(500).json({ message: 'Lỗi máy chủ nội bộ.', error: error.message });
  }
};
