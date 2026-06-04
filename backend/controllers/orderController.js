const pool = require('../config/db');

// @route   POST /api/orders
// @desc    Create new order
// @access  Private (Logged in users)
const createOrder = async (req, res) => {
  try {
    const { orderItems, shippingAddress, totalPrice, customerName, customerPhone, orderType = 'delivery', tableId = null } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: 'Giỏ hàng trống' });
    }

    const userId = req.user ? req.user.id : null;

    let orderId;
    let isMerge = false;

    // 1. Check if we need to merge for Dine-In
    if (orderType === 'dine_in' && tableId) {
      const [existingOrder] = await pool.query(
        `SELECT id, total_price FROM orders WHERE table_id = ? AND status IN ('pending', 'processing') LIMIT 1`,
        [tableId]
      );
      if (existingOrder.length > 0) {
        orderId = existingOrder[0].id;
        isMerge = true;
        
        // Update total price
        await pool.query(
          'UPDATE orders SET total_price = total_price + ? WHERE id = ?',
          [totalPrice, orderId]
        );
      }
    }

    if (!isMerge) {
      // Create new order
      const [orderResult] = await pool.query(
        `INSERT INTO orders 
        (user_id, total_price, status, shipping_address, customer_name, customer_phone, order_type, table_id) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [userId, totalPrice, 'pending', shippingAddress || null, customerName || null, customerPhone || null, orderType, tableId]
      );
      orderId = orderResult.insertId;

      // Auto-occupy table if dine_in
      if (orderType === 'dine_in' && tableId) {
        await pool.query('UPDATE tables SET status = ? WHERE id = ?', ['occupied', tableId]);
      }
    }

    // 2. Insert order items
    for (const item of orderItems) {
      await pool.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
        [orderId, item.product_id, item.quantity, item.price]
      );
    }

    // 3. Emit real-time event to admin
    const [fetchedOrder] = await pool.query(
      `SELECT o.*, u.name as user_name, u.email, t.name as table_name 
       FROM orders o 
       LEFT JOIN users u ON o.user_id = u.id 
       LEFT JOIN tables t ON o.table_id = t.id
       WHERE o.id = ?`, [orderId]
    );
    const [items] = await pool.query(
      `SELECT oi.*, p.name, p.image_url 
       FROM order_items oi JOIN products p ON oi.product_id = p.id 
       WHERE oi.order_id = ?`, [orderId]
    );

    const io = req.app.get('io');
    if (io) {
      if (isMerge) {
        // Just emit status updated or a generic refresh event to let UI know order changed
        io.emit('order_status_updated', { orderId: orderId, status: fetchedOrder[0].status, merged: true, newTotal: fetchedOrder[0].total_price });
        // Alternatively, sending the full updated order is better:
        io.emit('new_order', { ...fetchedOrder[0], items, isUpdate: true }); 
      } else {
        io.emit('new_order', { ...fetchedOrder[0], items });
      }
    }

    res.status(isMerge ? 200 : 201).json({ message: isMerge ? 'Đã thêm món vào hóa đơn bàn' : 'Đặt hàng thành công', orderId });
  } catch (error) {
    console.error('Lỗi khi tạo đơn hàng:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// @route   GET /api/orders/myorders
// @desc    Get logged in user orders
// @access  Private
const getMyOrders = async (req, res) => {
  try {
    const [orders] = await pool.query(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(orders);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách đơn hàng:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// @route   GET /api/orders/:id
// @desc    Get order by ID (with details)
// @access  Private
const getOrderById = async (req, res) => {
  try {
    // Check if order exists and belongs to user (or is admin)
    const [orders] = await pool.query('SELECT * FROM orders WHERE id = ?', [req.params.id]);
    
    if (orders.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }
    
    const order = orders[0];
    if (order.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Không có quyền xem đơn hàng này' });
    }

    // Get order items
    const [items] = await pool.query(`
      SELECT oi.*, p.name, p.image_url 
      FROM order_items oi 
      JOIN products p ON oi.product_id = p.id 
      WHERE oi.order_id = ?
    `, [req.params.id]);

    res.json({ ...order, items });
  } catch (error) {
    console.error('Lỗi lấy chi tiết đơn hàng:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// @route   GET /api/orders
// @desc    Get all orders
// @access  Private/Admin
const getOrdersList = async (req, res) => {
  try {
    const [orders] = await pool.query(`
      SELECT o.*, u.name as user_name, u.email, t.name as table_name
      FROM orders o 
      LEFT JOIN users u ON o.user_id = u.id 
      LEFT JOIN tables t ON o.table_id = t.id
      ORDER BY o.created_at DESC
    `);
    
    if (orders.length > 0) {
      const orderIds = orders.map(o => o.id);
      const [orderItems] = await pool.query(`
        SELECT oi.*, p.name, p.image_url 
        FROM order_items oi 
        JOIN products p ON oi.product_id = p.id 
        WHERE oi.order_id IN (?)
      `, [orderIds]);
      
      // Map items to corresponding orders
      orders.forEach(order => {
        order.items = orderItems.filter(item => item.order_id === order.id);
      });
    }

    res.json(orders);
  } catch (error) {
    console.error('Lỗi khi lấy tất cả đơn hàng:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// @route   PUT /api/orders/:id/status
// @desc    Update order status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    const [result] = await pool.query(
      'UPDATE orders SET status = ? WHERE id = ?',
      [status, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }

    // Emit real-time status update
    const io = req.app.get('io');
    if (io) {
      io.emit('order_status_updated', { orderId: parseInt(req.params.id), status });
    }

    res.json({ message: 'Cập nhật trạng thái thành công' });
  } catch (error) {
    console.error('Lỗi cập nhật trạng thái đơn:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  getOrdersList,
  updateOrderStatus
};
