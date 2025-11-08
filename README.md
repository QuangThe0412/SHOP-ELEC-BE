# Shop Electronics Backend API

Backend API server cho hệ thống thương mại điện tử Shop Electronics, được xây dựng với Node.js, Express.js và sử dụng mock data.

## 🚀 Tính năng

### Authentication & Authorization
- ✅ Đăng ký tài khoản mới
- ✅ Đăng nhập với JWT
- ✅ Refresh token
- ✅ Phân quyền Admin/Customer
- ✅ Bảo mật với bcrypt

### Quản lý Sản phẩm
- ✅ Xem danh sách sản phẩm (có phân trang)
- ✅ Lọc theo category, giá, rating
- ✅ Tìm kiếm sản phẩm
- ✅ Sắp xếp theo nhiều tiêu chí
- ✅ CRUD sản phẩm (Admin only)

### Giỏ hàng
- ✅ Thêm/xóa/cập nhật sản phẩm trong giỏ
- ✅ Tính tổng tiền tự động
- ✅ Miễn phí ship cho đơn > 500k

### Đơn hàng
- ✅ Tạo đơn hàng mới
- ✅ Xem lịch sử đơn hàng
- ✅ Theo dõi đơn hàng (public)
- ✅ Cập nhật trạng thái (Admin)
- ✅ Quản lý tất cả đơn hàng (Admin)

### Danh mục & Đánh giá
- ✅ Quản lý categories
- ✅ Đánh giá & rating sản phẩm
- ✅ Verified purchase check

### Admin Dashboard
- ✅ Thống kê doanh thu
- ✅ Quản lý đơn hàng
- ✅ Sản phẩm bán chạy
- ✅ Biểu đồ doanh thu

## 📁 Cấu trúc dự án

```
shop-elec-be/
├── src/
│   ├── controllers/       # Business logic
│   │   ├── authController.js
│   │   ├── productController.js
│   │   ├── cartController.js
│   │   ├── orderController.js
│   │   ├── categoryController.js
│   │   ├── reviewController.js
│   │   └── adminController.js
│   ├── routes/           # API routes
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   ├── cartRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── categoryRoutes.js
│   │   ├── reviewRoutes.js
│   │   └── adminRoutes.js
│   ├── middleware/       # Custom middleware
│   │   ├── auth.js
│   │   └── errorHandler.js
│   ├── utils/           # Utility functions
│   │   ├── jwt.js
│   │   ├── response.js
│   │   └── validation.js
│   ├── data/            # Mock data
│   │   └── mockData.js
│   └── models/          # Type definitions
│       └── types.js
├── .env                 # Environment variables
├── .env.example        # Environment template
├── .gitignore
├── server.js           # Entry point
├── package.json
└── README.md
```

## 🛠️ Cài đặt

### Yêu cầu
- Node.js >= 14.x
- npm hoặc yarn

### Các bước cài đặt

1. Clone repository:
```bash
git clone <repository-url>
cd shop-elec-be
```

2. Cài đặt dependencies:
```bash
npm install
```

3. Tạo file .env (copy từ .env.example):
```bash
copy .env.example .env
```

4. Chỉnh sửa file .env theo cấu hình của bạn

5. Chạy server:
```bash
# Development mode (with nodemon)
npm run dev

# Production mode
npm start
```

Server sẽ chạy tại `http://localhost:5000`

## 📡 API Endpoints

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/register` | Đăng ký tài khoản | ❌ |
| POST | `/login` | Đăng nhập | ❌ |
| POST | `/logout` | Đăng xuất | ❌ |
| GET | `/me` | Lấy thông tin user | ✅ |
| POST | `/refresh-token` | Làm mới token | ❌ |

### Products (`/api/products`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | Lấy danh sách sản phẩm | ❌ |
| GET | `/:id` | Lấy chi tiết sản phẩm | ❌ |
| POST | `/` | Tạo sản phẩm mới | 🔒 Admin |
| PUT | `/:id` | Cập nhật sản phẩm | 🔒 Admin |
| DELETE | `/:id` | Xóa sản phẩm | 🔒 Admin |

### Cart (`/api/cart`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | Lấy giỏ hàng | ✅ |
| POST | `/items` | Thêm vào giỏ | ✅ |
| PUT | `/items/:itemId` | Cập nhật số lượng | ✅ |
| DELETE | `/items/:itemId` | Xóa khỏi giỏ | ✅ |
| DELETE | `/` | Xóa toàn bộ giỏ | ✅ |

### Orders (`/api/orders`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/` | Tạo đơn hàng | ✅ |
| GET | `/` | Lấy đơn hàng của user | ✅ |
| GET | `/:orderId` | Chi tiết đơn hàng | ✅ |
| GET | `/track/:orderCode` | Theo dõi đơn hàng | ❌ |
| GET | `/admin/all` | Tất cả đơn hàng | 🔒 Admin |
| PUT | `/:orderId/status` | Cập nhật trạng thái | 🔒 Admin |

