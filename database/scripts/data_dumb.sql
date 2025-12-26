USE BlueMoon;

-- =============================================
-- 1. INSERT DATA: USERS (Chưa có household_id)
-- =============================================
INSERT INTO users (username, password_hash, full_name, email, role, status) VALUES
('admin_thanh', 'hash1', 'Nguyễn Văn Thành', 'thanh.bql@bluemoon.vn', 'ADMIN', 'ACTIVE'),
('admin_lan', 'hash2', 'Lê Thị Lan', 'lan.bql@bluemoon.vn', 'ADMIN', 'ACTIVE'),
('admin_hung', 'hash3', 'Phạm Tuấn Hùng', 'hung.bql@bluemoon.vn', 'ADMIN', 'ACTIVE'),
('admin_ngoc', 'hash4', 'Trần Bảo Ngọc', 'ngoc.bql@bluemoon.vn', 'ADMIN', 'ACTIVE'),
('admin_duc', 'hash5', 'Hoàng Minh Đức', 'duc.bql@bluemoon.vn', 'ADMIN', 'ACTIVE'),
('user_hien', 'hash6', 'Trịnh Thu Hiền', 'hien.101@gmail.com', 'RESIDENT', 'ACTIVE'),
('user_minh', 'hash7', 'Vũ Quang Minh', 'minh.102@gmail.com', 'RESIDENT', 'ACTIVE'),
('user_tuan', 'hash8', 'Đỗ Anh Tuấn', 'tuan.103@gmail.com', 'RESIDENT', 'ACTIVE'),
('user_linh', 'hash9', 'Phan Khánh Linh', 'linh.104@gmail.com', 'RESIDENT', 'ACTIVE'),
('user_son', 'hash10', 'Lý Tùng Sơn', 'son.201@gmail.com', 'RESIDENT', 'ACTIVE'),
('user_mai', 'hash11', 'Ngô Phương Mai', 'mai.202@gmail.com', 'RESIDENT', 'ACTIVE'),
('user_duong', 'hash12', 'Bùi Thái Dương', 'duong.203@gmail.com', 'RESIDENT', 'ACTIVE'),
('user_anh', 'hash13', 'Võ Hoàng Anh', 'anh.204@gmail.com', 'RESIDENT', 'ACTIVE'),
('user_quynh', 'hash14', 'Đặng Diễm Quỳnh', 'quynh.301@gmail.com', 'RESIDENT', 'ACTIVE'),
('user_nam', 'hash15', 'Lương Thành Nam', 'nam.302@gmail.com', 'RESIDENT', 'ACTIVE'),
('user_trang', 'hash16', 'Hà Huyền Trang', 'trang.303@gmail.com', 'RESIDENT', 'ACTIVE'),
('user_phuc', 'hash17', 'Đinh Hồng Phúc', 'phuc.304@gmail.com', 'RESIDENT', 'ACTIVE'),
('user_tam', 'hash18', 'Mai Chí Tâm', 'tam.401@gmail.com', 'RESIDENT', 'ACTIVE'),
('user_kien', 'hash19', 'Tô Trung Kiên', 'kien.402@gmail.com', 'RESIDENT', 'ACTIVE'),
('user_vy', 'hash20', 'Nguyễn Thảo Vy', 'vy.403@gmail.com', 'RESIDENT', 'ACTIVE');
-- =============================================
-- 2. INSERT DATA: HOUSEHOLDS
-- =============================================
INSERT INTO households (household_code, owner_name, address, area_sqm, user_id) VALUES
('BM_101', 'Trịnh Thu Hiền', 'Tầng 1 - Căn 101', 75.5, 6),
('BM_102', 'Vũ Quang Minh', 'Tầng 1 - Căn 102', 80.0, 7),
('BM_103', 'Đỗ Anh Tuấn', 'Tầng 1 - Căn 103', 65.0, 8),
('BM_104', 'Phan Khánh Linh', 'Tầng 1 - Căn 104', 110.2, 9),
('BM_201', 'Lý Tùng Sơn', 'Tầng 2 - Căn 201', 75.5, 10),
('BM_202', 'Ngô Phương Mai', 'Tầng 2 - Căn 202', 75.5, 11),
('BM_203', 'Bùi Thái Dương', 'Tầng 2 - Căn 203', 80.0, 12),
('BM_204', 'Võ Hoàng Anh', 'Tầng 2 - Căn 204', 65.0, 13),
('BM_301', 'Đặng Diễm Quỳnh', 'Tầng 3 - Căn 301', 110.2, 14),
('BM_302', 'Lương Thành Nam', 'Tầng 3 - Căn 302', 75.5, 15),
('BM_303', 'Hà Huyền Trang', 'Tầng 3 - Căn 303', 80.0, 16),
('BM_304', 'Đinh Hồng Phúc', 'Tầng 3 - Căn 304', 65.0, 17),
('BM_401', 'Mai Chí Tâm', 'Tầng 4 - Căn 401', 75.5, 18),
('BM_402', 'Tô Trung Kiên', 'Tầng 4 - Căn 402', 110.2, 19),
('BM_403', 'Nguyễn Thảo Vy', 'Tầng 4 - Căn 403', 65.0, 20),
('BM_501', 'Trần Văn A', 'Tầng 5 - Căn 501', 75.0, NULL),
('BM_502', 'Lê Văn B', 'Tầng 5 - Căn 502', 80.0, NULL),
('BM_503', 'Nguyễn Văn C', 'Tầng 5 - Căn 503', 65.0, NULL),
('BM_504', 'Phạm Văn D', 'Tầng 5 - Căn 504', 110.0, NULL),
('BM_601', 'Hoàng Văn E', 'Tầng 6 - Căn 601', 75.0, NULL);

