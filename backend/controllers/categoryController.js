const pool = require('../config/db');

const getAllCategories = async (req, res) => {
  try {
    const [categories] = await pool.query('SELECT * FROM categories ORDER BY created_at DESC');
    res.json(categories);
  } catch (error) {
    console.error('Lỗi khi lấy danh mục:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

const getCategoryById = async (req, res) => {
  try {
    const [categories] = await pool.query('SELECT * FROM categories WHERE id = ?', [req.params.id]);
    if (categories.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy danh mục' });
    }
    res.json(categories[0]);
  } catch (error) {
    console.error('Lỗi khi lấy danh mục:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Admin only
const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    const [result] = await pool.query(
      'INSERT INTO categories (name, description) VALUES (?, ?)',
      [name, description]
    );
    res.status(201).json({ id: result.insertId, name, description });
  } catch (error) {
    console.error('Lỗi khi tạo danh mục:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Admin only
const updateCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    const [result] = await pool.query(
      'UPDATE categories SET name = ?, description = ? WHERE id = ?',
      [name, description, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Không tìm thấy danh mục' });
    }
    res.json({ message: 'Cập nhật danh mục thành công' });
  } catch (error) {
    console.error('Lỗi khi cập nhật danh mục:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Admin only
const deleteCategory = async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM categories WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Không tìm thấy danh mục' });
    }
    res.json({ message: 'Xóa danh mục thành công' });
  } catch (error) {
    console.error('Lỗi khi xóa danh mục:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};
