-- Xóa database cũ và tạo mới
DROP DATABASE IF EXISTS BlueMoon;
CREATE DATABASE BlueMoon;
USE BlueMoon;

-- =============================================
-- 1. QUẢN LÝ HỆ THỐNG & PHÂN QUYỀN (Epic E05)
-- =============================================

-- Bảng người dùng (BQL và Cư dân)
-- Đã bỏ role 'KETOAN'. 'ADMIN' đại diện cho Ban Quản Lý.
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    -- Chỉ giữ lại ADMIN (BQL) và RESIDENT (Cư dân)
    role ENUM('ADMIN', 'RESIDENT') NOT NULL DEFAULT 'RESIDENT',
    status ENUM('ACTIVE', 'LOCKED') DEFAULT 'ACTIVE',
    household_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Bảng Sessions (Quản lý phiên đăng nhập)
CREATE TABLE sessions (
    session_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    refresh_token VARCHAR(255) NOT NULL UNIQUE,
    expires_at DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_sessions_user_id (user_id),
    INDEX idx_sessions_refresh_token (refresh_token),
    INDEX idx_sessions_expires_at (expires_at)
);

-- =============================================
-- 2. QUẢN LÝ HỘ DÂN & NHÂN KHẨU (Epic E01)
-- =============================================

-- Bảng Hộ gia đình
CREATE TABLE households (
    household_id INT AUTO_INCREMENT PRIMARY KEY,
    household_code VARCHAR(20) NOT NULL UNIQUE, -- Mã hộ (VD: GMD_101)
    owner_name VARCHAR(100) NOT NULL, 
    address VARCHAR(255) NOT NULL, 
    area_sqm DECIMAL(10, 2), 
    user_id INT UNIQUE, -- Liên kết tài khoản Cư dân
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
);

-- Bảng Nhân khẩu
CREATE TABLE residents (
    resident_id INT AUTO_INCREMENT PRIMARY KEY,
    household_id INT NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    date_of_birth DATE,
    identity_card_number VARCHAR(20) UNIQUE, -- CCCD phải duy nhất
    relation_to_owner VARCHAR(50), 
    job VARCHAR(100), 
    phone_number VARCHAR(15),
    is_staying BOOLEAN DEFAULT TRUE, 
    FOREIGN KEY (household_id) REFERENCES households(household_id) ON DELETE CASCADE
);

-- =============================================
-- 3. QUẢN LÝ KHOẢN THU (Epic E02)
-- =============================================

-- Bảng Danh mục loại phí
-- BQL định nghĩa các loại phí tại đây
CREATE TABLE fee_types (
    fee_type_id INT AUTO_INCREMENT PRIMARY KEY,
    fee_name VARCHAR(100) NOT NULL, 
    unit_price DECIMAL(15, 2) NOT NULL, 
    unit VARCHAR(20), 
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE 
);

-- =============================================
-- 4. THU PHÍ & THANH TOÁN (Epic E03, E04)
-- =============================================

-- Bảng Hóa đơn / Công nợ hàng tháng
-- BQL (Admin) sẽ là người tạo hóa đơn
CREATE TABLE bills (
    bill_id INT AUTO_INCREMENT PRIMARY KEY,
    household_id INT NULL,
    billing_period DATE NOT NULL, 
    title VARCHAR(200), 
    total_amount DECIMAL(15, 2) DEFAULT 0, 
    paid_amount DECIMAL(15, 2) DEFAULT 0, 
    payment_status ENUM('UNPAID', 'PARTIAL', 'PAID') DEFAULT 'UNPAID', 
    created_by INT NULL, -- Người tạo là BQL (Admin)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (household_id) REFERENCES households(household_id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL
);

-- Bảng Chi tiết hóa đơn
CREATE TABLE bill_details (
    detail_id INT AUTO_INCREMENT PRIMARY KEY,
    bill_id INT NOT NULL,
    fee_type_id INT NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL, 
    current_unit_price DECIMAL(15, 2) NOT NULL, 
    amount DECIMAL(15, 2) NOT NULL, 
    note VARCHAR(255),
    FOREIGN KEY (bill_id) REFERENCES bills(bill_id) ON DELETE CASCADE,
    FOREIGN KEY (fee_type_id) REFERENCES fee_types(fee_type_id)
);

-- Bảng Giao dịch thanh toán (Lịch sử thu tiền)
-- BQL (Admin) trực tiếp thu tiền và ghi nhận vào hệ thống
CREATE TABLE transactions (
    transaction_id INT AUTO_INCREMENT PRIMARY KEY,
    bill_id INT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL, 
    payment_method ENUM('CASH', 'TRANSFER') NOT NULL, 
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    collector_id INT NULL, -- Người thu tiền là BQL (Admin)
    transaction_code VARCHAR(50), 
    note TEXT, 
    FOREIGN KEY (bill_id) REFERENCES bills(bill_id),
    FOREIGN KEY (collector_id) REFERENCES users(user_id) ON DELETE SET NULL
);



-- =============================================
-- 17/12/2025: Thay đổi cách thức ghi nhận thu phí
DROP TABLE IF EXISTS bill_details;
DROP TABLE IF EXISTS transactions;

-- Thêm cột Loại phí tham chiếu sang bảng fee_types
ALTER TABLE bills
ADD COLUMN fee_type_id INT NULL,
ADD CONSTRAINT fk_bill_fee_type
FOREIGN KEY (fee_type_id) REFERENCES fee_types(fee_type_id) ON DELETE SET NULL;

-- Định danh người thực hiện thu tiền tham chiếu bảng users
ALTER TABLE bills
ADD COLUMN collector_id INT NULL,
ADD CONSTRAINT fk_bill_collector
FOREIGN KEY (collector_id) REFERENCES users(user_id) ON DELETE SET NULL;


-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX idx_household_search ON households(household_code, owner_name, address);
CREATE INDEX idx_resident_search ON residents(full_name, identity_card_number);
CREATE INDEX idx_bills_household_id ON bills(household_id);
CREATE INDEX idx_bills_fee_status ON bills(fee_type_id, payment_status);
CREATE INDEX idx_bills_period_status ON bills(billing_period, payment_status);

-- =============================================
-- FOREIGN KEY: users -> households
-- =============================================
ALTER TABLE users
ADD CONSTRAINT fk_users_household
FOREIGN KEY (household_id) REFERENCES households(household_id) ON DELETE SET NULL;

CREATE INDEX idx_users_household_id ON users(household_id);

-- =============================================
-- 6. BẢNG LOGS (Nhật ký hoạt động chi tiết)
-- =============================================
CREATE TABLE logs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NULL,
    entity_id INT NULL,
    details TEXT NULL,
    ip_address VARCHAR(45) NULL,
    user_agent VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_logs_user_id (user_id),
    INDEX idx_logs_action (action),
    INDEX idx_logs_entity_type (entity_type),
    INDEX idx_logs_created_at (created_at)
);







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
