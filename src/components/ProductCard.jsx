import React from 'react';
import { useCart } from '../context/CartContext';
import { Star, Plus, Heart, Eye, Check } from 'lucide-react';

export default function ProductCard({ product, onQuickView }) {
  const { addToCart, toggleWishlist, isInWishlist, cartItems } = useCart();

  const isWishlisted = isInWishlist(product.id);
  const cartItem = cartItems.find(item => item.id === product.id);
  const inCartQty = cartItem ? cartItem.quantity : 0;
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 10;

  return (
    <div className="product-card">
      {/* Product Image & Overlays */}
      <div className="product-image-container">
        <img
          src={product.image}
          alt={product.title}
          className="product-card-img"
          loading="lazy"
        />

        {/* Discount Badge */}
        {product.discount_percent > 0 && (
          <span className="product-discount-tag">
            -{product.discount_percent}%
          </span>
        )}

        {/* Wishlist Button */}
        <button
          className={`product-wishlist-btn ${isWishlisted ? 'active' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product);
          }}
          title={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
          aria-label="Wishlist"
        >
          <Heart size={16} fill={isWishlisted ? '#f43f5e' : 'none'} color={isWishlisted ? '#f43f5e' : 'currentColor'} />
        </button>

        {/* Quick View Overlay Button */}
        <div className="product-quick-view-overlay">
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => onQuickView(product)}
            style={{ backdropFilter: 'blur(10px)', background: 'var(--bg-glass-heavy)' }}
          >
            <Eye size={14} />
            <span>Quick View</span>
          </button>
        </div>
      </div>

      {/* Product Information */}
      <div className="product-info">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
          <span className="product-category-text">{product.category}</span>
          {isLowStock && (
            <span style={{ fontSize: '0.7rem', color: '#f59e0b', fontWeight: 700 }}>
              Only {product.stock} left!
            </span>
          )}
          {isOutOfStock && (
            <span style={{ fontSize: '0.7rem', color: 'var(--danger)', fontWeight: 700 }}>
              Sold Out
            </span>
          )}
        </div>

        <h3
          className="product-card-title"
          title={product.title}
          onClick={() => onQuickView(product)}
          style={{ cursor: 'pointer' }}
        >
          {product.title}
        </h3>

        <div className="product-card-rating">
          <Star size={14} fill="#f59e0b" color="#f59e0b" />
          <span style={{ fontWeight: 700 }}>{product.rating ? product.rating.toFixed(1) : '4.5'}</span>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
            ({product.review_count || 0})
          </span>
        </div>

        {/* Price & Add to Cart Action */}
        <div className="product-card-bottom">
          <div className="product-card-price">
            <span className="price-current">${product.price.toFixed(2)}</span>
            {product.original_price && product.original_price > product.price && (
              <span className="price-original">${product.original_price.toFixed(2)}</span>
            )}
          </div>

          <button
            className="add-cart-btn"
            disabled={isOutOfStock}
            onClick={() => addToCart(product, 1)}
            title={isOutOfStock ? 'Item Out of Stock' : inCartQty > 0 ? `In Cart (${inCartQty}). Click to add more` : 'Add to Shopping Cart'}
            aria-label="Add to cart"
          >
            {inCartQty > 0 ? (
              <span style={{ fontSize: '0.85rem', fontWeight: 800 }}>{inCartQty}</span>
            ) : (
              <Plus size={20} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
