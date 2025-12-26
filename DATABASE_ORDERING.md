# Thứ Tự Sắp Xếp Dữ Liệu Trong Hệ Thống

Tài liệu này mô tả cách sắp xếp dữ liệu trong các chức năng của hệ thống.

## 📋 Tổng Quan

| Chức năng | Trường sắp xếp | Thứ tự | Controller File |
| --------- | -------------- | ------ | --------------- |
| **Khoản thu (Bills)** | `createdAt` | DESC (Mới → Cũ) | `billController.js` |
| **Hộ gia đình (Households)** | `ownerName` | ASC (A → Z) | `householdController.js` |
| **Hộ gia đình (Admin View)** | `householdId` | DESC (Mới → Cũ) | `householdController.js` |
| **Cư dân (Residents)** | `fullName` | ASC (A → Z) | `residentController.js` |
| **Người dùng (Users)** | `createdAt` | DESC (Mới → Cũ) | `userController.js` |
| **Loại phí (Fee Types)** | `feeTypeId` | DESC (Mới → Cũ) | `feeTypeController.js` |
| **Loại phí (Active)** | `feeName` | ASC (A → Z) | `feeTypeController.js` |
| **Admin** | `fullName` | ASC (A → Z) | `adminController.js` |
| **Log hệ thống** | `created_at` | DESC (Mới → Cũ) | `logController.js` |

---

### 1. Quản Lý Khoản Thu (Bills)

**File:** `backend/src/controllers/billController.js`

```javascript
order: [['createdAt', 'DESC']]
```

- **Trường:** `createdAt` (Thời gian tạo)
- **Thứ tự:** DESC - Mới nhất lên đầu
- **Lý do:** Người dùng thường quan tâm đến các khoản thu mới nhất

---

### 2. Quản Lý Hộ Gia Đình (Households)

**File:** `backend/src/controllers/householdController.js`

#### View thông thường

```javascript
order: [['ownerName', 'ASC']]
```

- **Trường:** `ownerName` (Tên chủ hộ)
- **Thứ tự:** ASC - Sắp xếp A → Z
- **Lý do:** Dễ tìm kiếm theo tên

#### Admin View

```javascript
order: [['householdId', 'DESC']]
```

- **Trường:** `householdId` (ID hộ gia đình)
- **Thứ tự:** DESC - Mới nhất lên đầu
- **Lý do:** Admin thường xử lý các hộ gia đình mới đăng ký

---

### 3. Quản Lý Cư Dân (Residents)

**File:** `backend/src/controllers/residentController.js`

```javascript
order: [['fullName', 'ASC']]
```

- **Trường:** `fullName` (Tên đầy đủ)
- **Thứ tự:** ASC - Sắp xếp A → Z
- **Lý do:** Dễ tìm kiếm theo tên

---

### 4. Quản Lý Người Dùng (Users)

**File:** `backend/src/controllers/userController.js`

```javascript
order: [['createdAt', 'DESC']]
```

- **Trường:** `createdAt` (Thời gian tạo)
- **Thứ tự:** DESC - Mới nhất lên đầu
- **Lý do:** Admin thường xử lý các tài khoản mới đăng ký

---

### 5. Quản Lý Loại Phí (Fee Types)

**File:** `backend/src/controllers/feeTypeController.js`

#### Danh sách tất cả

```javascript
order: [['feeTypeId', 'DESC']]
```

- **Trường:** `feeTypeId` (ID loại phí)
- **Thứ tự:** DESC - Mới nhất lên đầu
- **Lý do:** Loại phí mới thường được quan tâm hơn

#### Danh sách đang hoạt động (Active)

```javascript
order: [['feeName', 'ASC']]
```

- **Trường:** `feeName` (Tên loại phí)
- **Thứ tự:** ASC - Sắp xếp A → Z
- **Lý do:** Dễ chọn khi tạo khoản thu

---

### 6. Quản Lý Admin

**File:** `backend/src/controllers/adminController.js`

```javascript
order: [['fullName', 'ASC']]
```

- **Trường:** `fullName` (Tên đầy đủ)
- **Thứ tự:** ASC - Sắp xếp A → Z
- **Lý do:** Dễ tìm kiếm theo tên

---

### 7. Log Hệ Thống

**File:** `backend/src/controllers/logController.js`

```javascript
order: [['created_at', 'DESC']]
```

- **Trường:** `created_at` (Thời gian tạo - database column name)
- **Thứ tự:** DESC - Mới nhất lên đầu
- **Lý do:** Log mới nhất là thông tin quan trọng nhất
- **Lưu ý:** Sử dụng `created_at` (snake_case) thay vì `createdAt` (camelCase)

---

### 8. Thống Kê (Statistics)

**File:** `backend/src/controllers/statisticsController.js`

#### Thống kê theo hộ gia đình (Top 10)

```javascript
order: [[sequelize.literal('totalRevenue'), 'DESC']]
```

- **Trường:** `totalRevenue` (Tổng doanh thu)
- **Thứ tự:** DESC - Cao nhất lên đầu
- **Giới hạn:** 10 hộ gia đình
- **Lý do:** Hiển thị top 10 hộ có doanh thu cao nhất

#### Thống kê theo kỳ thu (Period)

```javascript
order: [[sequelize.literal('period'), 'ASC']]
```

- **Trường:** `period` (Kỳ thu - YYYY-MM)
- **Thứ tự:** ASC - Cũ đến mới
- **Lý do:** Hiển thị xu hướng theo thời gian

---

## 🎯 Quy Tắc Chung

### Theo Thời Gian (Timestamps)

- **DESC (Mới → Cũ):** Bills, Users, Fee Types (ID), Admin view Households, Logs
- **ASC (Cũ → Mới):** Statistics Period (để thấy xu hướng)

### Theo Tên (Names)

- **ASC (A → Z):** Households (ownerName), Residents (fullName), Admin (fullName), Active Fee Types (feeName)

### Theo Giá Trị Số (Numeric)

- **DESC (Cao → Thấp):** Statistics by Household (totalRevenue)

---

## 📝 Ghi Chú Quan Trọng

1. **Log Controller:** Sử dụng `created_at` (database column) thay vì `createdAt` (model attribute) do cấu hình đặc biệt của Sequelize

2. **Statistics Controller:** Sử dụng `sequelize.literal()` để sắp xếp theo calculated fields

3. **Households:** Có 2 cách sắp xếp khác nhau:
   - User view: Theo tên chủ hộ (dễ tìm)
   - Admin view: Theo ID (xử lý hộ mới)

4. **Fee Types:** Có 2 cách sắp xếp khác nhau:
   - Tất cả: Theo ID (mới nhất)
   - Active: Theo tên (dễ chọn)

---

## 🔄 Cách Thay Đổi Thứ Tự Sắp Xếp

Nếu muốn thay đổi thứ tự sắp xếp, tìm dòng `order:` trong controller tương ứng và chỉnh sửa:

```javascript
// Ví dụ: Đổi từ mới → cũ sang cũ → mới
order: [['createdAt', 'DESC']]  // Cũ
order: [['createdAt', 'ASC']]   // Mới

// Ví dụ: Đổi từ A → Z sang Z → A
order: [['fullName', 'ASC']]    // Cũ
order: [['fullName', 'DESC']]   // Mới
```

---

**Cập nhật lần cuối:** 26/12/2025  
**Người tạo:** Development Team
