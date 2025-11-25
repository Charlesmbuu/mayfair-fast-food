const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`,
      });
    }

    next();
  };
};

// Specific role checkers for common use cases
const requireAdmin = authorize('admin', 'manager');
const requireManager = authorize('manager');
const requireSuperAdmin = authorize('super_admin');
const requireCustomer = authorize('customer');

module.exports = {
  authorize,
  requireAdmin,
  requireManager,
  requireSuperAdmin,
  requireCustomer,
};