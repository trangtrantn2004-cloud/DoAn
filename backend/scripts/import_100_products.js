const mysql = require('mysql2/promise');
require('dotenv').config();

async function import100Products() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'coffee_shop'
  });

  try {
    console.log('🚀 Đang chuẩn bị 100 dữ liệu mẫu đồ uống...');

    const categories = [
      { id: 1, name: 'Cà Phê' },
      { id: 2, name: 'Trà' },
      { id: 3, name: 'Sinh Tố & Nước Ép' },
      { id: 5, name: 'Đá Xay' }
    ];

    const drinkBases = {
      1: [ // Cà Phê
        'Cà Phê Sữa', 'Cà Phê Đen', 'Cà Phê Muối', 'Cappuccino', 'Latte', 'Americano', 'Mocha', 'Cà Phê Trứng', 
        'Flat White', 'Macchiato', 'Espresso', 'Cold Brew', 'Cà Phê Cốt Dừa', 'Cà Phê Hạnh Nhân', 'Cà Phê Bạc Xỉu', 
        'Cà Phê Kem Cheese', 'Cà Phê Hạt Dẻ', 'Cà Phê Caramel', 'Cà Phê Vanilla', 'Cà Phê Rhum'
      ],
      2: [ // Trà
        'Trà Đào Cam Sả', 'Trà Sen Vàng', 'Trà Vải', 'Hồng Trà Sữa', 'Trà Matcha Latte', 'Trà Oolong', 'Trà Nhài', 
        'Trà Thiết Quan Âm', 'Trà Bạc Hà', 'Trà Dâu Tây', 'Trà Việt Quất', 'Trà Xoài', 'Trà Ổi Hồng', 'Trà Chanh', 
        'Trà Tắc', 'Trà Thảo Mộc', 'Trà Hoa Cúc', 'Trà Gừng', 'Trà Atiso', 'Trà Sâm Dứa'
      ],
      3: [ // Sinh Tố & Nước Ép
        'Sinh Tố Bơ', 'Sinh Tố Xoài', 'Nước Ép Cam', 'Sinh Tố Dâu', 'Sinh Tố Mãng Cầu', 'Sinh Tố Dưa Hấu', 
        'Nước Ép Táo', 'Nước Ép Thơm', 'Nước Ép Cà Rốt', 'Nước Ép Bưởi', 'Sinh Tố Chuối', 'Sinh Tố Thanh Long', 
        'Sinh Tố Kiwi', 'Nước Ép Dâu Tây', 'Nước Ép Nho', 'Nước Ép Rau Má', 'Nước Ép Củ Dền', 'Nước Ép Chanh Dây',
        'Sinh Tố Sapoche', 'Sinh Tố Mít'
      ],
      5: [ // Đá Xay
        'Đá Xay Socola', 'Đá Xay Dâu', 'Đá Xay Matcha', 'Đá Xay Caramel', 'Đá Xay Cookie', 'Đá Xay Việt Quất', 
        'Đá Xay Bạc Hà', 'Đá Xay Vanilla', 'Đá Xay Chanh Dây', 'Đá Xay Phúc Bồn Tử', 'Đá Xay Táo Xanh', 
        'Đá Xay Việt Quất Kem Cheese', 'Đá Xay Socola Chip', 'Đá Xay Hạt Dẻ', 'Đá Xay Sữa Dừa'
      ]
    };

    const adjectives = ['Đặc Biệt', 'Cao Cấp', 'Truyền Thống', 'Hiện Đại', 'Ít Đường', 'Không Đường', 'Thêm Kem', 'Lớn', 'Vừa', 'Nhỏ'];
    
    const imageUrls = [
      'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400',
      'https://images.unsplash.com/photo-1497636577773-f1231844b336?w=400',
      'https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=400',
      'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400',
      'https://images.unsplash.com/photo-1561882468-9110e03e0f78?w=400',
      'https://images.unsplash.com/photo-1551030173-122aabc4489c?w=400',
      'https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?w=400',
      'https://images.unsplash.com/photo-1495774856032-8b90bbb32b32?w=400',
      'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400',
      'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400',
      'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=400',
      'https://images.unsplash.com/photo-1558857563-b371033873b8?w=400',
      'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=400',
      'https://images.unsplash.com/photo-1638176066666-ffb2f013c7dd?w=400',
      'https://images.unsplash.com/photo-1546173159-315724a31696?w=400',
      'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400',
      'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400',
      'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400',
      'https://images.unsplash.com/photo-1497534446932-c925b458314e?w=400',
      'https://images.unsplash.com/photo-1525385133512-2f3bdd039054?w=400'
    ];

    const productsToInsert = [];
    let count = 0;

    while (count < 100) {
      const category = categories[Math.floor(Math.random() * categories.length)];
      const baseName = drinkBases[category.id][Math.floor(Math.random() * drinkBases[category.id].length)];
      const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
      
      const name = `${baseName} ${adj}`;
      const description = `Hương vị ${baseName.toLowerCase()} thơm ngon, kết hợp cùng phong cách ${adj.toLowerCase()}, mang lại trải nghiệm tuyệt vời cho bạn.`;
      const price = Math.floor(Math.random() * (70000 - 25000 + 1) + 25000 / 1000) * 1000; // Round to thousands
      const imageUrl = imageUrls[Math.floor(Math.random() * imageUrls.length)];
      const isFeatured = Math.random() > 0.8;

      // Avoid duplicates
      if (!productsToInsert.some(p => p.name === name)) {
        productsToInsert.push([category.id, name, description, price, imageUrl, isFeatured]);
        count++;
      }
    }

    console.log(`📝 Đang thêm 100 sản phẩm vào database...`);
    
    // Batch insert
    for (const product of productsToInsert) {
      await connection.query(
        'INSERT INTO products (category_id, name, description, price, image_url, is_featured) VALUES (?, ?, ?, ?, ?, ?)',
        product
      );
    }

    console.log('✅ Đã thêm thành công 100 sản phẩm đồ uống!');
    await connection.end();
    process.exit(0);

  } catch (err) {
    console.error('❌ Lỗi:', err.message);
    await connection.end();
    process.exit(1);
  }
}

import100Products();
