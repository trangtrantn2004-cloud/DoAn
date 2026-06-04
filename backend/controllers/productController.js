const pool = require('../config/db');

const getAllProducts = async (req, res) => {
  try {
    let query = `
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id
    `;
    
    // Thêm chức năng lọc nếu có
    const queryParams = [];
    if (req.query.category) {
      query += ' WHERE p.category_id = ?';
      queryParams.push(req.query.category);
    } else if (req.query.featured === 'true') {
      query += ' WHERE p.is_featured = true';
    }

    query += ' ORDER BY p.created_at DESC';

    const [products] = await pool.query(query, queryParams);
    res.json(products);
  } catch (error) {
    console.error('Lỗi khi lấy sản phẩm:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

const getProductById = async (req, res) => {
  try {
    const [products] = await pool.query(`
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `, [req.params.id]);

    if (products.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }
    res.json(products[0]);
  } catch (error) {
    console.error('Lỗi khi lấy chi tiết sản phẩm:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Admin only
const createProduct = async (req, res) => {
  try {
    const { category_id, name, description, price, image_url, is_featured } = req.body;
    
    const [result] = await pool.query(
      'INSERT INTO products (category_id, name, description, price, image_url, is_featured) VALUES (?, ?, ?, ?, ?, ?)',
      [category_id || null, name, description, price, image_url || null, is_featured ? 1 : 0]
    );
    
    res.status(201).json({ id: result.insertId, message: 'Thêm sản phẩm thành công' });
  } catch (error) {
    console.error('Lỗi khi tạo sản phẩm:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Admin only
const updateProduct = async (req, res) => {
  try {
    const { category_id, name, description, price, image_url, is_featured } = req.body;
    const [result] = await pool.query(
      'UPDATE products SET category_id=?, name=?, description=?, price=?, image_url=?, is_featured=? WHERE id=?',
      [category_id || null, name, description, price, image_url || null, is_featured ? 1 : 0, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }
    res.json({ message: 'Cập nhật sản phẩm thành công' });
  } catch (error) {
    console.error('Lỗi khi cập nhật sản phẩm:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Admin only
const deleteProduct = async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM products WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }
    res.json({ message: 'Xóa sản phẩm thành công' });
  } catch (error) {
    console.error('Lỗi khi xóa sản phẩm:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
