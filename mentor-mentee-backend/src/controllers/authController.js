const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * POST /api/auth/login
 * Unified login for Admin, Mentor, and Mentee
 */
exports.login = async (req, res, next) => {
  try {
    // Support multiple field bindings from frontend forms (PRN/Email)
    const { username, email, prn, password } = req.body;
    const identifier = username || email || prn;

    if (!identifier || !password) {
      return res.status(400).json({ success: false, message: 'Please provide PRN, Email, or Username along with your Password' });
    }

    // 1. Check if ADMIN (credentials from .env)
    if (identifier === process.env.ADMIN_EMAIL) {
      if (password !== process.env.ADMIN_PASSWORD) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }
      
      const token = jwt.sign({ id: 'admin-system-id', role: 'ADMIN' }, process.env.JWT_SECRET, { expiresIn: '1d' });
      
      return res.status(200).json({
        success: true,
        token,
        role: 'ADMIN',
        message: 'Admin logged in successfully'
      });
    }

    // 2. Database Lookup for Mentor/Mentee
    // We search the unified 'username' field (which stores PRN for mentees, Email for mentors)
    const user = await prisma.user.findFirst({
      where: { username: identifier }
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account is deactivated. Contact admin.' });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Forced password change for first-time Mentee login
    if (user.role === 'MENTEE' && user.isFirstLogin) {
      const token = jwt.sign(
        { id: user.id, role: user.role, requirePasswordChange: true }, 
        process.env.JWT_SECRET, 
        { expiresIn: '1h' }
      );
      
      return res.status(200).json({
        success: true,
        requirePasswordChange: true,
        token,
        message: 'First time login. Please change your password.'
      });
    }

    // Standard JWT generation
    const token = jwt.sign(
      { id: user.id, role: user.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1d' }
    );

    res.status(200).json({
      success: true,
      token,
      role: user.role,
      requirePasswordChange: user.isFirstLogin || false,
      message: 'Logged in successfully'
    });

  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/change-password
 * Requires Authentication
 */
exports.changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    if (userRole === 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Admin password must be changed in system configuration (.env)' });
    }

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide old password and new password' });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid old password' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        isFirstLogin: false
      }
    });

    // Generate fresh token without requirePasswordChange restraint
    const token = jwt.sign(
      { id: user.id, role: user.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1d' }
    );

    res.status(200).json({
      success: true,
      token,
      message: 'Password changed successfully'
    });
  } catch (error) {
    next(error);
  }
};
