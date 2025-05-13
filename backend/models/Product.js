// backend/models/Product.js
import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { 
    type: String, 
    required: true,
    enum: [
      'Food & Produce', // e.g., Organic Vegetables, Grains
      'Farm Inputs',    // e.g., Fertilizers, Pesticides
      'Equipment',      // e.g., Tractors, Irrigation Systems
      'Seeds',          // e.g., Hybrid Seeds
      'Livestock',      // e.g., Chickens, Goats
      'Dairy'           // e.g., Milk, Cheese
    ] 
  },
  subCategory: { type: String }, // e.g., "Organic", "Poultry"
  grade: { type: String, enum: ['A', 'B', 'C'] },
  images: [{ type: String }],
  farmingPractices: { type: String }, // e.g., "Organic", "Rainfed"
  certification: { type: String }, // e.g., "USDA Organic"
  farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isBidding: { type: Boolean, default: false },
  stock: { type: Number, default: 0 },
  harvestDate: { type: Date } // For perishable goods
}, { timestamps: true });

const Product = mongoose.model("Product" , productSchema);
export default Product;