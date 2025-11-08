const bcrypt = require('bcryptjs');

// Mock users database
const users = [
  {
    id: '1',
    email: 'admin@shop.com',
    password: bcrypt.hashSync('admin123', 10),
    name: 'Admin User',
    role: 'admin',
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    email: 'user@shop.com',
    password: bcrypt.hashSync('user123', 10),
    name: 'Customer User',
    role: 'customer',
    createdAt: new Date().toISOString()
  }
];

// Mock categories
const categories = [
  {
    id: 'cat-1',
    name: 'Điện thoại & Tablet',
    slug: 'dien-thoai-tablet',
    icon: '📱',
    itemCount: 45,
    subCategories: [
      { id: 'sub-1-1', name: 'Điện thoại', slug: 'dien-thoai', itemCount: 30 },
      { id: 'sub-1-2', name: 'Tablet', slug: 'tablet', itemCount: 15 }
    ]
  },
  {
    id: 'cat-2',
    name: 'Laptop & Máy tính',
    slug: 'laptop-may-tinh',
    icon: '💻',
    itemCount: 38,
    subCategories: [
      { id: 'sub-2-1', name: 'Laptop', slug: 'laptop', itemCount: 25 },
      { id: 'sub-2-2', name: 'PC Gaming', slug: 'pc-gaming', itemCount: 13 }
    ]
  },
  {
    id: 'cat-3',
    name: 'Âm thanh',
    slug: 'am-thanh',
    icon: '🎧',
    itemCount: 52,
    subCategories: [
      { id: 'sub-3-1', name: 'Tai nghe', slug: 'tai-nghe', itemCount: 30 },
      { id: 'sub-3-2', name: 'Loa', slug: 'loa', itemCount: 22 }
    ]
  },
  {
    id: 'cat-4',
    name: 'Phụ kiện',
    slug: 'phu-kien',
    icon: '⚡',
    itemCount: 120,
    subCategories: [
      { id: 'sub-4-1', name: 'Sạc & Cáp', slug: 'sac-cap', itemCount: 50 },
      { id: 'sub-4-2', name: 'Ốp lưng', slug: 'op-lung', itemCount: 40 },
      { id: 'sub-4-3', name: 'Balo & Túi', slug: 'balo-tui', itemCount: 30 }
    ]
  }
];

