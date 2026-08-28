const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

// Get all products with search, filtering, sorting, and pagination
router.get('/', (req, res) => {
  try {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      minRating,
      inStockOnly,
      featuredOnly,
      sortBy = 'featured',
      page = 1,
      limit = 12
    } = req.query;

    let query = 'SELECT * FROM products WHERE 1=1';
    let countQuery = 'SELECT COUNT(*) as count FROM products WHERE 1=1';
    const params = [];
    const countParams = [];

    if (search && search.trim() !== '') {
      const searchTerm = `%${search.trim()}%`;
      query += ' AND (title LIKE ? OR brand LIKE ? OR description LIKE ? OR tags LIKE ?)';
      countQuery += ' AND (title LIKE ? OR brand LIKE ? OR description LIKE ? OR tags LIKE ?)';
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
      countParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (category && category !== 'All' && category !== '') {
      query += ' AND category = ?';
      countQuery += ' AND category = ?';
      params.push(category);
      countParams.push(category);
    }

    if (minPrice !== undefined && minPrice !== '') {
      query += ' AND price >= ?';
      countQuery += ' AND price >= ?';
      params.push(parseFloat(minPrice));
      countParams.push(parseFloat(minPrice));
    }

    if (maxPrice !== undefined && maxPrice !== '') {
      query += ' AND price <= ?';
      countQuery += ' AND price <= ?';
      params.push(parseFloat(maxPrice));
      countParams.push(parseFloat(maxPrice));
    }

    if (minRating !== undefined && minRating !== '') {
      query += ' AND rating >= ?';
      countQuery += ' AND rating >= ?';
      params.push(parseFloat(minRating));
      countParams.push(parseFloat(minRating));
    }

    if (inStockOnly === 'true' || inStockOnly === true) {
      query += ' AND stock > 0';
      countQuery += ' AND stock > 0';
    }

    if (featuredOnly === 'true' || featuredOnly === true) {
      query += ' AND is_featured = 1';
      countQuery += ' AND is_featured = 1';
    }

    // Sort order
    switch (sortBy) {
      case 'price_asc':
        query += ' ORDER BY price ASC';
        break;
      case 'price_desc':
        query += ' ORDER BY price DESC';
        break;
      case 'rating':
        query += ' ORDER BY rating DESC, review_count DESC';
        break;
      case 'newest':
        query += ' ORDER BY created_at DESC';
        break;
      case 'discount':
        query += ' ORDER BY discount_percent DESC';
        break;
      case 'featured':
      default:
        query += ' ORDER BY is_featured DESC, rating DESC, id DESC';
        break;
    }

    // Pagination
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, parseInt(limit) || 12);
    const offset = (pageNum - 1) * limitNum;

    query += ' LIMIT ? OFFSET ?';
    params.push(limitNum, offset);

    const totalCount = db.prepare(countQuery).get(...countParams).count;
    const products = db.prepare(query).all(...params);

    const formattedProducts = products.map(p => ({
      ...p,
      gallery: p.gallery ? JSON.parse(p.gallery) : [p.image],
      features: p.features ? JSON.parse(p.features) : [],
      tags: p.tags ? JSON.parse(p.tags) : []
    }));

    res.json({
      products: formattedProducts,
      pagination: {
        total: totalCount,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalCount / limitNum)
      }
    });
  } catch (error) {
    console.error('Fetch products error:', error);
    res.status(500).json({ error: 'Failed to fetch products.' });
  }
});

// Get distinct categories with counts
router.get('/categories', (req, res) => {
  try {
    const categories = db.prepare(`
      SELECT category, COUNT(*) as count, MIN(image) as thumbnail
      FROM products
      GROUP BY category
      ORDER BY count DESC
    `).all();

    const totalProducts = db.prepare('SELECT COUNT(*) as total FROM products').get().total;

    res.json({
      categories: [
        { category: 'All', count: totalProducts },
        ...categories
      ]
    });
  } catch (error) {
    console.error('Fetch categories error:', error);
    res.status(500).json({ error: 'Failed to fetch categories.' });
  }
});

// Get featured spotlight products
router.get('/featured', (req, res) => {
  try {
    const products = db.prepare(`
      SELECT * FROM products 
      WHERE is_featured = 1 
      ORDER BY rating DESC 
      LIMIT 6
    `).all();

    const formatted = products.map(p => ({
      ...p,
      gallery: p.gallery ? JSON.parse(p.gallery) : [p.image],
      features: p.features ? JSON.parse(p.features) : [],
      tags: p.tags ? JSON.parse(p.tags) : []
    }));

    res.json({ products: formatted });
  } catch (error) {
    console.error('Fetch featured error:', error);
    res.status(500).json({ error: 'Failed to fetch featured products.' });
  }
});

// Get single product details + reviews
router.get('/:id', (req, res) => {
  try {
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    const reviews = db.prepare(`
      SELECT r.*, u.avatar 
      FROM reviews r
      LEFT JOIN users u ON r.user_id = u.id
      WHERE r.product_id = ?
      ORDER BY r.created_at DESC
    `).all(product.id);

    // Also fetch 4 related products in same category
    const related = db.prepare(`
      SELECT id, title, price, original_price, discount_percent, rating, review_count, image, category, brand, stock
      FROM products
      WHERE category = ? AND id != ?
      ORDER BY rating DESC
      LIMIT 4
    `).all(product.category, product.id);

    res.json({
      product: {
        ...product,
        gallery: product.gallery ? JSON.parse(product.gallery) : [product.image],
        features: product.features ? JSON.parse(product.features) : [],
        tags: product.tags ? JSON.parse(product.tags) : []
      },
      reviews,
      related
    });
  } catch (error) {
    console.error('Fetch single product error:', error);
    res.status(500).json({ error: 'Failed to fetch product details.' });
  }
});

// Add customer review
router.post('/:id/reviews', authenticateToken, (req, res) => {
  try {
    const productId = req.params.id;
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be an integer between 1 and 5.' });
    }

    if (!comment || comment.trim().length < 4) {
      return res.status(400).json({ error: 'Please provide a helpful review comment.' });
    }

    const product = db.prepare('SELECT id, rating, review_count FROM products WHERE id = ?').get(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    const insert = db.prepare(`
      INSERT INTO reviews (product_id, user_id, user_name, rating, comment)
      VALUES (?, ?, ?, ?, ?)
    `);

    insert.run(productId, req.user.id, req.user.name, parseInt(rating), comment.trim());

    // Recalculate average rating & review count
    const stats = db.prepare(`
      SELECT AVG(rating) as avgRating, COUNT(*) as count 
      FROM reviews 
      WHERE product_id = ?
    `).get(productId);

    const newAvg = Math.round(stats.avgRating * 10) / 10;
    const newCount = stats.count;

    db.prepare('UPDATE products SET rating = ?, review_count = ? WHERE id = ?').run(newAvg, newCount, productId);

    const updatedReviews = db.prepare(`
      SELECT r.*, u.avatar 
      FROM reviews r
      LEFT JOIN users u ON r.user_id = u.id
      WHERE r.product_id = ?
      ORDER BY r.created_at DESC
    `).all(productId);

    res.status(201).json({
      message: 'Review posted successfully!',
      reviews: updatedReviews,
      rating: newAvg,
      review_count: newCount
    });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({ error: 'Failed to submit review.' });
  }
});

module.exports = router;
