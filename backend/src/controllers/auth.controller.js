const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
exports.login = async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const normalizedPassword = String(password || '').trim();
  const u = await User.findOne({ email: normalizedEmail }).select('+password');
  if (!u || !(await u.comparePassword(normalizedPassword))) return res.status(401).json({ message: 'Invalid email or password' });
  const token = jwt.sign({ id: u._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1d' });
  res.json({ token, user: { name: u.name, email: u.email, role: u.role } });
};
