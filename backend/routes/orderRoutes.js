const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrderById,
  getOrdersList,
  updateOrderStatus
} = require('../controllers/orderController');
const { protect, adminOnly, optionalAuth } = require('../middleware/authMiddleware');

router.route('/')
  .post(optionalAuth, createOrder)
  .get(protect, adminOnly, getOrdersList); // Admin only

router.route('/myorders').get(protect, getMyOrders);

router.route('/:id').get(protect, getOrderById);

router.route('/:id/status').put(protect, adminOnly, updateOrderStatus); // Admin only

module.exports = router;
