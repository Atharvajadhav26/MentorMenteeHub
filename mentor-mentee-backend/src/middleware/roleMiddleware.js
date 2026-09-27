/**
 * Role-Based Access Control (RBAC) Middleware
 * @param  {...string} roles - Allowed roles (e.g., 'ADMIN', 'MENTOR')
 */
exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    // req.user is set by the protect middleware
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `Role (${req.user ? req.user.role : 'Unknown'}) is not allowed to access this resource` 
      });
    }
    next();
  };
};
