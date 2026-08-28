const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5050;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/coupons', require('./routes/coupons'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'NexusMart E-Commerce Core API',
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

// Serve static frontend build if present
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

// SPA fallback without triggering path-to-regexp asterisk error
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api/')) {
    const indexHtml = path.join(distPath, 'index.html');
    if (fs.existsSync(indexHtml)) {
      return res.sendFile(indexHtml);
    }
  }
  next();
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ error: 'An internal server error occurred.' });
});

// Start Server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 NexusMart API Server is running on http://localhost:${PORT}`);
  console.log(`📦 Database: SQLite (WAL Enabled) at data/nexusmart.db`);
});

// Event loop keepalive
const keepAlive = setInterval(() => {}, 1000 * 60 * 60);

process.on('SIGTERM', () => {
  clearInterval(keepAlive);
  server.close(() => process.exit(0));
});

process.on('SIGINT', () => {
  clearInterval(keepAlive);
  server.close(() => process.exit(0));
});
