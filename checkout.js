const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');

// POST /api/checkout/create-order
// Creates a Razorpay order for the current cart
router.post('/create-order', async (req, res) => {
  const cart = req.session.cart;
  if (!cart || cart.length === 0) {
    return res.status(400).json({ success: false, message: 'Cart is empty' });
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const amountInPaise = total * 100; // Razorpay uses paise

  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    // Razorpay not configured — return a mock order for development
    return res.json({
      success: true,
      mock: true,
      message: 'Razorpay not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env',
      data: {
        orderId: 'mock_order_' + Date.now(),
        amount: amountInPaise,
        currency: 'INR',
        items: cart,
        total,
      },
    });
  }

  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

  const order = await razorpay.orders.create({
    amount: amountInPaise,
    currency: 'INR',
    receipt: 'rcpt_' + Date.now(),
    notes: {
      items: cart.map((i) => `${i.name} x${i.qty}`).join(', '),
    },
  });

  res.json({
    success: true,
    data: {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    },
  });
});

// POST /api/checkout/verify-payment
// Verify Razorpay payment signature after frontend completes payment
router.post('/verify-payment', (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!process.env.RAZORPAY_KEY_SECRET) {
    return res.status(400).json({ success: false, message: 'Razorpay not configured' });
  }

  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
    return res.status(400).json({ success: false, message: 'Payment verification failed' });
  }

  // Clear cart on successful payment
  req.session.cart = [];

  res.json({
    success: true,
    message: 'Payment verified successfully!',
    data: { orderId: razorpay_order_id, paymentId: razorpay_payment_id },
  });
});

module.exports = router;
