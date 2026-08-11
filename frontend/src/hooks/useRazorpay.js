import { useState } from 'react';
import api from '../api/axios';

/**
 * Custom React Hook for seamlessly triggering Razorpay Payment Checkout
 */
export const useRazorpay = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const processPayment = async ({ feeRecordId, monthId, monthCode, studentId, amount: paramAmount, studentName, email, phone, onSuccess, onFailure }) => {
    try {
      setLoading(true);
      setError('');

      const resScript = await loadRazorpayScript();
      if (!resScript) {
        throw new Error('Razorpay SDK failed to load. Please check your internet connection.');
      }

      // 1. Create order via Backend API
      const orderPayload = feeRecordId
        ? { fee_record_id: feeRecordId }
        : { monthly_fee_id: monthId, month_code: monthCode, student_id: studentId, amount: paramAmount };

      const { data: orderRes } = await api.post('/payments/create-order', orderPayload);

      if (!orderRes?.success || !orderRes?.data) {
        throw new Error(orderRes?.message || 'Failed to initiate payment order.');
      }

      const { orderId, amount, currency, keyId } = orderRes.data;

      // 2. Configure Razorpay Checkout Modal
      const options = {
        key: keyId,
        amount: amount,
        currency: currency || 'INR',
        name: 'Thomson School ERP',
        description: 'Student Fee Payment',
        order_id: orderId,
        prefill: {
          name: studentName || '',
          email: email || '',
          contact: phone || '',
        },
        theme: {
          color: '#4f46e5', // Indigo theme
        },
        handler: async function (response) {
          try {
            // 3. Verify Payment Signature via Backend API
            const { data: verifyRes } = await api.post('/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyRes?.success) {
              if (onSuccess) onSuccess(verifyRes.data);
            } else {
              throw new Error(verifyRes?.message || 'Payment verification failed.');
            }
          } catch (vErr) {
            console.error('Payment Verification Error:', vErr);
            setError(vErr.response?.data?.message || vErr.message);
            if (onFailure) onFailure(vErr);
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (err) {
      console.error('Razorpay Payment Error:', err);
      const msg = err.response?.data?.message || err.message || 'Payment initiation failed.';
      setError(msg);
      if (onFailure) onFailure(err);
      setLoading(false);
    }
  };

  return { processPayment, loading, error, setError };
};
