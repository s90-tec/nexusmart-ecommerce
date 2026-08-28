const express = require('express');
const router = express.Router();
const db = require('../db/database');

// Validate coupon code
router.post('/validate', (req, res) => {
  try {
    const { code, subtotal = 0 } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Please provide a coupon code.' });
    }

    const coupon = db.prepare('SELECT * FROM coupons WHERE code = ? AND is_active = 1').get(code.toUpperCase().trim());

    if (!coupon) {
      return res.status(404).json({ error: `Promo code "${code}" is invalid or expired.` });
    }

    const numSubtotal = parseFloat(subtotal) || 0;
    if (numSubtotal < coupon.min_purchase) {
      return res.status(400).json({
        error: `Coupon "${coupon.code}" requires a minimum subtotal of $${coupon.min_purchase.toFixed(2)}. (Current: $${numSubtotal.toFixed(2)})`
      });
    }

    let discount = 0;
    if (coupon.discount_type === 'percentage') {
      discount = (numSubtotal * coupon.discount_value) / 100;
      if (coupon.max_discount && discount > coupon.max_discount) {
        discount = coupon.max_discount;
      }
    } else if (coupon.discount_type === 'fixed') {
      discount = Math.min(numSubtotal, coupon.discount_value);
    } else if (coupon.discount_type === 'shipping') {
      discount = coupon.discount_value;
    }

    discount = Math.round(discount * 100) / 100;

    res.json({
      valid: true,
      code: coupon.code,
      discountType: coupon.discount_type,
      discountValue: coupon.discount_value,
      discountAmount: discount,
      description: coupon.description
    });
  } catch (error) {
    console.error('Validate coupon error:', error);
    res.status(500).json({ error: 'Failed to validate coupon code.' });
  }
});

// List public active promotional deals
router.get('/featured', (req, res) => {
  try {
    const coupons = db.prepare('SELECT code, discount_type, discount_value, min_purchase, description FROM coupons WHERE is_active = 1 LIMIT 4').all();
    res.json({ coupons });
  } catch (error) {
    console.error('Get coupons error:', error);
    res.status(500).json({ error: 'Failed to fetch coupons.' });
  }
});

module.exports = router;
