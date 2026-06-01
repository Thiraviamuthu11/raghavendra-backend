const express = require('express');
const router = express.Router();
const { BATTERIES } = require('../data/batteries');

// Helper — read cart from session
function getCart(req) {
  if (!req.session.cart) req.session.cart = [];
  return req.session.cart;
}

// GET /api/cart
router.get('/', (req, res) => {
  const cart = getCart(req);
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  res.json({ success: true, data: { items: cart, total, count: cart.reduce((s, i) => s + i.qty, 0) } });
});

// POST /api/cart/add  { productId, qty? }
router.post('/add', (req, res) => {
  const { productId, qty = 1 } = req.body;
  const battery = BATTERIES.find((b) => b.id === parseInt(productId));
  if (!battery) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }
  if (battery.stock < 1) {
    return res.status(400).json({ success: false, message: 'Out of stock' });
  }

  const cart = getCart(req);
  const existing = cart.find((i) => i.id === battery.id);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ id: battery.id, name: battery.name, model: battery.model, emoji: battery.emoji, price: battery.price, qty });
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  res.json({ success: true, message: `${battery.name} added to cart`, data: { items: cart, total } });
});

// PATCH /api/cart/update  { productId, qty }
router.patch('/update', (req, res) => {
  const { productId, qty } = req.body;
  const cart = getCart(req);
  const item = cart.find((i) => i.id === parseInt(productId));
  if (!item) {
    return res.status(404).json({ success: false, message: 'Item not in cart' });
  }

  if (qty <= 0) {
    req.session.cart = cart.filter((i) => i.id !== parseInt(productId));
  } else {
    item.qty = qty;
  }

  const updatedCart = req.session.cart;
  const total = updatedCart.reduce((sum, i) => sum + i.price * i.qty, 0);
  res.json({ success: true, data: { items: updatedCart, total } });
});

// DELETE /api/cart/remove/:productId
router.delete('/remove/:productId', (req, res) => {
  req.session.cart = getCart(req).filter((i) => i.id !== parseInt(req.params.productId));
  const total = req.session.cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  res.json({ success: true, data: { items: req.session.cart, total } });
});

// DELETE /api/cart/clear
router.delete('/clear', (req, res) => {
  req.session.cart = [];
  res.json({ success: true, message: 'Cart cleared' });
});

module.exports = router;
