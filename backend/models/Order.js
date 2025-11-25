const express = require('express');
const db = require('../config/database');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @desc    Create a new order
// @route   POST /api/orders
// @access  Private
router.post('/', protect, async (req, res) => {
  const client = await db.pool.connect();
  
  try {
    const {
      restaurant_id,
      order_type = 'delivery',
      delivery_address = null,
      order_items,
      special_instructions = ''
    } = req.body;

    // Validation
    if (!restaurant_id || !order_items || !Array.isArray(order_items) || order_items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide restaurant ID and order items',
      });
    }

    await client.query('BEGIN');

    // 1. Verify restaurant belongs to tenant
    const restaurantQuery = `
      SELECT id FROM restaurants 
      WHERE id = $1 AND tenant_id = $2
    `;
    const restaurantResult = await client.query(restaurantQuery, [restaurant_id, req.user.tenant_id]);

    if (restaurantResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'Invalid restaurant',
      });
    }

    // 2. Calculate total and verify menu items
    let totalAmount = 0;
    const verifiedItems = [];

    for (const item of order_items) {
      const { menu_item_id, quantity, notes = '' } = item;

      if (!menu_item_id || !quantity || quantity <= 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          message: 'Invalid order item data',
        });
      }

      // Get menu item details and verify availability
      const menuItemQuery = `
        SELECT id, name, price, is_available, inventory_count
        FROM menu_items
        WHERE id = $1 AND tenant_id = $2
      `;
      const menuItemResult = await client.query(menuItemQuery, [menu_item_id, req.user.tenant_id]);

      if (menuItemResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          message: `Menu item not found: ${menu_item_id}`,
        });
      }

      const menuItem = menuItemResult.rows[0];

      if (!menuItem.is_available) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          message: `Menu item not available: ${menuItem.name}`,
        });
      }

      if (menuItem.inventory_count < quantity) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          message: `Insufficient inventory for: ${menuItem.name}`,
        });
      }

      const itemTotal = parseFloat(menuItem.price) * quantity;
      totalAmount += itemTotal;

      verifiedItems.push({
        menu_item_id,
        quantity,
        notes,
        unit_price: menuItem.price,
        item_total: itemTotal,
        menu_item_name: menuItem.name
      });
    }

    // 3. Generate order number
    const orderNumberQuery = `
      SELECT COUNT(*) as order_count FROM orders 
      WHERE tenant_id = $1 AND DATE(created_at) = CURRENT_DATE
    `;
    const orderNumberResult = await client.query(orderNumberQuery, [req.user.tenant_id]);
    const dailyOrderCount = parseInt(orderNumberResult.rows[0].order_count) + 1;
    const orderNumber = `ORD-${req.user.tenant_id.slice(0, 8)}-${Date.now()}-${dailyOrderCount.toString().padStart(4, '0')}`;

    // 4. Create order
    const insertOrderQuery = `
      INSERT INTO orders (
        tenant_id, user_id, restaurant_id, order_number, status,
        order_type, total_amount, delivery_address, special_instructions
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const newOrderResult = await client.query(insertOrderQuery, [
      req.user.tenant_id,
      req.user.id,
      restaurant_id,
      orderNumber,
      'pending',
      order_type,
      totalAmount,
      delivery_address ? JSON.stringify(delivery_address) : null,
      special_instructions
    ]);

    const order = newOrderResult.rows[0];

    // 5. Create order items and update inventory
    for (const item of verifiedItems) {
      // Insert order item
      const insertOrderItemQuery = `
        INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, notes)
        VALUES ($1, $2, $3, $4, $5)
      `;
      await client.query(insertOrderItemQuery, [
        order.id,
        item.menu_item_id,
        item.quantity,
        item.unit_price,
        item.notes
      ]);

      // Update inventory
      const updateInventoryQuery = `
        UPDATE menu_items 
        SET inventory_count = inventory_count - $1, updated_at = NOW()
        WHERE id = $2
      `;
      await client.query(updateInventoryQuery, [item.quantity, item.menu_item_id]);
    }

    // 6. Log order status change
    const insertStatusLogQuery = `
      INSERT INTO order_status_log (order_id, old_status, new_status, changed_by)
      VALUES ($1, $2, $3, $4)
    `;
    await client.query(insertStatusLogQuery, [
      order.id,
      null,
      'pending',
      req.user.id
    ]);

    await client.query('COMMIT');

    // 7. Fetch complete order details for response
    const completeOrderQuery = `
      SELECT 
        o.*,
        json_agg(
          json_build_object(
            'id', oi.id,
            'menu_item_id', oi.menu_item_id,
            'menu_item_name', mi.name,
            'quantity', oi.quantity,
            'unit_price', oi.unit_price,
            'notes', oi.notes,
            'item_total', (oi.quantity * oi.unit_price)
          )
        ) as order_items,
        r.name as restaurant_name
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN menu_items mi ON oi.menu_item_id = mi.id
      LEFT JOIN restaurants r ON o.restaurant_id = r.id
      WHERE o.id = $1
      GROUP BY o.id, r.name
    `;

    const completeOrderResult = await db.query(completeOrderQuery, [order.id]);

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: completeOrderResult.rows[0],
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating order',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  } finally {
    client.release();
  }
});

// @desc    Get user's orders
// @route   GET /api/orders
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const ordersQuery = `
      SELECT 
        o.id, o.order_number, o.status, o.total_amount, o.order_type,
        o.created_at, o.updated_at,
        r.name as restaurant_name
      FROM orders o
      LEFT JOIN restaurants r ON o.restaurant_id = r.id
      WHERE o.user_id = $1 AND o.tenant_id = $2
      ORDER BY o.created_at DESC
    `;

    const ordersResult = await db.query(ordersQuery, [req.user.id, req.user.tenant_id]);

    res.json({
      success: true,
      data: ordersResult.rows,
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
    });
  }
});

module.exports = router;
