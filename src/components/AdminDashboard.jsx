import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Truck,
  Search,
  Filter,
  Save,
  X,
  ExternalLink,
  ChevronRight,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';

export default function AdminDashboard({ onInspectOrder }) {
  const { user } = useAuth();
  const { showToast } = useCart();

  const [activeTab, setActiveTab] = useState('analytics');
  const [loading, setLoading] = useState(true);

  // Analytics Data
  const [analytics, setAnalytics] = useState(null);

  // Products Data
  const [products, setProducts] = useState([]);
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('All');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    title: '',
    category: 'Electronics & Audio',
    brand: '',
    price: '',
    original_price: '',
    stock: '15',
    image: '',
    description: '',
    features: '',
    is_featured: false
  });

  // Orders Data
  const [orders, setOrders] = useState([]);
  const [orderStatusFilter, setOrderStatusFilter] = useState('All');
  const [orderSearch, setOrderSearch] = useState('');
  const [selectedOrderForStatus, setSelectedOrderForStatus] = useState(null);
  const [statusUpdateForm, setStatusUpdateForm] = useState({
    status: 'Shipped',
    note: '',
    trackingCarrier: 'Nexus Express Priority',
    trackingCode: ''
  });

  // Users Data
  const [usersList, setUsersList] = useState([]);

  // Fetch functions with Auth Token
  const token = localStorage.getItem('nexusmart_token');
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  };

  const loadAnalytics = async () => {
    try {
      const res = await fetch('/api/admin/analytics', { headers });
      const data = await res.json();
      if (res.ok) setAnalytics(data);
    } catch (err) {
      console.error('Failed to load admin analytics:', err);
    }
  };

  const loadProducts = async () => {
    try {
      const res = await fetch(`/api/admin/products?search=${encodeURIComponent(productSearch)}&category=${encodeURIComponent(productCategoryFilter)}`, { headers });
      const data = await res.json();
      if (res.ok) setProducts(data.products || []);
    } catch (err) {
      console.error('Failed to load admin products:', err);
    }
  };

  const loadOrders = async () => {
    try {
      const res = await fetch(`/api/admin/orders?status=${encodeURIComponent(orderStatusFilter)}&search=${encodeURIComponent(orderSearch)}`, { headers });
      const data = await res.json();
      if (res.ok) setOrders(data.orders || []);
    } catch (err) {
      console.error('Failed to load admin orders:', err);
    }
  };

  const loadUsers = async () => {
    try {
      const res = await fetch('/api/admin/users', { headers });
      const data = await res.json();
      if (res.ok) setUsersList(data.users || []);
    } catch (err) {
      console.error('Failed to load admin users:', err);
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([loadAnalytics(), loadProducts(), loadOrders(), loadUsers()])
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (activeTab === 'products') loadProducts();
  }, [productSearch, productCategoryFilter, activeTab]);

  useEffect(() => {
    if (activeTab === 'orders') loadOrders();
  }, [orderStatusFilter, orderSearch, activeTab]);

  // Product Save Handler (Create / Update)
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!productForm.title || !productForm.price || !productForm.image || !productForm.category) {
      showToast('Please fill all required product fields.', 'warning');
      return;
    }

    try {
      const url = editingProduct ? `/api/admin/products/${editingProduct.id}` : '/api/admin/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify({
          ...productForm,
          features: productForm.features ? productForm.features.split('\n').filter(Boolean) : []
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save product');

      showToast(editingProduct ? 'Product updated successfully!' : 'Product added to inventory!', 'success');
      setIsProductModalOpen(false);
      setEditingProduct(null);
      loadProducts();
      loadAnalytics();
    } catch (err) {
      showToast(err.message, 'danger');
    }
  };

  // Inline Stock Update Handler
  const handleInlineStockUpdate = async (productId, newStock) => {
    try {
      const res = await fetch(`/api/admin/products/${productId}/stock`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ stock: newStock })
      });
      if (res.ok) {
        setProducts(prev => prev.map(p => p.id === productId ? { ...p, stock: newStock } : p));
        showToast('Stock count updated.', 'success');
        loadAnalytics();
      }
    } catch (err) {
      showToast('Failed to update stock.', 'danger');
    }
  };

  // Delete Product Handler
  const handleDeleteProduct = async (productId, title) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${title}"?`)) return;

    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
        headers
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete');

      showToast(data.message, 'info');
      loadProducts();
      loadAnalytics();
    } catch (err) {
      showToast(err.message, 'danger');
    }
  };

  // Order Status Update Handler
  const handleUpdateOrderStatus = async (e) => {
    e.preventDefault();
    if (!selectedOrderForStatus) return;

    try {
      const res = await fetch(`/api/admin/orders/${selectedOrderForStatus.id}/status`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(statusUpdateForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update status');

      showToast(data.message, 'success');
      setSelectedOrderForStatus(null);
      loadOrders();
      loadAnalytics();
    } catch (err) {
      showToast(err.message, 'danger');
    }
  };

  return (
    <div className="container" style={{ padding: '2rem 1.5rem 4rem' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Admin Command Center</h1>
            <span className="badge badge-primary">Super Admin</span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Real-time store management, inventory control, and fulfillment tracking
          </p>
        </div>

        {/* Action button */}
        {activeTab === 'products' && (
          <button
            className="btn btn-primary"
            onClick={() => {
              setEditingProduct(null);
              setProductForm({
                title: '',
                category: 'Electronics & Audio',
                brand: 'Nexus Brand',
                price: '',
                original_price: '',
                stock: '20',
                image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&auto=format&fit=crop&q=80',
                description: 'Next-generation tech accessory with premium ergonomics and long-lasting durability.',
                features: 'Aerospace Grade Casing\nUltra Battery Life\nFast USB-C Charging',
                is_featured: false
              });
              setIsProductModalOpen(true);
            }}
          >
            <Plus size={18} />
            <span>Add New Product</span>
          </button>
        )}
      </div>

      {/* Admin Layout */}
      <div className="admin-layout">
        {/* Left Navigation Sidebar */}
        <aside className="admin-sidebar">
          <button
            className={`admin-nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            <LayoutDashboard size={18} />
            <span>Executive Analytics</span>
          </button>

          <button
            className={`admin-nav-item ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            <Package size={18} />
            <span>Product Inventory ({products.length})</span>
          </button>

          <button
            className={`admin-nav-item ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <Truck size={18} />
            <span>Order Fulfillment ({orders.length})</span>
          </button>

          <button
            className={`admin-nav-item ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <Users size={18} />
            <span>Customer Directory ({usersList.length})</span>
          </button>
        </aside>

        {/* Main Content Area */}
        <main>
          {/* TAB 1: EXECUTIVE ANALYTICS */}
          {activeTab === 'analytics' && analytics && (
            <div>
              {/* 4 Stat Cards */}
              <div className="stat-cards-grid">
                <div className="stat-card">
                  <div className="stat-icon" style={{ background: 'var(--accent-gradient)' }}>
                    <DollarSign size={24} />
                  </div>
                  <div>
                    <div className="stat-value">${analytics.metrics.totalRevenue.toLocaleString()}</div>
                    <div className="stat-label">Total Store Revenue</div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #06b6d4, #3b82f6)' }}>
                    <ShoppingCart size={24} />
                  </div>
                  <div>
                    <div className="stat-value">{analytics.metrics.totalOrders}</div>
                    <div className="stat-label">Total Customer Orders</div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                    <Users size={24} />
                  </div>
                  <div>
                    <div className="stat-value">{analytics.metrics.totalCustomers}</div>
                    <div className="stat-label">Active Customers</div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                    <AlertTriangle size={24} />
                  </div>
                  <div>
                    <div className="stat-value">{analytics.metrics.lowStockCount}</div>
                    <div className="stat-label">Low Stock Alerts (&le;10)</div>
                  </div>
                </div>
              </div>

              {/* Two Column Section: Revenue Graph Simulation & Low Stock Alerts */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '1.5rem', marginBottom: '2rem' }}>
                {/* Revenue Trend Visualizer */}
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <TrendingUp size={18} color="var(--accent-primary)" />
                      <span>Monthly Revenue Trend</span>
                    </h3>
                    <span className="badge badge-success">+28.4% this month</span>
                  </div>

                  {/* Visual Bar Chart */}
                  <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: 180, paddingTop: '1rem' }}>
                    {analytics.salesTimeline.map(item => {
                      const maxVal = 14000;
                      const heightPercent = Math.min(100, (item.sales / maxVal) * 100);

                      return (
                        <div key={item.month} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>${(item.sales / 1000).toFixed(1)}k</span>
                          <div
                            style={{
                              width: '32px',
                              height: `${heightPercent}%`,
                              background: item.month === 'Aug' ? 'var(--accent-gradient)' : 'var(--bg-tertiary)',
                              borderRadius: '6px 6px 0 0',
                              boxShadow: item.month === 'Aug' ? '0 0 12px rgba(99, 102, 241, 0.4)' : 'none',
                              transition: 'height 0.4s ease'
                            }}
                          ></div>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: item.month === 'Aug' ? 'var(--accent-primary)' : 'var(--text-secondary)' }}>
                            {item.month}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Low Stock Alerts */}
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <AlertTriangle size={18} color="#f59e0b" />
                    <span>Inventory Low Stock Alerts</span>
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {analytics.lowStockItems.map(item => (
                      <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <img src={item.image} alt={item.title} style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover' }} />
                          <div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 700, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</div>
                            <span style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: 600 }}>Stock: {item.stock} left</span>
                          </div>
                        </div>

                        <button
                          className="btn btn-outline btn-sm"
                          style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                          onClick={() => handleInlineStockUpdate(item.id, item.stock + 20)}
                          title="Add +20 to stock"
                        >
                          +20 Restock
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Orders Overview */}
              <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Recent Customer Orders</h3>
                  <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('orders')}>
                    View All Orders
                  </button>
                </div>

                <div className="data-table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Order #</th>
                        <th>Customer</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.recentOrders.map(ord => (
                        <tr key={ord.id}>
                          <td style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>#{ord.order_number}</td>
                          <td>{ord.customer_name}</td>
                          <td style={{ fontWeight: 700 }}>${ord.total.toFixed(2)}</td>
                          <td>
                            <span className={`badge ${
                              ord.status === 'Delivered' ? 'badge-success' :
                              ord.status === 'Shipped' || ord.status === 'Out for Delivery' ? 'badge-primary' :
                              ord.status === 'Cancelled' ? 'badge-danger' : 'badge-warning'
                            }`}>
                              {ord.status}
                            </span>
                          </td>
                          <td style={{ color: 'var(--text-muted)' }}>{new Date(ord.created_at).toLocaleDateString()}</td>
                          <td>
                            <button
                              className="btn btn-outline btn-sm"
                              onClick={() => {
                                setSelectedOrderForStatus(ord);
                                setStatusUpdateForm({
                                  status: ord.status,
                                  note: '',
                                  trackingCarrier: 'Nexus Express Priority',
                                  trackingCode: `NX-TRK-${Math.floor(10000000 + Math.random() * 90000000)}`
                                });
                              }}
                            >
                              Update Status
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRODUCT INVENTORY MANAGEMENT */}
          {activeTab === 'products' && (
            <div>
              {/* Filters bar */}
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: 260 }}>
                  <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    placeholder="Search product inventory..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="form-input"
                    style={{ paddingLeft: '2.75rem' }}
                  />
                </div>

                <select
                  className="form-select"
                  style={{ width: 'auto' }}
                  value={productCategoryFilter}
                  onChange={(e) => setProductCategoryFilter(e.target.value)}
                >
                  <option value="All">All Categories</option>
                  <option value="Electronics & Audio">Electronics & Audio</option>
                  <option value="Computing & Office">Computing & Office</option>
                  <option value="Smart Wearables">Smart Wearables</option>
                  <option value="Home & Lifestyle">Home & Lifestyle</option>
                  <option value="Accessories & Gear">Accessories & Gear</option>
                </select>
              </div>

              {/* Product Inventory Table */}
              <div className="data-table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Stock Level</th>
                      <th>Rating</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(p => (
                      <tr key={p.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <img src={p.image} alt={p.title} style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover' }} />
                            <div>
                              <div style={{ fontWeight: 700, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</div>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.brand}</span>
                            </div>
                          </div>
                        </td>
                        <td><span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>{p.category}</span></td>
                        <td style={{ fontWeight: 700 }}>${p.price.toFixed(2)}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <input
                              type="number"
                              className="form-input"
                              style={{ width: 70, padding: '0.25rem 0.5rem', textAlign: 'center', fontSize: '0.85rem' }}
                              value={p.stock}
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 0;
                                handleInlineStockUpdate(p.id, val);
                              }}
                            />
                            {p.stock <= 10 && <span style={{ color: '#f59e0b', fontSize: '0.75rem', fontWeight: 700 }}>Low</span>}
                          </div>
                        </td>
                        <td>★ {p.rating ? p.rating.toFixed(1) : '4.5'} ({p.review_count})</td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
                            <button
                              className="btn btn-outline btn-sm"
                              style={{ padding: '0.35rem 0.6rem' }}
                              onClick={() => {
                                setEditingProduct(p);
                                setProductForm({
                                  title: p.title,
                                  category: p.category,
                                  brand: p.brand || '',
                                  price: p.price,
                                  original_price: p.original_price || '',
                                  stock: p.stock,
                                  image: p.image,
                                  description: p.description,
                                  features: Array.isArray(p.features) ? p.features.join('\n') : '',
                                  is_featured: p.is_featured === 1
                                });
                                setIsProductModalOpen(true);
                              }}
                              title="Edit product"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              style={{ padding: '0.35rem 0.6rem' }}
                              onClick={() => handleDeleteProduct(p.id, p.title)}
                              title="Delete product"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: ORDER FULFILLMENT CENTER */}
          {activeTab === 'orders' && (
            <div>
              {/* Order Status Filters */}
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: 260 }}>
                  <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    placeholder="Search by Order #, Customer, or Tracking Code..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    className="form-input"
                    style={{ paddingLeft: '2.75rem' }}
                  />
                </div>

                <select
                  className="form-select"
                  style={{ width: 'auto' }}
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                >
                  <option value="All">All Statuses</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Out for Delivery">Out for Delivery</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              {/* Orders Table */}
              <div className="data-table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Order #</th>
                      <th>Customer Info</th>
                      <th>Items</th>
                      <th>Total Paid</th>
                      <th>Status</th>
                      <th>Tracking</th>
                      <th style={{ textAlign: 'right' }}>Fulfillment Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(order => (
                      <tr key={order.id}>
                        <td style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>#{order.order_number}</td>
                        <td>
                          <div>
                            <strong style={{ display: 'block' }}>{order.customer_name}</strong>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{order.shipping_city}, {order.shipping_state}</span>
                          </div>
                        </td>
                        <td>
                          <span style={{ fontWeight: 600 }}>{order.items ? order.items.length : 1} item(s)</span>
                        </td>
                        <td style={{ fontWeight: 800 }}>${order.total.toFixed(2)}</td>
                        <td>
                          <span className={`badge ${
                            order.status === 'Delivered' ? 'badge-success' :
                            order.status === 'Shipped' || order.status === 'Out for Delivery' ? 'badge-primary' :
                            order.status === 'Cancelled' ? 'badge-danger' : 'badge-warning'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{order.tracking_code}</span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => {
                              setSelectedOrderForStatus(order);
                              setStatusUpdateForm({
                                status: order.status === 'Processing' ? 'Shipped' : order.status === 'Shipped' ? 'Out for Delivery' : order.status === 'Out for Delivery' ? 'Delivered' : order.status,
                                note: '',
                                trackingCarrier: order.tracking_carrier || 'Nexus Express Priority',
                                trackingCode: order.tracking_code || `NX-TRK-${Math.floor(10000000 + Math.random() * 90000000)}`
                              });
                            }}
                          >
                            <span>Update Status</span>
                            <ChevronRight size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: CUSTOMER DIRECTORY */}
          {activeTab === 'users' && (
            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Customer Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Orders Placed</th>
                    <th>Total Spent</th>
                    <th>Member Since</th>
                  </tr>
                </thead>
                <tbody>
                  {usersList.map(u => (
                    <tr key={u.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <img src={u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`} alt={u.name} style={{ width: 32, height: 32, borderRadius: '50%' }} />
                          <span style={{ fontWeight: 700 }}>{u.name}</span>
                        </div>
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                      <td>
                        <span className={`badge ${u.role === 'admin' ? 'badge-primary' : 'badge-info'}`} style={{ fontSize: '0.7rem' }}>
                          {u.role}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600 }}>{u.order_count || 0}</td>
                      <td style={{ fontWeight: 800, color: 'var(--success)' }}>${(u.total_spend || 0).toFixed(2)}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{new Date(u.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>

      {/* Product Add / Edit Modal */}
      {isProductModalOpen && (
        <div className="modal-overlay" onClick={() => setIsProductModalOpen(false)}>
          <div className="modal-content modal-content-lg" onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                {editingProduct ? `Edit Product: ${editingProduct.title}` : 'Add New Inventory Product'}
              </h3>
              <button onClick={() => setIsProductModalOpen(false)} style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} style={{ padding: '2rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Product Title *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Lumina Vision Smart AR Glasses"
                    value={productForm.title}
                    onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select
                    className="form-select"
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                  >
                    <option value="Electronics & Audio">Electronics & Audio</option>
                    <option value="Computing & Office">Computing & Office</option>
                    <option value="Smart Wearables">Smart Wearables</option>
                    <option value="Home & Lifestyle">Home & Lifestyle</option>
                    <option value="Accessories & Gear">Accessories & Gear</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Brand</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Zenith Tech"
                    value={productForm.brand}
                    onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Sale Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-input"
                    placeholder="199.99"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Original MSRP Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-input"
                    placeholder="249.99"
                    value={productForm.original_price}
                    onChange={(e) => setProductForm({ ...productForm, original_price: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Inventory Stock Units *</label>
                  <input
                    type="number"
                    className="form-input"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">High-Res Image URL *</label>
                  <input
                    type="url"
                    className="form-input"
                    placeholder="https://images.unsplash.com/..."
                    value={productForm.image}
                    onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Description *</label>
                  <textarea
                    rows={3}
                    className="form-textarea"
                    placeholder="Comprehensive description of product features..."
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    required
                  ></textarea>
                </div>

                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Feature Highlights (1 per line)</label>
                  <textarea
                    rows={3}
                    className="form-textarea"
                    placeholder="Adaptive Active Noise Cancellation&#10;40-Hour Extended Battery Life&#10;Spatial Audio Support"
                    value={productForm.features}
                    onChange={(e) => setProductForm({ ...productForm, features: e.target.value })}
                  ></textarea>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsProductModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <Save size={16} />
                  <span>{editingProduct ? 'Save Changes' : 'Create Product'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Status Update Modal */}
      {selectedOrderForStatus && (
        <div className="modal-overlay" onClick={() => setSelectedOrderForStatus(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                  Update Order #{selectedOrderForStatus.order_number}
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Customer: {selectedOrderForStatus.customer_name}
                </span>
              </div>
              <button onClick={() => setSelectedOrderForStatus(null)} style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateOrderStatus} style={{ padding: '1.75rem' }}>
              <div className="form-group">
                <label className="form-label">New Fulfillment Stage</label>
                <select
                  className="form-select"
                  value={statusUpdateForm.status}
                  onChange={(e) => setStatusUpdateForm({ ...statusUpdateForm, status: e.target.value })}
                >
                  <option value="Processing">Processing (Picking & Packing)</option>
                  <option value="Shipped">Shipped (In Transit with Courier)</option>
                  <option value="Out for Delivery">Out for Delivery (Local Driver Route)</option>
                  <option value="Delivered">Delivered (Completed Delivery)</option>
                  <option value="Cancelled">Cancelled (Order Void)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Tracking Carrier</label>
                <input
                  type="text"
                  className="form-input"
                  value={statusUpdateForm.trackingCarrier}
                  onChange={(e) => setStatusUpdateForm({ ...statusUpdateForm, trackingCarrier: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Tracking Code</label>
                <input
                  type="text"
                  className="form-input"
                  value={statusUpdateForm.trackingCode}
                  onChange={(e) => setStatusUpdateForm({ ...statusUpdateForm, trackingCode: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Checkpoint Note (Visible in customer live tracking)</label>
                <textarea
                  rows={2}
                  className="form-textarea"
                  placeholder="e.g. Package arrived at local distribution gateway in Seattle."
                  value={statusUpdateForm.note}
                  onChange={(e) => setStatusUpdateForm({ ...statusUpdateForm, note: e.target.value })}
                ></textarea>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setSelectedOrderForStatus(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <CheckCircle2 size={16} />
                  <span>Commit Status Change</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
