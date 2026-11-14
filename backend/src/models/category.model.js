const mongoose = require('mongoose');
module.exports = mongoose.model('Category', new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  nameEn: { type: String, trim: true },
  nameAr: { type: String, trim: true },
  description: { type: String, trim: true },
  descriptionEn: { type: String, trim: true },
  descriptionAr: { type: String, trim: true },
}, { timestamps: true }));
