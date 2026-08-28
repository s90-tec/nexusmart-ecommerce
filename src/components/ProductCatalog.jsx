import React from 'react';
import ProductCard from './ProductCard';
import { SlidersHorizontal, RotateCcw, Search, Sparkles, Filter } from 'lucide-react';

export default function ProductCatalog({
  products = [],
  loading = false,
  categories = [],
  selectedCategory,
  setSelectedCategory,
  priceRange,
  setPriceRange,
  minRating,
  setMinRating,
  inStockOnly,
  setInStockOnly,
  sortBy,
  setSortBy,
  searchTerm,
  setSearchTerm,
  onQuickView,
  onResetFilters
}) {
  return (
    <section className="container" style={{ paddingBottom: '4rem' }} id="catalog">
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
            {selectedCategory === 'All' ? 'Curated Catalog' : selectedCategory}
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            {searchTerm ? `Search results for "${searchTerm}" — ` : ''}
            Showing {products.length} premium products
          </p>
        </div>

        {/* Sort Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Sort by:</span>
          <select
            className="form-select"
            style={{ width: 'auto', padding: '0.5rem 1rem', fontSize: '0.85rem' }}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="featured">Featured & Best Matches</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
            <option value="discount">Biggest Discount</option>
            <option value="newest">Newest Arrivals</option>
          </select>
        </div>
      </div>

      {/* Catalog Layout */}
      <div className="catalog-layout">
        {/* Filters Sidebar */}
        <aside className="filters-sidebar">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
              <Filter size={18} color="var(--accent-primary)" />
              <span>Filters</span>
            </div>
            <button
              onClick={onResetFilters}
              className="btn btn-outline btn-sm"
              style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
              title="Reset all filters"
            >
              <RotateCcw size={12} />
              <span>Reset</span>
            </button>
          </div>

          {/* Category Filter */}
          <div className="filter-section">
            <h4 className="filter-title">Category</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              {categories.map(cat => (
                <label
                  key={cat.category}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.45rem 0.6rem',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    background: selectedCategory === cat.category ? 'rgba(99, 102, 241, 0.12)' : 'transparent',
                    color: selectedCategory === cat.category ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    fontWeight: selectedCategory === cat.category ? 700 : 500,
                    fontSize: '0.875rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <input
                      type="radio"
                      name="categoryFilter"
                      checked={selectedCategory === cat.category}
                      onChange={() => setSelectedCategory(cat.category)}
                      style={{ accentColor: 'var(--accent-primary)' }}
                    />
                    <span>{cat.category}</span>
                  </div>
                  {cat.count !== undefined && (
                    <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>{cat.count}</span>
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="filter-section">
            <div className="filter-title">
              <span>Max Price</span>
              <span style={{ color: 'var(--accent-primary)', fontWeight: 800 }}>${priceRange}</span>
            </div>
            <input
              type="range"
              min="20"
              max="2200"
              step="10"
              value={priceRange}
              onChange={(e) => setPriceRange(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
              <span>$20</span>
              <span>$2,200</span>
            </div>
          </div>

          {/* Minimum Rating */}
          <div className="filter-section">
            <h4 className="filter-title">Minimum Rating</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {[
                { val: 0, label: 'All Ratings' },
                { val: 4.5, label: '4.5★ & above' },
                { val: 4.0, label: '4.0★ & above' }
              ].map(r => (
                <label
                  key={r.val}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    color: minRating === r.val ? 'var(--text-primary)' : 'var(--text-secondary)'
                  }}
                >
                  <input
                    type="radio"
                    name="minRating"
                    checked={minRating === r.val}
                    onChange={() => setMinRating(r.val)}
                    style={{ accentColor: 'var(--accent-primary)' }}
                  />
                  <span>{r.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* In Stock Only Toggle */}
          <div className="filter-section" style={{ borderBottom: 'none', paddingBottom: 0 }}>
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>In Stock Only</span>
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                style={{ width: 18, height: 18, accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
              />
            </label>
          </div>
        </aside>

        {/* Products Grid */}
        <main>
          {loading ? (
            <div className="product-grid">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="product-card" style={{ height: 360, opacity: 0.5, animation: 'pulseGlow 1.5s infinite' }}></div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div
              className="glass-panel"
              style={{
                textAlign: 'center',
                padding: '4rem 2rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1rem'
              }}
            >
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Search size={32} color="var(--text-muted)" />
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700 }}>No matching products found</h3>
              <p style={{ color: 'var(--text-secondary)', maxWidth: 400, fontSize: '0.9rem' }}>
                We couldn't find any products matching your active filters. Try clearing your search or broadening price filters.
              </p>
              <button className="btn btn-primary btn-sm" onClick={onResetFilters}>
                <RotateCcw size={16} />
                <span>Reset All Filters</span>
              </button>
            </div>
          ) : (
            <div className="product-grid">
              {products.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onQuickView={onQuickView}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </section>
  );
}
