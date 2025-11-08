# 🌍 Environment Configuration Guide

## Các file môi trường

Dự án hỗ trợ nhiều file .env cho các môi trường khác nhau:

```
.env                 → Môi trường hiện tại (local development)
.env.development     → Cấu hình cho Development
.env.production      → Cấu hình cho Production
.env.example         → Template mẫu
```

## Sử dụng

### Development
```bash
# Mặc định sử dụng .env
npm run dev

# Hoặc sử dụng .env.development
npm run dev:env
```

### Production
```bash
# Sử dụng .env.production
npm run prod:env

# Hoặc set NODE_ENV
npm run start:prod
```

## Cấu hình quan trọng

### 1. Swagger Documentation

**Development** (Swagger enabled):
```env
NODE_ENV=development
ENABLE_SWAGGER=true
```

**Production** (Swagger disabled):
```env
NODE_ENV=production
ENABLE_SWAGGER=false
```

### 2. CORS

**Development**:
```env
CLIENT_URL=http://localhost:5173
```

**Production**:
```env
CLIENT_URL=https://your-frontend-domain.com
```

### 3. JWT Secrets

⚠️ **QUAN TRỌNG**: Thay đổi JWT secrets trước khi deploy production!

```env
JWT_SECRET=your-very-long-and-random-secret-key
JWT_REFRESH_SECRET=another-very-long-and-random-secret-key
```

### 4. Rate Limiting

```env
RATE_LIMIT_WINDOW_MS=900000      # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100      # 100 requests per IP
```

## So sánh Development vs Production

| Feature | Development | Production |
|---------|-------------|------------|
| Swagger UI | ✅ Enabled | ❌ Disabled |
| Detailed Logs | ✅ Yes | ⚠️ Minimal |
| Rate Limit | 100/15min | 100/15min |
| CORS | localhost | Production domain |
| Auto-reload | ✅ Yes (nodemon) | ❌ No |

## File .gitignore

Các file .env **KHÔNG** được commit vào Git:

```gitignore
.env
.env.local
.env.production
```

Chỉ commit:
- ✅ .env.example
- ✅ .env.development (nếu không chứa secrets)

## Tạo .env từ template

```bash
# Copy template
copy .env.example .env

# Chỉnh sửa giá trị
notepad .env
```

## Environment Variables Reference

### Server
- `PORT` - Port server chạy (default: 5000)
- `NODE_ENV` - Môi trường: development | production

### Security
- `JWT_SECRET` - Secret key cho access token
- `JWT_REFRESH_SECRET` - Secret key cho refresh token
- `JWT_EXPIRE` - Thời gian hết hạn access token (7d)
- `JWT_REFRESH_EXPIRE` - Thời gian hết hạn refresh token (30d)

### CORS
- `CLIENT_URL` - URL của frontend được phép truy cập

### Rate Limiting
- `RATE_LIMIT_WINDOW_MS` - Khung thời gian (ms)
- `RATE_LIMIT_MAX_REQUESTS` - Số request tối đa

### Documentation
- `ENABLE_SWAGGER` - Bật/tắt Swagger UI (true/false)

## Best Practices

### ✅ DO
- Sử dụng .env.development cho dev
- Sử dụng .env.production cho prod
- Thay đổi JWT secrets trong production
- Set ENABLE_SWAGGER=false trong production
- Sử dụng HTTPS URL cho CLIENT_URL trong production

### ❌ DON'T
- Commit file .env vào Git
- Dùng chung secrets giữa dev và prod
- Để Swagger enabled trong production
- Hard-code sensitive data trong code

## Troubleshooting

### Swagger không hiển thị?
Kiểm tra:
```env
ENABLE_SWAGGER=true
NODE_ENV=development
```

### CORS Error?
Kiểm tra CLIENT_URL trong .env:
```env
CLIENT_URL=http://localhost:3000  # Phải khớp với frontend URL
```

### Token không hợp lệ?
Kiểm tra JWT_SECRET có khớp không, và không bị thay đổi giữa các lần restart.

---

**Luôn kiểm tra file .env trước khi deploy! 🔐**
