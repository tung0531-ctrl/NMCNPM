# Tài liệu Chức năng Quản lý User và Xem Log

## Tổng quan
Đã thêm hai chức năng chính:
1. **Quản lý User**: Thêm, sửa, xóa người dùng (chỉ dành cho Admin)
2. **Xem Log**: Xem lịch sử hoạt động hệ thống (chỉ xem, không chỉnh sửa)

---

## 1. Backend Implementation

### 1.1. Database Schema
**File**: `database/scripts/create_logs_table.sql`

Bảng `logs` được tạo để lưu trữ các hoạt động:
- `log_id`: ID tự động tăng
- `user_id`: ID người dùng thực hiện hành động
- `action`: Loại hành động (CREATE_USER, UPDATE_USER, DELETE_USER, VIEW_ALL_USERS, etc.)
- `entity_type`: Loại đối tượng (USER, BILL, HOUSEHOLD, etc.)
- `entity_id`: ID của đối tượng bị tác động
- `details`: Chi tiết dưới dạng JSON
- `ip_address`: Địa chỉ IP
- `user_agent`: Thông tin trình duyệt
- `created_at`: Thời gian tạo log

**Chạy script SQL**:
```sql
mysql -u your_username -p your_database < database/scripts/create_logs_table.sql
```

### 1.2. Models

#### Log Model
**File**: `backend/src/models/Log.js`
- Model Sequelize cho bảng logs
- Quan hệ: `Log belongsTo User`

#### User Model (đã có sẵn)
**File**: `backend/src/models/User.js`
- Đã thêm quan hệ: `User hasMany Log`

### 1.3. Controllers

#### User Controller
**File**: `backend/src/controllers/userController.js`

**API Endpoints đã thêm**:
- `GET /api/users` - Lấy tất cả user (Admin only)
- `GET /api/users/:id` - Lấy thông tin user theo ID (Admin only)
- `POST /api/users` - Tạo user mới (Admin only)
- `PUT /api/users/:id` - Cập nhật user (Admin only)
- `DELETE /api/users/:id` - Xóa user (Admin only)

**Tính năng**:
- Kiểm tra username/email trùng lặp
- Hash mật khẩu với bcrypt
- Tự động tạo log cho mọi thao tác
- Không cho phép user tự xóa chính mình

#### Log Controller
**File**: `backend/src/controllers/logController.js`

**API Endpoints**:
- `GET /api/logs` - Lấy danh sách log với phân trang và filter
  - Query params: `page`, `limit`, `action`, `entityType`, `userId`, `startDate`, `endDate`
- `GET /api/logs/stats` - Lấy thống kê log

### 1.4. Routes

#### User Routes
**File**: `backend/src/routes/userRoute.js`
- Tất cả route CRUD đều yêu cầu Admin role
- Protected với middleware `adminOnly`

#### Log Routes
**File**: `backend/src/routes/logRoute.js`
- Chỉ Admin mới được xem log
- Protected với middleware `adminOnly`

### 1.5. Server Configuration
**File**: `backend/src/server.js`
- Đã thêm route `/api/logs`

---

## 2. Frontend Implementation

### 2.1. Services

#### User Service
**File**: `frontend/src/services/userService.ts`

**Functions**:
- `getAllUsers()` - Lấy tất cả user
- `getUserById(id)` - Lấy user theo ID
- `createUser(data)` - Tạo user mới
- `updateUser(id, data)` - Cập nhật user
- `deleteUser(id)` - Xóa user

**Types**:
- `User`: Interface cho user object
- `CreateUserData`: Interface cho dữ liệu tạo user
- `UpdateUserData`: Interface cho dữ liệu cập nhật user (các field optional)

#### Log Service
**File**: `frontend/src/services/logService.ts`

**Functions**:
- `getLogs(params)` - Lấy log với filter và pagination
- `getLogStats(startDate, endDate)` - Lấy thống kê log

**Types**:
- `Log`: Interface cho log object
- `LogsResponse`: Response với pagination
- `GetLogsParams`: Parameters cho filter

### 2.2. Pages

#### User Management Page
**File**: `frontend/src/pages/UserManagementPage.tsx`

**Tính năng**:
- Hiển thị danh sách user trong bảng
- Tìm kiếm theo username, email, fullName
- Thêm user mới (dialog form)
- Sửa thông tin user (dialog form)
- Xóa user (confirmation dialog)
- Hiển thị role và status với màu sắc phân biệt
- Form validation và error handling

