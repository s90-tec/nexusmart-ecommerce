const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Protect all admin endpoints
router.use(authenticateToken, requireAdmin);

// 1. Get Executive Analytics Dashboard
router.get('/analytics', (req, res) => {
  try {
    const totalRevenueRow = db.prepare("SELECT SUM(total) as revenue FROM orders WHERE status != 'Cancelled'").get();
    const totalRevenue = totalRevenueRow ? (totalRevenueRow.revenue || 0) : 0;

    const totalOrders = db.prepare('SELECT COUNT(*) as count FROM orders').get().count;
    const totalCustomers = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'customer'").get().count;
    const totalProducts = db.prepare('SELECT COUNT(*) as count FROM products').get().count;
    const lowStockCount = db.prepare('SELECT COUNT(*) as count FROM products WHERE stock <= 10').get().count;

    // Status breakdown
    const orderStatusCounts = db.prepare(`
      SELECT status, COUNT(*) as count 
      FROM orders 
      GROUP BY status
    `).all();

    // Category distribution
    const categoryStats = db.prepare(`
      SELECT category, COUNT(*) as count, SUM(stock) as total_stock 
      FROM products 
      GROUP BY category
    `).all();

    // Low stock items
    const lowStockItems = db.prepare(`
      SELECT id, title, category, stock, price, image 
      FROM products 
      WHERE stock <= 15 
      ORDER BY stock ASC 
      LIMIT 6
    `).all();

    // Recent orders
    const recentOrders = db.prepare(`
      SELECT id, order_number, customer_name, customer_email, total, status, payment_status, created_at 
      FROM orders 
      ORDER BY created_at DESC 
      LIMIT 8
    `).all();

    // Monthly / Sales distribution mock data points for UI chart
    const salesTimeline = [
      { month: 'Mar', sales: 4200, orders: 28 },
      { month: 'Apr', sales: 6100, orders: 41 },
      { month: 'May', sales: 5800, orders: 39 },
      { month: 'Jun', sales: 8400, orders: 54 },
      { month: 'Jul', sales: 11200, orders: 72 },
      { month: 'Aug', sales: Math.round(totalRevenue), orders: totalOrders }
    ];

    res.json({
      metrics: {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalOrders,
        totalCustomers,
        totalProducts,
        lowStockCount
      },
      orderStatusCounts,
      categoryStats,
      lowStockItems,
      recentOrders,
      salesTimeline
    });
  } catch (error) {
    console.error('Admin analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics metrics.' });
  }
});

// 2. Admin: List all products for management table
router.get('/products', (req, res) => {
  try {
    const { search, category } = req.query;
    let query = 'SELECT * FROM products WHERE 1=1';
    const params = [];

    if (search && search.trim()) {
      const s = `%${search.trim()}%`;
      query += ' AND (title LIKE ? OR brand LIKE ? OR category LIKE ?)';
      params.push(s, s, s);
    }

    if (category && category !== 'All') {
      query += ' AND category = ?';
      params.push(category);
    }

    query += ' ORDER BY id DESC';
    const products = db.prepare(query).all(...params);

    const formatted = products.map(p => ({
      ...p,
      gallery: p.gallery ? JSON.parse(p.gallery) : [p.image],
      features: p.features ? JSON.parse(p.features) : [],
      tags: p.tags ? JSON.parse(p.tags) : []
    }));

    res.json({ products: formatted });
  } catch (error) {
    console.error('Admin products error:', error);
    res.status(500).json({ error: 'Failed to fetch inventory products.' });
  }
});

