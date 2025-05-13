import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Bid from '../models/Bid.js';
import Campaign from '../models/Campaign.js';
import { stripe } from '../config/stripe.js';
import Cart from '../models/Cart.js';

// FE-1: Product Management
const createProduct = async (req, res) => {
  try {
    const farmerId = req.user.id; // Get from authenticated user
    const { name, description, price, category, grade, farmingPractices, stock } = req.body;
    
    const validCategories = ['Food & Produce', 'Farm Inputs', 'Equipment', 'Seeds', 'Fertilizers', 'Livestock', 'Dairy'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ error: "Invalid product category" });
    }

    const images = req.files?.map(file => file.path) || [];

    const product = await Product.create({
      farmerId,
      name,
      description,
      price,
      category,
      grade,
      farmingPractices,
      stock,
      images
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: "Failed to list product", details: error.message });
  }
};

const getProducts = async (req, res) => {
  try {
    const { category, grade, minPrice, maxPrice } = req.query;
    
    const filter = {};
    if (category) filter.category = category;
    if (grade) filter.grade = grade;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const products = await Product.find(filter)
      .populate('farmerId', 'name location')
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
};

const getFarmerProducts = async (req, res) => {
  try {
    const farmerId = req.user.id;
    const products = await Product.find({ farmerId })
      .sort({ createdAt: -1 });
    
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch farmer products" });
  }
};

const updateProduct = async (req, res) => {
  try {
    const farmerId = req.user.id;
    const { id } = req.params;
    const updates = req.body;
    
    // Check if product belongs to farmer
    const product = await Product.findOne({ _id: id, farmerId });
    if (!product) {
      return res.status(404).json({ error: "Product not found or not authorized" });
    }

    // Handle image updates
    const newImages = req.files?.map(file => file.path) || [];
    const images = [...product.images, ...newImages];

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { ...updates, images },
      { new: true }
    );

    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ error: "Failed to update product" });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const farmerId = req.user.id;
    const { id } = req.params;
    
    const product = await Product.findOneAndDelete({ _id: id, farmerId });
    if (!product) {
      return res.status(404).json({ error: "Product not found or not authorized" });
    }

    // Clean up related data
    await Order.deleteMany({ productId: id });
    await Bid.deleteMany({ productId: id });

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete product" });
  }
};

// FE-5: Order Management
const createOrder = async (req, res) => {
  try {
    const buyerId = req.user.id;
    const { productId, quantity } = req.body;
    
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ error: "Insufficient stock" });
    }

    const order = await Order.create({
      productId,
      buyerId,
      quantity,
      totalPrice: product.price * quantity,
      status: 'pending'
    });

    // Update stock
    product.stock -= quantity;
    await product.save();

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ error: "Order failed", details: error.message });
  }
};

const getFarmerOrders = async (req, res) => {
  try {
    const farmerId = req.user.id;
    
    // Find orders for products belonging to this farmer
    const orders = await Order.find()
      .populate({
        path: 'productId',
        match: { farmerId },
        select: 'name price images'
      })
      .populate('buyerId', 'name email')
      .sort({ createdAt: -1 });

    // Filter out null products (orders for other farmers)
    const farmerOrders = orders.filter(order => order.productId);

    res.json(farmerOrders);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const validStatuses = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate('productId');

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: "Failed to update order status" });
  }
};

// FE-6: Bidding System
const placeBid = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, amount } = req.body;
    
    const product = await Product.findById(productId);
    if (!product.isBidding) {
      return res.status(400).json({ error: "Product not available for bidding" });
    }

    if (amount <= product.price) {
      return res.status(400).json({ error: "Bid must be higher than current price" });
    }

    const bid = await Bid.create({
      productId,
      userId,
      amount,
      isWinning: true
    });

    // Mark other bids as non-winning
    await Bid.updateMany(
      { productId, _id: { $ne: bid._id } },
      { isWinning: false }
    );

    // Update product price
    product.price = amount;
    await product.save();

    res.status(201).json(bid);
  } catch (error) {
    res.status(500).json({ error: "Bid placement failed" });
  }
};

