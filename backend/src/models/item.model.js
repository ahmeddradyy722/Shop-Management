const mongoose = require('mongoose');
module.exports = mongoose.model('Item', new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  nameEn: { type: String, trim: true },
  nameAr: { type: String, trim: true },
  description: { type: String, trim: true },
  descriptionEn: { type: String, trim: true },
  descriptionAr: { type: String, trim: true },
  imageUrl: { type: String, trim: true },
  price: { type: Number, required: true, min: 0 },
  quantity: { type: Number, required: true, min: 0, default: 0 },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
}, { timestamps: true }));
