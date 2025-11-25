const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../config/database');
const generateToken = require('../utils/generateToken');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { email, password, role = 'customer', profile = {} } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // Check if user already exists
    const userExistsQuery = 'SELECT id FROM users WHERE email = $1 AND is_deleted = false';
    const userExistsResult = await db.query(userExistsQuery, [email]);

    if (userExistsResult.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email',
      });
    }

    // For MVP: Assign to the founding hotel (you'd get this from configuration)
    // In production, this would be handled during tenant onboarding
    const tenantQuery = 'SELECT id FROM tenants WHERE slug = $1';
    const tenantResult = await db.query(tenantQuery, ['founding-hotel']);
    
    if (tenantResult.rows.length === 0) {
      return res.status(500).json({
        success: false,
        message: 'System configuration error',
      });
    }

    const tenantId = tenantResult.rows[0].id;

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user in database
    const insertUserQuery = `
      INSERT INTO users (tenant_id, email, role, profile, auth_provider_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, email, role, profile, tenant_id, created_at
    `;

    // For simplicity, we're using our own auth. In production, use Auth0/Clerk
    const authProviderId = `local|${Date.now()}`;

    const newUserResult = await db.query(insertUserQuery, [
      tenantId,
      email,
      role,
      JSON.stringify(profile),
      authProviderId
    ]);

    // Store hashed password separately (in a real app, you might have a separate credentials table)
    const passwordQuery = 'UPDATE users SET password_hash = $1 WHERE id = $2';
    await db.query(passwordQuery, [hashedPassword, newUserResult.rows[0].id]);

    const user = newUserResult.rows[0];

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        id: user.id,
        email: user.email,
        role: user.role,
        profile: user.profile,
        tenantId: user.tenant_id,
        token: generateToken(user.id),
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Error in user registration',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // Check if user exists and get hashed password
    const userQuery = `
      SELECT u.id, u.email, u.role, u.tenant_id, u.profile, u.password_hash, 
             t.name as tenant_name, t.config as tenant_config
      FROM users u
      LEFT JOIN tenants t ON u.tenant_id = t.id
      WHERE u.email = $1 AND u.is_deleted = false
    `;
    const userResult = await db.query(userQuery, [email]);

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    const user = userResult.rows[0];

    // Check password
    const isPasswordMatch = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Remove password hash from response
    delete user.password_hash;

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        id: user.id,
        email: user.email,
        role: user.role,
        profile: user.profile,
        tenantId: user.tenant_id,
        tenantName: user.tenant_name,
        token: generateToken(user.id),
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error in user login',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        id: req.user.id,
        email: req.user.email,
        role: req.user.role,
        profile: req.user.profile,
        tenantId: req.user.tenant_id,
        tenantName: req.user.tenant_name,
      },
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user data',
    });
  }
});

module.exports = router;