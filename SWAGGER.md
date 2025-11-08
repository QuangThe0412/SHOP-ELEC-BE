# 📚 Swagger Documentation

## Truy cập Swagger UI

Khi chạy ở môi trường **development**, Swagger UI sẽ được kích hoạt tự động tại:

```
http://localhost:5000/api-docs
```

## Cấu hình môi trường

### Development (Swagger enabled)
```bash
# Sử dụng .env hoặc .env.development
ENABLE_SWAGGER=true
NODE_ENV=development
```

### Production (Swagger disabled)
```bash
# Sử dụng .env.production
ENABLE_SWAGGER=false
NODE_ENV=production
```

## Chạy với các môi trường khác nhau

### Development với Swagger
```bash
npm run dev
```

### Development với file .env.development
```bash
npm run dev:env
```

### Production với file .env.production
```bash
npm run prod:env
```

## Tính năng Swagger

✅ **Interactive API Testing** - Test API trực tiếp từ browser
✅ **Authentication Support** - Thêm JWT token để test protected endpoints
✅ **Request/Response Examples** - Xem ví dụ request và response
✅ **Schema Documentation** - Chi tiết về data models
✅ **Try It Out** - Gửi request thực tế và xem kết quả

## Cách sử dụng

### 1. Mở Swagger UI
Truy cập: `http://localhost:5000/api-docs`

### 2. Test endpoint không cần authentication
- Click vào endpoint bạn muốn test (vd: GET /api/products)
- Click "Try it out"
- Điền parameters (nếu có)
- Click "Execute"
- Xem response

### 3. Test endpoint cần authentication

#### Bước 1: Lấy token
1. Mở endpoint `POST /api/auth/login`
2. Click "Try it out"
3. Nhập:
   ```json
   {
     "email": "user@shop.com",
     "password": "user123"
   }
   ```
4. Click "Execute"
5. Copy `accessToken` từ response

#### Bước 2: Authorize
1. Click nút "Authorize" 🔒 ở góc trên
2. Nhập: `Bearer YOUR_ACCESS_TOKEN`
3. Click "Authorize"
4. Click "Close"

#### Bước 3: Test protected endpoints
Giờ bạn có thể test các endpoint cần authentication như:
- GET /api/auth/me
- POST /api/cart/items
- POST /api/orders
- etc.

## API Documentation Coverage

✅ **Auth** (5 endpoints)
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/refresh-token
- POST /api/auth/logout
- GET /api/auth/me

✅ **Products** (5 endpoints)
- GET /api/products
- GET /api/products/{id}
- POST /api/products (Admin)
- PUT /api/products/{id} (Admin)
- DELETE /api/products/{id} (Admin)

📝 **Các endpoints khác đang được document...**

## Tắt Swagger trong Production

Swagger sẽ tự động tắt khi:
1. `NODE_ENV=production`
2. Hoặc `ENABLE_SWAGGER=false`

Khi tắt, endpoint `/api-docs` sẽ không khả dụng.

## Thêm Documentation cho Routes mới

Thêm JSDoc comments trước mỗi route:

```javascript
/**
 * @swagger
 * /api/your-endpoint:
 *   get:
 *     summary: Mô tả ngắn gọn
 *     tags: [YourTag]
 *     parameters:
 *       - in: query
 *         name: param1
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/your-endpoint', yourHandler);
```

## Tùy chỉnh Swagger

File cấu hình: `src/config/swagger.js`

Có thể tùy chỉnh:
- Servers (dev/prod URLs)
- Security schemes
- Schemas/Models
- Tags
- API info

---

**Happy Documenting! 📖**
