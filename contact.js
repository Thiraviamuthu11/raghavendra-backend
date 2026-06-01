const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

// POST /api/contact
router.post('/', async (req, res) => {
  const { fname, lname, phone, email, service, message } = req.body;

  if (!fname || !phone) {
    return res.status(400).json({ success: false, message: 'Name and phone number are required' });
  }

  // Basic phone validation (Indian numbers)
  const phoneRegex = /^[6-9]\d{9}$/;
  if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
    return res.status(400).json({ success: false, message: 'Enter a valid 10-digit Indian phone number' });
  }

  // Log the enquiry (in production, save to DB)
  const enquiry = {
    name: `${fname} ${lname || ''}`.trim(),
    phone,
    email: email || null,
    service: service || 'General Enquiry',
    message: message || '',
    submittedAt: new Date().toISOString(),
  };

  console.log('[Contact Enquiry]', enquiry);

  // Send email notification if SMTP is configured
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: `"Website Enquiry" <${process.env.SMTP_USER}>`,
        to: process.env.OWNER_EMAIL || process.env.SMTP_USER,
        subject: `New Enquiry from ${enquiry.name} — Raghavendra Automobiles`,
        html: `
          <h2>New Customer Enquiry</h2>
          <table cellpadding="8" style="border-collapse:collapse;">
            <tr><td><strong>Name</strong></td><td>${enquiry.name}</td></tr>
            <tr><td><strong>Phone</strong></td><td>${enquiry.phone}</td></tr>
            <tr><td><strong>Email</strong></td><td>${enquiry.email || '—'}</td></tr>
            <tr><td><strong>Service</strong></td><td>${enquiry.service}</td></tr>
            <tr><td><strong>Message</strong></td><td>${enquiry.message || '—'}</td></tr>
            <tr><td><strong>Time</strong></td><td>${new Date(enquiry.submittedAt).toLocaleString('en-IN')}</td></tr>
          </table>
        `,
      });
    } catch (err) {
      console.error('[Email Error]', err.message);
      // Still return success — email failure shouldn't block the user
    }
  }

  res.json({ success: true, message: 'Your enquiry has been received. We will contact you shortly!' });
});

module.exports = router;
