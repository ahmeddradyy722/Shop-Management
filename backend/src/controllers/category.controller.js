const Category = require('../models/category.model');
const Item = require('../models/item.model');
const pick = b => ({
  name: b.name || b.nameEn || b.nameAr,
  nameEn: b.nameEn,
  nameAr: b.nameAr,
  description: b.description,
  descriptionEn: b.descriptionEn,
  descriptionAr: b.descriptionAr,
});
exports.list = async (req, res) => res.json(await Category.find().sort('name'));
exports.create = async (req, res) => res.status(201).json(await Category.create(pick(req.body)));
exports.update = async (req, res) => {
  const c = await Category.findByIdAndUpdate(req.params.id, pick(req.body), { new: true, runValidators: true });
  if (!c) return res.status(404).json({ message: 'Category not found' });
  res.json(c);
};
exports.remove = async (req, res) => {
  if (await Item.exists({ category: req.params.id })) return res.status(400).json({ message: 'Cannot delete a category that has items' });
  await Category.findByIdAndDelete(req.params.id);
  res.status(204).end();
};
