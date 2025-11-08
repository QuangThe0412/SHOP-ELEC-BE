const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Shop Electronics API',
      version: '1.0.0',
      description: 'Backend API cho hệ thống thương mại điện tử Shop Electronics',
      contact: {
        name: 'API Support',
        email: 'support@shopelec.com'
      },
      license: {
        name: 'ISC',
        url: 'https://opensource.org/licenses/ISC'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server'
      },
      {
        url: 'https://api.shopelec.com',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string', format: 'email' },
            name: { type: 'string' },
            role: { type: 'string', enum: ['customer', 'admin'] },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Product: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            description: { type: 'string' },
            price: { type: 'number' },
            originalPrice: { type: 'number' },
            category: { type: 'string' },
            subCategory: { type: 'string' },
            image: { type: 'string' },
            images: { type: 'array', items: { type: 'string' } },
            rating: { type: 'number' },
            reviewCount: { type: 'number' },
            stock: { type: 'number' },
            tags: { type: 'array', items: { type: 'string' } },
            specs: { type: 'object' },
            isBestSeller: { type: 'boolean' },
            isNewArrival: { type: 'boolean' }
          }
        },
        Category: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            slug: { type: 'string' },
            icon: { type: 'string' },
            itemCount: { type: 'number' },
            subCategories: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  slug: { type: 'string' },
                  itemCount: { type: 'number' }
                }
              }
            }
          }
        },
        CartItem: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            productId: { type: 'string' },
            userId: { type: 'string' },
            quantity: { type: 'number' },
            product: { $ref: '#/components/schemas/Product' }
          }
        },
        Order: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            userId: { type: 'string' },
            orderCode: { type: 'string' },
            items: { type: 'array' },
            subtotal: { type: 'number' },
            shippingFee: { type: 'number' },
            total: { type: 'number' },
            status: { type: 'string', enum: ['pending', 'confirmed', 'shipping', 'delivered', 'cancelled'] },
            paymentMethod: { type: 'string', enum: ['cod', 'transfer', 'card'] },
            paymentStatus: { type: 'string', enum: ['pending', 'paid', 'failed'] },
            customerInfo: { type: 'object' },
            timeline: { type: 'array' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Review: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            productId: { type: 'string' },
            userId: { type: 'string' },
            userName: { type: 'string' },
            rating: { type: 'number', minimum: 1, maximum: 5 },
            comment: { type: 'string' },
            images: { type: 'array', items: { type: 'string' } },
            verifiedPurchase: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string' },
            data: { type: 'object' }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            code: { type: 'string' }
          }
        }
      }
    },
    tags: [
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Products', description: 'Product management' },
      { name: 'Cart', description: 'Shopping cart' },
      { name: 'Orders', description: 'Order management' },
      { name: 'Categories', description: 'Category management' },
      { name: 'Reviews', description: 'Product reviews' },
      { name: 'Admin', description: 'Admin dashboard' }
    ]
  },
  apis: ['./src/routes/*.js'] // Path to API routes
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
