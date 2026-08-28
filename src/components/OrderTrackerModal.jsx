import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import {
  X,
  Truck,
  Search,
  CheckCircle2,
  Clock,
  Package,
  MapPin,
  Calendar,
  AlertTriangle,
  RotateCcw,
  Sparkles
} from 'lucide-react';

export default function OrderTrackerModal({ initialOrderNumber, onClose }) {
  const { showToast } = useCart();
  const { user } = useAuth();

  const [searchQuery, setSearchQuery] = useState(initialOrderNumber || 'NEX-84920');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const fetchTracking = async (queryToSearch) => {
    const q = queryToSearch || searchQuery;
    if (!q || !q.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/orders/track/${encodeURIComponent(q.trim())}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Tracking number not found');
      setOrder(data.order);
    } catch (err) {
      showToast(err.message, 'danger');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialOrderNumber) {
      setSearchQuery(initialOrderNumber);
      fetchTracking(initialOrderNumber);
    } else {
      fetchTracking('NEX-84920'); // load default demo active order
    }
  }, [initialOrderNumber]);

  const handleCancelOrder = async () => {
    if (!order) return;
    if (!window.confirm(`Are you sure you want to cancel order ${order.order_number}?`)) return;

    setCancelling(true);
    try {
      const token = localStorage.getItem('nexusmart_token');
      const res = await fetch(`/api/orders/${order.id}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to cancel order');

      setOrder(data.order);
      showToast(data.message, 'success');
    } catch (err) {
      showToast(err.message, 'danger');
    } finally {
      setCancelling(false);
    }
  };

  // Stepper Stage Calculation
  const stages = ['Ordered', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered'];
  const getStageIndex = (status) => {
    if (status === 'Cancelled') return -1;
    const idx = stages.findIndex(s => s.toLowerCase() === status.toLowerCase());
    return idx >= 0 ? idx : 1;
  };

  const currentStageIndex = order ? getStageIndex(order.status) : 0;
  const isCancelled = order?.status === 'Cancelled';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-content-xl" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <Truck size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Live Milestone Order Tracker</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Real-time GPS dispatch & fulfillment telemetry</p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '2rem' }}>
          {/* Tracking Search Input & Demo Pills */}
          <div style={{ marginBottom: '2rem' }}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                fetchTracking();
              }}
              style={{ display: 'flex', gap: '0.75rem', maxWidth: 600, marginBottom: '0.75rem' }}
            >
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Enter Order # (e.g. NEX-84920) or Tracking Code..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '2.75rem' }}
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                <span>{loading ? 'Locating...' : 'Track Package'}</span>
              </button>
            </form>

            {/* Quick Demo Shortcuts */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', fontSize: '0.8rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Demo Orders:</span>
              {[
                { code: 'NEX-84920', label: 'NEX-84920 (In Transit)' },
                { code: 'NEX-71204', label: 'NEX-71204 (Delivered)' },
                { code: 'NEX-93011', label: 'NEX-93011 (Processing)' }
              ].map(demo => (
                <button
                  key={demo.code}
                  className="cat-pill"
                  style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem' }}
                  onClick={() => {
                    setSearchQuery(demo.code);
                    fetchTracking(demo.code);
                  }}
                >
                  {demo.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tracking Details View */}
          {order && (
            <div>
              {/* Top Status Card */}
              <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
                      <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Order #{order.order_number}</h2>
                      <span
                        className={`badge ${
                          order.status === 'Delivered' ? 'badge-success' :
                          order.status === 'Shipped' || order.status === 'Out for Delivery' ? 'badge-primary' :
                          order.status === 'Cancelled' ? 'badge-danger' : 'badge-warning'
                        }`}
                        style={{ fontSize: '0.8rem' }}
                      >
                        {order.status}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      <span>Carrier: <strong>{order.tracking_carrier}</strong></span>
                      <span>Tracking #: <strong style={{ fontFamily: 'monospace' }}>{order.tracking_code}</strong></span>
                      <span>Placed On: <strong>{new Date(order.created_at).toLocaleDateString()}</strong></span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Estimated Delivery</div>
                    <div style={{ fontSize: '1.35rem', fontWeight: 800, color: isCancelled ? 'var(--danger)' : 'var(--success)' }}>
                      {isCancelled ? 'Order Cancelled' : order.estimated_delivery}
                    </div>
                  </div>
                </div>

                {/* Visual Milestone Stepper */}
                {!isCancelled ? (
                  <div className="tracking-stepper">
                    {stages.map((stageName, index) => {
                      const isCompleted = index <= currentStageIndex;
                      const isActive = index === currentStageIndex;

                      return (
                        <div
                          key={stageName}
                          className={`tracking-step ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}
                        >
                          <div className="step-icon-circle">
                            {isCompleted ? <CheckCircle2 size={20} /> : <Clock size={20} />}
                          </div>
                          <span className="step-label">{stageName}</span>
                          <span className="step-desc">
                            {index === 0 ? 'Payment Verified' :
                             index === 1 ? 'Packed & Inspected' :
                             index === 2 ? 'In Transit' :
                             index === 3 ? 'Courier Dispatch' : 'Doorstep'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ background: 'var(--danger-bg)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(239, 68, 68, 0.3)', marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--danger)' }}>
                    <AlertTriangle size={20} />
                    <span>This order was cancelled. Items have been restocked and payment refunded.</span>
                  </div>
                )}
              </div>

              {/* Two Column Layout: Timeline Checkpoints & Order Receipt */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '2rem' }}>
                {/* Left: Detailed Timeline Log */}
                <div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Clock size={18} color="var(--accent-primary)" />
                    <span>Fulfillment Milestones</span>
                  </h4>

                  <div className="timeline-history">
                    {order.timeline && order.timeline.length > 0 ? (
                      order.timeline.map((item, idx) => (
                        <div key={item.id || idx} className="timeline-item">
                          <div className={`timeline-dot ${item.is_completed ? 'done' : ''}`}></div>
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                              <strong style={{ fontSize: '0.95rem', color: item.is_completed ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                                {item.title || item.status}
                              </strong>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                {item.timestamp}
                              </span>
                            </div>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                              {item.description}
                            </p>
                            {item.location && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: 'var(--accent-primary)' }}>
                                <MapPin size={12} />
                                <span>{item.location}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Awaiting initial carrier milestone check-in.</p>
                    )}
                  </div>
                </div>

                {/* Right: Itemized Summary & Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {/* Items Box */}
                  <div className="glass-panel" style={{ padding: '1.25rem' }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem' }}>Items in this Shipment</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {order.items && order.items.map(item => (
                        <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <img src={item.image} alt={item.title} style={{ width: 40, height: 40, borderRadius: 6, objectFit: 'cover' }} />
                            <div>
                              <div style={{ fontWeight: 600, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.title}</div>
                              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Qty: {item.quantity} × ${item.price.toFixed(2)}</div>
                            </div>
                          </div>
                          <span style={{ fontWeight: 700 }}>${item.total.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    {/* Cost Breakdown */}
                    <div style={{ borderTop: '1px solid var(--border-subtle)', marginTop: '1rem', paddingTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.85rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                        <span>Subtotal:</span>
                        <span>${order.subtotal.toFixed(2)}</span>
                      </div>
                      {order.discount > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--success)' }}>
                          <span>Discount ({order.coupon_code}):</span>
                          <span>-${order.discount.toFixed(2)}</span>
                        </div>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                        <span>Shipping ({order.shipping_method}):</span>
                        <span>${order.shipping_fee.toFixed(2)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.1rem', marginTop: '0.3rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.5rem' }}>
                        <span>Total Paid:</span>
                        <span className="gradient-text">${order.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Shipping Address Box */}
                  <div className="glass-panel" style={{ padding: '1.25rem', fontSize: '0.85rem' }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.5rem' }}>Destination Address</h4>
                    <div style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      <strong style={{ color: 'var(--text-primary)' }}>{order.customer_name}</strong><br />
                      {order.shipping_address}<br />
                      {order.shipping_city}, {order.shipping_state} {order.shipping_zip}, {order.shipping_country}<br />
                      <span style={{ color: 'var(--text-muted)' }}>Phone: {order.customer_phone}</span>
                    </div>
                  </div>

                  {/* Cancel Button if eligible */}
                  {(order.status === 'Processing' || order.status === 'Pending') && (
                    <button
                      className="btn btn-outline btn-sm"
                      style={{ color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.4)' }}
                      onClick={handleCancelOrder}
                      disabled={cancelling}
                    >
                      <RotateCcw size={16} />
                      <span>{cancelling ? 'Cancelling...' : 'Request Order Cancellation'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
