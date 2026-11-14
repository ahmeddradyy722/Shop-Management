const mongoose = require('mongoose');
const line = new mongoose.Schema({
  item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
}, { _id: false });
const note = new mongoose.Schema({
  text: { type: String, required: true, trim: true },
  createdAt: { type: Date, default: Date.now },
}, { _id: true });
module.exports = mongoose.model('Order', new mongoose.Schema({
  customer: {
    name: { type: String, required: [true, 'Customer name is required'], trim: true },
    phone: { type: String, required: [true, 'Customer phone is required'], trim: true },
    email: { type: String, required: [true, 'Customer email is required'], trim: true, lowercase: true, match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Customer email is invalid'] },
    address: { type: String, trim: true },
  },
  items: { type: [line], validate: v => v.length > 0 },
  totalPrice: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ['opened', 'closed'], default: 'opened' },
  paymentMethod: { type: String, enum: ['phone', 'stripe'], default: 'phone' },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  stripeSessionId: { type: String, sparse: true },
  notes: { type: String, trim: true },
  noteHistory: { type: [note], default: [] },
}, { timestamps: true }));
