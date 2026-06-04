const mysql = require('mysql2/promise');
require('dotenv').config();

async function clearOrders() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'coffee_shop'
    });
    
    console.log('Clearing orders and order_items tables...');
    await connection.query('SET FOREIGN_KEY_CHECKS = 0;');
    await connection.query('TRUNCATE TABLE order_items;');
    await connection.query('TRUNCATE TABLE orders;');
    // Set pending occupied tables back to available
    await connection.query("UPDATE tables SET status = 'available';");
    await connection.query('SET FOREIGN_KEY_CHECKS = 1;');
    
    console.log('Successfully cleared all orders and reset table statuses!');
    process.exit(0);
  } catch (error) {
    console.error('Error clearing database:', error);
    process.exit(1);
  }
}

clearOrders();
