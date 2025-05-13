import express from 'express';
import {
  createOrder,
  updateOrderStatus,
  placeBid,
  initiatePayment,
  getBuyerOrders,
  getBuyerBids,
  confirmPayment,
  addToCart,
  getProductBids,
  acceptBid,
  rejectBid,
  checkoutCart,
  updateCartItem,
  removeFromCart
} from '../controllers/MarketPlaceController.js';

import authMiddleware from '../middleware/authMiddleware.js';
import { updateLastActivity } from '../middleware/lastactivity.js';

const MarketRouter = express.Router();

MarketRouter.use(updateLastActivity);

// FE-5: Direct Purchase
MarketRouter.post('/orders', authMiddleware, createOrder);
MarketRouter.put('/orders/:id', authMiddleware, updateOrderStatus);
MarketRouter.get('/orders/buyer-orders', authMiddleware, getBuyerOrders);

// FE-6: Bidding System
MarketRouter.post('/bids', authMiddleware, placeBid);
MarketRouter.get('/bids/my-bids', authMiddleware, getBuyerBids);
MarketRouter.get('/bids/product/:id', authMiddleware, getProductBids);       // ✅ NEW
MarketRouter.put('/bids/:id/accept', authMiddleware, acceptBid);             // ✅ NEW
MarketRouter.put('/bids/:id/reject', authMiddleware, rejectBid);             // ✅ NEW

// Cart System
MarketRouter.post('/cart', authMiddleware, addToCart);
MarketRouter.put('/cart/:id', authMiddleware, updateCartItem);               // ✅ NEW
MarketRouter.delete('/cart/:id', authMiddleware, removeFromCart);            // ✅ NEW
MarketRouter.post('/orders/cart-checkout', authMiddleware, checkoutCart);    // ✅ NEW

// FE-8: Payments
MarketRouter.post('/payment', authMiddleware, initiatePayment);
MarketRouter.post('/payment/confirm', authMiddleware, confirmPayment);

export default MarketRouter;
