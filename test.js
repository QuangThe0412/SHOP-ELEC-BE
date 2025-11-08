const http = require('http');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function testEndpoint(method, path, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          resolve({ status: res.statusCode, data: response });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function runTests() {
  log('\n╔════════════════════════════════════════════════════════╗', 'blue');
  log('║        Shop Electronics API - Test Suite              ║', 'blue');
  log('╚════════════════════════════════════════════════════════╝\n', 'blue');

  let token = null;
  let orderId = null;

  try {
    // Test 1: Health Check
    log('1. Testing Health Check...', 'yellow');
    const health = await testEndpoint('GET', '/api/health');
    if (health.status === 200 && health.data.success) {
      log('   ✓ Health check passed', 'green');
    } else {
      log('   ✗ Health check failed', 'red');
    }

    // Test 2: Get Categories
    log('\n2. Testing Get Categories...', 'yellow');
    const categories = await testEndpoint('GET', '/api/categories');
    if (categories.status === 200 && categories.data.data.categories.length > 0) {
      log(`   ✓ Found ${categories.data.data.categories.length} categories`, 'green');
    } else {
      log('   ✗ Failed to get categories', 'red');
    }

    // Test 3: Get Products
    log('\n3. Testing Get Products...', 'yellow');
    const products = await testEndpoint('GET', '/api/products');
    if (products.status === 200 && products.data.data.products.length > 0) {
      log(`   ✓ Found ${products.data.data.products.length} products`, 'green');
    } else {
      log('   ✗ Failed to get products', 'red');
    }

    // Test 4: Login
    log('\n4. Testing Login...', 'yellow');
    const login = await testEndpoint('POST', '/api/auth/login', {
      email: 'user@shop.com',
      password: 'user123'
    });
    if (login.status === 200 && login.data.data.accessToken) {
      token = login.data.data.accessToken;
      log('   ✓ Login successful', 'green');
      log(`   User: ${login.data.data.user.name} (${login.data.data.user.role})`, 'green');
    } else {
      log('   ✗ Login failed', 'red');
      return;
    }

    // Test 5: Get Current User
    log('\n5. Testing Get Current User...', 'yellow');
    const me = await testEndpoint('GET', '/api/auth/me', null, token);
    if (me.status === 200 && me.data.data.user) {
      log(`   ✓ User authenticated: ${me.data.data.user.email}`, 'green');
    } else {
      log('   ✗ Failed to get current user', 'red');
    }

    // Test 6: Add to Cart
    log('\n6. Testing Add to Cart...', 'yellow');
    const cart = await testEndpoint('POST', '/api/cart/items', {
      productId: 'prod-1',
      quantity: 2
    }, token);
    if (cart.status === 201) {
      log('   ✓ Product added to cart', 'green');
    } else {
      log('   ✗ Failed to add to cart', 'red');
    }

    // Test 7: Get Cart
    log('\n7. Testing Get Cart...', 'yellow');
    const getCart = await testEndpoint('GET', '/api/cart', null, token);
    if (getCart.status === 200 && getCart.data.data.items) {
      log(`   ✓ Cart has ${getCart.data.data.items.length} items`, 'green');
      log(`   Total: ${getCart.data.data.summary.total.toLocaleString('vi-VN')} VND`, 'green');
    } else {
      log('   ✗ Failed to get cart', 'red');
    }

    // Test 8: Create Order
    log('\n8. Testing Create Order...', 'yellow');
    const order = await testEndpoint('POST', '/api/orders', {
      items: [
        {
          productId: 'prod-1',
          quantity: 1
        }
      ],
      paymentMethod: 'cod',
      customerInfo: {
        name: 'Test User',
        email: 'test@email.com',
        phone: '0901234567',
        address: '123 Test Street',
        city: 'Hồ Chí Minh',
        district: 'Quận 1',
        ward: 'Phường 1'
      }
    }, token);
    if (order.status === 201 && order.data.data.order) {
      orderId = order.data.data.order.id;
      log(`   ✓ Order created: ${order.data.data.order.orderCode}`, 'green');
      log(`   Total: ${order.data.data.order.total.toLocaleString('vi-VN')} VND`, 'green');
    } else {
      log('   ✗ Failed to create order', 'red');
    }

    // Test 9: Track Order
    if (orderId) {
      log('\n9. Testing Track Order...', 'yellow');
      const track = await testEndpoint('GET', `/api/orders/${orderId}`, null, token);
      if (track.status === 200 && track.data.data.order) {
        log(`   ✓ Order tracked: ${track.data.data.order.status}`, 'green');
      } else {
        log('   ✗ Failed to track order', 'red');
      }
    }

    // Test 10: Admin Login
    log('\n10. Testing Admin Login...', 'yellow');
    const adminLogin = await testEndpoint('POST', '/api/auth/login', {
      email: 'admin@shop.com',
      password: 'admin123'
    });
    if (adminLogin.status === 200 && adminLogin.data.data.user.role === 'admin') {
      const adminToken = adminLogin.data.data.accessToken;
      log('   ✓ Admin login successful', 'green');

      // Test Admin Dashboard
      log('\n11. Testing Admin Dashboard...', 'yellow');
      const stats = await testEndpoint('GET', '/api/admin/stats', null, adminToken);
      if (stats.status === 200 && stats.data.data) {
        log('   ✓ Dashboard stats retrieved', 'green');
        log(`   Total Orders: ${stats.data.data.orders.total}`, 'green');
        log(`   Total Products: ${stats.data.data.products.total}`, 'green');
        log(`   Total Revenue: ${stats.data.data.revenue.total.toLocaleString('vi-VN')} VND`, 'green');
      } else {
        log('   ✗ Failed to get dashboard stats', 'red');
      }
    } else {
      log('   ✗ Admin login failed', 'red');
    }

    log('\n╔════════════════════════════════════════════════════════╗', 'blue');
    log('║               All Tests Completed! ✓                   ║', 'blue');
    log('╚════════════════════════════════════════════════════════╝\n', 'blue');

  } catch (error) {
    log(`\n✗ Test failed with error: ${error.message}`, 'red');
    log('\nMake sure the server is running on http://localhost:5000', 'yellow');
  }
}

// Run tests
runTests();
