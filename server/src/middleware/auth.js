const jwt = require('jsonwebtoken');
const User = require('../models/User');

// req.user will be set if authenticated
// authenticateToken middleware
const authenticateToken = async (req, res, next) => {
  try {
    console.log('🔑 Auth middleware called for:', req.method, req.url);
    const authHeader = req.headers['authorization'];
    console.log('📋 Auth header:', authHeader ? `${authHeader.substring(0, 20)}...` : 'MISSING');
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      console.log('❌ Token missing');
      return res.status(401).json({ error: 'Токен доступу відсутній' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    console.log('✅ Token decoded, userId:', decoded.userId);
    const user = await User.findById(decoded.userId);

    if (!user) {
      console.log('❌ User not found for userId:', decoded.userId);
      return res.status(401).json({ error: 'Користувач не знайдений' });
    }

    console.log('✅ User authenticated:', user.username, user.role);
    req.user = user;
    next();
  } catch (error) {
    console.error('❌ Auth middleware error:', error);
    return res.status(403).json({ 
      error: 'Недійсний токен', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};

// requireRole middleware
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Користувач не автентифікований' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Недостатньо прав доступу',
        required: allowedRoles,
        current: req.user.role
      });
    }

    next();
  };
};

module.exports = { authenticateToken, requireRole };
