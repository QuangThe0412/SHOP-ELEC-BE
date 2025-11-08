# API Test Collection

## Sử dụng với VS Code REST Client hoặc Postman

### Variables
```
@baseUrl = http://localhost:5000/api
@token = 
@refreshToken = 
```

---

## Authentication

### Register
```http
POST {{baseUrl}}/auth/register
Content-Type: application/json

{
  "email": "test@shop.com",
  "password": "test123",
  "name": "Test User"
}
```

### Login Admin
```http
POST {{baseUrl}}/auth/login
Content-Type: application/json

{
  "email": "admin@shop.com",
  "password": "admin123"
}
```

### Login Customer
```http
POST {{baseUrl}}/auth/login
Content-Type: application/json

{
  "email": "user@shop.com",
  "password": "user123"
}
```

### Get Current User
```http
GET {{baseUrl}}/auth/me
Authorization: Bearer {{token}}
```

### Refresh Token
```http
POST {{baseUrl}}/auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "{{refreshToken}}"
}
```

---

## Products

### Get All Products
```http
GET {{baseUrl}}/products
```

### Get Products with Filters
```http
GET {{baseUrl}}/products?category=dien-thoai-tablet&minPrice=10000000&maxPrice=30000000&sort=price-asc&page=1&limit=10
```

### Get Product by ID
```http
GET {{baseUrl}}/products/prod-1
```

### Create Product (Admin)
```http
POST {{baseUrl}}/products
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "name": "Test Product",
  "description": "Test description",
  "price": 1000000,
  "originalPrice": 1200000,
  "category": "phu-kien",
  "subCategory": "sac-cap",
  "image": "https://via.placeholder.com/300",
  "stock": 100
}
```

---

## Categories

### Get All Categories
```http
GET {{baseUrl}}/categories
```

### Get Category by ID
```http
GET {{baseUrl}}/categories/cat-1
```

---

## Cart

### Get Cart
```http
GET {{baseUrl}}/cart
Authorization: Bearer {{token}}
```

### Add to Cart
```http
POST {{baseUrl}}/cart/items
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "productId": "prod-1",
  "quantity": 2
}
```

### Update Cart Item
```http
PUT {{baseUrl}}/cart/items/cart-item-123
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "quantity": 3
}
```

### Remove from Cart
```http
DELETE {{baseUrl}}/cart/items/cart-item-123
Authorization: Bearer {{token}}
```

---

## Orders

### Create Order
```http
POST {{baseUrl}}/orders
Authorization: Bearer {{token}}
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
    "email": "test@email.com",
    "phone": "0901234567",
    "address": "123 Đường ABC",
    "city": "Hồ Chí Minh",
    "district": "Quận 1",
    "ward": "Phường Bến Nghé"
  }
}
```

### Get User Orders
```http
GET {{baseUrl}}/orders
Authorization: Bearer {{token}}
```

### Track Order (Public)
```http
GET {{baseUrl}}/orders/track/ORD001000
```

### Get All Orders (Admin)
```http
GET {{baseUrl}}/orders/admin/all?status=pending&page=1&limit=10
Authorization: Bearer {{token}}
```

### Update Order Status (Admin)
```http
PUT {{baseUrl}}/orders/order-123/status
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "status": "confirmed",
  "description": "Đơn hàng đã được xác nhận"
}
```

---

## Reviews

### Get Product Reviews
```http
GET {{baseUrl}}/reviews/products/prod-1/reviews?page=1&limit=10
```

### Create Review
```http
POST {{baseUrl}}/reviews
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "productId": "prod-1",
  "rating": 5,
  "comment": "Sản phẩm tuyệt vời!",
  "images": []
}
```

---

## Admin Dashboard

### Get Dashboard Stats
```http
GET {{baseUrl}}/admin/stats
Authorization: Bearer {{token}}
```

### Get Recent Orders
```http
GET {{baseUrl}}/admin/orders/recent?limit=10
Authorization: Bearer {{token}}
```

### Get Top Selling Products
```http
GET {{baseUrl}}/admin/products/top-selling?limit=10
Authorization: Bearer {{token}}
```

### Get Revenue Chart
```http
GET {{baseUrl}}/admin/revenue/chart?period=week
Authorization: Bearer {{token}}
```
