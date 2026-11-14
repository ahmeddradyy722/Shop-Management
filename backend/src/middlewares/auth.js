const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
exports.protect = async (req, res, next) => {
  try {
    const h = req.headers.authorization || '';
    const token = h.startsWith('Bearer ') ? h.slice(7) : null;
    if (!token) return res.status(401).json({ message: 'Unauthorized' });
    const { id } = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(id);
    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    req.user = user; next();
  } catch { res.status(401).json({ message: 'Invalid or expired token' }); }
};
exports.managerOnly = (req, res, next) => {
  if (req.user?.role !== 'manager') return res.status(403).json({ message: 'Manager access required' });
  next();
};