-- =============================================
-- UPDATE: Gán household_id cho users
-- =============================================
UPDATE users SET household_id = 1 WHERE user_id = 6;  -- user_hien -> BM_101
UPDATE users SET household_id = 2 WHERE user_id = 7;  -- user_minh -> BM_102
UPDATE users SET household_id = 3 WHERE user_id = 8;  -- user_tuan -> BM_103
UPDATE users SET household_id = 4 WHERE user_id = 9;  -- user_linh -> BM_104
UPDATE users SET household_id = 5 WHERE user_id = 10; -- user_son -> BM_201
UPDATE users SET household_id = 6 WHERE user_id = 11; -- user_mai -> BM_202
UPDATE users SET household_id = 7 WHERE user_id = 12; -- user_duong -> BM_203
UPDATE users SET household_id = 8 WHERE user_id = 13; -- user_anh -> BM_204
UPDATE users SET household_id = 9 WHERE user_id = 14; -- user_quynh -> BM_301
UPDATE users SET household_id = 10 WHERE user_id = 15; -- user_nam -> BM_302
UPDATE users SET household_id = 11 WHERE user_id = 16; -- user_trang -> BM_303
UPDATE users SET household_id = 12 WHERE user_id = 17; -- user_phuc -> BM_304
UPDATE users SET household_id = 13 WHERE user_id = 18; -- user_tam -> BM_401
UPDATE users SET household_id = 14 WHERE user_id = 19; -- user_kien -> BM_402
UPDATE users SET household_id = 15 WHERE user_id = 20; -- user_vy -> BM_403

