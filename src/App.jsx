import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from './context/AuthContext';
import { useCart } from './context/CartContext';
import Navbar from './components/Navbar';
import HeroBanner from './components/HeroBanner';
import ProductCatalog from './components/ProductCatalog';
import ProductModal from './components/ProductModal';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import OrderTrackerModal from './components/OrderTrackerModal';
import AccountDashboard from './components/AccountDashboard';
import AdminDashboard from './components/AdminDashboard';
import AuthModal from './components/AuthModal';
import Toast from './components/Toast';
import Footer from './components/Footer';

export default function App() {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const { isCheckoutOpen, setIsCheckoutOpen, setIsCartOpen } = useCart();

  // Theme Management
  const [theme, setTheme] = useState(() => localStorage.getItem('nexusmart_theme') || 'dark');
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('nexusmart_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // View Navigation: 'catalog' | 'account' | 'admin'
  const [activeView, setActiveView] = useState('catalog');
  const [accountTab, setAccountTab] = useState('orders');

  // Filter & Search State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [priceRange, setPriceRange] = useState(2000);
  const [minRating, setMinRating] = useState(0);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState('featured');

  // Data State
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Modals
  const [selectedProductForModal, setSelectedProductForModal] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isTrackerModalOpen, setIsTrackerModalOpen] = useState(false);
  const [trackerInitialOrder, setTrackerInitialOrder] = useState('NEX-84920');

  // Fetch Categories
  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/products/categories');
      const data = await res.json();
      if (res.ok) setCategories(data.categories || []);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  }, []);

  // Fetch Products with active filters
  const fetchProducts = useCallback(async () => {
    setLoadingProducts(true);
    try {
      const queryParams = new URLSearchParams();
      if (searchTerm) queryParams.append('search', searchTerm);
      if (selectedCategory && selectedCategory !== 'All') queryParams.append('category', selectedCategory);
      if (priceRange < 2000) queryParams.append('maxPrice', priceRange);
      if (minRating > 0) queryParams.append('minRating', minRating);
      if (inStockOnly) queryParams.append('inStockOnly', 'true');
      if (sortBy) queryParams.append('sortBy', sortBy);

      const res = await fetch(`/api/products?${queryParams.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setProducts(data.products || []);
      }
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoadingProducts(false);
    }
  }, [searchTerm, selectedCategory, priceRange, minRating, inStockOnly, sortBy]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 150);
    return () => clearTimeout(timer);
  }, [fetchProducts]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setPriceRange(2000);
    setMinRating(0);
    setInStockOnly(false);
    setSortBy('featured');
  };

  const handleOpenTracking = (orderNumber) => {
    setTrackerInitialOrder(orderNumber || 'NEX-84920');
    setIsTrackerModalOpen(true);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Toast System */}
      <Toast />

      {/* Global Navbar */}
      <Navbar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        categories={categories}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenAccount={(tab = 'orders') => {
          setAccountTab(tab);
          setActiveView('account');
        }}
        onOpenAdmin={() => setActiveView('admin')}
        onOpenTrackModal={() => handleOpenTracking()}
        theme={theme}
        toggleTheme={toggleTheme}
        activeView={activeView}
        setActiveView={setActiveView}
      />

      {/* Main View Router */}
      <div style={{ flex: 1 }}>
        {/* VIEW 1: PRODUCT CATALOG & STOREFRONT */}
        {activeView === 'catalog' && (
          <>
            {/* Show Hero only when not actively searching or filtered deeply */}
            {!searchTerm && selectedCategory === 'All' && (
              <HeroBanner
                onExplore={() => {
                  const catalogEl = document.getElementById('catalog');
                  if (catalogEl) catalogEl.scrollIntoView({ behavior: 'smooth' });
                }}
                onTrackOrder={() => handleOpenTracking()}
              />
            )}

            <ProductCatalog
              products={products}
              loading={loadingProducts}
              categories={categories}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
              minRating={minRating}
              setMinRating={setMinRating}
              inStockOnly={inStockOnly}
              setInStockOnly={setInStockOnly}
              sortBy={sortBy}
              setSortBy={setSortBy}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              onQuickView={(p) => setSelectedProductForModal(p)}
              onResetFilters={handleResetFilters}
            />
          </>
        )}

        {/* VIEW 2: CUSTOMER ACCOUNT HUB */}
        {activeView === 'account' && (
          <AccountDashboard
            initialTab={accountTab}
            onTrackOrder={(ordNum) => handleOpenTracking(ordNum)}
            onShopMore={() => {
              setActiveView('catalog');
              handleResetFilters();
            }}
          />
        )}

        {/* VIEW 3: ADMIN CONSOLE */}
        {activeView === 'admin' && (
          <AdminDashboard
            onInspectOrder={(ordNum) => handleOpenTracking(ordNum)}
          />
        )}
      </div>

      {/* Footer */}
      <Footer
        onOpenTrackModal={() => handleOpenTracking()}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          setActiveView('catalog');
          const catalogEl = document.getElementById('catalog');
          if (catalogEl) catalogEl.scrollIntoView({ behavior: 'smooth' });
        }}
        onOpenAdmin={() => {
          if (isAdmin) {
            setActiveView('admin');
          } else {
            setIsAuthModalOpen(true);
          }
        }}
      />

      {/* Modals & Slide-overs */}
      <CartDrawer
        onProceedToCheckout={() => setIsCheckoutOpen(true)}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderPlaced={(order) => {
          handleOpenTracking(order.order_number);
        }}
      />

      {selectedProductForModal && (
        <ProductModal
          product={selectedProductForModal}
          onClose={() => setSelectedProductForModal(null)}
          onAuthRequired={() => {
            setSelectedProductForModal(null);
            setIsAuthModalOpen(true);
          }}
        />
      )}

      {isTrackerModalOpen && (
        <OrderTrackerModal
          initialOrderNumber={trackerInitialOrder}
          onClose={() => setIsTrackerModalOpen(false)}
        />
      )}

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}
