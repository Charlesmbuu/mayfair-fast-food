const express = require('express');
const db = require('../config/database');
const { protect } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/roleCheck');

const router = express.Router();

// @desc    Get menu items for customers
// @route   GET /api/menu
// @access  Private (any authenticated user)
router.get('/', protect, async (req, res) => {
  try {
    const { category_id, search } = req.query;
    
    let menuQuery = `
      SELECT 
        mi.id, mi.name, mi.description, mi.price, mi.image_url,
        mi.is_available, mi.inventory_count, mi.attributes,
        mc.name as category_name, mc.id as category_id
      FROM menu_items mi
      INNER JOIN menu_categories mc ON mi.category_id = mc.id
      WHERE mi.tenant_id = $1 AND mi.is_available = true
      AND mc.is_active = true
    `;
    
    const queryParams = [req.user.tenant_id];
    let paramCount = 1;

    if (category_id) {
      paramCount++;
      menuQuery += ` AND mi.category_id = $${paramCount}`;
      queryParams.push(category_id);
    }

    if (search) {
      paramCount++;
      menuQuery += ` AND (mi.name ILIKE $${paramCount} OR mi.description ILIKE $${paramCount})`;
      queryParams.push(`%${search}%`);
    }

    menuQuery += ` ORDER BY mc.sort_order, mi.name`;

    const menuResult = await db.query(menuQuery, queryParams);

    // Group by category for better frontend display
    const menuByCategory = {};
    menuResult.rows.forEach(item => {
      if (!menuByCategory[item.category_name]) {
        menuByCategory[item.category_name] = {
          category_id: item.category_id,
          category_name: item.category_name,
          items: []
        };
      }
      menuByCategory[item.category_name].items.push({
        id: item.id,
        name: item.name,
        description: item.description,
        price: parseFloat(item.price),
        image_url: item.image_url,
        inventory_count: item.inventory_count,
        attributes: item.attributes
      });
    });

    res.json({
      success: true,
      data: Object.values(menuByCategory),
    });
  } catch (error) {
    console.error('Get menu error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching menu items',
    });
  }
});

// @desc    Create a new menu item (Admin/Manager only)
// @route   POST /api/admin/menu
// @access  Private (Admin/Manager)
router.post('/admin/menu', protect, requireAdmin, async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category_id,
      image_url,
      inventory_count = 0,
      attributes = {}
    } = req.body;

    // Validation
    if (!name || !price || !category_id) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, price, and category',
      });
    }

    // Verify category belongs to tenant
    const categoryCheckQuery = `
      SELECT id FROM menu_categories 
      WHERE id = $1 AND tenant_id = $2
    `;
    const categoryCheck = await db.query(categoryCheckQuery, [category_id, req.user.tenant_id]);

    if (categoryCheck.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category',
      });
    }

    const insertMenuItemQuery = `
      INSERT INTO menu_items (
        tenant_id, category_id, name, description, price, 
        image_url, inventory_count, attributes
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const newMenuItemResult = await db.query(insertMenuItemQuery, [
      req.user.tenant_id,
      category_id,
      name,
      description,
      price,
      image_url,
      inventory_count,
      JSON.stringify(attributes)
    ]);

    res.status(201).json({
      success: true,
      message: 'Menu item created successfully',
      data: newMenuItemResult.rows[0],
    });
  } catch (error) {
    console.error('Create menu item error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating menu item',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// @desc    Get menu categories
// @route   GET /api/menu/categories
// @access  Private
router.get('/categories', protect, async (req, res) => {
  try {
    const categoriesQuery = `
      SELECT id, name, description, sort_order
      FROM menu_categories
      WHERE tenant_id = $1 AND is_active = true
      ORDER BY sort_order, name
    `;

    const categoriesResult = await db.query(categoriesQuery, [req.user.tenant_id]);

    res.json({
      success: true,
      data: categoriesResult.rows,
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching categories',
    });
  }
});

module.exports = router;