-- =============================================
-- 3. INSERT DATA: RESIDENTS
-- =============================================
INSERT INTO residents (household_id, full_name, date_of_birth, identity_card_number, relation_to_owner, job, phone_number) VALUES
(1, 'Trịnh Thu Hiền', '1985-05-12', '001085001234', 'Chủ hộ', 'Kế toán', '0912345678'),
(1, 'Trần Minh Quân', '1982-10-20', '001082005678', 'Chồng', 'Kỹ sư', '0912345679'),
(1, 'Trần Bảo Anh', '2015-01-15', NULL, 'Con', 'Học sinh', NULL),
(2, 'Vũ Quang Minh', '1990-03-08', '034090001111', 'Chủ hộ', 'Kinh doanh', '0988123456'),
(2, 'Lê Diệu Thúy', '1992-12-12', '034092002222', 'Vợ', 'Giáo viên', '0988123457'),
(3, 'Đỗ Anh Tuấn', '1978-07-25', '038078003333', 'Chủ hộ', 'Bác sĩ', '0904112233'),
(4, 'Phan Khánh Linh', '1995-11-30', '025095004444', 'Chủ hộ', 'Designer', '0977888999'),
(5, 'Lý Tùng Sơn', '1988-02-14', '040088005555', 'Chủ hộ', 'IT Helpdesk', '0911222333'),
(6, 'Ngô Phương Mai', '1993-06-20', '051093006666', 'Chủ hộ', 'Nội trợ', '0933444555'),
(7, 'Bùi Thái Dương', '1980-09-09', '062080007777', 'Chủ hộ', 'Công chức', '0944555666'),
(8, 'Võ Hoàng Anh', '1997-12-05', '072097008888', 'Chủ hộ', 'Freelancer', '0955666777'),
(9, 'Đặng Diễm Quỳnh', '1989-01-01', '082089009999', 'Chủ hộ', 'Luật sư', '0966777888'),
(10, 'Lương Thành Nam', '1984-04-04', '092084010101', 'Chủ hộ', 'Tài xế', '0977888111'),
(11, 'Hà Huyền Trang', '1996-08-16', '010096011212', 'Chủ hộ', 'Nhân viên VP', '0988999222'),
(12, 'Đinh Hồng Phúc', '1991-10-10', '011091012323', 'Chủ hộ', 'Kiến trúc sư', '0999000333'),
(13, 'Mai Chí Tâm', '1987-05-05', '012087013434', 'Chủ hộ', 'Đầu bếp', '0900111444'),
(14, 'Tô Trung Kiên', '1982-03-03', '013082014545', 'Chủ hộ', 'Nhà báo', '0911222555'),
(15, 'Nguyễn Thảo Vy', '1994-11-11', '014094015656', 'Chủ hộ', 'Dược sĩ', '0922333666'),
(16, 'Trần Văn A', '1975-01-01', '015075016767', 'Chủ hộ', 'Nghỉ hưu', '0933444777'),
(17, 'Lê Văn B', '1980-02-02', '016080017878', 'Chủ hộ', 'Thợ điện', '0944555888');

-- =============================================
-- 4. INSERT DATA: FEE TYPES
-- (Các loại phí cơ bản)
-- =============================================
INSERT INTO fee_types (fee_name, unit_price, unit, description) VALUES
('Phí quản lý vận hành', 7000, 'm2', 'Phí dịch vụ chung tòa nhà hàng tháng'),
('Phí vệ sinh', 50000, 'hộ', 'Phí thu gom rác và vệ sinh hành lang'),
('Phí gửi xe máy', 100000, 'xe', 'Phí trông giữ xe máy hàng tháng'),
('Phí gửi ô tô', 1200000, 'xe', 'Phí trông giữ ô tô hàng tháng'),
('Phí Internet tập trung', 250000, 'hộ', 'Gói cước internet tòa nhà');

-- =============================================
-- 5. INSERT DATA: BILLS
-- (Tạo hóa đơn cho tháng 12/2025)
-- =============================================
INSERT INTO bills (household_id, billing_period, title, total_amount, paid_amount, payment_status, fee_type_id, created_by, collector_id) VALUES
(1, '2025-12-01', 'Tiền quản lý tháng 12', 528500, 528500, 'PAID', 1, 1, 1),
(2, '2025-12-01', 'Tiền quản lý tháng 12', 560000, 560000, 'PAID', 1, 1, 2),
(3, '2025-12-01', 'Tiền quản lý tháng 12', 455000, 0, 'UNPAID', 1, 1, NULL),
(4, '2025-12-01', 'Tiền quản lý tháng 12', 771400, 771400, 'PAID', 1, 1, 1),
(5, '2025-12-01', 'Tiền quản lý tháng 12', 528500, 200000, 'PARTIAL', 1, 1, 3),
(6, '2025-12-01', 'Tiền vệ sinh tháng 12', 50000, 50000, 'PAID', 2, 1, 1),
(7, '2025-12-01', 'Tiền vệ sinh tháng 12', 50000, 0, 'UNPAID', 2, 1, NULL),
(8, '2025-12-01', 'Tiền vệ sinh tháng 12', 50000, 50000, 'PAID', 2, 1, 2),
(9, '2025-12-01', 'Tiền gửi xe ô tô tháng 12', 1200000, 1200000, 'PAID', 4, 1, 4),
(10, '2025-12-01', 'Tiền gửi xe ô tô tháng 12', 1200000, 0, 'UNPAID', 4, 1, NULL),
(11, '2025-12-01', 'Tiền gửi xe máy tháng 12', 200000, 200000, 'PAID', 3, 1, 1),
(12, '2025-12-01', 'Tiền gửi xe máy tháng 12', 100000, 100000, 'PAID', 3, 1, 2),
(13, '2025-12-01', 'Tiền Internet tháng 12', 250000, 0, 'UNPAID', 5, 1, NULL),
(14, '2025-12-01', 'Tiền Internet tháng 12', 250000, 250000, 'PAID', 5, 1, 1),
(15, '2025-12-01', 'Tiền quản lý tháng 12', 455000, 455000, 'PAID', 1, 1, 5),
(16, '2025-12-01', 'Tiền quản lý tháng 12', 525000, 0, 'UNPAID', 1, 1, NULL),
(17, '2025-12-01', 'Tiền vệ sinh tháng 12', 50000, 50000, 'PAID', 2, 1, 3),
(18, '2025-12-01', 'Tiền gửi xe máy tháng 12', 100000, 0, 'UNPAID', 3, 1, NULL),
(19, '2025-12-01', 'Tiền Internet tháng 12', 250000, 250000, 'PAID', 5, 1, 2),
(20, '2025-12-01', 'Tiền quản lý tháng 12', 525000, 525000, 'PAID', 1, 1, 1);

