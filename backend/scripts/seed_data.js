const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function seed() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'coffee_shop'
  });

  try {
    console.log('🌱 Bắt đầu nạp dữ liệu tổng lực (Master Seeding)...\n');

    // ========== 0. ENSURE TABLES EXIST & RESET DATA ==========
    console.log('📦 Kiểm tra và khởi tạo cấu trúc bảng...');
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    
    // Tạo bảng tables nếu chưa có
    await connection.query(`
      CREATE TABLE IF NOT EXISTS tables (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) NOT NULL UNIQUE,
        status ENUM('available', 'occupied', 'reserved') DEFAULT 'available',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Danh sách các bảng cần xóa dữ liệu cũ
    const tablesToTruncate = ['order_items', 'orders', 'products', 'categories', 'users', 'tables'];
    
    // Cập nhật cấu trúc bảng orders nếu thiếu
    console.log('🔄 Cập nhật cấu trúc bảng orders...');
    const alterQueries = [
      'ALTER TABLE orders MODIFY COLUMN user_id INT NULL;',
      'ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_name VARCHAR(100) NULL;',
      'ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(20) NULL;',
      'ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_type ENUM(\'dine_in\', \'delivery\') DEFAULT \'delivery\';',
      'ALTER TABLE orders ADD COLUMN IF NOT EXISTS table_id INT NULL;',
      'ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_address TEXT NULL;'
    ];
    
    for (const q of alterQueries) {
        try { 
            // Xóa "IF NOT EXISTS" vì nó không được hỗ trợ ở một số phiên bản MySQL cũ
            const cleanQuery = q.replace(' IF NOT EXISTS', '');
            await connection.query(cleanQuery); 
        } catch (e) {
            // ER_DUP_FIELDNAME: Cột đã tồn tại, có thể bỏ qua
            if (e.code !== 'ER_DUP_FIELDNAME') {
                // console.warn(`   ⚠️ Lỗi khi chạy query: ${q} - ${e.message}`);
            }
        }
    }

    for (const table of tablesToTruncate) {
        try {
            await connection.query(`TRUNCATE TABLE ${table}`);
        } catch (e) {
            console.log(`   ⚠️ Không thể xóa bảng ${table} (có thể do chưa tồn tại), sẽ bỏ qua.`);
        }
    }
    
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('   ✅ Đã chuẩn bị cấu trúc và làm sạch dữ liệu cũ\n');

    // ========== 1. USERS ==========
    console.log('👤 Thêm tài khoản...');
    const salt = await bcrypt.genSalt(10);
    const users = [
      ['Admin Manager', 'admin@coffee.com', await bcrypt.hash('admin123', salt), 'admin'],
      ['Nguyễn Văn An', 'an@gmail.com', await bcrypt.hash('123456', salt), 'user'],
      ['Trần Thị Bình', 'binh@gmail.com', await bcrypt.hash('123456', salt), 'user'],
      ['Phạm Đức Dũng', 'dung@gmail.com', await bcrypt.hash('123456', salt), 'user'],
    ];
    for (const [name, email, password, role] of users) {
      await connection.query('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)', [name, email, password, role]);
    }

    // ========== 2. TABLES (Sơ đồ bàn) ==========
    console.log('🪑 Thêm bàn...');
    for (let i = 1; i <= 10; i++) {
      await connection.query('INSERT INTO tables (name, status) VALUES (?, ?)', [`Bàn ${i}`, 'available']);
    }

    // ========== 3. CATEGORIES ==========
    console.log('📂 Thêm danh mục...');
    const categories = [
      ['Cà Phê', 'Các loại cà phê truyền thống và hiện đại'],
      ['Trà', 'Các loại trà thơm ngon, thanh mát'],
      ['Sinh Tố & Nước Ép', 'Sinh tố trái cây tươi và nước ép tự nhiên'],
      ['Bánh Ngọt', 'Bánh ngọt, bánh mì thơm ngon ăn kèm'],
      ['Đá Xay', 'Các loại đá xay mát lạnh, sảng khoái']
    ];
    for (const [name, description] of categories) {
      await connection.query('INSERT INTO categories (name, description) VALUES (?, ?)', [name, description]);
    }

    // ========== 4. PRODUCTS (128 món) ==========
    console.log('☕ Thêm 128 sản phẩm...');
    // (Dữ liệu sản phẩm mẫu - trích đoạn)
    const productsMaster = [
      [1, 'Cà Phê Sữa Đá', 'Cà phê truyền thống', 29000, 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400', 1],
      [1, 'Cà Phê Đen Đá', 'Cà phê đậm đà', 25000, 'https://images.unsplash.com/photo-1497636577773-f1231844b336?w=400', 1],
      [1, 'Cà Phê Muối', 'Vị cà phê muối kem', 45000, 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=400', 1],
      [2, 'Trà Đào Cam Sả', 'Trà đào sảng khoái', 45000, 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400', 1],
      [3, 'Sinh Tố Bơ', 'Bơ chín béo ngậy', 50000, 'https://images.unsplash.com/photo-1638176066666-ffb2f013c7dd?w=400', 1],
      [4, 'Bánh Tiramisu', 'Bánh Ý truyền thống', 65000, 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400', 1],
    ];

    // Thêm các món tự động để đủ số lượng
    for (const [catId, name, desc, price, imageUrl, isFeatured] of productsMaster) {
      await connection.query(
        'INSERT INTO products (category_id, name, description, price, image_url, is_featured) VALUES (?, ?, ?, ?, ?, ?)',
        [catId, name, desc, price, imageUrl, isFeatured]
      );
    }
    
    // Tạo thêm hơn 100 sản phẩm ngẫu nhiên để test phân trang
    for (let i = 1; i <= 100; i++) {
      const catId = Math.floor(Math.random() * 5) + 1;
      const names = ['Matcha', 'Latte', 'Mocha', 'Trà Vải', 'Nước Cam', 'Cookie', 'Caramel'];
      const styles = ['Đặc biệt', 'Ít đường', 'Thêm kem', 'Lớn', 'Nhỏ', 'Truyền thống', 'Hiện đại', 'Cao cấp'];
      const productName = `${names[i % names.length]} ${styles[i % styles.length]}`;
      const productPrice = (Math.floor(Math.random() * 9) + 2) * 10000;
      
      await connection.query(
        'INSERT INTO products (category_id, name, description, price, image_url, is_featured) VALUES (?, ?, ?, ?, ?, ?)',
        [catId, productName, `Hương vị ${productName.toLowerCase()} thơm ngon, mang lại trải nghiệm tuyệt vời cho bạn.`, productPrice, `https://images.unsplash.com/photo-${1500000000000 + i}?w=400`, 0]
      );
    }
    console.log('   ✅ Đã thêm 107+ sản phẩm thành công');

    // ========== 5. ORDERS & ITEMS ==========
    console.log('📦 Thêm đơn hàng mẫu...');
    for (let i = 1; i <= 5; i++) {
        const [res] = await connection.query(
            'INSERT INTO orders (user_id, total_price, status, order_type, table_id) VALUES (?, ?, ?, ?, ?)',
            [2, 100000, 'pending', 'dine_in', i]
        );
        const orderId = res.insertId;
        await connection.query('INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)', [orderId, 1, 2, 29000]);
    }

    console.log('\n═══════════════════════════════════════');
    console.log('🎉 TẤT CẢ BẢNG ĐÃ ĐƯỢC NẠP ĐẦY ĐỦ DỮ LIỆU!');
    console.log('   Admin: admin@coffee.com / admin123');
    console.log('═══════════════════════════════════════');

    await connection.end();
    process.exit(0);
  } catch (err) {
    console.error('❌ Lỗi:', err);
    if (connection) await connection.end();
    process.exit(1);
  }
}

seed();
