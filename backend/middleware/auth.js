const jwt = require('jsonwebtoken');
const db = require('../config/database');

const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route',
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from database
      const userQuery = `
        SELECT u.id, u.email, u.role, u.tenant_id, u.profile, t.name as tenant_name, t.config as tenant_config
        FROM users u
        LEFT JOIN tenants t ON u.tenant_id = t.id
        WHERE u.id = $1 AND u.is_deleted = false
      `;
      const userResult = await db.query(userQuery, [decoded.id]);

      if (userResult.rows.length === 0) {
        return res.status(401).json({
          success: false,
          message: 'User not found or account deactivated',
        });
      }

      req.user = userResult.rows[0];
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route',
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error in authentication',
    });
  }
};

module.exports = { protect };