const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./simple-db');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

const JWT_SECRET = 'mayfair_fast_food_jwt_secret_2023';

// Auth middleware
const auth = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'No token, authorization denied' 
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = db.findUser({ id: decoded.id });
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token is not valid' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ 
      success: false, 
      message: 'Token is not valid' 
    });
  }
};

const adminAuth = (req, res, next) => {
  auth(req, res, () => {
    if (req.user && req.user.role === 'admin') {
      next();
    } else {
      res.status(403).json({ 
        success: false, 
        message: 'Access denied. Admin rights required.' 
      });
    }
  });
};

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: '🍔 May Fair Fast Food API is running! (Simple DB Version)',
    version: '1.0.0',
    database: 'JSON File Database',
    status: 'Ready for orders!'
  });
});

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;

    // Check if user exists
    const existingUser = db.findUser({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = db.createUser({
      name,
      email,
      password: hashedPassword,
      phone,
      address,
      role: 'customer'
    });

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '30d' });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: error.message
    });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = db.findUser({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '30d' });

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message
    });
  }
});

app.get('/api/auth/me', auth, (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

// Menu routes
app.get('/api/menu', (req, res) => {
  try {
    const { category } = req.query;
    const menuItems = db.findMenuItems({ 
      category, 
      available: true 
    });

    res.json({
      success: true,
      count: menuItems.length,
      data: menuItems
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching menu items',
      error: error.message
    });
  }
});

app.get('/api/menu/:id', (req, res) => {
  try {
    const menuItem = db.findMenuItemById(req.params.id);
    
    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    res.json({
      success: true,
      data: menuItem
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching menu item',
      error: error.message
    });
  }
});

// Order routes
app.post('/api/orders', auth, async (req, res) => {
  try {
    const { items, deliveryAddress, specialInstructions, paymentMethod } = req.body;

    // Calculate total and verify items
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const menuItem = db.findMenuItemById(item.menuItem);
      if (!menuItem || !menuItem.available) {
        return res.status(400).json({
          success: false,
          message: `Item ${menuItem?.name || item.menuItem} is not available`
        });
      }

      const itemTotal = menuItem.price * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        menuItem: menuItem.id,
        name: menuItem.name,
        quantity: item.quantity,
        price: menuItem.price
      });
    }

    // Create order
    const order = db.createOrder({
      customer: req.user.id,
      customerName: req.user.name,
      items: orderItems,
      totalAmount,
      deliveryAddress,
      specialInstructions,
      paymentMethod
    });

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating order',
      error: error.message
    });
  }
});

app.get('/api/orders/my-orders', auth, (req, res) => {
  try {
    const orders = db.findOrders({ customer: req.user.id });

    res.json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message
    });
  }
});

// Admin routes
app.get('/api/admin/dashboard', adminAuth, (req, res) => {
  try {
    const orders = db.findOrders();
    const menuItems = db.findMenuItems();
    const users = db.data.users.filter(user => user.role === 'customer');

    const totalOrders = orders.length;
    const totalRevenue = orders
      .filter(order => order.paymentStatus === 'paid')
      .reduce((sum, order) => sum + order.totalAmount, 0);
    const totalCustomers = users.length;
    const totalMenuItems = menuItems.length;

    const recentOrders = orders.slice(-10).reverse();

    res.json({
      success: true,
      data: {
        stats: {
          totalOrders,
          totalRevenue,
          totalCustomers,
          totalMenuItems
        },
        recentOrders
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

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Simple Server running on port ${PORT}`);
  console.log(`🍔 May Fair Fast Food API Ready!`);
  console.log(`📍 Manyanja Road, Nairobi`);
  console.log(`💾 Using JSON File Database (no MongoDB required)`);
  console.log(`📊 Sample data loaded automatically`);
  console.log(`👤 Admin: admin@mayfair.com / admin123`);
  console.log(`👥 Customer: customer@example.com / customer123`);
});

// Cart routes
app.post('/api/cart/add', auth, async (req, res) => {
  try {
    const { menuItemId, quantity } = req.body;
    const menuItem = await MenuItem.findById(menuItemId).exec();
    
    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    // In a real app, you'd store cart in database
    // For now, we'll just return success
    res.json({
      success: true,
      message: 'Item added to cart',
      data: {
        menuItem,
        quantity
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding to cart',
      error: error.message
    });
  }
});

// User profile route
app.get('/api/user/profile', auth, (req, res) => {
  res.json({
    success: true,
    data: req.user
  });
});

// Update order status (admin)
app.patch('/api/admin/orders/:id', adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const order = db.updateOrder(req.params.id, { status });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      message: 'Order status updated',
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating order',
      error: error.message
    });
  }
});