// FE-8: Payment Integration
const initiatePayment = async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId).populate('productId');
    
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Convert PKR to USD (if needed) - adjust rate as necessary
    const exchangeRate = 280; // Example: 1 USD = 280 PKR
    const amountUSD = Math.round((order.totalPrice / exchangeRate) * 100); // Convert to cents

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountUSD,
      currency: 'usd',
      metadata: {
        orderId: order._id.toString(),
        productName: order.productId.name,
        originalAmountPKR: order.totalPrice // Store original amount for reference
      },
      description: `AgroTech Purchase: ${order.productId.name}`
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      displayAmount: order.totalPrice, // Send original PKR amount for display
      currency: 'PKR' // Indicate display currency
    });
  } catch (error) {
    res.status(500).json({ 
      error: "Payment initialization failed",
      details: error.message 
    });
  }
};

// FE-7: Inventory Management
const updateInventory = async (req, res) => {
  try {
    const farmerId = req.user.id;
    const { productId, stock } = req.body;
    
    const product = await Product.findOneAndUpdate(
      { _id: productId, farmerId },
      { stock },
      { new: true }
    );
    
    if (!product) {
      return res.status(404).json({ error: "Product not found or not authorized" });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: "Inventory update failed" });
  }
};

// FE-3: Marketing Campaigns
const createCampaign = async (req, res) => {
  try {
    const farmerId = req.user.id;
    const { name, targetProductId, budget } = req.body;
    
    // Verify product belongs to farmer
    const product = await Product.findOne({ _id: targetProductId, farmerId });
    if (!product) {
      return res.status(404).json({ error: "Product not found or not authorized" });
    }

    const campaign = await Campaign.create({
      name,
      targetProduct: targetProductId,
      budget,
      farmerId,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days later
    });

    res.status(201).json(campaign);
  } catch (error) {
    res.status(500).json({ error: "Campaign creation failed" });
  }
};

// FE-5: Order Management - Get Buyer's Orders
const getBuyerOrders = async (req, res) => {
  try {
    const buyerId = req.user.id;
    
    const orders = await Order.find({ buyerId })
      .populate('productId', 'name price images farmerId')
      .populate({
        path: 'productId',
        populate: {
          path: 'farmerId',
          select: 'name'
        }
      })
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch buyer orders", details: error.message });
  }
};

// FE-6: Bidding System - Get Buyer's Bids
const getBuyerBids = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const bids = await Bid.find({ userId })
      .populate({
        path: 'productId',
        select: 'name price images farmerId',
        populate: {
          path: 'farmerId',
          select: 'name'
        }
      })
      .sort({ createdAt: -1 });

    res.json(bids);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch buyer bids", details: error.message });
  }
};

// FE-8: Payment Integration - Confirm Payment
const confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId, orderId } = req.body;
    
    // Validate input
    if (!paymentIntentId || !orderId) {
      return res.status(400).json({ 
        success: false,
        error: "Missing required fields" 
      });
    }

    // Verify payment with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    // Check if payment belongs to this order
    if (paymentIntent.metadata.orderId !== orderId) {
      return res.status(400).json({
        success: false,
        error: "Payment intent does not match this order"
      });
    }

    // Handle successful payment
    if (paymentIntent.status === 'succeeded') {
      const updatedOrder = await Order.findByIdAndUpdate(
        orderId,
        { 
          status: 'paid', 
          paymentIntentId,
          paidAt: new Date(),
          paymentAmount: paymentIntent.amount / 100, // Store in USD
          originalAmountPKR: paymentIntent.metadata.originalAmountPKR // Store original PKR amount
        },
        { new: true }
      ).populate('productId');
      
      return res.json({ 
        success: true,
        order: updatedOrder
      });
    }

    // Handle other statuses
    return res.status(400).json({ 
      success: false,
      error: `Payment not completed. Current status: ${paymentIntent.status}`,
      paymentIntent
    });

  } catch (error) {
    console.error('Payment confirmation error:', error);
    res.status(500).json({ 
      success: false,
      error: "Payment confirmation failed",
      details: error.message
    });
  }
};

const addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity } = req.body;

    if (!productId || !quantity || quantity <= 0) {
      return res.status(400).json({ error: "Invalid product or quantity" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Check if product is already in cart
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = await Cart.create({
        userId,
        items: [{ productId, quantity }]
      });
    } else {
      const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
      
      if (itemIndex > -1) {
        // Update quantity
        cart.items[itemIndex].quantity += quantity;
      } else {
        // Add new item
        cart.items.push({ productId, quantity });
      }

      await cart.save();
    }

    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ error: "Failed to add to cart", details: error.message });
  }
};


