const pool = require('../config/db');

// @route   GET /api/tables
// @desc    Get all tables
// @access  Public
const getTables = async (req, res) => {
  try {
    const [tables] = await pool.query('SELECT * FROM tables ORDER BY id ASC');
    res.json(tables);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách bàn:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// @route   POST /api/tables
// @desc    Create new table
// @access  Private/Admin
const createTable = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Tên bàn là bắt buộc' });

    const [existing] = await pool.query('SELECT id FROM tables WHERE name = ?', [name]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Bàn này đã tồn tại' });
    }

    const [result] = await pool.query('INSERT INTO tables (name) VALUES (?)', [name]);
    res.status(201).json({ id: result.insertId, name, status: 'available' });
  } catch (error) {
    console.error('Lỗi tạo bàn:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// @route   PUT /api/tables/:id
// @desc    Update a table
// @access  Private/Admin
const updateTable = async (req, res) => {
  try {
    const { name, status } = req.body;
    
    // Check existing name
    if (name) {
      const [existing] = await pool.query('SELECT id FROM tables WHERE name = ? AND id != ?', [name, req.params.id]);
      if (existing.length > 0) {
        return res.status(400).json({ message: 'Tên bàn này đã được sử dụng' });
      }
    }

    const updates = [];
    const values = [];
    if (name) {
      updates.push('name = ?');
      values.push(name);
    }
    if (status) {
      updates.push('status = ?');
      values.push(status);
    }

    if (updates.length > 0) {
      values.push(req.params.id);
      await pool.query(`UPDATE tables SET ${updates.join(', ')} WHERE id = ?`, values);
    }

    res.json({ message: 'Cập nhật bàn thành công' });
  } catch (error) {
    console.error('Lỗi cập nhật bàn:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// @route   DELETE /api/tables/:id
// @desc    Delete a table
// @access  Private/Admin
const deleteTable = async (req, res) => {
  try {
    // Check if any orders are linked to this table
    const [orders] = await pool.query('SELECT id FROM orders WHERE table_id = ? LIMIT 1', [req.params.id]);
    if (orders.length > 0) {
      return res.status(400).json({ message: 'Không thể xóa bàn đã có đơn hàng. Vui lòng đổi tên thay vì xóa.' });
    }

    const [result] = await pool.query('DELETE FROM tables WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Không tìm thấy bàn cần xóa' });
    }

    res.json({ message: 'Đã xóa bàn' });
  } catch (error) {
    console.error('Lỗi xóa bàn:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// @route   POST /api/tables/:id/checkout
// @desc    Checkout a table (complete active orders and free table)
// @access  Private/Admin
const checkoutTable = async (req, res) => {
  try {
    const tableId = req.params.id;
    
    // Update orders
    await pool.query(
      `UPDATE orders SET status = 'completed' WHERE table_id = ? AND status IN ('pending', 'processing')`,
      [tableId]
    );

    // Update table status
    await pool.query(
      `UPDATE tables SET status = 'available' WHERE id = ?`,
      [tableId]
    );

    // Emit event so dashboard auto-refreshes
    const io = req.app.get('io');
    if (io) {
      io.emit('table_checkout', { tableId: parseInt(tableId) });
    }

    res.json({ message: 'Đã thanh toán bàn' });
  } catch (error) {
    console.error('Lỗi thanh toán bàn:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

module.exports = {
  getTables,
  createTable,
  updateTable,
  deleteTable,
  checkoutTable
};
