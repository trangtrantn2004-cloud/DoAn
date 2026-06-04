const mysql = require('mysql2/promise');
require('dotenv').config();

async function updatePrices() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'coffee_shop'
  });

  try {
    console.log('🔄 Đang cập nhật giá tiền cho tất cả sản phẩm (10k - 100k)...');

    const [products] = await connection.query('SELECT id, category_id, name FROM products');

    for (const product of products) {
      let minPrice = 10000;
      let maxPrice = 100000;

      // Phân loại giá theo danh mục để hợp lý hơn
      switch (product.category_id) {
        case 1: // Cà Phê
          minPrice = 15000;
          maxPrice = 55000;
          break;
        case 2: // Trà
          minPrice = 15000;
          maxPrice = 60000;
          break;
        case 3: // Sinh Tố & Nước Ép
          minPrice = 30000;
          maxPrice = 65000;
          break;
        case 4: // Bánh Ngọt
          minPrice = 20000;
          maxPrice = 85000;
          break;
        case 5: // Đá Xay
          minPrice = 45000;
          maxPrice = 75000;
          break;
      }

      // Một số món "Đặc biệt" hoặc "Cao cấp" sẽ có giá cao hơn
      if (product.name.includes('Đặc Biệt') || product.name.includes('Cao Cấp')) {
        maxPrice = 100000;
      }

      const newPrice = Math.floor(Math.random() * (maxPrice - minPrice + 1) + minPrice);
      const roundedPrice = Math.round(newPrice / 1000) * 1000; // Làm tròn đến hàng nghìn

      await connection.query('UPDATE products SET price = ? WHERE id = ?', [roundedPrice, product.id]);
    }

    console.log(`✅ Đã cập nhật giá cho ${products.length} sản phẩm thành công!`);
    await connection.end();
    process.exit(0);

  } catch (err) {
    console.error('❌ Lỗi:', err.message);
    await connection.end();
    process.exit(1);
  }
}

updatePrices();
