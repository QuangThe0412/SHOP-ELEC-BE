const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data
  await prisma.review.deleteMany();
  await prisma.orderTimeline.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.subCategory.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  console.log('✅ Cleared existing data');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@elecshop.com',
      password: hashedPassword,
      name: 'Admin User',
      role: 'admin',
    },
  });

  // Create regular users
  const user1 = await prisma.user.create({
    data: {
      email: 'user1@example.com',
      password: await bcrypt.hash('user123', 10),
      name: 'John Doe',
      role: 'user',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'user2@example.com',
      password: await bcrypt.hash('user123', 10),
      name: 'Jane Smith',
      role: 'user',
    },
  });

  console.log('✅ Created users');

  // Create categories
  const laptop = await prisma.category.create({
    data: {
      name: 'Laptop',
      slug: 'laptop',
      icon: 'https://via.placeholder.com/200x200?text=Laptop',
    },
  });

  const smartphone = await prisma.category.create({
    data: {
      name: 'Smartphone',
      slug: 'smartphone',
      icon: 'https://via.placeholder.com/200x200?text=Smartphone',
    },
  });

  const tablet = await prisma.category.create({
    data: {
      name: 'Tablet',
      slug: 'tablet',
      icon: 'https://via.placeholder.com/200x200?text=Tablet',
    },
  });

  const accessory = await prisma.category.create({
    data: {
      name: 'Phụ kiện',
      slug: 'phu-kien',
      icon: 'https://via.placeholder.com/200x200?text=Accessory',
    },
  });

  console.log('✅ Created categories');

  // Create subcategories
  const gamingLaptop = await prisma.subCategory.create({
    data: {
      name: 'Laptop Gaming',
      slug: 'laptop-gaming',
      categoryId: laptop.id,
    },
  });

  const businessLaptop = await prisma.subCategory.create({
    data: {
      name: 'Laptop Văn phòng',
      slug: 'laptop-van-phong',
      categoryId: laptop.id,
    },
  });

  const iphone = await prisma.subCategory.create({
    data: {
      name: 'iPhone',
      slug: 'iphone',
      categoryId: smartphone.id,
    },
  });

  const samsung = await prisma.subCategory.create({
    data: {
      name: 'Samsung',
      slug: 'samsung',
      categoryId: smartphone.id,
    },
  });

  console.log('✅ Created subcategories');

  // Create products
  const product1 = await prisma.product.create({
    data: {
      name: 'Laptop Gaming ASUS ROG Strix G15',
      description: 'Laptop gaming cao cấp với RTX 3060, màn hình 144Hz',
      price: 29990000,
      originalPrice: 34990000,
      categoryId: laptop.id,
      subCategoryId: gamingLaptop.id,
      image: 'https://via.placeholder.com/400x400?text=ASUS+ROG',
      rating: 4.8,
      reviewCount: 125,
      stock: 15,
      tags: JSON.stringify(['Gaming', 'RTX 3060', '144Hz']),
      specs: JSON.stringify({
        cpu: 'AMD Ryzen 7 5800H',
        ram: '16GB DDR4',
        storage: '512GB SSD',
        gpu: 'RTX 3060 6GB',
        display: '15.6" FHD 144Hz',
      }),
      isBestSeller: true,
      isNewArrival: false,
    },
  });

  await prisma.productImage.createMany({
    data: [
      { productId: product1.id, url: 'https://via.placeholder.com/800x800?text=ASUS+ROG+1', isPrimary: true },
      { productId: product1.id, url: 'https://via.placeholder.com/800x800?text=ASUS+ROG+2', isPrimary: false },
      { productId: product1.id, url: 'https://via.placeholder.com/800x800?text=ASUS+ROG+3', isPrimary: false },
    ],
  });

  const product2 = await prisma.product.create({
    data: {
      name: 'iPhone 15 Pro Max 256GB',
      description: 'iPhone 15 Pro Max với chip A17 Pro, camera 48MP',
      price: 33990000,
      originalPrice: 35990000,
      categoryId: smartphone.id,
      subCategoryId: iphone.id,
      image: 'https://via.placeholder.com/400x400?text=iPhone+15+Pro',
      rating: 4.9,
      reviewCount: 289,
      stock: 25,
      tags: JSON.stringify(['iPhone', 'A17 Pro', '5G']),
      specs: JSON.stringify({
        chip: 'A17 Pro',
        ram: '8GB',
        storage: '256GB',
        camera: '48MP Main + 12MP Ultra Wide + 12MP Telephoto',
        display: '6.7" Super Retina XDR',
      }),
      isBestSeller: true,
      isNewArrival: true,
    },
  });

  await prisma.productImage.createMany({
    data: [
      { productId: product2.id, url: 'https://via.placeholder.com/800x800?text=iPhone+15+1', isPrimary: true },
      { productId: product2.id, url: 'https://via.placeholder.com/800x800?text=iPhone+15+2', isPrimary: false },
    ],
  });

  const product3 = await prisma.product.create({
    data: {
      name: 'Samsung Galaxy S24 Ultra',
      description: 'Samsung flagship với S Pen, camera 200MP',
      price: 27990000,
      originalPrice: 29990000,
      categoryId: smartphone.id,
      subCategoryId: samsung.id,
      image: 'https://via.placeholder.com/400x400?text=Galaxy+S24',
      rating: 4.7,
      reviewCount: 156,
      stock: 20,
      tags: JSON.stringify(['Samsung', 'S Pen', '200MP']),
      specs: JSON.stringify({
        chip: 'Snapdragon 8 Gen 3',
        ram: '12GB',
        storage: '256GB',
        camera: '200MP Main + 50MP Telephoto + 12MP Ultra Wide',
        display: '6.8" Dynamic AMOLED 2X',
      }),
      isBestSeller: false,
      isNewArrival: true,
    },
  });

  await prisma.productImage.createMany({
    data: [
      { productId: product3.id, url: 'https://via.placeholder.com/800x800?text=S24+1', isPrimary: true },
      { productId: product3.id, url: 'https://via.placeholder.com/800x800?text=S24+2', isPrimary: false },
    ],
  });

  const product4 = await prisma.product.create({
    data: {
      name: 'MacBook Pro 14" M3 Pro',
      description: 'MacBook Pro 14" với chip M3 Pro, màn hình Liquid Retina XDR',
      price: 52990000,
      originalPrice: 54990000,
      categoryId: laptop.id,
      subCategoryId: businessLaptop.id,
      image: 'https://via.placeholder.com/400x400?text=MacBook+Pro',
      rating: 5.0,
      reviewCount: 89,
      stock: 10,
      tags: JSON.stringify(['MacBook', 'M3 Pro', 'Retina']),
      specs: JSON.stringify({
        chip: 'Apple M3 Pro',
        ram: '18GB Unified Memory',
        storage: '512GB SSD',
        gpu: '14-core GPU',
        display: '14.2" Liquid Retina XDR',
      }),
      isBestSeller: true,
      isNewArrival: false,
    },
  });

  await prisma.productImage.createMany({
    data: [
      { productId: product4.id, url: 'https://via.placeholder.com/800x800?text=MacBook+1', isPrimary: true },
      { productId: product4.id, url: 'https://via.placeholder.com/800x800?text=MacBook+2', isPrimary: false },
    ],
  });

  const product5 = await prisma.product.create({
    data: {
      name: 'iPad Pro 11" M2',
      description: 'iPad Pro 11" với chip M2, hỗ trợ Apple Pencil 2',
      price: 21990000,
      originalPrice: 23990000,
      categoryId: tablet.id,
      image: 'https://via.placeholder.com/400x400?text=iPad+Pro',
      rating: 4.8,
      reviewCount: 167,
      stock: 18,
      tags: JSON.stringify(['iPad', 'M2', 'Apple Pencil']),
      specs: JSON.stringify({
        chip: 'Apple M2',
        ram: '8GB',
        storage: '256GB',
        display: '11" Liquid Retina',
        features: 'Face ID, Apple Pencil 2 support',
      }),
      isBestSeller: false,
      isNewArrival: false,
    },
  });

  await prisma.productImage.create({
    data: { productId: product5.id, url: 'https://via.placeholder.com/800x800?text=iPad+Pro', isPrimary: true },
  });

  console.log('✅ Created products and images');

  // Create reviews
  await prisma.review.createMany({
    data: [
      {
        productId: product1.id,
        userId: user1.id,
        rating: 5,
        comment: 'Laptop chơi game mượt mà, đáng đồng tiền!',
        verifiedPurchase: true,
      },
      {
        productId: product1.id,
        userId: user2.id,
        rating: 4,
        comment: 'Máy tốt nhưng hơi nóng khi chơi game lâu',
        verifiedPurchase: true,
      },
      {
        productId: product2.id,
        userId: user1.id,
        rating: 5,
        comment: 'iPhone đẹp, camera chụp ảnh tuyệt vời',
        verifiedPurchase: true,
      },
    ],
  });

  console.log('✅ Created reviews');

  // Create cart items
  await prisma.cartItem.createMany({
    data: [
      { userId: user1.id, productId: product3.id, quantity: 1 },
      { userId: user2.id, productId: product1.id, quantity: 1 },
      { userId: user2.id, productId: product5.id, quantity: 2 },
    ],
  });

  console.log('✅ Created cart items');

  // Create orders
  const order1 = await prisma.order.create({
    data: {
      orderCode: 'ORD-001',
      userId: user1.id,
      customerName: user1.name,
      customerEmail: user1.email,
      customerPhone: '0123456789',
      address: '123 Nguyen Hue',
      city: 'TPHCM',
      district: 'Quận 1',
      subtotal: 29990000,
      shippingFee: 0,
      total: 29990000,
      status: 'delivered',
      paymentMethod: 'card',
      paymentStatus: 'paid',
      items: {
        create: [
          {
            productId: product1.id,
            name: product1.name,
            image: product1.image,
            quantity: 1,
            price: product1.price,
          },
        ],
      },
      timeline: {
        create: [
          { status: 'pending', description: 'Đơn hàng đã được tạo' },
          { status: 'confirmed', description: 'Đơn hàng đã được xác nhận' },
          { status: 'shipping', description: 'Đơn hàng đang giao' },
          { status: 'delivered', description: 'Đã giao thành công' },
        ],
      },
    },
  });

  const order2 = await prisma.order.create({
    data: {
      orderCode: 'ORD-002',
      userId: user2.id,
      customerName: user2.name,
      customerEmail: user2.email,
      customerPhone: '0987654321',
      address: '456 Le Loi',
      city: 'TPHCM',
      district: 'Quận 1',
      subtotal: 33990000,
      shippingFee: 0,
      total: 33990000,
      status: 'shipping',
      paymentMethod: 'cod',
      paymentStatus: 'pending',
      items: {
        create: [
          {
            productId: product2.id,
            name: product2.name,
            image: product2.image,
            quantity: 1,
            price: product2.price,
          },
        ],
      },
      timeline: {
        create: [
          { status: 'pending', description: 'Đơn hàng đã được tạo' },
          { status: 'confirmed', description: 'Đơn hàng đã được xác nhận' },
          { status: 'shipping', description: 'Đơn hàng đang giao' },
        ],
      },
    },
  });

  console.log('✅ Created orders');

  console.log('\n🎉 Seed completed successfully!');
  console.log(`\n📊 Summary:`);
  console.log(`   - Users: 3 (1 admin, 2 users)`);
  console.log(`   - Categories: 4`);
  console.log(`   - Subcategories: 4`);
  console.log(`   - Products: 5`);
  console.log(`   - Product Images: 8`);
  console.log(`   - Reviews: 3`);
  console.log(`   - Cart Items: 3`);
  console.log(`   - Orders: 2`);
  console.log(`\n🔑 Login credentials:`);
  console.log(`   Admin: admin@elecshop.com / admin123`);
  console.log(`   User1: user1@example.com / user123`);
  console.log(`   User2: user2@example.com / user123`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