// Mock products
const products = [
  {
    id: 'prod-1',
    name: 'iPhone 15 Pro Max 256GB',
    description: 'iPhone 15 Pro Max với chip A17 Pro mạnh mẽ, camera 48MP, màn hình Super Retina XDR 6.7 inch',
    price: 29990000,
    originalPrice: 34990000,
    category: 'dien-thoai-tablet',
    subCategory: 'dien-thoai',
    image: 'https://via.placeholder.com/300x300/1e40af/ffffff?text=iPhone+15+Pro',
    images: [
      'https://via.placeholder.com/600x600/1e40af/ffffff?text=iPhone+15+Pro+1',
      'https://via.placeholder.com/600x600/1e40af/ffffff?text=iPhone+15+Pro+2'
    ],
    rating: 4.8,
    reviewCount: 234,
    stock: 15,
    tags: ['hot', 'new-arrival', 'best-seller'],
    specs: {
      screen: '6.7 inch, Super Retina XDR',
      os: 'iOS 17',
      camera: '48MP, 12MP, 12MP',
      chip: 'Apple A17 Pro',
      ram: '8GB',
      storage: '256GB',
      battery: '4422mAh'
    },
    isBestSeller: true,
    isNewArrival: true
  },
  {
    id: 'prod-2',
    name: 'Samsung Galaxy S24 Ultra',
    description: 'Galaxy S24 Ultra với bút S Pen, camera 200MP, màn hình Dynamic AMOLED 2X 6.8 inch',
    price: 27990000,
    originalPrice: 31990000,
    category: 'dien-thoai-tablet',
    subCategory: 'dien-thoai',
    image: 'https://via.placeholder.com/300x300/7c3aed/ffffff?text=Galaxy+S24',
    images: [
      'https://via.placeholder.com/600x600/7c3aed/ffffff?text=Galaxy+S24+1',
      'https://via.placeholder.com/600x600/7c3aed/ffffff?text=Galaxy+S24+2'
    ],
    rating: 4.7,
    reviewCount: 189,
    stock: 20,
    tags: ['hot', 'best-seller'],
    specs: {
      screen: '6.8 inch, Dynamic AMOLED 2X',
      os: 'Android 14',
      camera: '200MP, 50MP, 12MP, 10MP',
      chip: 'Snapdragon 8 Gen 3',
      ram: '12GB',
      storage: '256GB',
      battery: '5000mAh'
    },
    isBestSeller: true,
    isNewArrival: false
  },
  {
    id: 'prod-3',
    name: 'MacBook Pro 14 M3 Pro',
    description: 'MacBook Pro 14 inch với chip M3 Pro, màn hình Liquid Retina XDR, hiệu năng đỉnh cao',
    price: 52990000,
    originalPrice: 59990000,
    category: 'laptop-may-tinh',
    subCategory: 'laptop',
    image: 'https://via.placeholder.com/300x300/0891b2/ffffff?text=MacBook+Pro',
    images: [
      'https://via.placeholder.com/600x600/0891b2/ffffff?text=MacBook+1',
      'https://via.placeholder.com/600x600/0891b2/ffffff?text=MacBook+2'
    ],
    rating: 4.9,
    reviewCount: 156,
    stock: 8,
    tags: ['premium', 'best-seller'],
    specs: {
      screen: '14.2 inch, Liquid Retina XDR',
      cpu: 'Apple M3 Pro 11-core',
      gpu: '14-core GPU',
      ram: '18GB',
      storage: '512GB SSD',
      battery: '70Wh'
    },
    isBestSeller: true,
    isNewArrival: false
  },
  {
    id: 'prod-4',
    name: 'AirPods Pro 2023',
    description: 'AirPods Pro với chip H2, chống ồn chủ động, hộp sạc MagSafe USB-C',
    price: 5990000,
    originalPrice: 6990000,
    category: 'am-thanh',
    subCategory: 'tai-nghe',
    image: 'https://via.placeholder.com/300x300/dc2626/ffffff?text=AirPods+Pro',
    images: [
      'https://via.placeholder.com/600x600/dc2626/ffffff?text=AirPods+1',
      'https://via.placeholder.com/600x600/dc2626/ffffff?text=AirPods+2'
    ],
    rating: 4.6,
    reviewCount: 445,
    stock: 50,
    tags: ['hot', 'best-seller'],
    specs: {
      driver: 'Custom high-excursion',
      chip: 'Apple H2',
      anc: 'Active Noise Cancellation',
      battery: '6 giờ (30 giờ với hộp sạc)',
      charging: 'MagSafe, USB-C, Wireless'
    },
    isBestSeller: true,
    isNewArrival: false
  },
  {
    id: 'prod-5',
    name: 'Sony WH-1000XM5',
    description: 'Tai nghe chống ồn cao cấp Sony với âm thanh Hi-Res, pin 30 giờ',
    price: 7990000,
    originalPrice: 9990000,
    category: 'am-thanh',
    subCategory: 'tai-nghe',
    image: 'https://via.placeholder.com/300x300/ea580c/ffffff?text=Sony+WH-1000XM5',
    images: [
      'https://via.placeholder.com/600x600/ea580c/ffffff?text=Sony+1',
      'https://via.placeholder.com/600x600/ea580c/ffffff?text=Sony+2'
    ],
    rating: 4.8,
    reviewCount: 312,
    stock: 25,
    tags: ['premium', 'best-seller'],
    specs: {
      driver: '30mm',
      anc: 'HD Noise Cancelling Processor QN1',
      battery: '30 giờ',
      codec: 'LDAC, AAC, SBC',
      connection: 'Bluetooth 5.2'
    },
    isBestSeller: true,
    isNewArrival: false
  }
];

// Mock reviews
const reviews = [
  {
    id: 'rev-1',
    productId: 'prod-1',
    userId: '2',
    userName: 'Nguyễn Văn A',
    rating: 5,
    comment: 'Sản phẩm rất tuyệt vời, hiệu năng mạnh mẽ, camera đẹp!',
    images: [],
    verifiedPurchase: true,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'rev-2',
    productId: 'prod-1',
    userId: '3',
    userName: 'Trần Thị B',
    rating: 4,
    comment: 'Giá hơi cao nhưng chất lượng xứng đáng',
    images: [],
    verifiedPurchase: true,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  }
];

// Mock carts (in-memory)
let carts = {};

// Mock orders
let orders = [];
let orderCounter = 1000;

module.exports = {
  users,
  categories,
  products,
  reviews,
  carts,
  orders,
  orderCounter
};
