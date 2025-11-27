const express = require('express');
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const User = require('../models/User');
const { adminAuth } = require('../middleware/auth');

const router = express.Router();

// Get dashboard stats
router.get('/dashboard', adminAuth, async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const totalMenuItems = await MenuItem.countDocuments();

    const recentOrders = await Order.find()
      .populate('customer', 'name email')
      .sort({ createdAt: -1 })
      .limit(10);

    const ordersByStatus = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          totalOrders,
          totalRevenue: totalRevenue[0]?.total || 0,
          totalCustomers,
          totalMenuItems
        },
        recentOrders,
        ordersByStatus
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard data',
      error: error.message
    });
  }
});

// Get all orders (admin)
router.get('/orders', adminAuth, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    let filter = {};
    
    if (status && status !== 'all') {
      filter.status = status;
    }

    const orders = await Order.find(filter)
      .populate('customer', 'name email phone')
      .populate('items.menuItem')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(filter);

    res.json({
      success: true,
      data: orders,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message
    });
  }
});

module.exports = router;