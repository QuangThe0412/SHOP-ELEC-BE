require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./src/config/swagger');
const prisma = require('./src/lib/prisma');

// Import middleware
const { errorHandler, notFound, requestLogger } = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// Compression
app.use(compression());

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger
app.use(requestLogger);

// Rate limiting
const limiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Swagger Documentation (only in development)
const enableSwagger = process.env.ENABLE_SWAGGER === 'true' || process.env.NODE_ENV === 'development';
if (enableSwagger) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Shop Electronics API Documentation'
  }));
  console.log('📚 Swagger UI enabled at /api-docs');
}

// Health check
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Shop Electronics API Server',
    version: '1.0.0',
    documentation: enableSwagger ? '/api-docs' : 'Documentation disabled in production',
    endpoints: {
      auth: '/api/auth',
      products: '/api/products',
      cart: '/api/cart',
      orders: '/api/orders',
      categories: '/api/categories',
      reviews: '/api/reviews',
      admin: '/api/admin'
    }
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════╗
║                                                        ║
║   🛒 Shop Electronics API Server                      ║
║                                                        ║
║   Server running on: http://localhost:${PORT}         ║
║   Environment: ${process.env.NODE_ENV || 'development'}                              ║
║   Swagger Docs: ${enableSwagger ? `http://localhost:${PORT}/api-docs` : 'Disabled'}      ║
║                                                        ║
║   Available Endpoints:                                 ║
║   • Auth:       /api/auth                             ║
║   • Products:   /api/products                         ║
║   • Cart:       /api/cart                             ║
║   • Orders:     /api/orders                           ║
║   • Categories: /api/categories                       ║
║   • Reviews:    /api/reviews                          ║
║   • Admin:      /api/admin                            ║
║                                                        ║
║   Database:     Connected to SQL Server               ║
║   Default Accounts:                                    ║
║   Admin:    admin@elecshop.com / admin123             ║
║   Customer: user1@example.com / user123               ║
║                                                        ║
╚════════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🔌 Disconnecting from database...');
  await prisma.$disconnect();
  console.log('✅ Database disconnected');
  process.exit(0);
});

module.exports = app;
