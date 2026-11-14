exports.image = (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'Please select an image' });
  res.status(201).json({ imageUrl: `/uploads/${req.file.filename}` });
};
