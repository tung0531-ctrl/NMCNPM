-- Tạo bảng notifications để lưu thông tin thông báo
CREATE TABLE IF NOT EXISTS notifications (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key constraint
    CONSTRAINT fk_notification_user
        FOREIGN KEY (user_id) 
        REFERENCES users(user_id)
        ON DELETE CASCADE,
    
    -- Indexes for better query performance
    INDEX idx_user_id (user_id),
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Thêm comment cho bảng và các cột
ALTER TABLE notifications COMMENT = 'Bảng lưu trữ thông báo gửi đến người dùng';
