# Cấu trúc dự án Shop Electronics Backend

```
shop-elec-be/
│
├── 📁 src/                          # Source code chính
│   │
│   ├── 📁 controllers/              # Business logic & xử lý request
│   │   ├── authController.js        # Xác thực (login, register, logout)
│   │   ├── productController.js     # Quản lý sản phẩm (CRUD)
│   │   ├── cartController.js        # Quản lý giỏ hàng
│   │   ├── orderController.js       # Quản lý đơn hàng
│   │   ├── categoryController.js    # Quản lý danh mục
│   │   ├── reviewController.js      # Quản lý đánh giá
│   │   └── adminController.js       # Dashboard & thống kê admin
│   │
│   ├── 📁 routes/                   # Định nghĩa API routes
│   │   ├── authRoutes.js            # /api/auth/*
│   │   ├── productRoutes.js         # /api/products/*
│   │   ├── cartRoutes.js            # /api/cart/*
│   │   ├── orderRoutes.js           # /api/orders/*
│   │   ├── categoryRoutes.js        # /api/categories/*
│   │   ├── reviewRoutes.js          # /api/reviews/*
│   │   └── adminRoutes.js           # /api/admin/*
│   │
│   ├── 📁 middleware/               # Custom middleware
│   │   ├── auth.js                  # Authentication & authorization
│   │   └── errorHandler.js          # Error handling & logging
│   │
│   ├── 📁 utils/                    # Utility functions
│   │   ├── jwt.js                   # JWT token generation & verification
│   │   ├── response.js              # Standard response format
│   │   └── validation.js            # Input validation helpers
│   │
│   ├── 📁 data/                     # Mock data
│   │   └── mockData.js              # Products, users, orders, etc.
│   │
│   └── 📁 models/                   # Type definitions
│       └── types.js                 # JSDoc type definitions
│
├── 📄 server.js                     # Entry point - Express app setup
├── 📄 package.json                  # Dependencies & scripts
│
├── 📄 .env                          # Environment variables (local)
├── 📄 .env.example                  # Environment template
├── 📄 .gitignore                    # Git ignore rules
│
├── 📄 README.md                     # Tài liệu chi tiết
├── 📄 QUICKSTART.md                 # Hướng dẫn nhanh
├── 📄 API_TESTS.md                  # API test examples
└── 📄 test.js                       # Automated test suite

```

## 📝 Chi tiết từng thành phần

### Controllers
Xử lý business logic cho từng module:
- **authController**: Đăng ký, đăng nhập, JWT tokens
- **productController**: CRUD sản phẩm, filter, search, pagination
- **cartController**: Quản lý giỏ hàng, tính tổng tiền
- **orderController**: Tạo đơn, theo dõi, cập nhật trạng thái
- **categoryController**: Quản lý danh mục sản phẩm
- **reviewController**: Đánh giá & rating sản phẩm
- **adminController**: Dashboard, thống kê, báo cáo

### Routes
Định nghĩa các API endpoints và middleware:
- Phân tách route theo module
- Áp dụng authentication middleware
- Role-based authorization (admin/customer)

### Middleware
- **auth.js**: Xác thực JWT, phân quyền
- **errorHandler.js**: Xử lý lỗi toàn cục, logging

### Utils
Các hàm tiện ích tái sử dụng:
- **jwt.js**: Tạo & verify JWT tokens
- **response.js**: Format response chuẩn
- **validation.js**: Validate input (email, phone, required fields)

### Data
Mock data cho development (thay thế database):
- Users (admin & customer accounts)
- Products (5+ sản phẩm mẫu)
- Categories (4+ danh mục)
- In-memory carts & orders

### Models
JSDoc type definitions cho IntelliSense:
- User, Product, Category
- Cart, Order, Review
- Giúp auto-complete khi code

## 🔄 Luồng xử lý Request

```
Client Request
    ↓
Express App (server.js)
    ↓
Middleware (auth, logging, rate-limit)
    ↓
Routes (authRoutes, productRoutes, etc.)
    ↓
Controllers (business logic)
    ↓
Data/Services (mockData.js)
    ↓
Response (success/error format)
    ↓
Client
```

## 🎯 Mở rộng dự án

### Thêm module mới
1. Tạo controller: `src/controllers/newController.js`
2. Tạo routes: `src/routes/newRoutes.js`
3. Import trong `server.js`: `app.use('/api/new', newRoutes)`

### Kết nối Database
Thay `mockData.js` bằng:
- MongoDB + Mongoose
- PostgreSQL + Sequelize/TypeORM
- Prisma ORM

### Thêm tính năng
- Upload ảnh: Multer + Cloudinary/S3
- Email: Nodemailer + SendGrid
- Payment: VNPay, Stripe integration
- Real-time: Socket.io
- Caching: Redis
- Queue: Bull/BullMQ

## 🔒 Security Layers

```
Client → CORS → Rate Limit → Helmet → Auth → Authorization → Controller
```

1. **CORS**: Chỉ cho phép domain được config
2. **Rate Limit**: Giới hạn request/IP
3. **Helmet**: Security headers
4. **Auth**: JWT verification
5. **Authorization**: Role-based access control
6. **Validation**: Input sanitization

## 📊 Monitoring & Logging

Có thể thêm:
- Morgan: HTTP request logger
- Winston: Advanced logging
- Sentry: Error tracking
- New Relic/DataDog: APM

---

**Dự án được thiết kế modular, dễ mở rộng và bảo trì!** 🚀
