import React from 'react';
import { ArrowRight, ShieldCheck, Zap, Truck, Star, Sparkles } from 'lucide-react';

export default function HeroBanner({ onExplore, onTrackOrder }) {
  return (
    <section className="hero-banner">
      <div className="hero-glow-1"></div>
      <div className="hero-glow-2"></div>

      <div className="container">
        <div className="hero-grid">
          {/* Left Hero Text */}
          <div>
            <div className="hero-tag">
              <Sparkles size={16} />
              <span>Autumn Tech & Audio Drop 2026</span>
            </div>

            <h1 className="hero-title">
              Engineered For Excellence. <br />
              <span className="gradient-text">Tracked In Real-Time.</span>
            </h1>

            <p className="hero-desc">
              Discover curated high-performance audio, titanium wearables, creator gear, and smart home essentials. Enjoy instant checkout with full milestone visibility from warehouse to doorstep.
            </p>

            <div className="hero-cta-group">
              <button className="btn btn-primary btn-lg" onClick={onExplore}>
                <span>Shop Featured Collection</span>
                <ArrowRight size={18} />
              </button>

              <button className="btn btn-secondary btn-lg" onClick={onTrackOrder}>
                <Truck size={18} color="var(--accent-primary)" />
                <span>Live Order Tracker</span>
              </button>
            </div>

            {/* Micro Highlights */}
            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '2.5rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <ShieldCheck size={18} color="var(--success)" />
                <span>2-Year Official Warranty</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <Zap size={18} color="#f59e0b" />
                <span>Same-Day Fast Dispatch</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <Star size={18} color="#f59e0b" fill="#f59e0b" />
                <span>4.9/5 Average Rating (1.4k+ Reviews)</span>
              </div>
            </div>
          </div>

          {/* Right Hero Product Card Preview */}
          <div className="hero-card-preview">
            <img
              src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80"
              alt="Apex Pro ANC Headphones"
              className="hero-preview-img"
            />

            {/* Floating Glassmorphic Feature Badge */}
            <div className="hero-floating-badge">
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(16, 185, 129, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--success)'
                }}
              >
                <Truck size={24} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>Live GPS Milestone Stepper</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Fulfillment & Courier Updates</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
