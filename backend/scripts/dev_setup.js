const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function setup() {
  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || ''
  };

  try {
    const connection = await mysql.createConnection(dbConfig);
    const dbName = process.env.DB_NAME || 'coffee_shop';

    console.log(`Checking/Creating database: ${dbName}...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
    await connection.query(`USE \`${dbName}\`;`);

    // Create Tables
    console.log('Setting up tables...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100),
        email VARCHAR(100) UNIQUE,
        password VARCHAR(255),
        role ENUM('user', 'admin') DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100),
        description TEXT
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        category_id INT,
        name VARCHAR(255),
        description TEXT,
        price DECIMAL(10,2),
        image_url VARCHAR(255),
        is_featured BOOLEAN DEFAULT false,
        FOREIGN KEY (category_id) REFERENCES categories(id)
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        total_price DECIMAL(10,2),
        status ENUM('pending', 'processing', 'completed', 'cancelled') DEFAULT 'pending',
        shipping_address TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);
    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT,
        product_id INT,
        quantity INT,
        price DECIMAL(10,2),
        FOREIGN KEY (order_id) REFERENCES orders(id),
        FOREIGN KEY (product_id) REFERENCES products(id)
      )
    `);

    // Create Admin User
    const adminEmail = 'admin@coffee.com';
    const [existing] = await connection.query('SELECT id FROM users WHERE email = ?', [adminEmail]);
    
    if (existing.length === 0) {
      console.log('Creating admin user (admin@coffee.com / admin123)...');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      await connection.query(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        ['Admin Manager', adminEmail, hashedPassword, 'admin']
      );
    } else {
      console.log('Admin user already exists.');
    }

    // Seeding some products if empty
    const [prodCount] = await connection.query('SELECT COUNT(*) as total FROM products');
    if (prodCount[0].total === 0) {
      console.log('Seeding initial categories and products...');
      await connection.query('INSERT INTO categories (name, description) VALUES (?, ?)', ['Cà phê', 'Các loại cà phê']);
      const [cat] = await connection.query('SELECT id FROM categories LIMIT 1');
      await connection.query(
        'INSERT INTO products (category_id, name, description, price, is_featured) VALUES (?, ?, ?, ?, ?)',
        [cat[0].id, 'Cà Phê Muối', 'Vị cà phê đậm đà kết hợp với kem mặn độc đáo', 45000, true]
      );
    }

    console.log('Development setup completed successfully!');
    process.exit(0);
  } catch (err) {
    if (err.code === 'ECONNREFUSED') {
      console.error('ERROR: MySQL server is NOT running. Please start MySQL in XAMPP/WAMP first.');
    } else {
      console.error('ERROR:', err);
    }
    process.exit(1);
  }
}

setup();
