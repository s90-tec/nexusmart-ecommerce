import React from 'react';
import { useCart } from '../context/CartContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast() {
  const { toasts, removeToast } = useCart();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container" role="region" aria-label="Notifications">
      {toasts.map(toast => {
        const isSuccess = toast.type === 'success';
        const isDanger = toast.type === 'danger';
        const isWarning = toast.type === 'warning';

        return (
          <div
            key={toast.id}
            className={`toast ${isSuccess ? 'toast-success' : isDanger ? 'toast-danger' : isWarning ? 'toast-warning' : ''}`}
            style={{
              borderColor: isSuccess ? 'rgba(16, 185, 129, 0.4)' : isDanger ? 'rgba(239, 68, 68, 0.4)' : isWarning ? 'rgba(245, 158, 11, 0.4)' : 'var(--border-medium)'
            }}
          >
            {isSuccess && <CheckCircle2 size={18} color="var(--success)" />}
            {isDanger && <AlertCircle size={18} color="var(--danger)" />}
            {isWarning && <AlertCircle size={18} color="var(--warning)" />}
            {!isSuccess && !isDanger && !isWarning && <Info size={18} color="var(--accent-primary)" />}

            <span style={{ flex: 1, fontSize: '0.875rem' }}>{toast.message}</span>

            <button
              onClick={() => removeToast(toast.id)}
              style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}
              aria-label="Dismiss notification"
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