-- =============================================
-- 7. INSERT DATA: LOGS
-- (Nhật ký hoạt động chi tiết của hệ thống)
-- =============================================
INSERT INTO logs (user_id, action, entity_type, entity_id, details, ip_address, user_agent) VALUES
(1, 'CREATE', 'User', 6, '{"username":"user_hien","role":"RESIDENT"}', '192.168.1.10', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'),
(1, 'CREATE', 'User', 7, '{"username":"user_minh","role":"RESIDENT"}', '192.168.1.10', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'),
(1, 'UPDATE', 'User', 20, '{"oldStatus":"ACTIVE","newStatus":"LOCKED"}', '192.168.1.10', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'),
(1, 'UPDATE', 'User', 20, '{"oldStatus":"LOCKED","newStatus":"ACTIVE"}', '192.168.1.10', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'),
(2, 'CREATE', 'Household', 1, '{"householdCode":"BM_101","ownerName":"Trịnh Thu Hiền"}', '192.168.1.11', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'),
(2, 'CREATE', 'Resident', 1, '{"fullName":"Trịnh Thu Hiền","householdId":1}', '192.168.1.11', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'),
(1, 'UPDATE', 'Household', 4, '{"oldArea":"110.0","newArea":"110.2"}', '192.168.1.10', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'),
(3, 'CREATE', 'Bill', 1, '{"householdId":1,"title":"Tiền quản lý tháng 12"}', '192.168.1.15', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'),
(1, 'UPDATE', 'Bill', 1, '{"oldStatus":"UNPAID","newStatus":"PAID"}', '192.168.1.10', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'),
(2, 'UPDATE', 'Bill', 2, '{"oldStatus":"UNPAID","newStatus":"PAID"}', '192.168.1.11', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'),
(3, 'UPDATE', 'Bill', 5, '{"oldStatus":"UNPAID","newStatus":"PARTIAL"}', '192.168.1.15', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'),
(4, 'CREATE', 'FeeType', 6, '{"feeName":"Phí bảo trì","unitPrice":50000}', '192.168.1.18', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'),
(1, 'UPDATE', 'FeeType', 1, '{"oldPrice":"6500","newPrice":"7000"}', '192.168.1.10', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'),
(5, 'DELETE', 'Resident', 25, '{"fullName":"Nguyễn Văn Test","reason":"Di chuyển"}', '192.168.1.20', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'),
(1, 'LOGIN', 'Session', NULL, '{"success":true}', '192.168.1.10', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'),
(2, 'LOGIN', 'Session', NULL, '{"success":true}', '192.168.1.11', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'),
(6, 'LOGIN', 'Session', NULL, '{"success":true}', '192.168.1.100', 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0)'),
(1, 'LOGOUT', 'Session', NULL, '{}', '192.168.1.10', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'),
(1, 'CREATE', 'Household', 21, '{"householdCode":"BM_602","ownerName":"Trần Văn F"}', '192.168.1.10', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'),
(4, 'UPDATE', 'FeeType', 4, '{"oldPrice":"1100000","newPrice":"1200000"}', '192.168.1.18', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)');
