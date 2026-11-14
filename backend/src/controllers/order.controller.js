const Order = require('../models/order.model');
const Item = require('../models/item.model');
const mail = require('../services/mail.service');
const Stripe = require('stripe');
const getStripe = () => Stripe(process.env.STRIPE_SECRET_KEY);

exports.create = async (req, res) => {
  const { customer, items } = req.body;
  if (!customer?.name?.trim() || !customer?.phone?.trim() || !customer?.email?.trim()) {
    return res.status(400).json({ message: 'Customer name, phone and email are required' });
  }
  if (!Array.isArray(items) || !items.length) return res.status(400).json({ message: 'Cart is empty' });
  const docs = await Item.find({ _id: { $in: items.map(i => i.itemId) } });
  const lines = []; const reserved = []; let total = 0;
  for (const l of items) {
    const d = docs.find(x => String(x._id) === String(l.itemId));
    const qty = Number(l.quantity);
    if (!d || !Number.isInteger(qty) || qty < 1) return res.status(400).json({ message: 'Invalid item in cart' });
    if (qty > d.quantity) return res.status(400).json({ message: `Not enough stock for "${d.name}"` });
    const updated = await Item.findOneAndUpdate(
      { _id: d._id, quantity: { $gte: qty } },
      { $inc: { quantity: -qty } },
      { new: true },
    );
    if (!updated) {
      for (const r of reserved) await Item.findByIdAndUpdate(r.id, { $inc: { quantity: r.quantity } });
      return res.status(400).json({ message: `Not enough stock for "${d.name}"` });
    }
    reserved.push({ id: d._id, quantity: qty });
    lines.push({ item: d._id, name: d.name, price: d.price, quantity: qty });
    total += d.price * qty;
  }
  try {
    const o = await Order.create({ customer, items: lines, totalPrice: total, paymentMethod: 'phone' });
    let emailSent = false;
    let emailWarning = '';
    try {
      ({ sent: emailSent } = await mail.sendOrderConfirmation(o));
    } catch (error) {
      console.error('Order confirmation email failed:', error.message);
      emailWarning = 'Order created, but confirmation email could not be sent';
    }
    res.status(201).json({ _id: o._id, totalPrice: total, emailSent, emailWarning });
  } catch (error) {
    for (const r of reserved) await Item.findByIdAndUpdate(r.id, { $inc: { quantity: r.quantity } });
    throw error;
  }
};

exports.createCheckoutSession = async (req, res) => {
  if (!process.env.STRIPE_SECRET_KEY || !/^sk_(test|live)_[A-Za-z0-9]+$/.test(process.env.STRIPE_SECRET_KEY)) {
    return res.status(503).json({ message: 'Stripe secret key is missing or invalid' });
  }
  const stripe = getStripe();
  const { customer, items } = req.body;
  if (!customer?.name?.trim() || !customer?.phone?.trim() || !customer?.email?.trim()) {
    return res.status(400).json({ message: 'Customer name, phone and email are required' });
  }
  if (!Array.isArray(items) || !items.length) return res.status(400).json({ message: 'Cart is empty' });

  const docs = await Item.find({ _id: { $in: items.map(i => i.itemId) } });
  const lines = []; const reserved = []; const lineItems = []; let total = 0;
  for (const l of items) {
    const d = docs.find(x => String(x._id) === String(l.itemId));
    const qty = Number(l.quantity);
    if (!d || !Number.isInteger(qty) || qty < 1) return res.status(400).json({ message: 'Invalid item in cart' });
    const updated = await Item.findOneAndUpdate(
      { _id: d._id, quantity: { $gte: qty } }, { $inc: { quantity: -qty } }, { new: true },
    );
    if (!updated) {
      for (const r of reserved) await Item.findByIdAndUpdate(r.id, { $inc: { quantity: r.quantity } });
      return res.status(400).json({ message: `Not enough stock for "${d.name}"` });
    }
    reserved.push({ id: d._id, quantity: qty });
    lines.push({ item: d._id, name: d.name, price: d.price, quantity: qty });
    lineItems.push({ price_data: { currency: 'egp', product_data: { name: d.name }, unit_amount: Math.round(d.price * 100) }, quantity: qty });
    total += d.price * qty;
  }

  let order;
  try {
    order = await Order.create({ customer, items: lines, totalPrice: total, paymentMethod: 'stripe' });
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: customer.email,
      line_items: lineItems,
      metadata: { orderId: String(order._id) },
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:4200'}/buy?payment=success`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:4200'}/buy?payment=cancelled`,
    });
    await Order.findByIdAndUpdate(order._id, { stripeSessionId: session.id });
    res.status(201).json({ url: session.url });
  } catch (error) {
    for (const r of reserved) await Item.findByIdAndUpdate(r.id, { $inc: { quantity: r.quantity } });
    if (order) await Order.findByIdAndDelete(order._id);
    if (error.type === 'StripeAuthenticationError' || error.type === 'StripeInvalidRequestError') {
      return res.status(502).json({ message: `Stripe payment setup failed: ${error.message}` });
    }
    throw error;
  }
};

exports.handleStripeWebhook = async (req, res) => {
  let event;
  try {
    event = getStripe().webhooks.constructEvent(req.body, req.headers['stripe-signature'], process.env.STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const order = await Order.findOneAndUpdate(
      { _id: session.metadata?.orderId, paymentStatus: 'pending' },
      { paymentStatus: 'paid' }, { new: true },
    );
    if (order) {
      try { await mail.sendOrderConfirmation(order); } catch (error) { console.error('Order confirmation email failed:', error.message); }
    }
  }
  res.json({ received: true });
};
exports.list = async (req, res) => {
  const f = {};
  if (['opened', 'closed'].includes(req.query.status)) f.status = req.query.status;
  res.json(await Order.find(f).sort('-createdAt'));
};
exports.getOne = async (req, res) => {
  const o = await Order.findById(req.params.id);
  if (!o) return res.status(404).json({ message: 'Order not found' });
  res.json(o);
};
exports.update = async (req, res) => {
  const upd = {};
  if (req.body.status !== undefined) upd.status = req.body.status;
  const noteText = String(req.body.note || '').trim();
  const update = { $set: upd };
  if (noteText) update.$push = { noteHistory: { text: noteText, createdAt: new Date() } };
  const o = await Order.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
  if (!o) return res.status(404).json({ message: 'Order not found' });
  res.json(o);
};
