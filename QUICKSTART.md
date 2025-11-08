# 🚀 Quick Start Guide - Shop Electronics API

## Bước 1: Cài đặt và Chạy

```bash
# 1. Cài đặt dependencies
npm install

# 2. Chạy server development
npm run dev

# Server sẽ chạy tại: http://localhost:5000
```

## Bước 2: Test API với Postman hoặc cURL

### 1. Đăng nhập để lấy token

**Customer Account:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@shop.com",
    "password": "user123"
  }'
```

**Admin Account:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@shop.com",
    "password": "admin123"
  }'
```

Response sẽ trả về `accessToken`, copy token này để dùng cho các request tiếp theo.

### 2. Lấy danh sách sản phẩm

```bash
curl http://localhost:5000/api/products
```

### 3. Thêm sản phẩm vào giỏ hàng

```bash
curl -X POST http://localhost:5000/api/cart/items \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "prod-1",
    "quantity": 1
  }'
```

### 4. Xem giỏ hàng

```bash
curl http://localhost:5000/api/cart \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 5. Tạo đơn hàng

```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "productId": "prod-1",
        "quantity": 1
      }
    ],
    "paymentMethod": "cod",
    "customerInfo": {
      "name": "Nguyễn Văn A",
      "email": "test@email.com",
      "phone": "0901234567",
      "address": "123 Đường ABC",
      "city": "Hồ Chí Minh",
      "district": "Quận 1",
      "ward": "Phường 1"
    }
  }'
```

## Bước 3: Kết nối với Frontend

### CORS đã được cấu hình sẵn cho:
- `http://localhost:5173` (Vite/React default)
- `http://localhost:3000` (Create React App default)

### Trong frontend, gọi API như sau:

```javascript
// Login
const response = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@shop.com',
    password: 'user123'
  })
});

const data = await response.json();
const token = data.data.accessToken;

// Get products with auth
const products = await fetch('http://localhost:5000/api/products', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

## 📋 Checklist Test

- [ ] Server chạy thành công tại port 5000
- [ ] Đăng nhập với admin account
- [ ] Đăng nhập với customer account
- [ ] Lấy danh sách sản phẩm
- [ ] Thêm sản phẩm vào giỏ hàng
- [ ] Tạo đơn hàng mới
- [ ] Xem dashboard admin
- [ ] Cập nhật trạng thái đơn hàng (admin)

## 🔧 Troubleshooting

### Port đã được sử dụng?
Thay đổi PORT trong file `.env`:
```env
PORT=3001
```

### CORS Error?
Cập nhật CLIENT_URL trong `.env`:
```env
CLIENT_URL=http://localhost:YOUR_FRONTEND_PORT
```

### Token không hợp lệ?
- Kiểm tra format: `Authorization: Bearer <token>`
- Token có thể đã hết hạn (7 ngày), đăng nhập lại
- Sử dụng refresh token để lấy token mới

## 📚 Tài liệu chi tiết

Xem file `README.md` để biết thêm chi tiết về:
- Tất cả API endpoints
- Response format
- Error codes
- Security features
- Deployment guide

## 🎯 Next Steps

1. Tích hợp với database thật (MongoDB, PostgreSQL)
2. Thêm payment gateway (VNPay, Momo, Stripe)
3. Implement WebSocket cho real-time notifications
4. Thêm email service (SendGrid, Nodemailer)
5. Upload ảnh với Cloudinary/AWS S3
6. Thêm unit tests và integration tests
7. Deploy lên production (Heroku, Railway, Render)

---

**Happy Coding! 🎉**
