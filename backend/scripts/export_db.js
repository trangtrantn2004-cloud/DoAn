const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function exportSQL() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'coffee_shop'
  });

  try {
    console.log('📦 Bắt đầu xuất dữ liệu sang file SQL...');
    let sqlOutput = `-- Nero Coffee - Database Dump
-- Xuất bản ngày: ${new Date().toLocaleString()}

SET FOREIGN_KEY_CHECKS = 0;
CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'coffee_shop'}\`;
USE \`${process.env.DB_NAME || 'coffee_shop'}\`;

`;

    const tables = ['users', 'categories', 'products', 'orders', 'order_items'];

    for (const table of tables) {
      console.log(`- Đang xuất bảng: ${table}`);
      
      // Get Create Table
      const [createRes] = await connection.query(`SHOW CREATE TABLE \`${table}\``);
      sqlOutput += `DROP TABLE IF EXISTS \`${table}\`;\n`;
      sqlOutput += createRes[0]['Create Table'] + ';\n\n';

      // Get Data
      const [rows] = await connection.query(`SELECT * FROM \`${table}\``);
      if (rows.length > 0) {
        sqlOutput += `INSERT INTO \`${table}\` VALUES \n`;
        const values = rows.map(row => {
          const rowValues = Object.values(row).map(val => {
            if (val === null) return 'NULL';
            if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
            if (val instanceof Date) return `'${val.toISOString().slice(0, 19).replace('T', ' ')}'`;
            if (typeof val === 'boolean') return val ? 1 : 0;
            return val;
          });
          return `(${rowValues.join(', ')})`;
        });
        sqlOutput += values.join(',\n') + ';\n\n';
      }
    }

    sqlOutput += 'SET FOREIGN_KEY_CHECKS = 1;';

    const outputPath = path.join(__dirname, '../coffee_shop_full.sql');
    fs.writeFileSync(outputPath, sqlOutput);

    console.log(`✅ Xuất thành công! File lưu tại: ${outputPath}`);
    await connection.end();
    process.exit(0);

  } catch (err) {
    console.error('❌ Lỗi:', err.message);
    await connection.end();
    process.exit(1);
  }
}

exportSQL();
