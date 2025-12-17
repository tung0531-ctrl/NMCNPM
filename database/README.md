# 🏢 BlueMoon - Resident & Fee Management System

## 1. Giới thiệu tổng quan

**BlueMoon** là hệ thống quản lý cư dân và tài chính tập trung dành cho chung cư/khu đô thị. Hệ thống giải quyết các bài toán về quản lý nhân khẩu, tự động hóa quy trình tạo hóa đơn dịch vụ và minh bạch hóa lịch sử thanh toán.

## 2. Kiến trúc Cơ sở dữ liệu (Database Architecture)

Cơ sở dữ liệu được thiết kế gồm 6 bảng chính, chia thành 4 phân hệ cốt lõi:

### 🔐 Phân hệ Hệ thống & Bảo mật (System & Auth)

* **`users`**: Quản lý tài khoản truy cập. Phân quyền chặt chẽ giữa `ADMIN` (Ban quản lý) và `RESIDENT` (Cư dân).
* **`audit_logs`**: Lưu vết mọi hành động tác động đến dữ liệu (Ai sửa? Sửa gì? Lúc nào?). Đảm bảo tính toàn vẹn và trách nhiệm giải trình.

### 🏘️ Phân hệ Hộ dân & Nhân khẩu (Household & Resident)

* **`households`**: Quản lý thông tin căn hộ vật lý, mã hộ và diện tích sử dụng.
* **`residents`**: Lưu trữ thông tin chi tiết từng nhân khẩu.
* *Ràng buộc đặc biệt:* Số định danh (CCCD) là duy nhất trên toàn hệ thống để tránh trùng lặp dữ liệu.



### 💰 Phân hệ Cấu hình Phí (Fee Configuration)

* **`fee_types`**: Danh mục các loại dịch vụ (Quản lý, Gửi xe, Vệ sinh...).
* *Logic:* Cho phép thay đổi đơn giá linh hoạt theo thời điểm mà không làm ảnh hưởng đến dữ liệu lịch sử.



### 🧾 Phân hệ Hóa đơn & Thu phí (Billing & Payment)

* **`bills`**: Ghi nhận công nợ hàng tháng của từng hộ dân.
* *Trạng thái thanh toán:* Hỗ trợ theo dõi đóng đủ (`PAID`), đóng một phần (`PARTIAL`) hoặc chưa đóng (`UNPAID`).
* *Truy vết:* Ghi nhận trực tiếp người tạo hóa đơn và người thu tiền (`collector_id`) để quản lý dòng tiền.



---

## 3. Quy trình Nghiệp vụ Chính

1. **Thiết lập:** Admin khởi tạo danh mục phí trong `fee_types` và tạo tài khoản cư dân.
2. **Tạo hóa đơn:** Hàng tháng, Admin tạo các bản ghi công nợ trong bảng `bills` dựa trên loại phí và hộ dân.
3. **Thu phí:** Khi cư dân đóng tiền, Admin cập nhật `paid_amount` và chuyển trạng thái `payment_status`. Hệ thống ghi nhận `collector_id` là Admin thực hiện giao dịch đó.
4. **Tra cứu:** Cư dân (Resident) đăng nhập để xem danh sách hóa đơn của hộ mình. Admin xem báo cáo tổng hợp toàn tòa nhà.

---

## 4. Tiêu chuẩn Kỹ thuật (Technical Standards)

| Thành phần | Quy chuẩn | Ví dụ |
| --- | --- | --- |
| **Naming Convention** | Snake Case | `household_code`, `fee_name` |
| **Bảng** | Số nhiều (Plural) | `users`, `residents` |
| **Khóa chính (PK)** | `table_singular_id` | `bill_id`, `user_id` |
| **Kiểu dữ liệu tiền tệ** | `DECIMAL(15, 2)` | Đảm bảo độ chính xác tài chính |
| **Thời gian** | `TIMESTAMP` | Tự động ghi nhận `created_at`, `updated_at` |

---

## 5. Cài đặt nhanh

Để khởi tạo cấu trúc cơ sở dữ liệu BlueMoon, hãy chạy file SQL theo thứ tự sau:

1. `create_table` (Tạo bảng và ràng buộc, INDEX)
2. `data_dumb` (Chèn dữ liệu mẫu)