// 3. Admin: Create product
router.post('/products', (req, res) => {
  try {
    const {
      title,
      description,
      price,
      original_price,
      discount_percent,
      category,
      brand,
      stock = 10,
      image,
      gallery,
      features,
      tags,
      is_featured = 0
    } = req.body;

    if (!title || !description || !price || !category || !image) {
      return res.status(400).json({ error: 'Title, description, price, category, and image URL are required.' });
    }

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const galleryJson = Array.isArray(gallery) ? JSON.stringify(gallery) : JSON.stringify([image]);
    const featuresJson = Array.isArray(features) ? JSON.stringify(features) : JSON.stringify(features ? features.split('\n').filter(Boolean) : []);
    const tagsJson = Array.isArray(tags) ? JSON.stringify(tags) : JSON.stringify(tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [category]);

    const numPrice = parseFloat(price);
    const numOrig = original_price ? parseFloat(original_price) : numPrice;
    const numDiscount = discount_percent ? parseInt(discount_percent) : (numOrig > numPrice ? Math.round(((numOrig - numPrice) / numOrig) * 100) : 0);

    const insert = db.prepare(`
      INSERT INTO products (
        title, slug, description, price, original_price, discount_percent,
        category, brand, stock, image, gallery, features, tags, is_featured
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = insert.run(
      title.trim(),
      slug,
      description.trim(),
      numPrice,
      numOrig,
      numDiscount,
      category.trim(),
      brand ? brand.trim() : 'Nexus Brand',
      parseInt(stock) || 0,
      image.trim(),
      galleryJson,
      featuresJson,
      tagsJson,
      is_featured ? 1 : 0
    );

    const newProduct = db.prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json({
      message: 'Product created successfully!',
      product: {
        ...newProduct,
        gallery: JSON.parse(newProduct.gallery || '[]'),
        features: JSON.parse(newProduct.features || '[]'),
        tags: JSON.parse(newProduct.tags || '[]')
      }
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Failed to create product. ' + error.message });
  }
});

// 4. Admin: Update product
router.put('/products/:id', (req, res) => {
  try {
    const productId = req.params.id;
    const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(productId);
    if (!existing) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    const {
      title,
      description,
      price,
      original_price,
      discount_percent,
      category,
      brand,
      stock,
      image,
      gallery,
      features,
      tags,
      is_featured
    } = req.body;

    const numPrice = price !== undefined ? parseFloat(price) : existing.price;
    const numOrig = original_price !== undefined ? parseFloat(original_price) : existing.original_price;
    const numDiscount = discount_percent !== undefined ? parseInt(discount_percent) : existing.discount_percent;

    const galleryJson = gallery !== undefined ? (Array.isArray(gallery) ? JSON.stringify(gallery) : gallery) : existing.gallery;
    const featuresJson = features !== undefined ? (Array.isArray(features) ? JSON.stringify(features) : JSON.stringify(typeof features === 'string' ? features.split('\n').filter(Boolean) : [])) : existing.features;
    const tagsJson = tags !== undefined ? (Array.isArray(tags) ? JSON.stringify(tags) : JSON.stringify(typeof tags === 'string' ? tags.split(',').map(t => t.trim()).filter(Boolean) : [])) : existing.tags;

    db.prepare(`
      UPDATE products SET
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        price = ?,
        original_price = ?,
        discount_percent = ?,
        category = COALESCE(?, category),
        brand = COALESCE(?, brand),
        stock = COALESCE(?, stock),
        image = COALESCE(?, image),
        gallery = ?,
        features = ?,
        tags = ?,
        is_featured = COALESCE(?, is_featured)
      WHERE id = ?
    `).run(
      title,
      description,
      numPrice,
      numOrig,
      numDiscount,
      category,
      brand,
      stock !== undefined ? parseInt(stock) : existing.stock,
      image,
      galleryJson,
      featuresJson,
      tagsJson,
      is_featured !== undefined ? (is_featured ? 1 : 0) : existing.is_featured,
      productId
    );

    const updated = db.prepare('SELECT * FROM products WHERE id = ?').get(productId);

    res.json({
      message: 'Product updated successfully!',
      product: {
        ...updated,
        gallery: JSON.parse(updated.gallery || '[]'),
        features: JSON.parse(updated.features || '[]'),
        tags: JSON.parse(updated.tags || '[]')
      }
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Failed to update product.' });
  }
});

// 5. Admin: Quick Stock Update
router.patch('/products/:id/stock', (req, res) => {
  try {
    const { stock } = req.body;
    if (stock === undefined || isNaN(stock)) {
      return res.status(400).json({ error: 'Valid stock number is required.' });
    }

    db.prepare('UPDATE products SET stock = ? WHERE id = ?').run(Math.max(0, parseInt(stock)), req.params.id);
    res.json({ message: 'Stock updated successfully!', stock: Math.max(0, parseInt(stock)) });
  } catch (error) {
    console.error('Update stock error:', error);
    res.status(500).json({ error: 'Failed to update stock.' });
  }
});

// 6. Admin: Delete Product
router.delete('/products/:id', (req, res) => {
  try {
    const productId = req.params.id;
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    db.prepare('DELETE FROM products WHERE id = ?').run(productId);
    res.json({ message: `Product "${product.title}" has been deleted.` });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Failed to delete product.' });
  }
});

// 7. Admin: List all orders with filters
router.get('/orders', (req, res) => {
  try {
    const { status, search } = req.query;
    let query = 'SELECT * FROM orders WHERE 1=1';
    const params = [];

    if (status && status !== 'All') {
      query += ' AND status = ?';
      params.push(status);
    }

    if (search && search.trim()) {
      const s = `%${search.trim()}%`;
      query += ' AND (order_number LIKE ? OR customer_name LIKE ? OR customer_email LIKE ? OR tracking_code LIKE ?)';
      params.push(s, s, s, s);
    }

    query += ' ORDER BY created_at DESC';
    const orders = db.prepare(query).all(...params);

    const getItems = db.prepare('SELECT * FROM order_items WHERE order_id = ?');
    const getTimeline = db.prepare('SELECT * FROM order_timeline WHERE order_id = ? ORDER BY id ASC');

    const fullOrders = orders.map(o => ({
      ...o,
      items: getItems.all(o.id),
      timeline: getTimeline.all(o.id)
    }));

    res.json({ orders: fullOrders });
  } catch (error) {
    console.error('Admin orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders.' });
  }
});

// 8. Admin: Update order fulfillment status & timeline
router.patch('/orders/:id/status', (req, res) => {
  try {
    const orderId = req.params.id;
    const { status, note, location, trackingCarrier, trackingCode } = req.body;

    const validStatuses = ['Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    const updateOrderTx = db.transaction(() => {
      // Update order header
      db.prepare(`
        UPDATE orders 
        SET status = ?, 
            tracking_carrier = COALESCE(?, tracking_carrier),
            tracking_code = COALESCE(?, tracking_code),
            updated_at = datetime('now')
        WHERE id = ?
      `).run(status, trackingCarrier || null, trackingCode || null, orderId);

      // Add timeline checkpoint
      let title = `Status Updated: ${status}`;
      let description = note || `Order status updated to ${status} by fulfillment administrator.`;
      let loc = location || 'Nexus Regional Logistics Center';

      if (status === 'Shipped') {
        title = 'Shipped with Courier';
        description = note || `Package dispatched via ${trackingCarrier || order.tracking_carrier || 'Nexus Express'}.`;
      } else if (status === 'Out for Delivery') {
        title = 'Out for Delivery';
        description = note || 'Driver has departed distribution facility for recipient address.';
      } else if (status === 'Delivered') {
        title = 'Delivered to Customer';
        description = note || 'Package successfully delivered and confirmed.';
      } else if (status === 'Cancelled') {
        title = 'Order Cancelled';
        description = note || 'Order has been cancelled by administration.';
      }

      // Mark matching step in order_timeline as completed, or insert new milestone
      const existingStep = db.prepare('SELECT id FROM order_timeline WHERE order_id = ? AND status = ?').get(orderId, status);
      if (existingStep) {
        db.prepare(`
          UPDATE order_timeline 
          SET is_completed = 1, description = ?, location = ?, timestamp = datetime('now')
          WHERE id = ?
        `).run(description, loc, existingStep.id);
      } else {
        db.prepare(`
          INSERT INTO order_timeline (order_id, status, title, description, location, timestamp, is_completed)
          VALUES (?, ?, ?, ?, ?, datetime('now'), 1)
        `).run(orderId, status, title, description, loc);
      }

      // If Delivered, mark all prior steps completed
      if (status === 'Delivered') {
        db.prepare('UPDATE order_timeline SET is_completed = 1 WHERE order_id = ?').run(orderId);
      }
    });

    updateOrderTx();

    const updatedOrder = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
    const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(orderId);
    const timeline = db.prepare('SELECT * FROM order_timeline WHERE order_id = ? ORDER BY id ASC').all(orderId);

    res.json({
      message: `Order #${updatedOrder.order_number} status updated to ${status}`,
      order: {
        ...updatedOrder,
        items,
        timeline
      }
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Failed to update order status.' });
  }
});

// 9. Admin: List registered users
router.get('/users', (req, res) => {
  try {
    const users = db.prepare(`
      SELECT 
        u.id, u.name, u.email, u.role, u.avatar, u.phone, u.created_at,
        COUNT(o.id) as order_count,
        COALESCE(SUM(o.total), 0) as total_spend
      FROM users u
      LEFT JOIN orders o ON u.id = o.user_id AND o.status != 'Cancelled'
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `).all();

    res.json({ users });
  } catch (error) {
    console.error('Admin users error:', error);
    res.status(500).json({ error: 'Failed to fetch users.' });
  }
});

module.exports = router;
