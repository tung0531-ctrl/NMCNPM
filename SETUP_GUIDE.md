# Hướng dẫn chạy hệ thống Quản lý Khoản Thu

## Các bước thực hiện:

### 1. Cài đặt Database

Chạy script SQL để tạo database và insert dữ liệu mẫu:

```bash
mysql -u root -p < database/scripts/create_bills_table.sql
```

Hoặc truy cập MySQL Workbench/phpMyAdmin và chạy file `database/scripts/create_bills_table.sql`

### 2. Cấu hình Backend

File `.env` trong thư mục `backend` đã được cấu hình sẵn:
```
DB_CONNECTION_STRING="mysql://root:@localhost:3306/bluemoon"
ACCESS_TOKEN_SECRET=your_secret_key
FRONTEND_ORIGIN=http://localhost:5173
```

### 3. Khởi động Backend

```bash
cd backend
npm install   # Nếu chưa cài đặt dependencies
npm run dev
```

Backend sẽ chạy trên port 5001.

### 4. Khởi động Frontend

Mở terminal mới:

```bash
cd frontend
npm install   # Nếu chưa cài đặt dependencies
npm run dev
```

Frontend sẽ chạy trên port 5173.

### 5. Truy cập ứng dụng

Mở trình duyệt và truy cập: `http://localhost:5173`

## Tính năng đã triển khai:

### Backend API:
- **Endpoint**: `GET /api/bills`
- **Query Parameters**:
  - `page`: Số trang (mặc định: 1)
  - `limit`: Số items mỗi trang (mặc định: 10)
  - `householdName`: Tìm kiếm theo tên hộ
  - `paymentPeriod`: Tìm kiếm theo kỳ thanh toán (format: YYYY-MM)
  - `status`: Lọc theo trạng thái (Đã thanh toán, Chưa thanh toán, Quá hạn)
  - `collectorName`: Tìm kiếm theo tên người thu

### Frontend Features:
- Hiển thị danh sách hóa đơn với phân trang (10 items/page)
- Tìm kiếm theo:
  - Tên hộ gia đình
  - Kỳ thanh toán
  - Trạng thái thanh toán
  - Người thu tiền
- Hiển thị tổng hợp:
  - Tổng số hóa đơn
  - Tổng doanh thu
  - Số lượng đã thanh toán

## Cấu trúc Database:

### Bảng chính:
- **bills**: Lưu thông tin hóa đơn
- **households**: Lưu thông tin hộ gia đình
- **users**: Lưu thông tin người dùng (bao gồm người thu tiền)
- **fee_types**: Loại phí

### Mối quan hệ:
- bills ➔ households (many-to-one)
- bills ➔ users (collector) (many-to-one)

## Dữ liệu mẫu:

- 25 hộ gia đình
- 25 hóa đơn với các trạng thái khác nhau
- 2 nhân viên thu tiền (Trần Thị Thu, Nguyễn Văn Hùng)
- 4 loại phí (Phí quản lý, Phí gửi xe, Phí điện nước, Phí internet)

## Troubleshooting:

### Lỗi kết nối Database:
- Kiểm tra MySQL đã chạy chưa
- Xác nhận database `BlueMoon` đã được tạo
- Kiểm tra thông tin kết nối trong file `.env`

### Lỗi CORS:
- Đảm bảo `FRONTEND_ORIGIN` trong `.env` đúng với địa chỉ frontend

### Không có dữ liệu:
- Chạy lại script SQL để insert dữ liệu mẫu
- Kiểm tra console của backend để xem có lỗi không