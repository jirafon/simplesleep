const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      console.log('❌ No token provided for:', req.method, req.path);
      return res.status(401).json({ message: 'No token provided, authorization denied' });
    }

    // Clean JWT_SECRET (remove quotes and spaces)
    let jwtSecret = process.env.JWT_SECRET || 'saludsimple_secret_key_change_in_production';
    jwtSecret = jwtSecret.trim().replace(/^["']|["']$/g, '');

    const decoded = jwt.verify(token, jwtSecret);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      console.log('❌ User not found for token, userId:', decoded.userId);
      return res.status(401).json({ message: 'Token is not valid' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('❌ Auth error:', error.message);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Token inválido' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expirado' });
    }
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = auth;
