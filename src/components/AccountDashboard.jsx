import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import {
  Package,
  Heart,
  User,
  Truck,
  Calendar,
  CreditCard,
  ShoppingBag,
  ExternalLink,
  MapPin,
  Save,
  CheckCircle2
} from 'lucide-react';

export default function AccountDashboard({ initialTab = 'orders', onTrackOrder, onShopMore }) {
  const { user, updateProfile } = useAuth();
  const { wishlist, toggleWishlist, addToCart, showToast } = useCart();

  const [activeTab, setActiveTab] = useState(initialTab);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || ''
  });
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        phone: user.phone || '',
        address: user.address || ''
      });

      // Fetch user's orders
      const token = localStorage.getItem('nexusmart_token');
      if (token) {
        fetch('/api/orders/my-orders', {
          headers: { Authorization: `Bearer ${token}` }
        })
          .then(res => res.json())
          .then(data => {
            if (data.orders) setOrders(data.orders);
          })
          .catch(err => console.error('Failed to fetch orders:', err))
          .finally(() => setLoadingOrders(false));
      }
    }
  }, [user]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await updateProfile(profileForm);
      showToast('Profile information saved!', 'success');
    } catch (err) {
      showToast(err.message, 'danger');
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem 4rem' }}>
      {/* Account Top Header */}
      <div className="glass-panel" style={{ padding: '1.75rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <img
            src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
            alt={user?.name}
            style={{ width: 64, height: 64, borderRadius: '50%', border: '2px solid var(--accent-primary)', objectFit: 'cover' }}
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{user?.name}</h2>
              <span className={`badge ${user?.role === 'admin' ? 'badge-primary' : 'badge-info'}`} style={{ fontSize: '0.7rem' }}>
                {user?.role === 'admin' ? 'Administrator' : 'Customer'}
              </span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{user?.email}</p>
          </div>
        </div>

        {/* Quick Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--bg-secondary)', padding: '0.35rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
          <button
            className={`btn btn-sm ${activeTab === 'orders' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('orders')}
            style={{ border: 'none' }}
          >
            <Package size={16} />
            <span>My Orders ({orders.length})</span>
          </button>

          <button
            className={`btn btn-sm ${activeTab === 'wishlist' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('wishlist')}
            style={{ border: 'none' }}
          >
            <Heart size={16} />
            <span>Wishlist ({wishlist.length})</span>
          </button>

          <button
            className={`btn btn-sm ${activeTab === 'profile' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('profile')}
            style={{ border: 'none' }}
          >
            <User size={16} />
            <span>Settings</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Orders History */}
      {activeTab === 'orders' && (
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.25rem' }}>Order History & Live Shipments</h3>

          {loadingOrders ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <p style={{ color: 'var(--text-muted)' }}>Loading orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="glass-panel" style={{ textAlign: 'center', padding: '3.5rem 2rem' }}>
              <Package size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>No orders found</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>You haven't placed any orders with this account yet.</p>
              <button className="btn btn-primary btn-sm" onClick={onShopMore}>
                Explore Featured Products
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {orders.map(order => (
                <div key={order.id} className="glass-panel" style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--accent-primary)' }}>
                          #{order.order_number}
                        </span>
                        <span
                          className={`badge ${
                            order.status === 'Delivered' ? 'badge-success' :
                            order.status === 'Shipped' || order.status === 'Out for Delivery' ? 'badge-primary' :
                            order.status === 'Cancelled' ? 'badge-danger' : 'badge-warning'
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Placed on {new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} • Tracking: {order.tracking_code}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Amount</div>
                        <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>${order.total.toFixed(2)}</div>
                      </div>

                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => onTrackOrder(order.order_number)}
                      >
                        <Truck size={14} />
                        <span>Track Shipment</span>
                      </button>
                    </div>
                  </div>

                  {/* Order Items Preview */}
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    {order.items && order.items.map(item => (
                      <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: 'var(--bg-secondary)', padding: '0.4rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontSize: '0.85rem' }}>
                        <img src={item.image} alt={item.title} style={{ width: 32, height: 32, borderRadius: 4, objectFit: 'cover' }} />
                        <span style={{ fontWeight: 600 }}>{item.title}</span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>×{item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Saved Wishlist */}
      {activeTab === 'wishlist' && (
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.25rem' }}>Saved Wishlist Items</h3>

          {wishlist.length === 0 ? (
            <div className="glass-panel" style={{ textAlign: 'center', padding: '3.5rem 2rem' }}>
              <Heart size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Your wishlist is empty</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>Save products you love to quickly purchase them later.</p>
              <button className="btn btn-primary btn-sm" onClick={onShopMore}>
                Browse Catalog
              </button>
            </div>
          ) : (
            <div className="product-grid">
              {wishlist.map(product => (
                <div key={product.id} className="product-card">
                  <div className="product-image-container">
                    <img src={product.image} alt={product.title} className="product-card-img" />
                    <button
                      className="product-wishlist-btn active"
                      onClick={() => toggleWishlist(product)}
                      title="Remove from wishlist"
                    >
                      <Heart size={16} fill="#f43f5e" color="#f43f5e" />
                    </button>
                  </div>
                  <div className="product-info">
                    <span className="product-category-text">{product.category}</span>
                    <h4 className="product-card-title">{product.title}</h4>
                    <div className="product-card-bottom">
                      <span className="price-current">${product.price.toFixed(2)}</span>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => {
                          addToCart(product, 1);
                          toggleWishlist(product);
                        }}
                      >
                        <ShoppingBag size={14} />
                        <span>Move to Bag</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Profile Settings */}
      {activeTab === 'profile' && (
        <div style={{ maxWidth: 640 }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.25rem' }}>Profile & Shipping Preferences</h3>

          <form onSubmit={handleSaveProfile} className="glass-panel" style={{ padding: '2rem' }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address (Read-only)</label>
              <input
                type="email"
                className="form-input"
                value={user?.email || ''}
                disabled
                style={{ opacity: 0.7, cursor: 'not-allowed' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Default Phone Number</label>
              <input
                type="tel"
                className="form-input"
                placeholder="+1 (555) 000-0000"
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Default Shipping Address</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="Street address, city, state, zip code..."
                value={profileForm.address}
                onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
              ></textarea>
            </div>

            <button type="submit" className="btn btn-primary" disabled={savingProfile}>
              <Save size={16} />
              <span>{savingProfile ? 'Saving...' : 'Save Preferences'}</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
