-- Script để insert dữ liệu mẫu vào database BlueMoon
USE BlueMoon;

-- Insert sample users (collectors)
INSERT INTO users (username, password_hash, full_name, email, role, status) VALUES
('admin1', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Trần Thị Thu', 'thu@example.com', 'ADMIN', 'ACTIVE'),
('admin2', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Nguyễn Văn Hùng', 'hung@example.com', 'ADMIN', 'ACTIVE')
ON DUPLICATE KEY UPDATE username=username;

-- Insert sample fee types
INSERT INTO fee_types (fee_name, unit_price, unit, description, is_active) VALUES
('Phí quản lý', 15000, 'm²', 'Phí quản lý chung cư hàng tháng', TRUE),
('Phí gửi xe', 100000, 'xe', 'Phí gửi xe máy/ô tô', TRUE),
('Phí điện nước', 150000, 'hộ', 'Phí điện nước chung', TRUE),
('Phí internet', 50000, 'hộ', 'Phí internet chung', TRUE)
ON DUPLICATE KEY UPDATE fee_name=fee_name;

-- Insert sample households
INSERT INTO households (household_code, owner_name, address, area_sqm) VALUES
('GMD_101', 'Nguyễn Văn A', 'Tầng 1, Căn 101', 80.5),
('GMD_102', 'Trần Thị B', 'Tầng 1, Căn 102', 65.0),
('GMD_103', 'Lê Văn C', 'Tầng 1, Căn 103', 75.0),
('GMD_104', 'Phạm Thị D', 'Tầng 1, Căn 104', 80.5),
('GMD_201', 'Hoàng Văn E', 'Tầng 2, Căn 201', 80.5),
('GMD_202', 'Vũ Thị F', 'Tầng 2, Căn 202', 90.0),
('GMD_203', 'Đỗ Văn G', 'Tầng 2, Căn 203', 80.5),
('GMD_204', 'Ngô Thị H', 'Tầng 2, Căn 204', 80.5),
('GMD_301', 'Bùi Văn I', 'Tầng 3, Căn 301', 85.0),
('GMD_302', 'Trương Thị K', 'Tầng 3, Căn 302', 65.0),
('GMD_303', 'Phan Văn L', 'Tầng 3, Căn 303', 80.5),
('GMD_304', 'Đinh Thị M', 'Tầng 3, Căn 304', 80.5),
('GMD_401', 'Lý Văn N', 'Tầng 4, Căn 401', 75.0),
('GMD_402', 'Mai Thị O', 'Tầng 4, Căn 402', 65.0),
('GMD_403', 'Tô Văn P', 'Tầng 4, Căn 403', 80.5),
('GMD_404', 'Cao Thị Q', 'Tầng 4, Căn 404', 80.5),
('GMD_501', 'Lưu Văn R', 'Tầng 5, Căn 501', 90.0),
('GMD_502', 'Võ Thị S', 'Tầng 5, Căn 502', 65.0),
('GMD_503', 'Đặng Văn T', 'Tầng 5, Căn 503', 80.5),
('GMD_504', 'Dương Thị U', 'Tầng 5, Căn 504', 80.5),
('GMD_601', 'Hồ Văn V', 'Tầng 6, Căn 601', 75.0),
('GMD_602', 'Huỳnh Thị W', 'Tầng 6, Căn 602', 65.0),
('GMD_603', 'Tạ Văn X', 'Tầng 6, Căn 603', 80.5),
('GMD_604', 'Thái Thị Y', 'Tầng 6, Căn 604', 80.5),
('GMD_701', 'Từ Văn Z', 'Tầng 7, Căn 701', 85.0)
ON DUPLICATE KEY UPDATE household_code=household_code;

-- Get IDs for users and fee_types (assuming auto-increment starts from 1)
SET @admin1_id = (SELECT user_id FROM users WHERE username = 'admin1');
SET @admin2_id = (SELECT user_id FROM users WHERE username = 'admin2');
SET @fee_type_id = (SELECT fee_type_id FROM fee_types WHERE fee_name = 'Phí quản lý' LIMIT 1);

-- Insert sample bills
INSERT INTO bills (household_id, billing_period, title, total_amount, paid_amount, payment_status, created_by, fee_type_id, collector_id) VALUES
(1, '2025-12-01', 'Phí quản lý tháng 12/2025', 500000, 500000, 'PAID', @admin1_id, @fee_type_id, @admin1_id),
(2, '2025-11-01', 'Phí quản lý tháng 11/2025', 300000, 0, 'UNPAID', @admin1_id, @fee_type_id, NULL),
(3, '2025-12-01', 'Phí quản lý + Phí gửi xe tháng 12/2025', 450000, 450000, 'PAID', @admin1_id, @fee_type_id, @admin2_id),
(4, '2025-10-01', 'Phí quản lý tháng 10/2025', 500000, 0, 'UNPAID', @admin1_id, @fee_type_id, NULL),
(5, '2025-12-01', 'Phí quản lý tháng 12/2025', 500000, 0, 'UNPAID', @admin1_id, @fee_type_id, NULL),
(6, '2025-11-01', 'Phí quản lý + Phí điện nước tháng 11/2025', 650000, 650000, 'PAID', @admin1_id, @fee_type_id, @admin1_id),
(7, '2025-12-01', 'Phí quản lý tháng 12/2025', 500000, 0, 'UNPAID', @admin1_id, @fee_type_id, NULL),
(8, '2025-09-01', 'Phí quản lý tháng 09/2025', 500000, 0, 'UNPAID', @admin1_id, @fee_type_id, NULL),
(9, '2025-12-01', 'Phí quản lý + Phí internet tháng 12/2025', 550000, 550000, 'PAID', @admin1_id, @fee_type_id, @admin2_id),
(10, '2025-11-01', 'Phí quản lý tháng 11/2025', 300000, 0, 'UNPAID', @admin1_id, @fee_type_id, NULL),
(11, '2025-12-01', 'Phí quản lý tháng 12/2025', 500000, 500000, 'PAID', @admin1_id, @fee_type_id, @admin1_id),
(12, '2025-10-01', 'Phí quản lý tháng 10/2025', 500000, 0, 'UNPAID', @admin1_id, @fee_type_id, NULL),
(13, '2025-12-01', 'Phí quản lý + Phí gửi xe tháng 12/2025', 450000, 0, 'UNPAID', @admin1_id, @fee_type_id, NULL),
(14, '2025-11-01', 'Phí quản lý tháng 11/2025', 300000, 300000, 'PAID', @admin1_id, @fee_type_id, @admin2_id),
(15, '2025-12-01', 'Phí quản lý tháng 12/2025', 500000, 0, 'UNPAID', @admin1_id, @fee_type_id, NULL),
(16, '2025-09-01', 'Phí quản lý tháng 09/2025', 500000, 0, 'UNPAID', @admin1_id, @fee_type_id, NULL),
(17, '2025-12-01', 'Phí quản lý + Phí điện nước tháng 12/2025', 650000, 650000, 'PAID', @admin1_id, @fee_type_id, @admin1_id),
(18, '2025-11-01', 'Phí quản lý tháng 11/2025', 300000, 0, 'UNPAID', @admin1_id, @fee_type_id, NULL),
(19, '2025-12-01', 'Phí quản lý tháng 12/2025', 500000, 500000, 'PAID', @admin1_id, @fee_type_id, @admin2_id),
(20, '2025-10-01', 'Phí quản lý tháng 10/2025', 500000, 0, 'UNPAID', @admin1_id, @fee_type_id, NULL),
(21, '2025-12-01', 'Phí quản lý + Phí gửi xe tháng 12/2025', 450000, 0, 'UNPAID', @admin1_id, @fee_type_id, NULL),
(22, '2025-11-01', 'Phí quản lý tháng 11/2025', 300000, 300000, 'PAID', @admin1_id, @fee_type_id, @admin1_id),
(23, '2025-12-01', 'Phí quản lý tháng 12/2025', 500000, 0, 'UNPAID', @admin1_id, @fee_type_id, NULL),
(24, '2025-09-01', 'Phí quản lý tháng 09/2025', 500000, 0, 'UNPAID', @admin1_id, @fee_type_id, NULL),
(25, '2025-12-01', 'Phí quản lý + Phí internet tháng 12/2025', 550000, 550000, 'PAID', @admin1_id, @fee_type_id, @admin2_id);

-- Verify data
SELECT 'Bills inserted successfully' AS status;
SELECT COUNT(*) AS total_bills FROM bills;
SELECT COUNT(*) AS total_households FROM households;
SELECT COUNT(*) AS total_users FROM users WHERE role = 'ADMIN';