**UI Components sử dụng**:
- Card, Button, Input, Label
- Dialog (cho Create/Edit)
- AlertDialog (cho Delete confirmation)

#### Log Viewer Page
**File**: `frontend/src/pages/LogViewerPage.tsx`

**Tính năng**:
- Hiển thị log trong bảng với pagination
- Filter theo:
  - Action (hành động)
  - Entity Type (loại đối tượng)
  - User ID
  - Khoảng thời gian (startDate - endDate)
- Hiển thị thông tin user (nếu có)
- Format JSON details
- Pagination controls

**Thông tin hiển thị**:
- Log ID
- Thời gian (format theo locale Việt Nam)
- Người dùng (username, fullName, role)
- Hành động (với badge màu)
- Loại đối tượng
- ID đối tượng
- Chi tiết (JSON formatted)
- IP address

### 2.3. Router Configuration
**File**: `frontend/src/App.tsx`

**Routes đã thêm**:
- `/users` - User Management Page (Admin only)
- `/logs` - Log Viewer Page (Admin only)

Cả hai route đều được bảo vệ bởi:
- `ProtectedRoute` (yêu cầu đăng nhập)
- `AdminRoute` (yêu cầu role Admin)

---

## 3. Cách sử dụng

### 3.1. Chạy Database Migration
```bash
# Kết nối MySQL và chạy script
mysql -u root -p apartment_management < database/scripts/create_logs_table.sql
```

### 3.2. Khởi động Backend
```bash
cd backend
npm install  # Nếu cần
npm run dev
```

### 3.3. Khởi động Frontend
```bash
cd frontend
npm install  # Nếu cần
npm run dev
```

### 3.4. Truy cập
- Đăng nhập với tài khoản Admin
- Vào `/users` để quản lý user
- Vào `/logs` để xem log

---

## 4. Các Action Log được ghi lại

### User Management
- `CREATE_USER`: Khi tạo user mới
- `UPDATE_USER`: Khi cập nhật user
- `DELETE_USER`: Khi xóa user
- `VIEW_ALL_USERS`: Khi xem danh sách user
- `VIEW_USER`: Khi xem chi tiết một user

### Các module khác (có thể mở rộng)
- `LOGIN`: Đăng nhập
- `LOGOUT`: Đăng xuất
- `CREATE_BILL`: Tạo hóa đơn
- `UPDATE_BILL`: Cập nhật hóa đơn
- v.v.

---

## 5. Security Features

### Backend
- **Authentication**: Middleware `protectedRoute` kiểm tra JWT token
- **Authorization**: Middleware `adminOnly` chỉ cho phép Admin
- **Password**: Hash với bcrypt (10 rounds)
- **Validation**: Kiểm tra dữ liệu đầu vào
- **Self-protection**: Không cho phép user xóa chính mình

### Frontend
- **Route Protection**: ProtectedRoute và AdminRoute
- **Type Safety**: TypeScript với strict type checking
- **Error Handling**: Hiển thị toast message cho mọi lỗi
- **Confirmation**: Dialog xác nhận trước khi xóa

---

## 6. Mở rộng trong tương lai

### 6.1. Thêm Log cho các module khác
Trong controller của module khác, import và sử dụng hàm createLog:

```javascript
import Log from "../models/Log.js";

const createLog = async (userId, action, entityType, entityId, details, req) => {
    try {
        await Log.create({
            userId,
            action,
            entityType,
            entityId,
            details: JSON.stringify(details),
            ipAddress: req.ip || req.connection.remoteAddress,
            userAgent: req.get('user-agent')
        });
    } catch (error) {
        console.error("Lỗi tạo log:", error);
    }
};

// Sử dụng
await createLog(req.user.userId, 'CREATE_BILL', 'BILL', bill.id, { amount: bill.amount }, req);
```

### 6.2. Export Log
Thêm chức năng export log ra CSV/Excel trong LogViewerPage

### 6.3. Real-time Log
Thêm WebSocket để hiển thị log real-time

### 6.4. Log Dashboard
Tạo trang dashboard với charts và statistics về log

---

## 7. API Documentation

### User Management API

#### GET /api/users
Lấy tất cả user

**Headers**: 
- `Authorization: Bearer <token>`
- `Role: ADMIN`

