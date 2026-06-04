const pool = require('../config/db');

async function seedData() {
  try {
    console.log('Bắt đầu thêm dữ liệu mẫu...');

    // Seed Categories
    await pool.query('INSERT INTO categories (name, description) VALUES (?, ?)', ['Cà Phê Truyền Thống', 'Các loại cà phê pha phin truyền thống Việt Nam']);
    await pool.query('INSERT INTO categories (name, description) VALUES (?, ?)', ['Cà Phê Máy', 'Espresso, Cappuccino, Latte...']);
    
    // Get Categories ID
    const [cats] = await pool.query('SELECT id, name FROM categories');
    const getCatId = (name) => cats.find(c => c.name === name)?.id;

    // Seed Products
    const products = [
      {
        category_id: getCatId('Cà Phê Truyền Thống'),
        name: 'Cà Phê Phin Sữa Đá',
        description: 'Hương vị cà phê Robusta đậm đà hòa quyện với sữa đặc ngọt ngào.',
        price: 35000,
        image_url: 'https://images.unsplash.com/photo-1574068597087-0b15b3c6600a?q=80&w=400',
        is_featured: true
      },
      {
        category_id: getCatId('Cà Phê Truyền Thống'),
        name: 'Cà Phê Đen Đá',
        description: 'Đậm đà hương vị nguyên bản của cà phê hạt rang xay thủ công.',
        price: 29000,
        image_url: 'https://images.unsplash.com/photo-1621245781313-9a3d44baabec?q=80&w=400',
        is_featured: false
      },
      {
        category_id: getCatId('Cà Phê Máy'),
        name: 'Caramel Macchiato',
        description: 'Sự kết hợp hoàn hảo giữa Espresso, sữa tươi và sốt caramel.',
        price: 55000,
        image_url: 'https://images.unsplash.com/photo-1485609653526-7fdb44c1851b?q=80&w=400',
        is_featured: true
      },
      {
        category_id: getCatId('Cà Phê Máy'),
        name: 'Cappuccino Nóng',
        description: 'Espresso với lớp bọt sữa nóng bồng bềnh, rắc chút bột cacao.',
        price: 45000,
        image_url: 'https://images.unsplash.com/photo-1534040385115-33dcb3acba5b?q=80&w=400',
        is_featured: true
      }
    ];

    for (const p of products) {
      await pool.query(
        'INSERT INTO products (category_id, name, description, price, image_url, is_featured) VALUES (?, ?, ?, ?, ?, ?)',
        [p.category_id, p.name, p.description, p.price, p.image_url, p.is_featured ? 1 : 0]
      );
    }
    
    console.log('Thêm dữ liệu mẫu thành công!');
    process.exit(0);
  } catch (error) {
    console.error('Lỗi khi seed data:', error);
    process.exit(1);
  }
}

seedData();
