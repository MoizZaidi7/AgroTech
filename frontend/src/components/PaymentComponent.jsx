// PaymentComponent.jsx
import React, { useState, useEffect, useRef } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import axios from 'axios';
import { FaMoneyBillWave, FaTimes, FaCheck } from 'react-icons/fa';
import { motion } from 'framer-motion';

const PaymentComponent = ({ 
  orderId, 
  orderTotal, 
  onPaymentSuccess, 
  onClose,
  stripePublishableKey
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const stripeRef = useRef(null);
  const elementsRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    const initializePayment = async () => {
      try {
        setLoading(true);
        setError('');

        // Load Stripe.js only once
        if (!stripeRef.current) {
          stripeRef.current = await loadStripe(stripePublishableKey);
        }

        // Create payment intent
        const response = await axios.post(
          'http://localhost:5000/api/marketplace/payment',
          { orderId },
          { 
            headers: { 
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('token')}` 
            }
          }
        );

        if (!response.data.clientSecret) {
          throw new Error('Payment initialization failed - missing client secret');
        }

        // Initialize Elements with the client secret
        elementsRef.current = stripeRef.current.elements({
          clientSecret: response.data.clientSecret,
          appearance: {
            theme: 'stripe',
            variables: {
              colorPrimary: '#22c55e',
              colorBackground: '#ffffff',
              colorText: '#1f2937',
              fontFamily: 'Inter, system-ui, sans-serif',
            }
          }
        });

        // Create and mount the Payment Element
        const paymentElement = elementsRef.current.create('payment');
        paymentElement.mount('#payment-element');

      } catch (error) {
        if (isMounted) {
          setError(error.response?.data?.message || error.message || 'Failed to initiate payment');
          console.error('Payment initialization error:', error);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initializePayment();

    return () => {
      isMounted = false;
      // Cleanup elements when component unmounts
      if (elementsRef.current) {
        const elements = elementsRef.current;
        elements.getElement('payment')?.unmount();
      }
    };
  }, [orderId, stripePublishableKey]);

  // PaymentComponent.jsx
const handleConfirmPayment = async () => {
  try {
    setLoading(true);
    setError('');

    if (!stripeRef.current || !elementsRef.current) {
      throw new Error('Payment system not ready');
    }

    const { error: stripeError, paymentIntent } = await stripeRef.current.confirmPayment({
      elements: elementsRef.current,
      confirmParams: {
        return_url: window.location.origin + '/payment/success',
      },
      redirect: 'if_required'
    });

    if (stripeError) {
      throw stripeError;
    }

    // Verify with backend
    const verificationResponse = await axios.post(
      'http://localhost:5000/api/marketplace/payment/confirm',
      {
        paymentIntentId: paymentIntent.id,
        orderId
      },
      {
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}` 
        }
      }
    );

    if (!verificationResponse.data.success) {
      throw new Error(verificationResponse.data.error || 'Payment verification failed');
    }

    onPaymentSuccess();
    
  } catch (error) {
    setError(error.message || 'Payment failed. Please try again.');
    console.error('Payment error:', error);
  } finally {
    setLoading(false);
  }
};

const verifyPaymentWithBackend = async (paymentIntentId) => {
  try {
    const verificationResponse = await axios.post(
      'http://localhost:5000/api/marketplace/payment/confirm',
      {
        paymentIntentId,
        orderId,
        amount: orderTotal
      },
      {
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}` 
        }
      }
    );

    if (!verificationResponse.data.success) {
      throw new Error(verificationResponse.data.error || 'Payment verification failed');
    }

    onPaymentSuccess();
    
  } catch (error) {
    throw error;
  }
};

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md"
      >
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          Complete Payment
        </h3>
        
        <div className="mb-6">
          <p className="text-gray-600 font-medium mb-1">Order Total:</p>
          <p className="text-2xl font-bold text-green-600">
            PKR {orderTotal}
          </p>
          
          <div className="mt-4 min-h-[200px]">
            <div id="payment-element" className="w-full"></div>
          </div>
        </div>
          
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}
        
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmPayment}
            className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
            disabled={loading}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              <>
                <FaMoneyBillWave className="mr-2" /> Pay Now
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentComponent;