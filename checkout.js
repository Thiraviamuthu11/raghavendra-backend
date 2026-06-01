const express = require('express');
const router = express.Router();

// POST /api/checkout/create-order
router.post('/create-order', (req, res) => {
  const cart = req.session.cart;
  if (!cart || cart.length === 0) {
    return res.status(400).json({ success: false, message: 'Cart is empty' });
  }
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  // Mock order — replace with Razorpay later
  res.json({
    success: true,
    data: {
      orderId: 'order_' + Date.now(),
      amount: total * 100,
      currency: 'INR',
      items: cart,
      total
    }
  });
});

// POST /api/checkout/verify-payment
router.post('/verify-payment', (req, res) => {
  req.session.cart = [];
  res.json({ success: true, message: 'Payment recorded successfully!' });
});

module.exports = router;
