import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { FormEvent } from 'react';

interface VoucherFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
  price: string;
  onSuccess: (checkoutUrl: string) => void;
}

export default function VoucherFormModal({
  isOpen,
  onClose,
  productId,
  productName,
  price,
  onSuccess
}: VoucherFormModalProps) {
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Prevenir scroll del body cuando el modal está abierto y asegurar que el componente esté montado
  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const requestBody = {
        productId,
        recipientName,
        recipientEmail,
        message: message.trim() || undefined
      };

      const response = await fetch('/api/create-voucher-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to create order');
      }

      // Éxito - redirigir al checkout
      onSuccess(data.checkoutUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred. Please try again.');
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setRecipientName('');
      setRecipientEmail('');
      setMessage('');
      setError(null);
      onClose();
    }
  };

  const modalContent = (
    <div 
      className="fixed inset-0 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 transition-opacity duration-300"
      onClick={handleClose}
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0,
        zIndex: 99999,
        margin: 0,
        padding: '1rem'
      }}
    >
      <div 
        className="relative w-full max-w-lg bg-brand-cream rounded-sm shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        style={{ 
          maxHeight: '90vh', 
          overflowY: 'auto',
          overflowX: 'hidden',
          position: 'relative',
          zIndex: 100000
        }}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          disabled={loading}
          className="absolute top-4 right-4 z-10 p-2 text-brand-green hover:text-brand-gold transition-colors bg-white/50 rounded-full hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Close modal"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header - Sticky */}
        <div className="bg-brand-green text-white p-6 md:p-8 sticky top-0 z-20">
          <span className="text-brand-gold uppercase tracking-widest text-[10px] font-bold block mb-2">Gift Voucher</span>
          <h2 className="font-serif text-2xl md:text-3xl italic leading-tight">{productName}</h2>
          <p className="text-brand-gold text-xl font-serif italic mt-2">{price}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
          <div>
            <label htmlFor="recipient-name" className="block text-brand-green uppercase tracking-widest text-[10px] font-bold mb-2">
              Recipient Name *
            </label>
            <input
              type="text"
              id="recipient-name"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              required
              disabled={loading}
              className="w-full bg-white border border-brand-stone rounded-sm p-3 text-sm text-brand-dark focus:outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="Enter recipient's full name"
            />
          </div>

          <div>
            <label htmlFor="recipient-email" className="block text-brand-green uppercase tracking-widest text-[10px] font-bold mb-2">
              Recipient Email *
            </label>
            <input
              type="email"
              id="recipient-email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              required
              disabled={loading}
              className="w-full bg-white border border-brand-stone rounded-sm p-3 text-sm text-brand-dark focus:outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="recipient@example.com"
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-brand-green uppercase tracking-widest text-[10px] font-bold mb-2">
              Personal Message <span className="text-brand-dark/40 normal-case font-normal">(Optional)</span>
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={loading}
              rows={4}
              className="w-full bg-white border border-brand-stone rounded-sm p-3 text-sm text-brand-dark focus:outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 transition-colors resize-none disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="Add a personal message for the recipient..."
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-sm p-4">
              <p className="text-red-800 text-sm font-medium">{error}</p>
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 border border-brand-stone text-brand-dark px-6 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-brand-stone/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed leading-none"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !recipientName || !recipientEmail}
              className="flex-1 bg-brand-green text-white px-6 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-brand-gold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md leading-none relative"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                'Continue to Checkout'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // Usar Portal solo en el cliente (evita "Access to storage is not allowed" en edge/SSR)
  if (typeof document === 'undefined' || !document.body) return null;
  return createPortal(modalContent, document.body);
}
