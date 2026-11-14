const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const s = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6, select: false },
  role: { type: String, enum: ['manager'], default: 'manager' },
}, { timestamps: true });
s.pre('save', async function () { if (this.isModified('password')) this.password = await bcrypt.hash(this.password, 10); });
s.methods.comparePassword = function (p) { return bcrypt.compare(p, this.password); };
module.exports = mongoose.model('User', s);
