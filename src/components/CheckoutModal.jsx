import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import {
  X,
  CheckCircle2,
  Truck,
  CreditCard,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Lock,
  Sparkles,
  MapPin,
  Check
} from 'lucide-react';

export default function CheckoutModal({ isOpen, onClose, onOrderPlaced }) {
  const { cartItems, subtotal, discountAmount, grandTotal, appliedCoupon, clearCart, showToast } = useCart();
  const { user } = useAuth();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    customerName: user?.name || '',
    customerEmail: user?.email || '',
    customerPhone: user?.phone || '',
    shippingAddress: user?.address?.split(',')[0] || '',
    shippingCity: 'Springfield',
    shippingState: 'OR',
    shippingZip: '97477',
    shippingCountry: 'USA',
    shippingMethod: 'Standard',
    paymentMethod: 'Credit Card',
    cardNumber: '4242 •••• •••• 4242',
    cardExpiry: '08/29',
    cardCvc: '888',
    notes: 'Leave package on the front porch.'
  });

  if (!isOpen) return null;

  const autofillDemoAddress = () => {
    setFormData(prev => ({
      ...prev,
      customerName: user?.name || 'Alex Morgan',
      customerEmail: user?.email || 'alex@example.com',
      customerPhone: '+1 (555) 234-5678',
      shippingAddress: '742 Evergreen Terrace',
      shippingCity: 'Springfield',
      shippingState: 'OR',
      shippingZip: '97477',
      shippingCountry: 'USA',
      shippingMethod: 'Express',
      paymentMethod: 'Credit Card',
      notes: 'Please buzz code #44 if unavailable.'
    }));
    showToast('Auto-filled with Alex Morgan demo shipping details!', 'info');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePlaceOrder = async () => {
    if (!formData.customerName || !formData.customerEmail || !formData.shippingAddress || !formData.shippingCity || !formData.shippingZip) {
      showToast('Please fill in all required shipping address fields.', 'danger');
      setStep(1);
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('nexusmart_token');
      const payload = {
        items: cartItems,
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        shippingAddress: formData.shippingAddress,
        shippingCity: formData.shippingCity,
        shippingState: formData.shippingState,
        shippingZip: formData.shippingZip,
        shippingCountry: formData.shippingCountry,
        shippingMethod: formData.shippingMethod,
        paymentMethod: formData.paymentMethod,
        couponCode: appliedCoupon ? appliedCoupon.code : null,
        notes: formData.notes
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to place order.');

      clearCart();
      setPlacedOrder(data.order);
      showToast(`Order #${data.order.order_number} confirmed!`, 'success');
    } catch (err) {
      showToast(err.message, 'danger');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-content-lg" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Lock size={18} color="var(--accent-primary)" />
              <span>{placedOrder ? 'Order Confirmation' : 'Secure Multi-Step Checkout'}</span>
            </h3>
            {!placedOrder && (
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Step {step} of 3: {step === 1 ? 'Shipping Address' : step === 2 ? 'Shipping & Payment' : 'Review & Confirm'}
              </span>
            )}
          </div>

          <button
            onClick={onClose}
            style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Successful Order Placed View */}
        {placedOrder ? (
          <div style={{ padding: '3rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--success-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--success)' }}>
              <CheckCircle2 size={40} />
            </div>

            <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Order Successfully Placed!</h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: 460, fontSize: '0.95rem' }}>
              Thank you, <strong>{placedOrder.customer_name}</strong>! We've sent an order confirmation and itemized receipt to <strong>{placedOrder.customer_email}</strong>.
            </p>

            {/* Order Card Summary */}
            <div className="glass-panel" style={{ width: '100%', maxWidth: 520, padding: '1.5rem', textAlign: 'left', margin: '1rem 0' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem', fontSize: '0.875rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block' }}>Order Number</span>
                  <strong style={{ fontSize: '1.05rem', color: 'var(--accent-primary)' }}>{placedOrder.order_number}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block' }}>Tracking Code</span>
                  <strong style={{ fontFamily: 'monospace' }}>{placedOrder.tracking_code}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block' }}>Carrier & Speed</span>
                  <span>{placedOrder.tracking_carrier} ({placedOrder.shipping_method})</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block' }}>Est. Delivery</span>
                  <strong style={{ color: 'var(--success)' }}>{placedOrder.estimated_delivery}</strong>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', fontWeight: 800 }}>
                <span>Amount Paid</span>
                <span className="gradient-text" style={{ fontSize: '1.2rem' }}>${placedOrder.total.toFixed(2)}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              <button
                className="btn btn-primary"
                onClick={() => {
                  onClose();
                  onOrderPlaced(placedOrder);
                }}
              >
                <Truck size={18} />
                <span>Track Live Order Stepper</span>
              </button>

              <button className="btn btn-secondary" onClick={onClose}>
                Continue Shopping
              </button>
            </div>
          </div>
        ) : (
          /* Step Flow */
          <div style={{ padding: '2rem' }}>
            {/* Step Indicator */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', position: 'relative' }}>
              {[
                { num: 1, label: 'Address' },
                { num: 2, label: 'Payment' },
                { num: 3, label: 'Review' }
              ].map(s => (
                <div
                  key={s.num}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: step >= s.num ? 'var(--accent-primary)' : 'var(--text-muted)',
                    fontWeight: 700,
                    fontSize: '0.9rem'
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: step >= s.num ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                      color: step >= s.num ? '#fff' : 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.8rem'
                    }}
                  >
                    {step > s.num ? <Check size={14} /> : s.num}
                  </div>
                  <span>{s.label}</span>
                </div>
              ))}
            </div>

            {/* STEP 1: Shipping Address */}
            {step === 1 && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <h4 style={{ fontWeight: 700 }}>1. Shipping Details</h4>
                  <button
                    type="button"
                    onClick={autofillDemoAddress}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.75rem', borderColor: 'var(--accent-primary)' }}
                  >
                    <Sparkles size={14} color="var(--accent-primary)" />
                    <span>Auto-Fill Demo Address</span>
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input
                      type="text"
                      name="customerName"
                      value={formData.customerName}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="e.g. Alex Morgan"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email Address *</label>
                    <input
                      type="email"
                      name="customerEmail"
                      value={formData.customerEmail}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="alex@example.com"
                      required
                    />
                  </div>

                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="form-label">Street Address *</label>
                    <input
                      type="text"
                      name="shippingAddress"
                      value={formData.shippingAddress}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="e.g. 742 Evergreen Terrace"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">City *</label>
                    <input
                      type="text"
                      name="shippingCity"
                      value={formData.shippingCity}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Springfield"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <div>
                        <label className="form-label">State</label>
                        <input
                          type="text"
                          name="shippingState"
                          value={formData.shippingState}
                          onChange={handleInputChange}
                          className="form-input"
                          placeholder="OR"
                        />
                      </div>
                      <div>
                        <label className="form-label">ZIP *</label>
                        <input
                          type="text"
                          name="shippingZip"
                          value={formData.shippingZip}
                          onChange={handleInputChange}
                          className="form-input"
                          placeholder="97477"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input
                      type="tel"
                      name="customerPhone"
                      value={formData.customerPhone}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="+1 (555) 234-5678"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Delivery Instructions / Notes</label>
                    <input
                      type="text"
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="e.g. Gate code #123"
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      if (!formData.customerName || !formData.customerEmail || !formData.shippingAddress || !formData.shippingCity || !formData.shippingZip) {
                        showToast('Please fill in required address fields.', 'warning');
                        return;
                      }
                      setStep(2);
                    }}
                  >
                    <span>Continue to Shipping & Payment</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Shipping Method & Payment */}
            {step === 2 && (
              <div>
                <h4 style={{ fontWeight: 700, marginBottom: '1rem' }}>2. Shipping Method</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                  {[
                    { id: 'Standard', name: 'Standard Ground', time: '3-5 Business Days', price: subtotal > 99 ? 'FREE' : '$8.99' },
                    { id: 'Express', name: 'Express Air', time: '2 Business Days', price: '$14.99' },
                    { id: 'Priority Overnight', name: 'Priority Overnight', time: 'Next Day by 10:30 AM', price: '$24.99' }
                  ].map(method => (
                    <label
                      key={method.id}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        padding: '1rem',
                        borderRadius: 'var(--radius-md)',
                        border: `2px solid ${formData.shippingMethod === method.id ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
                        background: formData.shippingMethod === method.id ? 'rgba(99, 102, 241, 0.08)' : 'var(--bg-card)',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                        <input
                          type="radio"
                          name="shippingMethod"
                          value={method.id}
                          checked={formData.shippingMethod === method.id}
                          onChange={handleInputChange}
                          style={{ accentColor: 'var(--accent-primary)' }}
                        />
                        <strong style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>{method.price}</strong>
                      </div>
                      <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{method.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{method.time}</div>
                    </label>
                  ))}
                </div>

                <h4 style={{ fontWeight: 700, marginBottom: '1rem' }}>Payment Method</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                  {['Credit Card', 'UPI / NetBanking', 'Cash on Delivery'].map(pm => (
                    <label
                      key={pm}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        padding: '0.9rem',
                        borderRadius: 'var(--radius-md)',
                        border: `2px solid ${formData.paymentMethod === pm ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
                        background: formData.paymentMethod === pm ? 'rgba(99, 102, 241, 0.08)' : 'var(--bg-card)',
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: '0.875rem'
                      }}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={pm}
                        checked={formData.paymentMethod === pm}
                        onChange={handleInputChange}
                        style={{ accentColor: 'var(--accent-primary)' }}
                      />
                      <span>{pm}</span>
                    </label>
                  ))}
                </div>

                {formData.paymentMethod === 'Credit Card' && (
                  <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '0.75rem' }}>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Card Number</label>
                        <input
                          type="text"
                          name="cardNumber"
                          value={formData.cardNumber}
                          onChange={handleInputChange}
                          className="form-input"
                        />
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Expiry</label>
                        <input
                          type="text"
                          name="cardExpiry"
                          value={formData.cardExpiry}
                          onChange={handleInputChange}
                          className="form-input"
                        />
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">CVC</label>
                        <input
                          type="text"
                          name="cardCvc"
                          value={formData.cardCvc}
                          onChange={handleInputChange}
                          className="form-input"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
                  <button className="btn btn-secondary" onClick={() => setStep(1)}>
                    <ArrowLeft size={16} />
                    <span>Back</span>
                  </button>
                  <button className="btn btn-primary" onClick={() => setStep(3)}>
                    <span>Review Order</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Order Review & Submission */}
            {step === 3 && (
              <div>
                <h4 style={{ fontWeight: 700, marginBottom: '1rem' }}>3. Review & Complete Order</h4>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                  {/* Items Review */}
                  <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', maxHeight: 220, overflowY: 'auto' }}>
                    {cartItems.map(item => (
                      <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <img src={item.image} alt={item.title} style={{ width: 36, height: 36, borderRadius: 4, objectFit: 'cover' }} />
                          <div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{item.title}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Qty: {item.quantity} × ${item.price.toFixed(2)}</div>
                          </div>
                        </div>
                        <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Summary Box */}
                  <div className="glass-panel" style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Shipping to:</span>
                      <span style={{ fontWeight: 600 }}>{formData.shippingCity}, {formData.shippingZip}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Subtotal:</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    {discountAmount > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--success)', fontWeight: 600 }}>
                        <span>Coupon Discount:</span>
                        <span>-${discountAmount.toFixed(2)}</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.1rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.5rem', marginTop: '0.3rem' }}>
                      <span>Total Amount:</span>
                      <span className="gradient-text">${grandTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
                  <button className="btn btn-secondary" onClick={() => setStep(2)}>
                    <ArrowLeft size={16} />
                    <span>Back</span>
                  </button>
                  <button
                    className="btn btn-primary btn-lg"
                    onClick={handlePlaceOrder}
                    disabled={loading}
                  >
                    <ShieldCheck size={20} />
                    <span>{loading ? 'Processing Order...' : `Pay & Place Order ($${grandTotal.toFixed(2)})`}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
