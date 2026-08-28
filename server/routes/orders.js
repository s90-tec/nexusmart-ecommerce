const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

// Create new order (Checkout)
router.post('/', optionalAuth, (req, res) => {
  try {
    const {
      items,
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      shippingCity,
      shippingState,
      shippingZip,
      shippingCountry = 'USA',
      shippingMethod = 'Standard',
      paymentMethod = 'Credit Card',
      couponCode,
      notes
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty. Please add items before checking out.' });
    }

    if (!customerName || !customerEmail || !shippingAddress || !shippingCity || !shippingZip) {
      return res.status(400).json({ error: 'Shipping name, email, street address, city, and ZIP are required.' });
    }

    // 1. Verify stock and calculate subtotal
    let subtotal = 0;
    const verifiedItems = [];

    const getProduct = db.prepare('SELECT id, title, price, stock, image FROM products WHERE id = ?');

    for (const item of items) {
      const product = getProduct.get(item.productId || item.id);
      if (!product) {
        return res.status(400).json({ error: `Product ID ${item.id} not found.` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          error: `Insufficient stock for "${product.title}". Only ${product.stock} left in stock.`
        });
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      verifiedItems.push({
        productId: product.id,
        title: product.title,
        price: product.price,
        quantity: item.quantity,
        image: product.image,
        total: itemTotal
      });
    }

    // 2. Validate Coupon & Discount
    let discount = 0;
    let validCouponCode = null;

    if (couponCode) {
      const coupon = db.prepare('SELECT * FROM coupons WHERE code = ? AND is_active = 1').get(couponCode.toUpperCase().trim());
      if (coupon && subtotal >= coupon.min_purchase) {
        validCouponCode = coupon.code;
        if (coupon.discount_type === 'percentage') {
          discount = (subtotal * coupon.discount_value) / 100;
          if (coupon.max_discount && discount > coupon.max_discount) {
            discount = coupon.max_discount;
          }
        } else if (coupon.discount_type === 'fixed') {
          discount = coupon.discount_value;
        } else if (coupon.discount_type === 'shipping') {
          discount = coupon.discount_value;
        }
      }
    }

    // 3. Shipping fee calculation
    let shippingFee = 0;
    if (shippingMethod === 'Express') {
      shippingFee = 14.99;
    } else if (shippingMethod === 'Priority Overnight') {
      shippingFee = 24.99;
    } else {
      // Standard: Free over $99, otherwise $8.99
      shippingFee = (subtotal - discount) >= 99 ? 0 : 8.99;
    }

    if (couponCode === 'FREESHIP' && validCouponCode) {
      shippingFee = 0;
    }

    // 4. Tax (standard 7%)
    const taxableAmount = Math.max(0, subtotal - discount);
    const tax = Math.round(taxableAmount * 0.07 * 100) / 100;
    const finalTotal = Math.round((taxableAmount + tax + shippingFee) * 100) / 100;

    // 5. Generate Order Number & Tracking Number
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const orderNumber = `NEX-${randomSuffix}`;
    const trackingCode = `NX-TRK-${Math.floor(10000000 + Math.random() * 90000000)}`;

    const deliveryDays = shippingMethod === 'Priority Overnight' ? 1 : shippingMethod === 'Express' ? 2 : 4;
    const estDate = new Date();
    estDate.setDate(estDate.getDate() + deliveryDays);
    const estimatedDelivery = estDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    // 6. DB Transaction for Atomic Order Creation
    const userId = req.user ? req.user.id : null;

    const createOrderTx = db.transaction(() => {
      const orderRes = db.prepare(`
        INSERT INTO orders (
          order_number, user_id, customer_name, customer_email, customer_phone,
          shipping_address, shipping_city, shipping_state, shipping_zip, shipping_country,
          shipping_method, payment_method, payment_status, status,
          subtotal, discount, coupon_code, tax, shipping_fee, total,
          tracking_carrier, tracking_code, estimated_delivery, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Paid', 'Processing', ?, ?, ?, ?, ?, ?, 'Nexus Express', ?, ?, ?)
      `).run(
        orderNumber, userId, customerName.trim(), customerEmail.toLowerCase().trim(), customerPhone || '',
        shippingAddress.trim(), shippingCity.trim(), shippingState || '', shippingZip.trim(), shippingCountry,
        shippingMethod, paymentMethod,
        subtotal, discount, validCouponCode, tax, shippingFee, finalTotal,
        trackingCode, estimatedDelivery, notes || ''
      );

      const orderId = orderRes.lastInsertRowid;

      // Insert order items & decrement stock
      const insertItem = db.prepare(`
        INSERT INTO order_items (order_id, product_id, title, price, quantity, image, total)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      const updateStock = db.prepare('UPDATE products SET stock = stock - ? WHERE id = ?');

      for (const item of verifiedItems) {
        insertItem.run(orderId, item.productId, item.title, item.price, item.quantity, item.image, item.total);
        updateStock.run(item.quantity, item.productId);
      }

      // Insert Initial Timeline Milestones
      const insertTimeline = db.prepare(`
        INSERT INTO order_timeline (order_id, status, title, description, location, timestamp, is_completed)
        VALUES (?, ?, ?, ?, ?, datetime('now'), ?)
      `);

      insertTimeline.run(orderId, 'Ordered', 'Order Confirmed', `Order placed and payment authorized via ${paymentMethod}.`, 'Nexus Order Routing Center', 1);
      insertTimeline.run(orderId, 'Processing', 'Order In Fulfillment', 'Items currently scheduled for picking and custom packing.', 'Nexus Logistics Hub', 1);
      insertTimeline.run(orderId, 'Shipped', 'Handover to Courier', 'Package prepared with shipping label and awaiting carrier pickup.', 'Sorting Facility', 0);
      insertTimeline.run(orderId, 'Out for Delivery', 'Local Courier Route', 'Driver assigned for final delivery route.', `${shippingCity}, ${shippingState}`, 0);
      insertTimeline.run(orderId, 'Delivered', 'Package Arrival', 'Delivery to destination address.', `${shippingAddress}, ${shippingCity}`, 0);

      return orderId;
    });

    const newOrderId = createOrderTx();

    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(newOrderId);
    const orderItems = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(newOrderId);
    const timeline = db.prepare('SELECT * FROM order_timeline WHERE order_id = ? ORDER BY id ASC').all(newOrderId);

    res.status(201).json({
      message: 'Order placed successfully!',
      order: {
        ...order,
        items: orderItems,
        timeline
      }
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Failed to process order. ' + error.message });
  }
});

// Get customer's orders
router.get('/my-orders', authenticateToken, (req, res) => {
  try {
    const orders = db.prepare(`
      SELECT * FROM orders 
      WHERE user_id = ? OR customer_email = ?
      ORDER BY created_at DESC
    `).all(req.user.id, req.user.email);

    const getItems = db.prepare('SELECT * FROM order_items WHERE order_id = ?');

    const detailedOrders = orders.map(order => ({
      ...order,
      items: getItems.all(order.id)
    }));

    res.json({ orders: detailedOrders });
  } catch (error) {
    console.error('Fetch my orders error:', error);
    res.status(500).json({ error: 'Failed to fetch order history.' });
  }
});

// Track order by ID or Order Number
router.get('/track/:query', (req, res) => {
  try {
    const { query } = req.params;
    let order = db.prepare('SELECT * FROM orders WHERE order_number = ? OR id = ? OR tracking_code = ?').get(query, query, query);

    if (!order) {
      return res.status(404).json({ error: `Order or tracking ID "${query}" not found.` });
    }

    const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
    const timeline = db.prepare('SELECT * FROM order_timeline WHERE order_id = ? ORDER BY id ASC').all(order.id);

    res.json({
      order: {
        ...order,
        items,
        timeline
      }
    });
  } catch (error) {
    console.error('Track order error:', error);
    res.status(500).json({ error: 'Failed to retrieve tracking details.' });
  }
});

// Cancel Order
router.post('/:id/cancel', authenticateToken, (req, res) => {
  try {
    const orderId = req.params.id;
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);

    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    // Security check: only order owner or admin can cancel
    if (order.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'You are not authorized to cancel this order.' });
    }

    if (order.status === 'Delivered' || order.status === 'Cancelled') {
      return res.status(400).json({ error: `Cannot cancel an order that is already ${order.status.toLowerCase()}.` });
    }

    if (order.status === 'Shipped' || order.status === 'Out for Delivery') {
      return res.status(400).json({ error: 'Order has already shipped and cannot be automatically cancelled. Please initiate a return upon delivery.' });
    }

    // Cancel order & restore inventory stock
    const cancelTx = db.transaction(() => {
      db.prepare("UPDATE orders SET status = 'Cancelled', updated_at = datetime('now') WHERE id = ?").run(orderId);

      const items = db.prepare('SELECT product_id, quantity FROM order_items WHERE order_id = ?').all(orderId);
      const restoreStock = db.prepare('UPDATE products SET stock = stock + ? WHERE id = ?');

      for (const item of items) {
        if (item.product_id) {
          restoreStock.run(item.quantity, item.product_id);
        }
      }

      db.prepare(`
        INSERT INTO order_timeline (order_id, status, title, description, location, timestamp, is_completed)
        VALUES (?, 'Cancelled', 'Order Cancelled', 'Customer requested cancellation before shipment. Refund initialized.', 'Customer Portal', datetime('now'), 1)
      `).run(orderId);
    });

    cancelTx();

    const updatedOrder = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
    const timeline = db.prepare('SELECT * FROM order_timeline WHERE order_id = ? ORDER BY id ASC').all(orderId);

    res.json({
      message: 'Order cancelled successfully. Refund initialized to original payment method.',
      order: {
        ...updatedOrder,
        timeline
      }
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ error: 'Failed to cancel order.' });
  }
});

module.exports = router;
