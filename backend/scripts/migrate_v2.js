const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrate() {
  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'coffee_shop'
  };

  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log('🔄 Bắt đầu Migration v2: Tối ưu Checkout & Thêm Bàn...');

    // 1. Tạo bàng Tables
    console.log('📦 Tạo bảng tables...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS tables (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) NOT NULL UNIQUE,
        status ENUM('available', 'occupied', 'reserved') DEFAULT 'available',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Kiểm tra xem bảng tables đã có dữ liệu chưa
    const [tableCount] = await connection.query('SELECT COUNT(*) as total FROM tables');
    if (tableCount[0].total === 0) {
      console.log('Bàn trống, tiến hành thêm 10 bàn mặc định...');
      for (let i = 1; i <= 10; i++) {
        await connection.query('INSERT INTO tables (name) VALUES (?)', [`Bàn ${i}`]);
      }
    }

    // 2. Cập nhật bảng Orders
    console.log('📦 Cập nhật bảng orders...');
    // Dùng try-catch riêng để bỏ qua nếu cột đã tồn tại
    const alterQueries = [
      'ALTER TABLE orders MODIFY COLUMN user_id INT NULL;',
      'ALTER TABLE orders ADD COLUMN customer_name VARCHAR(100) NULL;',
      'ALTER TABLE orders ADD COLUMN customer_phone VARCHAR(20) NULL;',
      'ALTER TABLE orders ADD COLUMN order_type ENUM(\'dine_in\', \'delivery\') DEFAULT \'delivery\';',
      'ALTER TABLE orders ADD COLUMN table_id INT NULL;',
      'ALTER TABLE orders ADD FOREIGN KEY (table_id) REFERENCES tables(id);',
      'ALTER TABLE orders MODIFY COLUMN shipping_address TEXT NULL;' // Đổi thành tuỳ chọn
    ];

    for (const q of alterQueries) {
      try {
        await connection.query(q);
        console.log(`✅ Chạy thành công: ${q}`);
      } catch (err) {
        if (err.code === 'ER_DUP_FIELDNAME' || err.code === 'ER_REDUNDANT_ADD_KEY') {
          console.log(`⏭️  Bỏ qua (đã tồn tại): ${q}`);
        } else {
          console.warn(`⚠️  Cảnh báo: Lỗi khi chạy query '${q}' - chi tiết: ${err.message}`);
        }
      }
    }

    console.log('🎉 Migration hoàn tất!');
    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi Migration:', error);
    process.exit(1);
  }
}

migrate();