// ✅ Get bids for a specific product
const getProductBids = async (req, res) => {
  try {
    const { id } = req.params;
    const bids = await Bid.find({ productId: id })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    res.json(bids);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch bids for product", details: error.message });
  }
};

// ✅ Accept a bid
const acceptBid = async (req, res) => {
  try {
    const { id } = req.params;

    const acceptedBid = await Bid.findById(id).populate('productId');
    if (!acceptedBid) return res.status(404).json({ error: "Bid not found" });

    // Update this bid to accepted
    acceptedBid.status = 'accepted';
    acceptedBid.isWinning = true;
    await acceptedBid.save();

    // Mark other bids as rejected
    await Bid.updateMany(
      { productId: acceptedBid.productId._id, _id: { $ne: id } },
      { status: 'rejected', isWinning: false }
    );

    // Update product price to accepted bid amount
    const product = await Product.findByIdAndUpdate(
      acceptedBid.productId._id,
      { price: acceptedBid.amount },
      { new: true }
    );

    res.json({ message: "Bid accepted", bid: acceptedBid, updatedProduct: product });
  } catch (error) {
    res.status(500).json({ error: "Failed to accept bid", details: error.message });
  }
};

// ✅ Reject a bid
const rejectBid = async (req, res) => {
  try {
    const { id } = req.params;

    const bid = await Bid.findById(id);
    if (!bid) return res.status(404).json({ error: "Bid not found" });

    bid.status = 'rejected';
    bid.isWinning = false;
    await bid.save();

    res.json({ message: "Bid rejected", bid });
  } catch (error) {
    res.status(500).json({ error: "Failed to reject bid", details: error.message });
  }
};

// ✅ Checkout cart
const checkoutCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { shippingDetails, paymentMethod } = req.body;

    const cart = await Cart.findOne({ userId }).populate('items.productId');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    let totalPrice = 0;
    const orders = [];

    for (const item of cart.items) {
      const product = item.productId;
      if (!product) continue;

      if (product.stock < item.quantity) {
        return res.status(400).json({ error: `Insufficient stock for ${product.name}` });
      }

      const order = await Order.create({
        buyerId: userId,
        productId: product._id,
        quantity: item.quantity,
        totalPrice: product.price * item.quantity,
        shippingDetails,
        status: paymentMethod === 'stripe' ? 'pending' : 'cash-on-delivery'
      });

      product.stock -= item.quantity;
      await product.save();

      totalPrice += order.totalPrice;
      orders.push(order);
    }

    // Clear cart
    await Cart.findOneAndDelete({ userId });

    res.status(201).json({
      message: "Cart checkout complete",
      orders,
      paymentMethod,
      totalPrice
    });
  } catch (error) {
    res.status(500).json({ error: "Cart checkout failed", details: error.message });
  }
};

// ✅ Update cart item quantity
const updateCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params; // cart item ID
    const { quantity } = req.body;

    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ error: "Cart not found" });

    const item = cart.items.id(id);
    if (!item) return res.status(404).json({ error: "Cart item not found" });

    item.quantity = quantity;
    await cart.save();

    res.json({ message: "Cart item updated", cart });
  } catch (error) {
    res.status(500).json({ error: "Failed to update cart item", details: error.message });
  }
};

// ✅ Remove item from cart
const removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params; // cart item ID

    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ error: "Cart not found" });

    cart.items = cart.items.filter(item => item._id.toString() !== id);
    await cart.save();

    res.json({ message: "Cart item removed", cart });
  } catch (error) {
    res.status(500).json({ error: "Failed to remove cart item", details: error.message });
  }
};

// ✅ Export All Controllers
export {
  createProduct,
  getProducts,
  getFarmerProducts,
  updateProduct,
  deleteProduct,
  createOrder,
  getBuyerOrders,
  getFarmerOrders,
  updateOrderStatus,
  placeBid,
  getBuyerBids,
  initiatePayment,
  confirmPayment,
  updateInventory,
  createCampaign,
  addToCart,
  getProductBids,
  acceptBid,
  rejectBid,
  checkoutCart,
  updateCartItem,
  removeFromCart
};