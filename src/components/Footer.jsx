import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import {
  ShoppingBag,
  Truck,
  ShieldCheck,
  Headphones,
  CreditCard,
  ArrowRight,
  Send,
  Heart
} from 'lucide-react';

export default function Footer({ onOpenTrackModal, onSelectCategory, onOpenAdmin }) {
  const { showToast } = useCart();
  const [emailInput, setEmailInput] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (emailInput.trim()) {
      showToast('Subscribed! Check your inbox for exclusive 15% VIP discount.', 'success');
      setEmailInput('');
    }
  };

  return (
    <footer style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-subtle)', marginTop: 'auto' }}>
      {/* Trust Badges Bar */}
      <div style={{ borderBottom: '1px solid var(--border-subtle)', padding: '2.5rem 0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-md)', background: 'rgba(99, 102, 241, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)' }}>
                <Truck size={24} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800 }}>Tracked Delivery</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Free shipping on all orders $99+</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-md)', background: 'rgba(16, 185, 129, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--success)' }}>
                <ShieldCheck size={24} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800 }}>30-Day Guarantee</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Hassle-free 100% money back</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-md)', background: 'rgba(245, 158, 11, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b' }}>
                <Headphones size={24} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800 }}>24/7 VIP Concierge</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Dedicated support experts</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-md)', background: 'rgba(236, 72, 153, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ec4899' }}>
                <CreditCard size={24} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800 }}>256-Bit SSL Checkout</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Bank-grade encryption</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="container" style={{ padding: '3.5rem 1.5rem 2.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1.5fr', gap: '3rem', flexWrap: 'wrap' }} className="footer-links-grid">
          {/* Brand Col */}
          <div>
            <div className="brand-logo" style={{ marginBottom: '1rem' }}>
              <div className="brand-icon">
                <ShoppingBag size={20} />
              </div>
              <span>Nexus<span className="gradient-text">Mart</span></span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '1.5rem', maxWidth: 300 }}>
              Curating premium electronics, titanium wearables, audio engineering, and creator gear with live GPS milestone order tracking.
            </p>
          </div>

          {/* Catalog Categories */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem' }}>Departments</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              {['Electronics & Audio', 'Computing & Office', 'Smart Wearables', 'Home & Lifestyle', 'Accessories & Gear'].map(cat => (
                <li key={cat}>
                  <button
                    onClick={() => onSelectCategory(cat)}
                    style={{ color: 'inherit', textAlign: 'left', transition: 'color 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-primary)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'inherit'}
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Experience */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem' }}>Shopping & Hub</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              <li>
                <button onClick={onOpenTrackModal} style={{ color: 'inherit' }}>Live Order Tracker</button>
              </li>
              <li>
                <button onClick={onOpenAdmin} style={{ color: '#818cf8', fontWeight: 600 }}>Admin Console</button>
              </li>
              <li><span>Terms of Service</span></li>
              <li><span>Privacy Policy</span></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.5rem' }}>Stay in the Loop</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem' }}>
              Subscribe to receive private drop alerts, seasonal discounts, and tech releases.
            </p>
            <form onSubmit={handleSubscribe} style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="email"
                placeholder="Enter your email"
                className="form-input"
                style={{ fontSize: '0.85rem' }}
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                required
              />
              <button type="submit" className="btn btn-primary btn-sm">
                <Send size={14} />
              </button>
            </form>
          </div>
        </div>

        {/* Copyright */}
        <div style={{ borderTop: '1px solid var(--border-subtle)', marginTop: '3rem', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <div>&copy; 2026 NexusMart E-Commerce Platform. All rights reserved.</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span>Built with precision & passion</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
