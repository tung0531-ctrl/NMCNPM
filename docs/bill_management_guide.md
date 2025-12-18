# Hướng Dẫn Xây Dựng Trang Quản Lý Khoản Thu

## 1. Tổng Quan
Trang quản lý khoản thu là một hệ thống bao gồm backend và frontend, cho phép quản lý các hóa đơn thanh toán với các tính năng:
- Hiển thị danh sách hóa đơn với phân trang (10 hóa đơn/trang).
- Tìm kiếm hóa đơn theo tên hộ gia đình, kỳ thanh toán, trạng thái thanh toán, và người thu.
- Lọc hóa đơn theo trạng thái thanh toán ("Đã thanh toán", "Chưa thanh toán", "Thanh toán một phần").

## 2. Kiến Trúc Hệ Thống
Hệ thống được chia thành hai phần chính:
- **Backend**: Xây dựng API sử dụng Node.js, Express, Sequelize ORM và MySQL.
- **Frontend**: Xây dựng giao diện người dùng sử dụng React, TypeScript, Tailwind CSS và Axios.

---

## 3. Backend
### 3.1. Cấu Trúc Thư Mục
```
backend/
├── src/
│   ├── controllers/
│   │   └── billController.js
│   ├── models/
│   │   ├── Bill.js
│   │   ├── Household.js
│   │   └── User.js
│   ├── routes/
│   │   └── billRoute.js
│   └── libs/
│       └── db.js
├── package.json
```

### 3.2. Các Bước Xây Dựng
#### a. Tạo Model
- **Bill.js**: Đại diện cho bảng `bills` trong cơ sở dữ liệu.
  ```javascript
  const Bill = sequelize.define('Bill', {
      billId: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      householdId: DataTypes.INTEGER,
      billingPeriod: DataTypes.STRING,
      totalAmount: DataTypes.FLOAT,
      paidAmount: DataTypes.FLOAT,
      paymentStatus: DataTypes.ENUM('PAID', 'UNPAID', 'PARTIAL'),
      collectorId: DataTypes.INTEGER
  });
  ```

#### b. Tạo Controller
- **billController.js**: Xử lý logic lấy danh sách hóa đơn với phân trang và bộ lọc.
  ```javascript
  const getAllBills = async (req, res) => {
      const { page, limit, status, householdName } = req.query;
      const offset = (page - 1) * limit;
      const bills = await Bill.findAndCountAll({
          where: { paymentStatus: status },
          limit,
          offset
      });
      res.json(bills);
  };
  ```

#### c. Tạo Route
- **billRoute.js**: Định nghĩa endpoint `/api/bills`.
  ```javascript
  const express = require('express');
  const router = express.Router();
  const { getAllBills } = require('../controllers/billController');

  router.get('/bills', getAllBills);
  module.exports = router;
  ```

#### d. Kết Nối Cơ Sở Dữ Liệu
- **db.js**: Kết nối Sequelize với MySQL.
  ```javascript
  const sequelize = new Sequelize('database', 'username', 'password', {
      host: 'localhost',
      dialect: 'mysql'
  });
  ```

---

## 4. Frontend
### 4.1. Cấu Trúc Thư Mục
```
frontend/
├── src/
│   ├── pages/
│   │   └── BillManagementPage.tsx
│   ├── services/
│   │   └── billService.ts
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   └── Input.tsx
│   │   └── auth/
│   └── lib/
│       └── axios.ts
├── package.json
```

### 4.2. Các Bước Xây Dựng
#### a. Tạo Service
- **billService.ts**: Gửi yêu cầu API đến backend.
  ```typescript
  import axios from '../lib/axios';

  export const getBills = async (filters) => {
      const response = await axios.get('/bills', { params: filters });
      return response.data;
  };
  ```

#### b. Tạo Trang Quản Lý
- **BillManagementPage.tsx**: Hiển thị giao diện quản lý hóa đơn.
  ```tsx
  const BillManagementPage = () => {
      const [bills, setBills] = useState([]);

      useEffect(() => {
          const fetchBills = async () => {
              const data = await getBills({ page: 1, limit: 10 });
              setBills(data.rows);
          };
          fetchBills();
      }, []);

      return (
          <div>
              <h1>Quản Lý Khoản Thu</h1>
              <table>
                  <thead>
                      <tr>
                          <th>Hộ Gia Đình</th>
                          <th>Kỳ Thanh Toán</th>
                          <th>Trạng Thái</th>
                      </tr>
                  </thead>
                  <tbody>
                      {bills.map((bill) => (
                          <tr key={bill.billId}>
                              <td>{bill.householdName}</td>
                              <td>{bill.billingPeriod}</td>
                              <td>{bill.paymentStatus}</td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>
      );
  };
  ```

#### c. Tạo Component UI
- **Button.tsx**: Nút bấm tái sử dụng.
  ```tsx
  const Button = ({ onClick, children }) => (
      <button onClick={onClick} className="btn">
          {children}
      </button>
  );
  ```

#### d. Cấu Hình Axios
- **axios.ts**: Cấu hình baseURL và interceptor.
  ```typescript
  import axios from 'axios';

  const instance = axios.create({
      baseURL: 'http://localhost:5001/api'
  });

  export default instance;
  ```

---

## 5. Kiểm Tra
- Chạy backend: `cd backend && npm start`
- Chạy frontend: `cd frontend && npm run dev`
- Truy cập: [http://localhost:5173](http://localhost:5173)
- Kiểm tra các tính năng:
  - Phân trang: Chuyển đổi giữa các trang.
  - Tìm kiếm: Nhập tên hộ gia đình, kỳ thanh toán.
  - Lọc trạng thái: Chọn "Đã thanh toán", "Chưa thanh toán", "Thanh toán một phần".

---

## 6. Kết Luận
Hệ thống quản lý khoản thu được xây dựng với kiến trúc rõ ràng, dễ mở rộng. Các bước trên giúp bạn hiểu cách xây dựng từ đầu, từ backend đến frontend. Nếu cần hỗ trợ thêm, hãy liên hệ!