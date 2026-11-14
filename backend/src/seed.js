require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/user.model');
const Category = require('./models/category.model');
const Item = require('./models/item.model');
(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const email = process.env.MANAGER_EMAIL.toLowerCase();
  if (!(await User.findOne({ email }))) {
    await User.create({ name: 'Manager', email, password: process.env.MANAGER_PASSWORD });
    console.log('Manager created:', email);
  } else console.log('Manager already exists');
  if (!(await Category.countDocuments())) {
    const [a, b] = await Category.insertMany([{ name: 'Drinks', description: 'Cold and hot drinks' }, { name: 'Snacks', description: 'Chips, biscuits and more' }]);
    await Item.insertMany([
      { name: 'Orange Juice 1L', description: 'Fresh orange juice', imageUrl: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=900&q=80', price: 45, quantity: 20, category: a._id },
      { name: 'Black Tea 100 bags', description: 'Classic black tea', imageUrl: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=900&q=80', price: 60, quantity: 35, category: a._id },
      { name: 'Potato Chips', description: 'Salted, family size', imageUrl: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=900&q=80', price: 25, quantity: 50, category: b._id },
      { name: 'Chocolate Biscuits', description: 'Pack of 12', imageUrl: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=900&q=80', price: 30, quantity: 40, category: b._id },
    ]);
    console.log('Sample categories and items created');
  }
  const defaultImages = {
    'Orange Juice 1L': 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=900&q=80',
    'Black Tea 100 bags': 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=900&q=80',
    'Potato Chips': 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=900&q=80',
    'Chocolate Biscuits': 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=900&q=80',
  };
  for (const [name, imageUrl] of Object.entries(defaultImages)) {
    await Item.updateOne({ name, $or: [{ imageUrl: { $exists: false } }, { imageUrl: '' }] }, { $set: { imageUrl } });
  }
  console.log('Product images checked');
  await mongoose.disconnect();
})();
