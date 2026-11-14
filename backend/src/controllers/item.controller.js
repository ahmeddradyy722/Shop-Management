const Item = require('../models/item.model');
const pick = b => ({
  name: b.name || b.nameEn || b.nameAr,
  nameEn: b.nameEn,
  nameAr: b.nameAr,
  description: b.description,
  descriptionEn: b.descriptionEn,
  descriptionAr: b.descriptionAr,
  imageUrl: b.imageUrl,
  price: b.price,
  quantity: b.quantity,
  category: b.category,
});
const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Public: quantity is never returned
const publicItem = item => {
  const value = item.toObject ? item.toObject() : item;
  const { quantity, ...safeItem } = value;
  return {
    ...safeItem,
    description: { en: value.descriptionEn || value.description || '', ar: value.descriptionAr || value.description || '' },
    inStock: quantity > 0,
  };
};

exports.list = async (req, res) => {
  const f = {};
  if (req.query.category) f.category = req.query.category;
  if (req.query.search) f.name = new RegExp(esc(String(req.query.search)), 'i');
  const items = await Item.find(f).populate('category', 'name nameEn nameAr description descriptionEn descriptionAr').sort('-createdAt');
  res.json(items.map(publicItem));
};
exports.getOne = async (req, res) => {
  const i = await Item.findById(req.params.id).populate('category', 'name nameEn nameAr description descriptionEn descriptionAr');
  if (!i) return res.status(404).json({ message: 'Item not found' });
  res.json(publicItem(i));
};
exports.byIds = async (req, res) => {
  const ids = Array.isArray(req.body.ids) ? req.body.ids : [];
  const items = await Item.find({ _id: { $in: ids } }).populate('category', 'name nameEn nameAr description descriptionEn descriptionAr');
  res.json(items.map(publicItem));
};

// Admin: full data including quantity
exports.adminList = async (req, res) => res.json(await Item.find().populate('category', 'name').sort('-createdAt'));
exports.adminGet = async (req, res) => {
  const i = await Item.findById(req.params.id);
  if (!i) return res.status(404).json({ message: 'Item not found' });
  res.json(i);
};
exports.create = async (req, res) => res.status(201).json(await Item.create(pick(req.body)));
exports.update = async (req, res) => {
  const i = await Item.findByIdAndUpdate(req.params.id, pick(req.body), { new: true, runValidators: true });
  if (!i) return res.status(404).json({ message: 'Item not found' });
  res.json(i);
};
exports.remove = async (req, res) => { await Item.findByIdAndDelete(req.params.id); res.status(204).end(); };
