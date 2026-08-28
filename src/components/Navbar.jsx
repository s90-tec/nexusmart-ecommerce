import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import {
  ShoppingBag,
  Search,
  Heart,
  User,
  Sun,
  Moon,
  Truck,
  ShieldCheck,
  LogOut,
  ChevronDown,
  Sparkles,
  Package,
  Layers
} from 'lucide-react';

export default function Navbar({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  categories = [],
  onOpenAuth,
  onOpenAccount,
  onOpenAdmin,
  onOpenTrackModal,
  theme,
  toggleTheme,
  activeView,
  setActiveView
}) {
  const { user, isAuthenticated, isAdmin, logout, demoLogin } = useAuth();
  const { totalItemCount, wishlist, setIsCartOpen } = useCart();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  return (
    <header className="navbar-wrapper">
      {/* Top Announcement Bar */}
      <div className="top-announcement">
        <Sparkles size={14} />
        <span>Use code <span className="code">NEXUS20</span> for 20% off all orders over $50 | Free Express Shipping over $99</span>
      </div>

      <div className="container">
        <div className="nav-container">
          {/* Brand Logo */}
          <div
            className="brand-logo"
            style={{ cursor: 'pointer' }}
            onClick={() => {
              setActiveView('catalog');
              setSelectedCategory('All');
              setSearchTerm('');
            }}
          >
            <div className="brand-icon">
              <ShoppingBag size={22} />
            </div>
            <span>Nexus<span className="gradient-text">Mart</span></span>
          </div>

          {/* Search Bar */}
          <div className="nav-search">
            <Search size={18} className="nav-search-icon" />
            <input
              type="text"
              className="nav-search-input"
              placeholder="Search premium electronics, wearables, accessories..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                if (activeView !== 'catalog') setActiveView('catalog');
              }}
            />
          </div>

          {/* Nav Actions */}
          <div className="nav-actions">
            {/* Live Track Order Shortcut */}
            <button
              className="btn btn-secondary btn-sm"
              onClick={onOpenTrackModal}
              title="Track your order in real-time"
            >
              <Truck size={16} color="var(--accent-primary)" />
              <span className="hide-mobile">Track Order</span>
            </button>

            {/* Admin Dashboard Pill if Admin */}
            {isAdmin && (
              <button
                className={`btn btn-sm ${activeView === 'admin' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={onOpenAdmin}
                style={{ background: activeView === 'admin' ? 'var(--accent-gradient)' : 'rgba(99, 102, 241, 0.15)', borderColor: 'rgba(99, 102, 241, 0.4)' }}
              >
                <ShieldCheck size={16} />
                <span>Admin Hub</span>
              </button>
            )}

            {/* Theme Toggle */}
            <button
              className="nav-btn"
              onClick={toggleTheme}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={18} color="#f59e0b" /> : <Moon size={18} color="#6366f1" />}
            </button>

            {/* Wishlist Button */}
            <button
              className="nav-btn"
              onClick={() => {
                if (isAuthenticated) {
                  onOpenAccount('wishlist');
                } else {
                  onOpenAuth();
                }
              }}
              title="View Wishlist"
              aria-label="Wishlist"
            >
              <Heart size={18} color={wishlist.length > 0 ? '#f43f5e' : 'currentColor'} fill={wishlist.length > 0 ? '#f43f5e' : 'none'} />
              {wishlist.length > 0 && <span className="cart-badge" style={{ background: '#f43f5e' }}>{wishlist.length}</span>}
            </button>

            {/* Cart Trigger */}
            <button
              className="nav-btn"
              onClick={() => setIsCartOpen(true)}
              title="Shopping Cart"
              aria-label="Shopping Cart"
            >
              <ShoppingBag size={18} color="var(--accent-primary)" />
              {totalItemCount > 0 && (
                <span className="cart-badge animate-bounce">{totalItemCount}</span>
              )}
            </button>

            {/* Auth / Profile Dropdown */}
            {isAuthenticated ? (
              <div style={{ position: 'relative' }}>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  style={{ gap: '0.6rem', padding: '0.35rem 0.75rem' }}
                >
                  <img
                    src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                    alt={user.name}
                    style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <span style={{ maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.name.split(' ')[0]}
                  </span>
                  <ChevronDown size={14} />
                </button>

                {userDropdownOpen && (
                  <div
                    className="glass-panel"
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: 'calc(100% + 8px)',
                      width: 220,
                      padding: '0.75rem',
                      zIndex: 600,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.4rem',
                      boxShadow: 'var(--shadow-lg)'
                    }}
                  >
                    <div style={{ padding: '0.4rem 0.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{user.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.email}</div>
                      <span className={`badge ${user.role === 'admin' ? 'badge-primary' : 'badge-info'}`} style={{ marginTop: '0.4rem', fontSize: '0.65rem' }}>
                        {user.role === 'admin' ? 'Administrator' : 'Customer'}
                      </span>
                    </div>

                    <button
                      className="admin-nav-item"
                      style={{ fontSize: '0.85rem', padding: '0.5rem 0.75rem' }}
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onOpenAccount('orders');
                      }}
                    >
                      <Package size={16} />
                      <span>My Orders</span>
                    </button>

                    <button
                      className="admin-nav-item"
                      style={{ fontSize: '0.85rem', padding: '0.5rem 0.75rem' }}
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onOpenAccount('wishlist');
                      }}
                    >
                      <Heart size={16} />
                      <span>Saved Wishlist</span>
                    </button>

                    {isAdmin && (
                      <button
                        className="admin-nav-item"
                        style={{ fontSize: '0.85rem', padding: '0.5rem 0.75rem', color: '#818cf8' }}
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onOpenAdmin();
                        }}
                      >
                        <ShieldCheck size={16} />
                        <span>Admin Console</span>
                      </button>
                    )}

                    <div style={{ borderTop: '1px solid var(--border-subtle)', margin: '0.2rem 0' }}></div>

                    <button
                      className="admin-nav-item"
                      style={{ fontSize: '0.85rem', padding: '0.5rem 0.75rem', color: 'var(--danger)' }}
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                        setActiveView('catalog');
                      }}
                    >
                      <LogOut size={16} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button className="btn btn-primary btn-sm" onClick={onOpenAuth}>
                <User size={16} />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>

        {/* Category Navigation Pills */}
        <div className="category-nav-bar">
          {categories.map(cat => (
            <button
              key={cat.category}
              className={`cat-pill ${selectedCategory === cat.category ? 'active' : ''}`}
              onClick={() => {
                setSelectedCategory(cat.category);
                if (activeView !== 'catalog') setActiveView('catalog');
              }}
            >
              {cat.category}
              {cat.count !== undefined && <span style={{ opacity: 0.7, marginLeft: 4, fontSize: '0.75rem' }}>({cat.count})</span>}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