### Categories (`/api/categories`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | Lấy danh sách danh mục | ❌ |
| GET | `/:categoryId` | Chi tiết danh mục | ❌ |
| POST | `/` | Tạo danh mục | 🔒 Admin |
| PUT | `/:categoryId` | Cập nhật danh mục | 🔒 Admin |
| DELETE | `/:categoryId` | Xóa danh mục | 🔒 Admin |

### Reviews (`/api/reviews`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/products/:productId/reviews` | Lấy đánh giá sản phẩm | ❌ |
| POST | `/` | Tạo đánh giá | ✅ |
| PUT | `/:reviewId` | Cập nhật đánh giá | ✅ |
| DELETE | `/:reviewId` | Xóa đánh giá | ✅ |

### Admin (`/api/admin`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/stats` | Thống kê dashboard | 🔒 Admin |
| GET | `/orders/recent` | Đơn hàng gần đây | 🔒 Admin |
| GET | `/products/top-selling` | Sản phẩm bán chạy | 🔒 Admin |
| GET | `/users/recent` | User mới đăng ký | 🔒 Admin |
| GET | `/revenue/chart` | Dữ liệu biểu đồ | 🔒 Admin |

## 🔐 Authentication

API sử dụng JWT (JSON Web Token) cho authentication.

### Đăng nhập
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@shop.com",
  "password": "user123"
}
```

Response:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "2",
      "email": "user@shop.com",
      "name": "Customer User",
      "role": "customer"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Sử dụng Token
Thêm header `Authorization` vào các request cần authentication:

```bash
Authorization: Bearer <your-access-token>
```

## 📝 Ví dụ sử dụng

### Lấy danh sách sản phẩm với filters
```bash
GET /api/products?category=laptop-may-tinh&minPrice=10000000&maxPrice=50000000&sort=price-asc&page=1&limit=10
```

### Thêm sản phẩm vào giỏ hàng
```bash
POST /api/cart/items
Authorization: Bearer <token>
Content-Type: application/json

{
  "productId": "prod-1",
  "quantity": 2
}
```

### Tạo đơn hàng
```bash
POST /api/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "items": [
    {
      "productId": "prod-1",
      "quantity": 1
    }
  ],
  "paymentMethod": "cod",
  "customerInfo": {
    "name": "Nguyễn Văn A",
    "email": "nguyenvana@email.com",
    "phone": "0901234567",
    "address": "123 Đường ABC",
    "city": "Hồ Chí Minh",
    "district": "Quận 1",
    "ward": "Phường Bến Nghé"
  }
}
```

## 👥 Tài khoản mặc định

### Admin Account
- Email: `admin@shop.com`
- Password: `admin123`
- Role: `admin`

### Customer Account
- Email: `user@shop.com`
- Password: `user123`
- Role: `customer`

## 🔒 Security Features

- ✅ Helmet.js - Security headers
- ✅ CORS configuration
- ✅ Rate limiting
- ✅ JWT authentication
- ✅ Password hashing with bcrypt
- ✅ Input validation
- ✅ Request compression

## 🚀 Deployment

### Environment Variables cần thiết cho Production:

```env
NODE_ENV=production
PORT=5000
JWT_SECRET=<your-secure-secret>
JWT_REFRESH_SECRET=<your-secure-refresh-secret>
CLIENT_URL=<your-frontend-url>
```

## 📄 Response Format

### Success Response
```json
{
  "success": true,
  "message": "Success message",
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "code": "ERROR_CODE"
}
```

## 🐛 Error Codes

| Code | Description |
|------|-------------|
| `NO_TOKEN` | Token không được cung cấp |
| `INVALID_TOKEN` | Token không hợp lệ hoặc hết hạn |
| `AUTH_REQUIRED` | Yêu cầu xác thực |
| `FORBIDDEN` | Không có quyền truy cập |
| `NOT_FOUND` | Không tìm thấy tài nguyên |
| `VALIDATION_ERROR` | Lỗi validate dữ liệu |
| `INTERNAL_ERROR` | Lỗi server |

## 📞 Support

Nếu có vấn đề hoặc câu hỏi, vui lòng tạo issue trên GitHub.

## 📜 License

ISC License

---

**Made with ❤️ by Your Team**