**Response**:
```json
[
  {
    "userId": 1,
    "username": "admin",
    "email": "admin@example.com",
    "fullName": "Administrator",
    "role": "ADMIN",
    "status": "ACTIVE",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

#### GET /api/users/:id
Lấy user theo ID

#### POST /api/users
Tạo user mới

**Body**:
```json
{
  "username": "newuser",
  "email": "newuser@example.com",
  "fullName": "New User",
  "password": "securepassword123",
  "role": "RESIDENT",
  "status": "ACTIVE"
}
```

#### PUT /api/users/:id
Cập nhật user (các field optional)

**Body**:
```json
{
  "email": "newemail@example.com",
  "status": "LOCKED"
}
```

#### DELETE /api/users/:id
Xóa user

### Log API

#### GET /api/logs
Lấy log với filter

**Query Parameters**:
- `page`: Số trang (default: 1)
- `limit`: Số bản ghi mỗi trang (default: 50)
- `action`: Lọc theo action
- `entityType`: Lọc theo entity type
- `userId`: Lọc theo user ID
- `startDate`: Lọc từ ngày (ISO 8601)
- `endDate`: Lọc đến ngày (ISO 8601)

**Response**:
```json
{
  "logs": [...],
  "total": 100,
  "page": 1,
  "totalPages": 2
}
```

#### GET /api/logs/stats
Lấy thống kê log

**Response**:
```json
{
  "actionCounts": [
    { "action": "CREATE_USER", "count": 10 },
    { "action": "UPDATE_USER", "count": 5 }
  ],
  "entityTypeCounts": [
    { "entityType": "USER", "count": 15 },
    { "entityType": "BILL", "count": 20 }
  ]
}
```

---

## 8. Troubleshooting

### Lỗi 401 Unauthorized
- Kiểm tra JWT token có hợp lệ không
- Kiểm tra cookie có được gửi kèm không (credentials: true)

### Lỗi 403 Forbidden
- Kiểm tra user có role ADMIN không

### Lỗi kết nối database
- Kiểm tra file `.env` có đúng thông tin database không
- Kiểm tra bảng `logs` đã được tạo chưa

### Frontend không load được
- Kiểm tra CORS đã được config đúng chưa
- Kiểm tra axios baseURL trong `frontend/src/lib/axios.ts`

---

## 9. Files đã tạo/sửa đổi

### Backend
- ✅ `backend/src/models/Log.js` - NEW
- ✅ `backend/src/controllers/userController.js` - MODIFIED
- ✅ `backend/src/controllers/logController.js` - NEW
- ✅ `backend/src/routes/userRoute.js` - MODIFIED
- ✅ `backend/src/routes/logRoute.js` - NEW
- ✅ `backend/src/models/index.js` - MODIFIED
- ✅ `backend/src/server.js` - MODIFIED
- ✅ `database/scripts/create_logs_table.sql` - NEW

### Frontend
- ✅ `frontend/src/services/userService.ts` - NEW
- ✅ `frontend/src/services/logService.ts` - NEW
- ✅ `frontend/src/pages/UserManagementPage.tsx` - NEW
- ✅ `frontend/src/pages/LogViewerPage.tsx` - NEW
- ✅ `frontend/src/App.tsx` - MODIFIED

---

## 10. Testing Checklist

### User Management
- [ ] Tạo user mới với đầy đủ thông tin
- [ ] Tạo user với username/email đã tồn tại (expect error)
- [ ] Sửa thông tin user
- [ ] Đổi password user
- [ ] Đổi role user (RESIDENT <-> ADMIN)
- [ ] Khóa/mở khóa user (ACTIVE <-> LOCKED)
- [ ] Xóa user
- [ ] Thử xóa chính mình (expect error)
- [ ] Tìm kiếm user

### Log Viewer
- [ ] Xem danh sách log
- [ ] Filter theo action
- [ ] Filter theo entity type
- [ ] Filter theo user ID
- [ ] Filter theo khoảng thời gian
- [ ] Xóa filter
- [ ] Pagination
- [ ] Kiểm tra log sau khi tạo/sửa/xóa user

---

## Kết luận

Hệ thống quản lý user và log đã được implement đầy đủ với:
- ✅ Backend API hoàn chỉnh
- ✅ Frontend UI/UX thân thiện
- ✅ Security đầy đủ (Authentication & Authorization)
- ✅ Logging tự động cho mọi thao tác
- ✅ Type safety với TypeScript
- ✅ Error handling đầy đủ

Có thể sử dụng ngay hoặc mở rộng thêm theo nhu cầu!
