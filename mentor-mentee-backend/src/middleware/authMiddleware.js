const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');

/**
 * Middleware to protect routes and verify JWT
 */
exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Admin bypass since Admin is not in the database
    if (decoded.role === 'ADMIN') {
      req.user = { id: 'admin-system-id', role: 'ADMIN' };
      return next();
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, username: true, role: true, isFirstLogin: true, isActive: true }
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'User belonging to this token no longer exists' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account deactivated. Contact admin.' });
    }

    // Force password change lock:
    // **TEMPORARILY LOOSENED for Dashboard Testing** 
    /*
    if (user.isFirstLogin && !req.originalUrl.includes('/api/auth/change-password')) {
       return res.status(403).json({ 
         success: false, 
         message: 'Please change your temporary password to continue' 
       });
    }
    */

    req.user = user;
    next();
  } catch (error) {
    console.error('[AUTH Middleware Error]:', error.message);
    return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
  }
};
