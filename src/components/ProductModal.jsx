import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import {
  X,
  Star,
  Plus,
  Minus,
  ShoppingBag,
  Heart,
  ShieldCheck,
  Truck,
  RotateCcw,
  CheckCircle2,
  Send,
  MessageSquare
} from 'lucide-react';

export default function ProductModal({ product, onClose, onAuthRequired }) {
  const { addToCart, toggleWishlist, isInWishlist, showToast } = useCart();
  const { user, isAuthenticated } = useAuth();

  const [activeImage, setActiveImage] = useState(product?.image);
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [ratingInput, setRatingInput] = useState(5);
  const [commentInput, setCommentInput] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (product) {
      setActiveImage(product.image);
      setQuantity(1);
      // Fetch fresh reviews & full product details
      fetch(`/api/products/${product.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.reviews) setReviews(data.reviews);
        })
        .catch(err => console.error('Failed to load product details:', err));
    }
  }, [product]);

  if (!product) return null;

  const isWishlisted = isInWishlist(product.id);
  const isOutOfStock = product.stock <= 0;
  const gallery = product.gallery && product.gallery.length > 0 ? product.gallery : [product.image];
  const features = product.features || [];

  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      onAuthRequired();
      return;
    }

    if (!commentInput.trim()) {
      showToast('Please enter a review comment.', 'warning');
      return;
    }

    setSubmittingReview(true);
    try {
      const token = localStorage.getItem('nexusmart_token');
      const res = await fetch(`/api/products/${product.id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ rating: ratingInput, comment: commentInput })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to post review');

      setReviews(data.reviews);
      setCommentInput('');
      showToast('Thank you! Your verified review has been submitted.', 'success');
    } catch (err) {
      showToast(err.message, 'danger');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-content-lg" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            zIndex: 10,
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: 'var(--bg-tertiary)',
            color: 'var(--text-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid var(--border-subtle)'
          }}
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        <div style={{ padding: '2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem' }} className="modal-inner-grid">
          {/* Left Column: Image Gallery */}
          <div>
            <div
              style={{
                width: '100%',
                height: '380px',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                background: 'var(--bg-tertiary)',
                marginBottom: '1rem',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <img
                src={activeImage || product.image}
                alt={product.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            {/* Thumbnail Strip */}
            {gallery.length > 1 && (
              <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                {gallery.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(imgUrl)}
                    style={{
                      width: 70,
                      height: 70,
                      borderRadius: 'var(--radius-md)',
                      overflow: 'hidden',
                      border: `2px solid ${activeImage === imgUrl ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
                      opacity: activeImage === imgUrl ? 1 : 0.6,
                      flexShrink: 0
                    }}
                  >
                    <img src={imgUrl} alt={`Thumbnail ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Details & Actions */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <span className="badge badge-primary">{product.category}</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Brand: <strong>{product.brand}</strong></span>
            </div>

            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, lineHeight: 1.25, marginBottom: '0.75rem' }}>
              {product.title}
            </h2>

            {/* Rating */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', color: '#f59e0b' }}>
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    fill={i < Math.round(product.rating || 4.5) ? '#f59e0b' : 'none'}
                    color="#f59e0b"
                  />
                ))}
              </div>
              <span style={{ fontWeight: 700 }}>{product.rating ? product.rating.toFixed(1) : '4.5'}</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>({reviews.length || product.review_count || 0} reviews)</span>
            </div>

            {/* Price Box */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem', marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                ${product.price.toFixed(2)}
              </span>
              {product.original_price && product.original_price > product.price && (
                <>
                  <span style={{ fontSize: '1.1rem', textDecoration: 'line-through', color: 'var(--text-muted)' }}>
                    ${product.original_price.toFixed(2)}
                  </span>
                  <span className="badge badge-danger">
                    Save ${(product.original_price - product.price).toFixed(2)} ({product.discount_percent}%)
                  </span>
                </>
              )}
            </div>

            {/* Description */}
            <p style={{ fontSize: '0.925rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              {product.description}
            </p>

            {/* Key Features */}
            {features.length > 0 && (
              <div style={{ marginBottom: '1.5rem', background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  Highlights & Specs
                </h4>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem' }}>
                  {features.map((feat, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <CheckCircle2 size={14} color="var(--success)" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Quantity Selector and CTA */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: 'auto', marginBottom: '1.5rem' }}>
              {/* Stepper */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.2rem'
                }}
              >
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1 || isOutOfStock}
                  style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Minus size={16} />
                </button>
                <span style={{ width: 40, textAlign: 'center', fontWeight: 700 }}>{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  disabled={quantity >= product.stock || isOutOfStock}
                  style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Plus size={16} />
                </button>
              </div>

              {/* Add to Cart */}
              <button
                className="btn btn-primary btn-lg"
                style={{ flex: 1 }}
                disabled={isOutOfStock}
                onClick={() => {
                  addToCart(product, quantity);
                  onClose();
                }}
              >
                <ShoppingBag size={20} />
                <span>{isOutOfStock ? 'Sold Out' : 'Add to Cart'}</span>
              </button>

              {/* Wishlist Button */}
              <button
                className={`btn btn-secondary ${isWishlisted ? 'btn-danger' : ''}`}
                style={{ padding: '0.9rem' }}
                onClick={() => toggleWishlist(product)}
                title="Wishlist"
              >
                <Heart size={20} fill={isWishlisted ? '#f43f5e' : 'none'} color={isWishlisted ? '#f43f5e' : 'currentColor'} />
              </button>
            </div>

            {/* Shipping & Guarantee Guarantees */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Truck size={16} color="var(--accent-primary)" />
                <span>Tracked Express Shipping</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <ShieldCheck size={16} color="var(--success)" />
                <span>Authenticity Guaranteed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Reviews & Feedback Section */}
        <div style={{ borderTop: '1px solid var(--border-subtle)', padding: '2rem', background: 'var(--bg-card)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MessageSquare size={18} color="var(--accent-primary)" />
              <span>Customer Reviews ({reviews.length})</span>
            </h3>
          </div>

          {/* Write a Review Form */}
          <form onSubmit={handleAddReview} style={{ background: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: 'var(--radius-lg)', marginBottom: '2rem', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 700 }}>Rate this product:</span>
              <div style={{ display: 'flex', gap: '0.25rem', cursor: 'pointer' }}>
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRatingInput(star)}
                    style={{ background: 'none', border: 'none', padding: '2px', cursor: 'pointer' }}
                  >
                    <Star
                      size={20}
                      fill={star <= ratingInput ? '#f59e0b' : 'none'}
                      color={star <= ratingInput ? '#f59e0b' : 'var(--text-muted)'}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <input
                type="text"
                className="form-input"
                placeholder={isAuthenticated ? "Share your genuine experience with this item..." : "Sign in to post a verified review"}
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                disabled={submittingReview}
              />
              <button type="submit" className="btn btn-primary" disabled={submittingReview}>
                <Send size={16} />
                <span>{submittingReview ? 'Posting...' : 'Post'}</span>
              </button>
            </div>
          </form>

          {/* Reviews List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {reviews.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '1rem 0' }}>
                No reviews yet. Be the first to share your thoughts on this product!
              </p>
            ) : (
              reviews.map(rev => (
                <div
                  key={rev.id}
                  style={{
                    background: 'var(--bg-secondary)',
                    padding: '1rem 1.25rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <img
                        src={rev.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${rev.user_name}`}
                        alt={rev.user_name}
                        style={{ width: 28, height: 28, borderRadius: '50%' }}
                      />
                      <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{rev.user_name}</span>
                      <span className="badge badge-success" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>Verified Buyer</span>
                    </div>
                    <div style={{ display: 'flex', color: '#f59e0b' }}>
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={13} fill={i < rev.rating ? '#f59e0b' : 'none'} color="#f59e0b" />
                      ))}
                    </div>
                  </div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {rev.comment}
                  </p>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                    {new Date(rev.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
