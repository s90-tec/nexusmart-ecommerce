import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('nexusmart_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('nexusmart_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [trackingModalOrder, setTrackingModalOrder] = useState(null);
  const [toasts, setToasts] = useState([]);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('nexusmart_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem('nexusmart_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Toast Helper
  const showToast = (message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Cart Operations
  const addToCart = (product, quantity = 1) => {
    if (product.stock <= 0) {
      showToast(`Sorry, "${product.title}" is out of stock.`, 'danger');
      return;
    }

    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        const newQty = Math.min(product.stock, existing.quantity + quantity);
        showToast(`Updated quantity for "${product.title}" (${newQty} in cart)`, 'success');
        return prev.map(item =>
          item.id === product.id ? { ...item, quantity: newQty } : item
        );
      } else {
        const addedQty = Math.min(product.stock, quantity);
        showToast(`Added "${product.title}" to cart!`, 'success');
        return [...prev, {
          id: product.id,
          title: product.title,
          price: product.price,
          originalPrice: product.original_price,
          image: product.image,
          category: product.category,
          stock: product.stock,
          quantity: addedQty
        }];
      }
    });
  };

  const removeFromCart = (productId) => {
    const item = cartItems.find(i => i.id === productId);
    setCartItems(prev => prev.filter(i => i.id !== productId));
    if (item) {
      showToast(`Removed "${item.title}" from cart`, 'info');
    }
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCartItems(prev =>
      prev.map(item => {
        if (item.id === productId) {
          const clampedQty = Math.min(item.stock, newQuantity);
          return { ...item, quantity: clampedQty };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCartItems([]);
    setAppliedCoupon(null);
  };

  // Wishlist Operations
  const toggleWishlist = (product) => {
    const exists = wishlist.some(item => item.id === product.id);
    if (exists) {
      setWishlist(prev => prev.filter(item => item.id !== product.id));
      showToast(`Removed "${product.title}" from wishlist.`, 'info');
    } else {
      setWishlist(prev => [...prev, {
        id: product.id,
        title: product.title,
        price: product.price,
        image: product.image,
        category: product.category,
        stock: product.stock,
        rating: product.rating
      }]);
      showToast(`Saved "${product.title}" to your wishlist!`, 'success');
    }
  };

  const isInWishlist = (productId) => wishlist.some(item => item.id === productId);

  // Coupon Engine
  const applyCoupon = async (code) => {
    if (!code || !code.trim()) {
      showToast('Please enter a coupon promo code.', 'warning');
      return false;
    }

    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, subtotal })
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Invalid coupon code', 'danger');
        return false;
      }
      setAppliedCoupon(data);
      showToast(`Coupon "${data.code}" applied: Saved $${data.discountAmount.toFixed(2)}!`, 'success');
      return true;
    } catch {
      showToast('Failed to validate promo code.', 'danger');
      return false;
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    showToast('Coupon code removed.', 'info');
  };

  // Financial Calculations
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalItemCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'percentage') {
      discountAmount = (subtotal * appliedCoupon.discountValue) / 100;
    } else if (appliedCoupon.discountType === 'fixed') {
      discountAmount = Math.min(subtotal, appliedCoupon.discountValue);
    }
  }

  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const estimatedTax = Math.round(taxableAmount * 0.07 * 100) / 100;
  const estimatedShipping = subtotal > 99 || appliedCoupon?.code === 'FREESHIP' ? 0 : (cartItems.length > 0 ? 8.99 : 0);
  const grandTotal = Math.max(0, taxableAmount + estimatedTax + estimatedShipping);

  const value = {
    cartItems,
    wishlist,
    totalItemCount,
    subtotal,
    discountAmount,
    estimatedTax,
    estimatedShipping,
    grandTotal,
    appliedCoupon,
    isCartOpen,
    setIsCartOpen,
    isCheckoutOpen,
    setIsCheckoutOpen,
    trackingModalOrder,
    setTrackingModalOrder,
    toasts,
    showToast,
    removeToast,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    toggleWishlist,
    isInWishlist,
    applyCoupon,
    removeCoupon
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
