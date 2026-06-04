const express = require('express');
const router = express.Router();
const {
  getTables,
  createTable,
  updateTable,
  deleteTable,
  checkoutTable
} = require('../controllers/tableController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.route('/')
  .get(getTables) // Public access for Guests to select tables
  .post(protect, adminOnly, createTable); // Admin creates tables

router.route('/:id')
  .put(protect, adminOnly, updateTable)
  .delete(protect, adminOnly, deleteTable);

router.post('/:id/checkout', protect, adminOnly, checkoutTable);

module.exports = router;
